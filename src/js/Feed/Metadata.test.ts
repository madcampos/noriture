/* oxlint-disable max-lines, no-magic-numbers */

import { assert, describe, test, vi } from 'vitest';
import { parseHtml, parseXml } from '../utils/parsing.ts';
import {
	getApplicationManifest,
	getLargestIconSize,
	getMsApplicationConfig,
	parseAppleIcons,
	parseDescription,
	parseFavicons,
	parseIcon,
	parseIeIcons,
	parseImage,
	parseManifestIcons,
	parseMetadata,
	parseMsApplicationIcons,
	parseThemeColor,
	parseTitle
} from './Metadata.ts';

vi.mock(import('../utils/fetch.ts'), () => ({
	fetchProxied: async (url: string) => {
		const parsedUrl = new URL(url);

		if (parsedUrl.pathname.endsWith('manifest-from-link.json')) {
			return Promise.resolve(new Response(JSON.stringify({ name: 'Manifest from link' })));
		}

		if (parsedUrl.pathname.endsWith('app.webmanifest')) {
			if (parsedUrl.hostname.includes('skip-app')) {
				return Promise.reject(new Error('Not found'));
			}

			return Promise.resolve(new Response(JSON.stringify({ name: 'App Webmanifest' })));
		}

		if (parsedUrl.pathname.endsWith('manifest.json')) {
			if (parsedUrl.hostname.includes('skip-manifest')) {
				return Promise.reject(new Error('Not found'));
			}

			return Promise.resolve(new Response(JSON.stringify({ name: 'Manifest JSON' })));
		}

		if (parsedUrl.pathname.endsWith('config-from-link.xml')) {
			return Promise.resolve(new Response('<?xml version="1.0" encoding="utf-8"?><browserconfig><msapplication/></browserconfig>'));
		}

		if (parsedUrl.pathname.endsWith('browserconfig.xml')) {
			if (parsedUrl.hostname.includes('skip-browserconfig')) {
				return Promise.reject(new Error('Not found'));
			}

			return Promise.resolve(new Response('<?xml version="1.0" encoding="utf-8"?><browserconfig><msapplication/></browserconfig>'));
		}

		if (parsedUrl.pathname.endsWith('ieconfig.xml')) {
			if (parsedUrl.hostname.includes('skip-ieconfig')) {
				return Promise.reject(new Error('Not found'));
			}

			return Promise.resolve(new Response('<?xml version="1.0" encoding="utf-8"?><browserconfig><msapplication/></browserconfig>'));
		}

		if (parsedUrl.hostname === 'example.com' && parsedUrl.pathname === '/') {
			return Promise.resolve(new Response('<html><head><title>HTML Title</title></head></html>'));
		}

		if (parsedUrl.hostname === 'xhtml.example.com') {
			return Promise.resolve(new Response('<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml"><head><title>XHTML Title</title></head></html>'));
		}

		if (parsedUrl.hostname === 'fail.example.com') {
			return Promise.reject(new Error('Failed to fetch'));
		}

		return Promise.reject(new Error('Not found'));
	},
	checkImageExists: async (imageUrl: string) => {
		const url = new URL(imageUrl);

		if (url.searchParams.get('fail')) {
			return Promise.resolve(undefined);
		}

		return Promise.resolve({
			width: url.searchParams.has('width') ? Number.parseInt(url.searchParams.get('width') ?? '0', 10) : -Infinity,
			height: url.searchParams.has('height') ? Number.parseInt(url.searchParams.get('height') ?? '0', 10) : -Infinity
		});
	}
}));

