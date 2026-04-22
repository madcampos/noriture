import { canParseXml, parseHtml, parseUrl, parseUrlWithBase, parseXhtml, parseXml } from '../utils/parsing.ts';
import type { WebManifest } from './web-app-manifest';

interface MetadataIcon {
	url: string;
	mimeType: string;
	width: number;
	height: number;
}

const EXTENSION_MIME_MAP = {
	'.svg': 'image/svg+xml',
	'.png': 'image/png',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.ico': 'image/x-icon',
	'.webp': 'image/webp',
	'.avif': 'image/avif',
	'.gif': 'image/gif'
};

function getMimeTypeFromExtension(url: string) {
	return Object.entries(EXTENSION_MIME_MAP).find(([extension]) => url.endsWith(extension))?.[1] ?? 'image/*';
}

function getLargestIconSize(sizes?: string) {
	const sizeList = (sizes?.split(' ') ?? []).map((size) => {
		const [iconWidth = '0', iconHeight = '0'] = size.split('x');

		return {
			width: Number.parseInt(iconWidth, 10),
			height: Number.parseInt(iconHeight, 10)
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

async function getApplicationManifest(htmlDocument: Document, baseUrl: string) {
	const manifestPath = htmlDocument.querySelector('link[rel="manifest"]')?.getAttribute('href');

	const manifestUrl = new URL(manifestPath ?? '/app.webmanifest', baseUrl).href;
	let response = await fetch(`/proxy?url=${encodeURIComponent(manifestUrl)}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	if (!response.ok) {
		const fallbackUrl = new URL(manifestPath ?? '/manifest.json', baseUrl).href;

		response = await fetch(`/proxy?url=${encodeURIComponent(fallbackUrl)}`, {
			method: 'GET',
			credentials: 'omit',
			redirect: 'follow'
		});
	}

	if (!response.ok) {
		return undefined;
	}

	return response.json<WebManifest>();
}

function parseManifestIcons(manifest: WebManifest | undefined, baseUrl: string) {
	if (!manifest) {
		return [];
	}

	const icons: MetadataIcon[] | undefined = manifest.icons?.map(({ src, type, sizes }) => {
		const url = parseUrlWithBase(src, baseUrl)?.href ?? '';
		const { width, height } = getLargestIconSize(sizes);

		return {
			url,
			mimeType: type ?? getMimeTypeFromExtension(url),
			width,
			height
		};
	}).filter(({ url }) => url);

	return icons ?? [];
}

async function getMsApplicationConfig(htmlDocument: Document, baseUrl: string) {
	const msConfigElement = htmlDocument.querySelector('meta[name="msapplication-config"]');
	const configPath = msConfigElement?.getAttribute('content');

	const url = new URL(configPath ?? '/browserconfig.xml', baseUrl).href;
	let response = await fetch(`/proxy?url=${encodeURIComponent(url)}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	if (!response.ok) {
		const fallbackUrl = new URL('/ieconfig.xml', baseUrl).href;
		response = await fetch(`/proxy?url=${encodeURIComponent(fallbackUrl)}`, {
			method: 'GET',
			credentials: 'omit',
			redirect: 'follow'
		});
	}

	if (!response.ok) {
		return undefined;
	}

	const text = await response.text();

	return parseXml(text);
}

function parseMsApplicationIcons(xmlDocument: XMLDocument | undefined, baseUrl: string) {
	if (!xmlDocument) {
		return [];
	}

	const msConfigIcons = [...xmlDocument.querySelectorAll('tile > [src]')];

	const icons: MetadataIcon[] = msConfigIcons.map((iconElement) => {
		const href = iconElement.getAttribute('src');
		const size = iconElement.tagName.replace(/^(?:square|wide)(.+)logo$/giu, '$1') || '256x256';
		const { width, height } = getLargestIconSize(size);

		return {
			url: parseUrlWithBase(href, baseUrl)?.href ?? '',
			mimeType: 'image/png',
			width,
			height
		};
	}).filter(({ url }) => url);

	return icons;
}

function parseIeIcons(htmlDocument: Document, baseUrl: string) {
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

function parseAppleIcons(htmlDocument: Document, baseUrl: string) {
	const appleIcons = [...htmlDocument.querySelectorAll('link[rel^="apple-touch-icon"]')];

	const icons: MetadataIcon[] = appleIcons.map((iconElement) => {
		const href = iconElement.href;
		const url = parseUrlWithBase(href, baseUrl)?.href ?? '';
		const { width, height } = getLargestIconSize(iconElement.sizes.value);

		return {
			url,
			mimeType: iconElement.getAttribute('type') ?? getMimeTypeFromExtension(url),
			width,
			height
		};
	}).filter(({ url }) => url);

	return icons;
}

function parseFavicon(htmlDocument: Document, baseUrl: string) {
	const favicon = htmlDocument.querySelector('link[rel~="icon"]');
	const { width, height } = getLargestIconSize(favicon?.sizes.value);
	const href = favicon?.href;
	const url = parseUrlWithBase(href, baseUrl)?.href ?? '';

	let icon: MetadataIcon = {
		url,
		mimeType: favicon?.getAttribute('type') ?? getMimeTypeFromExtension(url),
		width,
		height
	};

	if (!favicon) {
		const fallbackUrl = new URL('/favicon.ico', baseUrl).href;

		icon = {
			url: fallbackUrl,
			mimeType: 'image/x-icon',
			width: 32,
			height: 32
		};
	}

	return icon;
}

function parseIcons(htmlDocument: Document, manifest: WebManifest | undefined, msconfig: XMLDocument | undefined, baseUrl: string) {
	// TODO: send HEAD requests to ping the urls (through proxy)
	const icons = [
		...parseManifestIcons(manifest, baseUrl),
		...parseAppleIcons(htmlDocument, baseUrl),
		...parseIeIcons(htmlDocument, baseUrl),
		...parseMsApplicationIcons(msconfig, baseUrl),
		parseFavicon(htmlDocument, baseUrl)
	];

	const mimeTypePrecedence = [
		'image/svg+xml',
		'image/png',
		'image/webp',
		'image/x-icon',
		'image/vnd.microsoft.icon',
		'image/avif',
		'image/jpeg',
		'image/gif'
	];

	return icons.sort((first, second) => {
		const lastMimeType = mimeTypePrecedence.length;

		const aTypeIndex = mimeTypePrecedence.includes(first.mimeType)
			? mimeTypePrecedence.indexOf(first.mimeType)
			: lastMimeType;
		const bTypeIndex = mimeTypePrecedence.includes(second.mimeType)
			? mimeTypePrecedence.indexOf(second.mimeType)
			: lastMimeType;
		const typeDifference = aTypeIndex - bTypeIndex;

		const widthDifference = first.width - second.width;
		const heightDifference = first.height - second.height;

		return typeDifference || widthDifference || heightDifference;
	})[0]?.url;
}

function parseTitle(htmlDocument: Document) {
	const titleElement = htmlDocument.querySelector('title')?.textContent;
	const openGraphTitle = htmlDocument.querySelector('meta[property="og:title"]')?.getAttribute('content');
	const twitterTitle = htmlDocument.querySelector('meta[property="twitter:title"]')?.getAttribute('content');

	const itempropElement = htmlDocument.querySelector('[itemprop="name"]');
	const itempropTitle = itempropElement?.getAttribute('content') ?? itempropElement?.textContent;

	return titleElement ?? openGraphTitle ?? twitterTitle ?? itempropTitle;
}

function parseDescription(htmlDocument: Document) {
	const metaDescription = htmlDocument.querySelector('meta[name="description"]')?.getAttribute('content');
	const openGraphDescription = htmlDocument.querySelector('meta[name="og:description"]')?.getAttribute('content');
	const twitterDescription = htmlDocument.querySelector('meta[name="twitter:description"]')?.getAttribute('content');

	const itempropElement = htmlDocument.querySelector('[itemprop="name"]');
	const itempropDescription = itempropElement?.getAttribute('content') ?? itempropElement?.textContent;

	return metaDescription ?? openGraphDescription ?? twitterDescription ?? itempropDescription;
}

function parseImage(htmlDocument: Document) {
	const openGraphImage = htmlDocument.querySelector('meta[property="og:image]')?.getAttribute('content');
	const openGraphImageAlt = htmlDocument.querySelector('meta[property="og:image:alt]')?.getAttribute('content');
	const twitterImage = htmlDocument.querySelector('meta[property="twitter:image]')?.getAttribute('content');
	const twitterImageAlt = htmlDocument.querySelector('meta[property="twitter:image:alt]')?.getAttribute('content');

	const itempropElement = htmlDocument.querySelector('[itemprop="name"]');
	const itempropImage = itempropElement?.getAttribute('content') ?? itempropElement?.getAttribute('src') ?? itempropElement?.getAttribute('href');
	const itempropAlt = itempropElement?.getAttribute('alt');

	return {
		url: parseUrl(openGraphImage, twitterImage, itempropImage)?.href,
		altText: openGraphImageAlt ?? twitterImageAlt ?? itempropAlt ?? undefined
	};
}

function parseThemeColor(htmlDocument: Document, manifest: WebManifest | undefined, msconfig: XMLDocument | undefined) {
	const htmlThemeColor = htmlDocument.querySelector('meta[name="theme-color"]')?.getAttribute('content');
	const manifestThemeColor = manifest?.theme_color;

	const htmlMsThemeColor = htmlDocument.querySelector('meta[name="msapplication-TileColor"]')?.getAttribute('content');
	const htmlIeNavButtonColor = htmlDocument.querySelector('meta[name="msapplication-navbutton-color"]')?.getAttribute('content');

	const msConfigThemeColor = msconfig?.querySelector('TileColor')?.textContent;

	return manifestThemeColor ?? htmlThemeColor ?? htmlMsThemeColor ?? msConfigThemeColor ?? htmlIeNavButtonColor ?? undefined;
}

export async function parseMetadata(siteUrl: string) {
	const response = await fetch(`/proxy?url=${encodeURIComponent(siteUrl)}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	if (!response.ok) {
		throw new Error(`Could not fetch feed: ${response.status} ${await response.text()}`);
	}

	const text = await response.text();

	let parsedDocument: Document;

	if (canParseXml(text)) {
		parsedDocument = parseXhtml(text);
	} else {
		parsedDocument = parseHtml(text);
	}

	const manifest = await getApplicationManifest(parsedDocument, siteUrl);
	const msconfig = await getMsApplicationConfig(parsedDocument, siteUrl);

	return {
		themeColor: parseThemeColor(parsedDocument, manifest, msconfig),
		title: parseTitle(parsedDocument),
		description: parseDescription(parsedDocument),
		image: parseImage(parsedDocument),
		icon: parseIcons(parsedDocument, manifest, msconfig, siteUrl)
	};
}
