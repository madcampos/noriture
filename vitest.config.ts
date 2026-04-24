// oxlint-env node

import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import { default as viteConfig } from './vite.config.ts';

// oxlint-disable-next-line import/no-default-export
export default defineConfig((config) => ({
	...viteConfig(config),
	plugins: [],
	test: {
		browser: {
			enabled: true,
			provider: playwright(),
			// https://vitest.dev/config/browser/playwright
			instances: [
				{ browser: 'chromium' }
			]
		}
	}
}));