describe('Metadata Title', () => {
	test('Title element', () => {
		const html = parseHtml('<title>Title Element</title>');
		const title = parseTitle(html);

		assert.equal(title, 'Title Element');
	});

	test('Open graph title', () => {
		const html = parseHtml('<meta property="og:title" content="OG Title" />');
		const title = parseTitle(html);

		assert.equal(title, 'OG Title');
	});

	test('Twitter title', () => {
		const html = parseHtml('<meta name="twitter:title" content="Twitter Title" />');
		const title = parseTitle(html);

		assert.equal(title, 'Twitter Title');
	});

	test('Itemprop of name with content attribute', () => {
		const html = parseHtml('<meta itemprop="name" content="Itemprop Content Title" />');
		const title = parseTitle(html);

		assert.equal(title, 'Itemprop Content Title');
	});

	test('Itemprop of name with text', () => {
		const html = parseHtml('<span itemprop="name">Itemprop Text Title</span>');
		const title = parseTitle(html);

		assert.equal(title, 'Itemprop Text Title');
	});

	test('No title', () => {
		const html = parseHtml('No title');
		const title = parseTitle(html);

		assert.equal(title, undefined);
	});
});

describe('Metadata Description', () => {
	test('Description element', () => {
		const html = parseHtml('<meta name="description" content="Meta Description" />');
		const description = parseDescription(html);

		assert.equal(description, 'Meta Description');
	});

	test('Open graph description', () => {
		const html = parseHtml('<meta property="og:description" content="OG Description" />');
		const description = parseDescription(html);

		assert.equal(description, 'OG Description');
	});

	test('Twitter description', () => {
		const html = parseHtml('<meta name="twitter:description" content="Twitter Description" />');
		const description = parseDescription(html);

		assert.equal(description, 'Twitter Description');
	});

	test('Itemprop of description with content attribute', () => {
		const html = parseHtml('<meta itemprop="description" content="Itemprop Content Description" />');
		const description = parseDescription(html);

		assert.equal(description, 'Itemprop Content Description');
	});

	test('Itemprop of description with text', () => {
		const html = parseHtml('<span itemprop="description">Itemprop Text Description</span>');
		const description = parseDescription(html);

		assert.equal(description, 'Itemprop Text Description');
	});

	test('No description', () => {
		const html = parseHtml('No description');
		const description = parseDescription(html);

		assert.equal(description, undefined);
	});
});

