import { serve } from '@hono/node-server';
import { Hono } from 'hono';

const app = new Hono();
app.get('/', (context) => {
	return context.text('Hello Hono!');
});

app.get('/proxy', async (context) => {
	const url = context.req.query('url');

	if (!url) {
		return context.text('url is required', 400);
	}

	try {
		new URL(url);
	} catch {
		return context.text('url is invalid', 400);
	}

	try {
		const response = await fetch(url);

		if (!response.ok) {
			return context.text('proxy failed', 500);
		}

		const validContentTypes = ['text/xml', 'application/xml', 'application/rss+xml', 'application/atom+xml'];
		const contentType = response.headers.get('content-type') ?? '';

		if (!validContentTypes.some((type) => contentType.startsWith(type))) {
			return context.text('invalid content type', 400);
		}

		const text = await response.text();

		return context.text(text, 200, {
			'Content-Type': contentType,
			'Access-Control-Allow-Origin': '*',
		});
	} catch (err) {
		return context.text(err.message, 500);
	}
});

serve(app);
