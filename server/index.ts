/* oxlint-disable typescript/only-throw-error */

const STATUS_CODES = {
	'Internal Server Error': 500,
	'Bad Request': 400,
	'OK': 200,
	'No Content': 204
} as const;

type StatusCode = typeof STATUS_CODES[keyof typeof STATUS_CODES];

const VALID_TEXT__MIME_TYPES = [
	'text/plain',
	'text/xml',
	'application/xml',
	'application/rss+xml',
	'application/atom+xml',
	'text/html',
	'application/xhtml+xml',
	'application/manifest+json',
	'application/json'
] as const;

function getDefaultHeaders(requestUrl: string) {
	return {
		'Access-Control-Allow-Origin': `https://${new URL(requestUrl).host}`,
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

class ErrorResponse extends Response {
	constructor(message: string, requestUrl: string, statusCode: StatusCode = STATUS_CODES['Bad Request']) {
		super(message, {
			status: statusCode,
			headers: new Headers(getDefaultHeaders(requestUrl))
		});
	}
}

function parseUrl(requestUrl: string) {
	const url = new URL(requestUrl).searchParams.get('url');

	if (!url) {
		throw new ErrorResponse('url is required', requestUrl);
	}

	if (!URL.canParse(url)) {
		throw new ErrorResponse('url is invalid', requestUrl);
	}

	return url;
}

function checkSecurityHeaders(request: Request) {
	const requestUrl = request.url;

	const fetchSecHeaders = {
		site: request.headers.get('Sec-Fetch-Site'),
		mode: request.headers.get('Sec-Fetch-Mode'),
		dest: request.headers.get('Sec-Fetch-Dest')
	};

	if (!['same-site', 'same-origin'].includes(fetchSecHeaders.site ?? 'cross-site')) {
		throw new ErrorResponse('request site is invalid', requestUrl);
	}

	if (!['cors', 'same-origin'].includes(fetchSecHeaders.mode ?? 'no-cors')) {
		throw new ErrorResponse('request mode is invalid', requestUrl);
	}

	if (fetchSecHeaders.dest !== '' && fetchSecHeaders.dest !== 'empty') {
		throw new ErrorResponse('request dest is invalid', requestUrl);
	}
}

async function proxyRequest(request: Request) {
	const requestUrl = request.url;

	try {
		const url = parseUrl(requestUrl);

		checkSecurityHeaders(request);

		const response = await fetch(url);

		if (!response.ok) {
			return new ErrorResponse('proxy failed', requestUrl, STATUS_CODES['Internal Server Error']);
		}

		const contentType = response.headers.get('content-type') ?? '';

		if (!VALID_TEXT__MIME_TYPES.some((type) => contentType.startsWith(type))) {
			return new ErrorResponse('invalid content type', requestUrl);
		}

		const mimeType = response.headers.get('Content-Type') ?? 'text/plain';

		return new Response(response.body, {
			status: STATUS_CODES.OK,
			headers: new Headers({
				...getDefaultHeaders(requestUrl),
				'Content-Type': mimeType
			})
		});
	} catch (err) {
		if (err instanceof ErrorResponse) {
			return err;
		}

		if (err instanceof Error) {
			return new ErrorResponse(err.message, requestUrl, STATUS_CODES['Internal Server Error']);
		}

		if ('toString' in err && typeof err.toString === 'function') {
			return new ErrorResponse(err.toString(), requestUrl, STATUS_CODES['Internal Server Error']);
		}

		console.error(err);
		return new ErrorResponse('server error', requestUrl, STATUS_CODES['Internal Server Error']);
	}
}

async function fetchHandler(request: Request) {
	const url = new URL(request.url);

	let response: Response;

	if (request.method === 'OPTIONS') {
		response = new Response(null, {
			status: STATUS_CODES['No Content'],
			headers: new Headers(getDefaultHeaders(url.href))
		});
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
