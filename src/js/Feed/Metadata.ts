import { fetchProxied, getImageSizes } from '../utils/fetch.ts';
import { getMimeTypeFromExtension } from '../utils/mime-types.ts';
import { canParseXml, parseHtml, parseIntWithFallback, parseUrl, parseUrlWithBase, parseXhtml, parseXml } from '../utils/parsing.ts';
import type { WebManifest } from './web-app-manifest';

interface MetadataIcon {
	url: string;
	mimeType: string;
	width: number;
	height: number;
}

export function getLargestIconSize(sizes?: string) {
	const sizeList = (sizes?.split(' ') ?? []).map((size) => {
		if (size.trim() === 'any') {
			return {
				width: Infinity,
				height: Infinity
			};
		}

		const [iconWidth, iconHeight] = size.trim().split('x');

		return {
			width: parseIntWithFallback(iconWidth, -Infinity),
			height: parseIntWithFallback(iconHeight, -Infinity)
		};
	}).sort((first, second) => {
		if (second.width !== first.width) {
			return second.width - first.width;
		}
		return second.height - first.height;
	});

	return sizeList[0] ?? {
		width: -Infinity,
		height: -Infinity
	};
}

export async function getApplicationManifest(htmlDocument: Document, baseUrl: string) {
	const manifestPath = htmlDocument.querySelector('link[rel="manifest"]')?.getAttribute('href');

	let response: Response | undefined = undefined;

	try {
		const manifestUrl = new URL(manifestPath ?? '/app.webmanifest', baseUrl).href;
		response = await fetchProxied(manifestUrl);
	} catch {
		try {
			const fallbackUrl = new URL(manifestPath ?? '/manifest.json', baseUrl).href;

			response = await fetchProxied(fallbackUrl);
		} catch {
			return undefined;
		}
	}

	return response.json<WebManifest>();
}

export function parseManifestIcons(manifest: WebManifest | undefined, baseUrl: string) {
	if (!manifest) {
		return [];
	}

	const icons: MetadataIcon[] | undefined = manifest.icons?.map(({ src, type, sizes }) => {
		const url = parseUrlWithBase(src, baseUrl)?.href ?? '';
		const { width, height } = getLargestIconSize(sizes);

		return {
			url,
			mimeType: type ?? getMimeTypeFromExtension(url) ?? 'image/*',
			width,
			height
		};
	}).filter(({ url }) => url);

	return icons ?? [];
}

export async function getMsApplicationConfig(htmlDocument: Document, baseUrl: string) {
	const msConfigElement = htmlDocument.querySelector('meta[name="msapplication-config"]');
	const configPath = msConfigElement?.getAttribute('content');

	let response: Response | undefined;

	try {
		const url = new URL(configPath ?? '/browserconfig.xml', baseUrl).href;
		response = await fetchProxied(url);
	} catch {
		try {
			const fallbackUrl = new URL('/ieconfig.xml', baseUrl).href;
			response = await fetchProxied(fallbackUrl);
		} catch {
			return undefined;
		}
	}

	const text = await response.text();

	return parseXml(text);
}

export function parseMsApplicationIcons(xmlDocument: XMLDocument | undefined, baseUrl: string) {
	if (!xmlDocument) {
		return [];
	}

	const msConfigIcons = [...xmlDocument.querySelectorAll('tile > [src]')];

	const icons: MetadataIcon[] = msConfigIcons.map((iconElement) => {
		const href = iconElement.getAttribute('src');
		const size = iconElement.tagName.replace(/^(?:square|wide)(.+)logo$/giu, '$1');
		let { width, height } = getLargestIconSize(size);

		if (iconElement.tagName.toLowerCase() === 'tileimage') {
			/* oxlint-disable no-magic-numbers */
			width = 256;
			height = 256;
			/* oxlint-enable no-magic-numbers */
		}

		return {
			url: parseUrlWithBase(href, baseUrl)?.href ?? '',
			mimeType: 'image/png',
			width,
			height
		};
	}).filter(({ url }) => url);

	return icons;
}

export function parseIeIcons(htmlDocument: Document, baseUrl: string) {
	const ieIcons = [...htmlDocument.querySelectorAll('meta[name="msapplication-TileImage"], meta[name^="msapplication-square"], meta[name^="msapplication-wide"]')];

	const icons: MetadataIcon[] = ieIcons.map((iconElement) => {
		const href = iconElement.content;
		const size = iconElement.getAttribute('name')?.replace(/^msapplication-(?:square|wide)(.+)(?:-TileImage|logo)$/giu, '$1') ?? '256x256';
		const { width, height } = getLargestIconSize(size);

		return {
			url: parseUrlWithBase(href, baseUrl)?.href ?? '',
			mimeType: iconElement.getAttribute('type') ?? 'image/png',
			width,
			height
		};
	});

	return icons;
}

