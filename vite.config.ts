// oxlint-env node

/// <reference types="@types/node" />
/// <reference types="vite/client" />

import { cloudflare } from '@cloudflare/vite-plugin';
import { readFileSync } from 'node:fs';
import { type UserConfig, defineConfig } from 'vite';

// oxlint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
	const sslOptions = mode === 'production'
		? undefined
		: {
			cert: readFileSync('./certs/server.crt', 'utf-8'),
			key: readFileSync('./certs/server.key', 'utf-8')
		};

	const serverOptions = {
		https: sslOptions,
		host: 'localhost',
		cors: true,
		port: 5000,
		strictPort: true
	};

	const config: UserConfig = {
		plugins: [cloudflare({ configPath: '../wrangler.json' })],
		envPrefix: 'APP_',
		envDir: '../',
		root: 'src',
		publicDir: '../public',
		clearScreen: false,
		server: {
			...serverOptions,
			open: false,
			forwardConsole: {
				unhandledErrors: true,
				logLevels: ['warn', 'error']
			}
		},
		build: {
			target: 'esnext',
			emptyOutDir: true,
			outDir: '../dist',
			reportCompressedSize: false
		},
		preview: {
			...serverOptions,
			open: true
		}
	};

	return config;
});
