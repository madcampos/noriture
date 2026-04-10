const INTERNAL_SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const OKAY = 200;

function getDefaultHeaders(request: Request) {
	const requestUrl = new URL('/', request.url);

	return {
		'Access-Control-Allow-Origin': `https://${requestUrl.host}`,
		'Access-Control-Allow-Methods': 'GET, OPTIONS',
		'Access-Control-Allow-Headers': '*',
		'Access-Control-Expose-Headers': '*',
		'Access-Control-Max-Age': '86400',

		'Cross-Origin-Embedder-Policy': 'credentialless',
		'Cross-Origin-Opener-Policy': 'same-origin',
		'Cross-Origin-Resource-Policy': 'same-origin',

		'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
		'Upgrade-Insecure-Requests': '1',
		'Referrer-Policy': 'no-referrer',
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'DENY'
	};
}

async function proxyRequest(request: Request) {
	const requestUrl = request.url;
	const url = new URL(requestUrl).searchParams.get('url');

	if (!url) {
		return new Response('url is required', {
			status: BAD_REQUEST,
			headers: new Headers(getDefaultHeaders(request))
		});
	}

	if (!URL.canParse(url)) {
		return new Response('url is invalid', {
			status: BAD_REQUEST,
			headers: new Headers(getDefaultHeaders(request))
		});
	}

	const fetchSecHeaders = {
		site: request.headers.get('Sec-Fetch-Site'),
		mode: request.headers.get('Sec-Fetch-Mode'),
		dest: request.headers.get('Sec-Fetch-Dest')
	};

	if (!['same-site', 'same-origin'].includes(fetchSecHeaders.site ?? 'cross-site')) {
		return new Response('request site is invalid', {
			status: BAD_REQUEST,
			headers: new Headers(getDefaultHeaders(request))
		});
	}

	if (!['cors', 'same-origin'].includes(fetchSecHeaders.mode ?? 'no-cors')) {
		return new Response('request mode is invalid', {
			status: BAD_REQUEST,
			headers: new Headers(getDefaultHeaders(request))
		});
	}

	if (fetchSecHeaders.dest !== '' && fetchSecHeaders.dest !== 'empty') {
		return new Response('request dest is invalid', {
			status: BAD_REQUEST,
			headers: new Headers(getDefaultHeaders(request))
		});
	}

	try {
		const response = await fetch(url);

		if (!response.ok) {
			return new Response('proxy failed', {
				status: INTERNAL_SERVER_ERROR,
				headers: new Headers(getDefaultHeaders(request))
			});
		}

		const validContentTypes = ['text/xml', 'application/xml', 'application/rss+xml', 'application/atom+xml'];
		const contentType = response.headers.get('content-type') ?? '';

		if (!validContentTypes.some((type) => contentType.startsWith(type))) {
			return new Response('invalid content type', {
				status: BAD_REQUEST,
				headers: new Headers(getDefaultHeaders(request))
			});
		}

		const text = await response.text();

		return new Response(text, {
			status: OKAY,
			headers: new Headers({
				...getDefaultHeaders(request),
				'Content-Type': 'text/xml'
			})
		});
	} catch (err) {
		if (err instanceof Error) {
			return new Response(err.message, {
				status: INTERNAL_SERVER_ERROR,
				headers: new Headers(getDefaultHeaders(request))
			});
		} else if ('toString' in err && typeof err.toString === 'function') {
			return new Response(err.toString(), {
				status: INTERNAL_SERVER_ERROR,
				headers: new Headers(getDefaultHeaders(request))
			});
		}

		return new Response('server error', {
			status: INTERNAL_SERVER_ERROR,
			headers: new Headers(getDefaultHeaders(request))
		});
	}
}

async function fetchHandler(request: Request) {
	const url = new URL(request.url);

	let response: Response;

	if (request.method === 'OPTIONS') {
		response = new Response('', { status: OKAY, headers: new Headers(getDefaultHeaders(request)) });
	} else {
		switch (url.pathname) {
			case '/proxy':
			case '/proxy/':
				response = await proxyRequest(request);
				break;
			default: {
				response = new Response('Not found', { status: 404 });
			}
		}
	}

	return response;
}

// oxlint-disable-next-line import/no-default-export
export default {
	fetch: fetchHandler
} satisfies ExportedHandler<Env>;
