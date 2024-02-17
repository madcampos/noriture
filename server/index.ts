import { serve } from '@hono/node-server';
import { Hono, type HonoRequest } from 'hono';

const INTERNAL_SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const OKAY = 200;

const app = new Hono();

app.get('/', (context) => context.text('Hello proxy!'));

function getCorsHeaders(request: HonoRequest) {
	return {
		'Access-Control-Allow-Origin': request.header('Origin') ?? '*',
		'Access-Control-Allow-Methods': request.header('Access-Control-Request-Method') ?? 'GET, OPTIONS',
		'Access-Control-Allow-Headers': request.header('Access-Control-Request-Headers') ?? 'Content-Type',
		'Access-Control-Expose-Headers': [...request.raw.headers.keys()].join(', ') ?? '',
		'Access-Control-Max-Age': '86400'
	};
}

app.options('/proxy', (context) => new Response('', { status: OKAY, headers: getCorsHeaders(context.req) }));

app.get('/proxy', async (context) => {
	const url = context.req.query('url');

	if (!url) {
		return context.text('url is required', BAD_REQUEST);
	}

	try {
		// eslint-disable-next-line no-new
		new URL(url);
	} catch {
		return context.text('url is invalid', BAD_REQUEST);
	}

	try {
		const response = await fetch(url);

		if (!response.ok) {
			return context.text('proxy failed', INTERNAL_SERVER_ERROR);
		}

		const validContentTypes = ['text/xml', 'application/xml', 'application/rss+xml', 'application/atom+xml'];
		const contentType = response.headers.get('content-type') ?? '';

		if (!validContentTypes.some((type) => contentType.startsWith(type))) {
			return context.text('invalid content type', BAD_REQUEST);
		}

		const text = await response.text();

		return context.text(text, OKAY, {
			...getCorsHeaders(context.req),
			'Content-Type': 'text/xml'
		});
	} catch (err) {
		return context.text(err.message, INTERNAL_SERVER_ERROR);
	}
});


const HOST = 'localhost';
const PORT = 3000;

serve({
	fetch: app.fetch,
	port: PORT,
	hostname: HOST
}).on('listening', () => {
	// eslint-disable-next-line no-console
	console.info(`Server is listening on http://${HOST}:${PORT}`);
});