export function parseAppleIcons(htmlDocument: Document, baseUrl: string) {
	const appleIcons = [...htmlDocument.querySelectorAll('link[rel^="apple-touch-icon"]')];

	const icons: MetadataIcon[] = appleIcons.map((iconElement) => {
		const href = iconElement.href;
		const url = parseUrlWithBase(href, baseUrl)?.href ?? '';
		const { width, height } = getLargestIconSize(iconElement.sizes.value);

		return {
			url,
			mimeType: iconElement.getAttribute('type') ?? getMimeTypeFromExtension(url) ?? 'image/*',
			width,
			height
		};
	}).filter(({ url }) => url);

	return icons;
}

export function parseFavicons(htmlDocument: Document, baseUrl: string) {
	const icons = [...htmlDocument.querySelectorAll('link[rel~="icon"]')].map((icon) => {
		let { width, height } = getLargestIconSize(icon.sizes.value);
		const href = icon.href;
		const url = parseUrlWithBase(href, baseUrl)?.href ?? '';
		const typeAttribute = icon.getAttribute('type')?.trim();
		let type = typeAttribute;

		if (typeAttribute === 'icon' || typeAttribute?.match(/image\/.*?icon/iu)) {
			type = 'image/vnd.microsoft.icon';
		}

		const mimeType = type ?? getMimeTypeFromExtension(url) ?? 'image/*';

		if (mimeType === 'image/vnd.microsoft.icon') {
			/* oxlint-disable no-magic-numbers */
			width = 32;
			height = 32;
			/* oxlint-enable no-magic-numbers */
		}

		const iconMetadata: MetadataIcon = {
			url,
			mimeType,
			width,
			height
		};

		return iconMetadata;
	});

	const fallbackUrl = new URL('/favicon.ico', baseUrl).href;

	icons.push({
		url: fallbackUrl,
		mimeType: 'image/vnd.microsoft.icon',
		width: 32,
		height: 32
	});

	return icons;
}

export async function parseIcon(htmlDocument: Document, manifest: WebManifest | undefined, msconfig: XMLDocument | undefined, baseUrl: string) {
	const icons = [
		...parseManifestIcons(manifest, baseUrl),
		...parseAppleIcons(htmlDocument, baseUrl),
		...parseIeIcons(htmlDocument, baseUrl),
		...parseMsApplicationIcons(msconfig, baseUrl),
		...parseFavicons(htmlDocument, baseUrl)
	];

	const mimeTypePrecedence = [
		'image/svg+xml',
		'image/png',
		'image/webp',
		'image/avif',
		'image/jpeg',
		'image/gif',
		'image/vnd.microsoft.icon'
	];

	const fetchedIcons = await Promise.allSettled(icons.map(async (icon) => {
		const fetchedSize = await getImageSizes(icon.url);

		if (!fetchedSize) {
			return undefined;
		}

		if (icon.width <= 0 && fetchedSize.width > 0) {
			icon.width = fetchedSize.width;
		}

		if (icon.height <= 0 && fetchedSize.height > 0) {
			icon.height = fetchedSize.height;
		}

		return icon;
	}));

	const filteredIcons = fetchedIcons
		.filter((result) => result.status === 'fulfilled')
		.map((result) => result.value)
		.filter((value) => value !== undefined);

	const sortedIcons = filteredIcons.sort((first, second) => {
		const lastMimeType = mimeTypePrecedence.length;

		const aTypeIndex = mimeTypePrecedence.includes(first.mimeType)
			? mimeTypePrecedence.indexOf(first.mimeType)
			: lastMimeType;
		const bTypeIndex = mimeTypePrecedence.includes(second.mimeType)
			? mimeTypePrecedence.indexOf(second.mimeType)
			: lastMimeType;
		const typeDifference = aTypeIndex - bTypeIndex;

		const widthDifference = second.width - first.width;
		const heightDifference = second.height - first.height;

		return typeDifference || widthDifference || heightDifference;
	});

	return sortedIcons[0]?.url;
}

