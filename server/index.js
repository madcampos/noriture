/* eslint-disable @typescript-eslint/no-magic-numbers, no-console */
//@ts-expect-error - Missing types
import corsProxy from 'cors-anywhere';

// Listen on a specific host via the HOST environment variable
const host = process.env.HOST ?? '0.0.0.0';
// Listen on a specific port via the PORT environment variable
const port = process.env.PORT ?? 8080;

corsProxy.createServer({
	// Allow all origins
	originWhitelist: ['https://localhost:3000', 'https://madcampos.github.io'],
	requireHeader: ['origin', 'x-requested-with'],
	removeHeaders: ['cookie', 'cookie2']
}).listen(port, host, () => {
	console.log(`Running CORS Anywhere on ${host}:${port}`);
});
