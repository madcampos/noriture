// oxlint-env node

import { cloudflare } from '@cloudflare/vite-plugin';
import { readFileSync } from 'fs';
import { defineConfig, type UserConfig } from 'vite';

// oxlint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
	const sslOptions = mode === 'production'
		? undefined
		: {
			cert: readFileSync('./certs/server.crt', 'utf-8'),
			key: readFileSync('./certs/server.key', 'utf-8')
		};

	const config: UserConfig = {
		plugins: [cloudflare({ configPath: '../wrangler.json' })],
		envPrefix: 'APP_',
		envDir: '../',
		root: 'src',
		publicDir: '../public',
		clearScreen: false,
		server: {
			host: 'localhost',
			https: sslOptions,
			open: false,
			cors: true,
			port: 5000
		},
		build: {
			target: 'esnext',
			emptyOutDir: true,
			outDir: '../dist'
		},
		preview: {
			https: sslOptions,
			open: true
		}
	};

	return config;
});
