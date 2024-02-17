import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const INTERNAL_SERVER_ERROR = 500;
const BAD_REQUEST = 400;
const OKAY = 200;

const app = new Hono();
app.get('/', (context) => context.text('Hello Hono!'));

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
			'Content-Type': contentType,
			'Access-Control-Allow-Origin': '*',
		});
	} catch (err) {
		return context.text(err.message, INTERNAL_SERVER_ERROR);
	}
});

serve(app);
