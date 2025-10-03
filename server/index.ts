import { Hono, type HonoRequest } from 'hono';

const INTERNAL_SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const OKAY = 200;

const app = new Hono();

app.get('/', (context) => context.text('Hello proxy!'));

function getDefaultHeaders(request: HonoRequest) {
	return {
		// TODO: block other origins
		'Access-Control-Allow-Origin': request.header('Origin') ?? '*',
		'Access-Control-Allow-Methods': request.header('Access-Control-Request-Method') ?? 'GET, OPTIONS',
		'Access-Control-Allow-Headers': request.header('Access-Control-Request-Headers') ?? 'Content-Type',
		'Access-Control-Expose-Headers': [...request.raw.headers.keys()].join(', ') ?? '',
		'Access-Control-Max-Age': '86400',

		'Cross-Origin-Embedder-Policy': 'credentialless',
		'Cross-Origin-Opener-Policy': 'same-origin',
		'Cross-Origin-Resource-Policy': 'same-origin',

		'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
		'Upgrade-Insecure-Requests': '1',
		'X-Content-Type-Options': 'nosniff',
		'X-Frame-Options': 'DENY',
		'X-Permitted-Cross-Domain-Policies': 'none',
		'X-XSS-Protection': '1; mode=block',

		'Content-Security-Policy':
			"child-src 'none'; connect-src 'self'; default-src https:; fenced-frame-src 'none'; font-src 'none'; frame-src 'none'; img-src 'none'; manifest-src 'none'; media-src 'none'; object-src 'none'; script-src 'self'; script-src-attr 'none'; style-src 'none'; sandbox; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",

		'Vary': 'Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site'
	};
}

app.options('/proxy', (context) => new Response('', { status: OKAY, headers: getDefaultHeaders(context.req) }));

app.get('/proxy', async (context) => {
	const url = context.req.query('url');

	if (!url) {
		return context.text('url is required', BAD_REQUEST, getDefaultHeaders(context.req));
	}

	if (!URL.canParse(url)) {
		return context.text('url is invalid', BAD_REQUEST, getDefaultHeaders(context.req));
	}

	const fetchSecHeaders = {
		site: context.req.header('Sec-Fetch-Site'),
		mode: context.req.header('Sec-Fetch-Mode'),
		dest: context.req.header('Sec-Fetch-Dest')
	};

	if (!['same-site', 'same-origin'].includes(fetchSecHeaders.site ?? 'cross-site')) {
		return context.text('request site is invalid', BAD_REQUEST, getDefaultHeaders(context.req));
	}

	if (!['cors', 'same-origin'].includes(fetchSecHeaders.mode ?? 'no-cors')) {
		return context.text('request mode is invalid', BAD_REQUEST, getDefaultHeaders(context.req));
	}

	if (fetchSecHeaders.dest !== '') {
		return context.text('request dest is invalid', BAD_REQUEST, getDefaultHeaders(context.req));
	}

	try {
		const response = await fetch(url);

		if (!response.ok) {
			return context.text('proxy failed', INTERNAL_SERVER_ERROR, getDefaultHeaders(context.req));
		}

		const validContentTypes = ['text/xml', 'application/xml', 'application/rss+xml', 'application/atom+xml'];
		const contentType = response.headers.get('content-type') ?? '';

		if (!validContentTypes.some((type) => contentType.startsWith(type))) {
			return context.text('invalid content type', BAD_REQUEST, getDefaultHeaders(context.req));
		}

		const text = await response.text();

		return context.text(text, OKAY, {
			...getDefaultHeaders(context.req),
			'Content-Type': 'text/xml'
		});
	} catch (err) {
		return context.text((err as Error).message, INTERNAL_SERVER_ERROR, getDefaultHeaders(context.req));
	}
});

export default app;
