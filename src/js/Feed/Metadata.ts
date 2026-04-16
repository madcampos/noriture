import { canParseXml, parseHtml, parseUrl, parseXhtml, parseXml } from '../utils/parsing.ts';

interface MetadataIcons {
	url: string;
	mimeType?: string;
	sizes?: string;
}

interface AppManifestIcons {
	icons?: {
		src: string,
		type?: string,
		sizes?: string
	}[];
}

async function getMsApplicationConfig(baseUrl: string, configPath?: string | null) {
	const url = new URL(configPath ?? '/browserconfig.xml', baseUrl);
	const response = await fetch(url.href);

	if (!response.ok) {
		throw new Error(`Failed to fetch config at ${url.href}`);
	}

	const text = await response.text();

	return parseXml(text);
}

async function parseManifestIcons(htmlDocument: Document, baseUrl: string) {
	const manifestPath = htmlDocument.querySelector('link[rel="manifest"]')?.getAttribute('href');

	const url = new URL(manifestPath ?? '/app.webmanifest', baseUrl);
	let response = await fetch(url.href);

	if (!response.ok) {
		const fallbackUrl = new URL(manifestPath ?? '/manifest.json', baseUrl);

		response = await fetch(fallbackUrl.href);
	}

	if (!response.ok) {
		return [];
	}

	const manifest = await response.json<AppManifestIcons>();

	const icons = manifest.icons?.map(({ src, type, sizes }) => ({
		url: parseUrl(src)?.href,
		mimeType: type,
		sizes
	}));

	return icons ?? [];
}

async function parseMsApplicationIcons(baseUrl: string, configPath?: string | null) {
	// TODO
}

function parseAppleIcons(htmlDocument: Document, baseUrl: string) {
	// TODO
}

function parseIeIcons(htmlDocument: Document, baseUrl: string) {
	// TODO
}

function parseFavicon(htmlDocument: Document, baseUrl: string) {
	// TODO
}

function parseSafariMaskIcon(htmlDocument: Document, baseUrl: string) {
	// TODO
}

async function parseIcons(htmlDocument: Document, baseUrl: string) {
	// TODO: compose list of icons
	// TODO: sort icons
	// TODO: batch send HEAD requests to ping the urls (through proxy?)
	const icons = [];

	const manifestIcons = await parseManifestIcons(htmlDocument, baseUrl);

	const iconLinks = htmlDocument.querySelectorAll(
		'link[rel~="icon"], link[rel^="apple-touch-icon"], link[rel="apple-touch-startup-image"], link[rel="mask-icon"]'
	);
	const ieIcons = htmlDocument.querySelectorAll('meta[name="msapplication-TileImage"], meta[name^="msapplication-square"], meta[name^="msapplication-wide"]');

	const ieConfig = htmlDocument.querySelector('meta[name="msapplication-config"]');

	iconLinks.forEach((iconLink) => {
		icons.push({
			href: new URL(iconLink.getAttribute('href') ?? '', baseUrl).href,
			type: iconLink.getAttribute('type'),
			sizes: iconLink.getAttribute('sizes')
		});
	});

	ieIcons.forEach((ieIcon) => {
		icons.push({
			href: new URL(ieIcon.getAttribute('content') ?? '', baseUrl).href,
			type: 'image/png',
			// eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
			sizes: ieIcon.getAttribute('name')?.replace(/^msapplication-(?:square|wide)(.+)(?:-TileImage|logo)$/giu, '$1') || '256x256'
		});
	});

	try {
		const msconfig = await getMsApplicationConfig(baseUrl, ieConfig?.getAttribute('content'));
		const msconfigIcons = msconfig.querySelectorAll('tile > [src]');

		msconfigIcons.forEach((msconfigIcon) => {
			icons.push({
				href: new URL(msconfigIcon.getAttribute('src') ?? '', baseUrl).href,
				type: 'image/png',
				sizes: msconfigIcon.tagName.replace(/^(?:square|wide)(.+)logo$/giu, '$1') ?? '256x256'
			});
		});
	} catch {
		// Ignore errors
	}

	try {
		const faviconResponse = await fetch(new URL('/favicon.ico', baseUrl).href);

		if (faviconResponse.ok) {
			icons.push({
				href: new URL('/favicon.ico', baseUrl).href,
				type: 'image/x-icon',
				sizes: '32x32'
			});
		}
	} catch {
		// Ignore errors
	}

	return icons.sort((first, second) => {
		const typePrecedence = ['image/svg+xml', 'image/png', 'image/x-icon', 'image/gif', 'image/jpeg'];
		const aTypeIndex = !typePrecedence.includes(first.type) ? typePrecedence.length : typePrecedence.indexOf(first.type);
		const bTypeIndex = !typePrecedence.includes(second.type) ? typePrecedence.length : typePrecedence.indexOf(second.type);
		const typeDifference = aTypeIndex - bTypeIndex;

		const aSizes = first.sizes.split('x').map((size) => Number.parseInt(size, 10));
		const bSizes = second.sizes.split('x').map((size) => Number.parseInt(size, 10));
		const aSizesSum = aSizes.reduce((sum, size) => sum + size, 0);
		const bSizesSum = bSizes.reduce((sum, size) => sum + size, 0);
		const sizesDifference = aSizesSum - bSizesSum;

		return typeDifference || sizesDifference;
	})[0]?.href;
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

	return {
		title: parseTitle(parsedDocument),
		description: parseDescription(parsedDocument),
		image: parseImage(parsedDocument)
	};
}