describe('Metadata Favicon', () => {
	const baseUrl = 'https://example.com';

	test('Icon link', () => {
		const html = parseHtml('<link rel="icon" href="/favicon.png" />', baseUrl);
		const icons = parseFavicons(html, baseUrl);

		assert.equal(icons[0]?.url, 'https://example.com/favicon.png');
		assert.equal(icons[0]?.mimeType, 'image/png');
	});

	test('Icon link with type of `image/icon`', () => {
		const html = parseHtml('<link rel="icon" type="image/icon" href="/icon.ico" />', baseUrl);
		const icons = parseFavicons(html, baseUrl);

		assert.equal(icons[0]?.url, 'https://example.com/icon.ico');
		assert.equal(icons[0]?.mimeType, 'image/vnd.microsoft.icon');
	});

	test('Icon link with type of `image/x-icon`', () => {
		const html = parseHtml('<link rel="icon" type="image/x-icon" href="/icon.ico" />', baseUrl);
		const icons = parseFavicons(html, baseUrl);

		assert.equal(icons[0]?.url, 'https://example.com/icon.ico');
		assert.equal(icons[0]?.mimeType, 'image/vnd.microsoft.icon');
	});

	test('Multiple icons', () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/icon1.png" />
			<link rel="icon" href="/icon2.png" />
		`,
			baseUrl
		);
		const icons = parseFavicons(html, baseUrl);

		assert.equal(icons.length, 3);
		assert.equal(icons[0]?.url, 'https://example.com/icon1.png');
		assert.equal(icons[1]?.url, 'https://example.com/icon2.png');
		assert.equal(icons[2]?.url, 'https://example.com/favicon.ico');
	});

	test('Ico icon has set size', () => {
		const html = parseHtml('<link rel="icon" href="/icon.ico" />', baseUrl);
		const icons = parseFavicons(html, baseUrl);

		assert.equal(icons[0]?.url, 'https://example.com/icon.ico');
		assert.equal(icons[0]?.mimeType, 'image/vnd.microsoft.icon');
		assert.equal(icons[0]?.width, 32);
		assert.equal(icons[0]?.height, 32);
	});

	test('Fallback to favicon', () => {
		const html = parseHtml('No icons here', baseUrl);
		const icons = parseFavicons(html, baseUrl);

		assert.equal(icons[0]?.url, 'https://example.com/favicon.ico');
		assert.equal(icons[0]?.mimeType, 'image/vnd.microsoft.icon');
		assert.equal(icons[0]?.width, 32);
		assert.equal(icons[0]?.height, 32);
	});
});

describe('Metadata Apple Icons', () => {
	const baseUrl = 'https://example.com';

	test('Apple touch icon', () => {
		const html = parseHtml('<link rel="apple-touch-icon" sizes="180x180" href="/apple-icon.png" />', baseUrl);
		const icons = parseAppleIcons(html, baseUrl);

		assert.equal(icons.length, 1);
		assert.equal(icons[0]?.url, 'https://example.com/apple-icon.png');
		assert.equal(icons[0]?.width, 180);
		assert.equal(icons[0]?.height, 180);
	});

	test('No icon', () => {
		const html = parseHtml('No apple icons', baseUrl);
		const icons = parseAppleIcons(html, baseUrl);

		assert.equal(icons.length, 0);
	});
});

describe('Metadata IE Icons', () => {
	const baseUrl = 'https://example.com';

	test('Tile Image', () => {
		const html = parseHtml('<meta name="msapplication-TileImage" content="/tile-image.png" />', baseUrl);
		const icons = parseIeIcons(html, baseUrl);

		assert.equal(icons.length, 1);
		assert.equal(icons[0]?.url, 'https://example.com/tile-image.png');
		assert.equal(icons[0]?.mimeType, 'image/png');
	});

	test('Square icon', () => {
		const html = parseHtml('<meta name="msapplication-square70x70logo" content="/square-icon.png" />', baseUrl);
		const icons = parseIeIcons(html, baseUrl);

		assert.equal(icons.length, 1);
		assert.equal(icons[0]?.url, 'https://example.com/square-icon.png');
		assert.equal(icons[0]?.width, 70);
		assert.equal(icons[0]?.height, 70);
	});

	test('Wide icon', () => {
		const html = parseHtml('<meta name="msapplication-wide310x150logo" content="/wide-icon.png" />', baseUrl);
		const icons = parseIeIcons(html, baseUrl);

		assert.equal(icons.length, 1);
		assert.equal(icons[0]?.url, 'https://example.com/wide-icon.png');
		assert.equal(icons[0]?.width, 310);
		assert.equal(icons[0]?.height, 150);
	});

	test('No icon', () => {
		const html = parseHtml('No IE icons', baseUrl);
		const icons = parseIeIcons(html, baseUrl);

		assert.equal(icons.length, 0);
	});
});

describe('Metadata MS Application Icons', () => {
	const baseUrl = 'https://example.com';

	test('Tile image', () => {
		const xml = parseXml(`<?xml version="1.0" encoding="utf-8"?>
		<browserconfig>
			<msapplication>
				<tile>
					<TileImage src="/tile-image.png" />
				</tile>
			</msapplication>
		</browserconfig>
		`);
		const icons = parseMsApplicationIcons(xml, baseUrl);

		assert.equal(icons.length, 1);
		assert.equal(icons[0]?.url, 'https://example.com/tile-image.png');
		assert.equal(icons[0]?.width, 256);
		assert.equal(icons[0]?.height, 256);
	});

	test('Square logo', () => {
		const xml = parseXml(`<?xml version="1.0" encoding="utf-8"?>
		<browserconfig>
			<msapplication>
				<tile>
					<square70x70logo src="/square.png" />
				</tile>
			</msapplication>
		</browserconfig>
		`);
		const icons = parseMsApplicationIcons(xml, baseUrl);

		assert.equal(icons.length, 1);
		assert.equal(icons[0]?.url, 'https://example.com/square.png');
		assert.equal(icons[0]?.width, 70);
		assert.equal(icons[0]?.height, 70);
	});

	test('Wide logo', () => {
		const xml = parseXml(`<?xml version="1.0" encoding="utf-8"?>
		<browserconfig>
			<msapplication>
				<tile>
					<wide310x150logo src="/wide.png" />
				</tile>
			</msapplication>
		</browserconfig>
		`);
		const icons = parseMsApplicationIcons(xml, baseUrl);

		assert.equal(icons.length, 1);
		assert.equal(icons[0]?.url, 'https://example.com/wide.png');
		assert.equal(icons[0]?.width, 310);
		assert.equal(icons[0]?.height, 150);
	});

	test('No images', () => {
		const xml = parseXml(`<?xml version="1.0" encoding="utf-8"?>
		<browserconfig>
			<msapplication>
				<tile></tile>
			</msapplication>
		</browserconfig>
		`);
		const icons = parseMsApplicationIcons(xml, baseUrl);

		assert.equal(icons.length, 0);
	});

	test('No document', () => {
		const icons = parseMsApplicationIcons(undefined, baseUrl);

		assert.equal(icons.length, 0);
	});
});

describe('Metadata Manifest Icons', () => {
	const baseUrl = 'https://example.com';

	test('Icon exists', () => {
		const manifest = {
			icons: [
				{
					src: '/manifest-icon.png',
					sizes: '192x192',
					type: 'image/png'
				}
			]
		};
		const icons = parseManifestIcons(manifest, baseUrl);

		assert.equal(icons.length, 1);
		assert.equal(icons[0]?.url, 'https://example.com/manifest-icon.png');
		assert.equal(icons[0]?.mimeType, 'image/png');
		assert.equal(icons[0]?.width, 192);
		assert.equal(icons[0]?.height, 192);
	});

	test('No icon', () => {
		const manifest = {
			icons: []
		};
		const icons = parseManifestIcons(manifest, baseUrl);

		assert.equal(icons.length, 0);
	});
});

describe('Metadata Largest Icon Size', () => {
	test('Sizes with one value', () => {
		const size = getLargestIconSize('192x192');
		assert.equal(size.width, 192);
		assert.equal(size.height, 192);
	});

	test('Sizes with multiple values', () => {
		const size = getLargestIconSize('32x32 64x64 128x128');

		assert.equal(size.width, 128);
		assert.equal(size.height, 128);
	});

	test('Sizes with decrescent values', () => {
		const size = getLargestIconSize('128x128 64x64 32x32');

		assert.equal(size.width, 128);
		assert.equal(size.height, 128);
	});

	test('Sizes with `any` value', () => {
		const size = getLargestIconSize('any');

		assert.equal(size.width, Infinity);
		assert.equal(size.height, Infinity);
	});

	test('Sizes with NaN values', () => {
		const size = getLargestIconSize('ZZxZZ =+)');

		assert.equal(size.width, -Infinity);
		assert.equal(size.height, -Infinity);
	});

	test('No sizes', () => {
		const size = getLargestIconSize(undefined);

		assert.equal(size.width, -Infinity);
		assert.equal(size.height, -Infinity);
	});
});

describe('Metadata Theme Color', () => {
	test('HTML theme color', () => {
		const html = parseHtml('<meta name="theme-color" content="#000000" />');
		const color = parseThemeColor(html, undefined, undefined);

		assert.equal(color, '#000000');
	});

	test('Manifest theme color', () => {
		const html = parseHtml('HTML');
		const manifest = {
			theme_color: '#000000'
		};
		const color = parseThemeColor(html, manifest, undefined);

		assert.equal(color, '#000000');
	});

	test('HTML tile color', () => {
		const html = parseHtml('<meta name="msapplication-TileColor" content="#000000" />');
		const color = parseThemeColor(html, undefined, undefined);

		assert.equal(color, '#000000');
	});

	test('HTML navbutton color', () => {
		const html = parseHtml('<meta name="msapplication-navbutton-color" content="#000000" />');
		const color = parseThemeColor(html, undefined, undefined);

		assert.equal(color, '#000000');
	});

	test('MSConfig tile color', () => {
		const html = parseHtml('HTML');
		const msconfig = parseXml(`<?xml version="1.0" encoding="utf-8"?>
		<browserconfig>
			<msapplication>
				<tile>
					<TileColor>#000000</TileColor>
				</tile>
			</msapplication>
		</browserconfig>
		`);
		const color = parseThemeColor(html, undefined, msconfig);

		assert.equal(color, '#000000');
	});
	test('Non hex theme color', () => {
		const html = parseHtml('<meta name="theme-color" content="black" />');
		const color = parseThemeColor(html, undefined, undefined);

		assert.equal(color, 'black');
	});

	test('No theme color', () => {
		const html = parseHtml('No colors');
		const color = parseThemeColor(html, undefined, undefined);

		assert.equal(color, undefined);
	});
});

describe('Metadata Image', () => {
	test('Open graph image', async () => {
		const html = parseHtml('<meta property="og:image" content="https://example.com/og-image.png" />');
		const image = await parseImage(html);

		assert.equal(image?.url, 'https://example.com/og-image.png');
	});

	test('Twitter image', async () => {
		const html = parseHtml('<meta name="twitter:image" content="https://example.com/twitter-image.png" />');
		const image = await parseImage(html);

		assert.equal(image?.url, 'https://example.com/twitter-image.png');
	});

	test('Itemprop content', async () => {
		const html = parseHtml('<meta itemprop="image" content="https://example.com/itemprop-image.png" />');
		const image = await parseImage(html);

		assert.equal(image?.url, 'https://example.com/itemprop-image.png');
	});

	test('Itemprop src', async () => {
		const html = parseHtml('<img itemprop="image" src="https://example.com/img-src.png" />');
		const image = await parseImage(html);

		assert.equal(image?.url, 'https://example.com/img-src.png');
	});

	test('Itemprop href', async () => {
		const html = parseHtml('<link itemprop="image" href="https://example.com/link-href.png" />');
		const image = await parseImage(html);

		assert.equal(image?.url, 'https://example.com/link-href.png');
	});

	test('Itemprop alt text', async () => {
		const html = parseHtml('<img itemprop="image" src="https://example.com/img-src.png" alt="Alt Text" />');
		const image = await parseImage(html);

		assert.equal(image?.url, 'https://example.com/img-src.png');
		assert.equal(image?.altText, 'Alt Text');
	});

	test('No image', async () => {
		const html = parseHtml('No images');
		const image = await parseImage(html);

		assert.equal(image, undefined);
	});
});

describe('Metadata Icons', () => {
	const baseUrl = 'https://example.com';

	test('SVG icon precedence', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/icon.ico" type="image/vnd.microsoft.icon" />
			<link rel="icon" href="/icon.svg" type="image/svg+xml" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/icon.svg');
	});

	test('PNG icon precedence', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/icon.ico" type="image/vnd.microsoft.icon" />
			<link rel="icon" href="/icon.png" type="image/png" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/icon.png');
	});

	test('Webp icon precedence', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/icon.ico" type="image/vnd.microsoft.icon" />
			<link rel="icon" href="/icon.webp" type="image/webp" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/icon.webp');
	});

	test('Avif icon precedence', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/icon.ico" type="image/vnd.microsoft.icon" />
			<link rel="icon" href="/icon.avif" type="image/avif" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/icon.avif');
	});

	test('JPEG icon precedence', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/icon.ico" type="image/vnd.microsoft.icon" />
			<link rel="icon" href="/icon.jpg" type="image/jpeg" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/icon.jpg');
	});

	test('GIF icon precedence', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/icon.ico" type="image/vnd.microsoft.icon" />
			<link rel="icon" href="/icon.gif" type="image/gif" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/icon.gif');
	});

	test('Ico icon precedence', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/icon.ico" type="image/vnd.microsoft.icon" />
			<link rel="icon" href="/other" type="image/*" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/icon.ico');
	});

	test('JPEG-XL icon', async () => {
		const html = parseHtml('<link rel="icon" href="/icon.jxl" type="image/jxl" />', baseUrl);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/favicon.ico');
	});

	test('JPEG 2000 icon', async () => {
		const html = parseHtml('<link rel="icon" href="/icon.jp2" type="image/jp2" />', baseUrl);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/favicon.ico');
	});

	test('HEIC icon', async () => {
		const html = parseHtml('<link rel="icon" href="/icon.heic" type="image/heic" />', baseUrl);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/favicon.ico');
	});

	test('Icon fails to fetch', async () => {
		const html = parseHtml('<link rel="icon" href="/missing.png?fail=true" />', baseUrl);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/favicon.ico');
	});

	test('Largest icon gets picked', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/small.png" sizes="32x32" />
			<link rel="icon" href="/large.png" sizes="128x128" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/large.png');
	});

	test('Wider icon gets picked', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/tall.png" sizes="32x64" />
			<link rel="icon" href="/wide.png" sizes="64x32" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/wide.png');
	});

	test('Taller icon gets picked', async () => {
		const html = parseHtml(
			`
			<link rel="icon" href="/square.png" sizes="64x64" />
			<link rel="icon" href="/tall.png" sizes="64x128" />
		`,
			baseUrl
		);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/tall.png');
	});

	test('Fetched icon size is present', async () => {
		const html = parseHtml('<link rel="icon" href="/icon.png?width=512&height=512" />', baseUrl);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/icon.png?width=512&height=512');
	});

	test('Fetched icon size is small', async () => {
		const html = parseHtml('<link rel="icon" href="/icon.png?width=-1&height=-1" />', baseUrl);
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/icon.png?width=-1&height=-1');
	});

	test('No icon declared', async () => {
		const html = parseHtml('No icon');
		const icon = await parseIcon(html, undefined, undefined, baseUrl);

		assert.equal(icon, 'https://example.com/favicon.ico');
	});
});

describe('Metadata Application Manifest', () => {
	const baseUrl = 'https://example.com';

	test('Manifest from link', async () => {
		const html = parseHtml('<link rel="manifest" href="/manifest-from-link.json" />', baseUrl);
		const manifest = await getApplicationManifest(html, baseUrl);

		assert.equal(manifest?.name, 'Manifest from link');
	});

	test('Manifest from `app.webmanifest`', async () => {
		const html = parseHtml('No manifest link', baseUrl);
		const manifest = await getApplicationManifest(html, baseUrl);

		assert.equal(manifest?.name, 'App Webmanifest');
	});

	test('Manifest from `manifest.json`', async () => {
		const html = parseHtml('No manifest link', baseUrl);
		const manifest = await getApplicationManifest(html, 'https://skip-app.example.com/');

		assert.equal(manifest?.name, 'Manifest JSON');
	});

	test('No manifest', async () => {
		const html = parseHtml('No manifest link', baseUrl);
		const manifest = await getApplicationManifest(html, 'https://skip-app.skip-manifest.example.com/');

		assert.equal(manifest, undefined);
	});
});

describe('Metadata MS Application Config', () => {
	const baseUrl = 'https://example.com';

	test('MSConfig from link', async () => {
		const html = parseHtml('<meta name="msapplication-config" content="/config-from-link.xml" />', baseUrl);
		const config = await getMsApplicationConfig(html, baseUrl);

		assert.isDefined(config);
	});

	test('MSConfig from `browserconfig.xml`', async () => {
		const html = parseHtml('No config link', baseUrl);
		const config = await getMsApplicationConfig(html, baseUrl);

		assert.isDefined(config);
	});

	test('MSConfig from `ieconfig.xml`', async () => {
		const html = parseHtml('No config link', baseUrl);
		const config = await getMsApplicationConfig(html, 'https://skip-browserconfig.example.com/');

		assert.isDefined(config);
	});

	test('No MSConfig', async () => {
		const html = parseHtml('No config link', baseUrl);
		const config = await getMsApplicationConfig(html, 'https://skip-browserconfig.skip-ieconfig.example.com/');

		assert.isUndefined(config);
	});
});

describe('Metadata Parsing', () => {
	test('Fetch an HTML document', async () => {
		const metadata = await parseMetadata('https://example.com/');

		assert.equal(metadata?.title, 'HTML Title');
	});

	test('Fetch an XHTML document', async () => {
		const metadata = await parseMetadata('https://xhtml.example.com/');

		assert.equal(metadata?.title, 'XHTML Title');
	});

	test('Fail to fetch the document', async () => {
		const metadata = await parseMetadata('https://fail.example.com/');

		assert.equal(metadata, undefined);
	});
});