export function parseTitle(htmlDocument: Document) {
	const titleElement = htmlDocument.querySelector('title')?.textContent;
	const openGraphTitle = htmlDocument.querySelector('meta:is([property="og:title"], [name="og:title"])')?.getAttribute('content');
	const twitterTitle = htmlDocument.querySelector('meta:is([property="twitter:title"], [name="twitter:title"])')?.getAttribute('content');

	const itempropElement = htmlDocument.querySelector('[itemprop="name"]');
	const itempropTitle = itempropElement?.getAttribute('content') ?? itempropElement?.textContent;

	return titleElement ?? openGraphTitle ?? twitterTitle ?? itempropTitle;
}

export function parseDescription(htmlDocument: Document) {
	const metaDescription = htmlDocument.querySelector('meta[name="description"]')?.getAttribute('content');
	const openGraphDescription = htmlDocument.querySelector('meta:is([property="og:description"], [name="og:description"])')?.getAttribute('content');
	const twitterDescription = htmlDocument.querySelector('meta:is([property="twitter:description"], [name="twitter:description"])')?.getAttribute('content');

	const itempropElement = htmlDocument.querySelector('[itemprop="description"]');
	const itempropDescription = itempropElement?.getAttribute('content') ?? itempropElement?.textContent;

	return metaDescription ?? openGraphDescription ?? twitterDescription ?? itempropDescription;
}

export async function parseImage(htmlDocument: Document) {
	const openGraphImage = htmlDocument.querySelector('meta:is([property="og:image"], [name="og:image"])')?.getAttribute('content');
	const openGraphImageAlt = htmlDocument.querySelector('meta:is([property="og:image:alt"], [name="og:image:alt"])')?.getAttribute('content');
	const twitterImage = htmlDocument.querySelector('meta:is([property="twitter:image"], [name="twitter:image"])')?.getAttribute('content');
	const twitterImageAlt = htmlDocument.querySelector('meta:is([property="twitter:image:alt"], [name="twitter:image:alt"])')?.getAttribute('content');

	const itempropElement = htmlDocument.querySelector('[itemprop="image"]');
	const itempropImage = itempropElement?.getAttribute('content') ?? itempropElement?.getAttribute('src') ?? itempropElement?.getAttribute('href');
	const itempropAlt = itempropElement?.getAttribute('alt');

	const url = parseUrl(openGraphImage, twitterImage, itempropImage)?.href;

	if (!url) {
		return undefined;
	}

	const doesImageExist = await getImageSizes(url);

	if (!doesImageExist) {
		return undefined;
	}

	return {
		url,
		altText: openGraphImageAlt ?? twitterImageAlt ?? itempropAlt ?? undefined
	};
}

export function parseThemeColor(htmlDocument: Document, manifest: WebManifest | undefined, msconfig: XMLDocument | undefined) {
	const htmlThemeColor = htmlDocument.querySelector('meta[name="theme-color"]')?.getAttribute('content');
	const manifestThemeColor = manifest?.theme_color;

	const htmlMsThemeColor = htmlDocument.querySelector('meta[name="msapplication-TileColor"]')?.getAttribute('content');
	const htmlIeNavButtonColor = htmlDocument.querySelector('meta[name="msapplication-navbutton-color"]')?.getAttribute('content');

	const msConfigThemeColor = msconfig?.querySelector('TileColor')?.textContent;

	return manifestThemeColor ?? htmlThemeColor ?? htmlMsThemeColor ?? msConfigThemeColor ?? htmlIeNavButtonColor ?? undefined;
}

export async function parseMetadata(siteUrl: string) {
	try {
		const response = await fetchProxied(siteUrl);
		const text = await response.text();

		let parsedDocument: Document;

		if (canParseXml(text)) {
			parsedDocument = parseXhtml(text, siteUrl);
		} else {
			parsedDocument = parseHtml(text, siteUrl);
		}

		const [manifestResult, msconfigResult, imageResult] = await Promise.allSettled([
			getApplicationManifest(parsedDocument, siteUrl),
			getMsApplicationConfig(parsedDocument, siteUrl),
			parseImage(parsedDocument)
		]);
		const manifest = manifestResult.status === 'fulfilled' ? manifestResult.value : undefined;
		const msconfig = msconfigResult.status === 'fulfilled' ? msconfigResult.value : undefined;
		const image = imageResult.status === 'fulfilled' ? imageResult.value : undefined;

		return {
			themeColor: parseThemeColor(parsedDocument, manifest, msconfig),
			title: parseTitle(parsedDocument),
			description: parseDescription(parsedDocument),
			image,
			icon: await parseIcon(parsedDocument, manifest, msconfig, siteUrl)
		};
	} catch (err) {
		console.error(err);

		return undefined;
	}
}
