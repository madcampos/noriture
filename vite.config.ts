/* eslint-disable camelcase */
// eslint-env node
import { readFileSync } from 'fs';

import { defineConfig, loadEnv } from 'vite';
import { createHtmlPlugin } from 'vite-plugin-html';
import { VitePWA as vitePWA } from 'vite-plugin-pwa';

import vue from '@vitejs/plugin-vue';

const sslOptions = {
	cert: readFileSync('./server.crt'),
	key: readFileSync('./server.key')
};

const packageJson: PackageJsonVariables = JSON.parse(readFileSync('./package.json', { encoding: 'utf8' }));

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
	const env = {
		PUBLIC_URL: packageJson.homepage,

		APP_NAME: packageJson.displayName,
		APP_SHORT_NAME: packageJson.shortName,
		APP_DESCRIPTION: packageJson.description,
		APP_KEYWORDS: packageJson.keywords.join(', '),
		APP_AUTHOR: packageJson.author.name,
		APP_VERSION: packageJson.version,

		THEME_COLOR: '#ffa500',
		BACKGROUND_COLOR: '#252525',

		APPLE_ICON: '/icons/maskable/apple-icon-180.png',
		SMALL_ICON: '/icons/transparent/manifest-icon-192.png',
		SMALL_ICON_BG: '/icons/maskable/manifest-icon-192.png',
		LARGE_ICON: '/icons/transparent/manifest-icon-512.png',
		LARGE_ICON_BG: '/icons/maskable/manifest-icon-512.png',
		...loadEnv(mode, process.cwd())
	};

	return {
		plugins: [
			vue(),
			createHtmlPlugin({
				minify: true,
				inject: {
					data: env
				}
			}),
			vitePWA({
				registerType: 'prompt',
				minify: true,
				includeAssets: ['/icons/favicon.svg'],
				manifest: {
					id: 'b4f0ee06-787e-43f1-8f4e-0c3988fae609',
					name: env.APP_NAME,
					short_name: env.APP_SHORT_NAME,
					lang: 'en-US',
					description: env.APP_DESCRIPTION,
					categories: ['app', 'utilities', 'tools', 'rss', 'feed'],
					display: 'standalone',
					orientation: 'portrait',
					background_color: env.BACKGROUND_COLOR,
					theme_color: env.THEME_COLOR,
					icons: [
						{
							src: env.SMALL_ICON,
							sizes: '192x192',
							type: 'image/png',
							purpose: 'any'
						},
						{
							src: env.SMALL_ICON_BG,
							sizes: '192x192',
							type: 'image/png',
							purpose: 'maskable'
						},
						{
							src: env.LARGE_ICON,
							sizes: '512x512',
							type: 'image/png',
							purpose: 'any'
						},
						{
							src: env.LARGE_ICON_BG,
							sizes: '512x512',
							type: 'image/png',
							purpose: 'maskable'
						}
					],
					protocol_handlers: [
						{ protocol: 'web+feed', url: './?add=%s' },
						{ protocol: 'web+rss', url: './?add=%s' },
						{ protocol: 'web+atom', url: './?add=%s' }
					]
				},
				workbox: {
					cleanupOutdatedCaches: true,
					clientsClaim: true,
					navigationPreload: false,
					runtimeCaching: [
						{
							urlPattern: new RegExp(`^${env.PUBLIC_URL}.*`, 'iu'),
							handler: 'CacheFirst',
							options: {
								cacheName: 'app-cache',
								expiration: {
									// eslint-disable-next-line @typescript-eslint/no-magic-numbers
									maxAgeSeconds: 60 * 60 * 24 * 30,
									maxEntries: 100
								}
							}
						},
						{
							urlPattern: new RegExp(`^(?!${env.PUBLIC_URL}).*`, 'iu'),
							handler: 'NetworkOnly'
						}
					]
				},
				devOptions: {
					enabled: false
				}
			})
		],
		clearScreen: false,
		server: {
			https: sslOptions,
			open: true
		},
		build: {
			target: 'esnext',
			assetsInlineLimit: 0
		},
		preview: {
			https: sslOptions,
			open: true
		}
	};
});
