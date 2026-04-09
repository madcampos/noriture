// oxlint-env node
import { cloudflare } from '@cloudflare/vite-plugin';
import { readFileSync } from 'fs';
import { defineConfig, type UserConfig } from 'vite';
import { type ManifestOptions, VitePWA as vitePWA } from 'vite-plugin-pwa';
import { externalResources, internalResources } from './src/service-worker';

const manifest: Partial<ManifestOptions> = JSON.parse(readFileSync('./src/manifest.json', { encoding: 'utf8' }));

// oxlint-disable-next-line import/no-default-export
export default defineConfig(({ mode }) => {
	const baseUrl = mode === 'production' ? 'https://noriture.madcampos.dev/' : 'https://localhost:3000/';

	const sslOptions = mode === 'production'
		? undefined
		: {
			cert: readFileSync('./certs/server.crt', 'utf-8'),
			key: readFileSync('./certs/server.key', 'utf-8')
		};

	const config: UserConfig = {
		plugins: [
			cloudflare(),
			vitePWA({
				registerType: 'prompt',
				minify: true,
				includeAssets: ['/icons/favicon.svg'],
				manifest,
				scope: baseUrl,
				workbox: {
					cleanupOutdatedCaches: true,
					clientsClaim: true,
					navigationPreload: false,
					runtimeCaching: [internalResources, externalResources]
				},
				devOptions: {
					enabled: false
				}
			})
		],
		base: baseUrl,
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
