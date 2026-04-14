import { canParseXml, parseHtml, parseXhtml, parseXml } from '../utils/parsing.ts';

interface Manifest {
	icons: {
		src: string,
		type: string,
		sizes: string
	}[];
}

async function getManifest(baseUrl: string, manifestPath?: string | null) {
	const url = new URL(manifestPath ?? '/app.webmanifest', baseUrl);
	let response = await fetch(url.href);

	if (!response.ok) {
		const fallbackUrl = new URL(manifestPath ?? '/manifest.json', baseUrl);

		response = await fetch(fallbackUrl.href);
	}

	if (!response.ok) {
		throw new Error(`Failed to fetch manifest at ${url.href}`);
	}

	return response.json() satisfies Promise<Manifest>;
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

async function extractIcon(htmlDocument: Document, baseUrl: string) {
	const icons = [];

	const iconLinks = htmlDocument.querySelectorAll(
		'link[rel~="icon"], link[rel^="apple-touch-icon"], link[rel="apple-touch-startup-image"], link[rel="mask-icon"], link[rel="fluid-icon"]'
	);
	const ieIcons = htmlDocument.querySelectorAll('meta[name="msapplication-TileImage"], meta[name^="msapplication-square"], meta[name^="msapplication-wide"]');

	const ieConfig = htmlDocument.querySelector('meta[name="msapplication-config"]');
	const manifest = htmlDocument.querySelector('link[rel="manifest"]');

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
		const parsedManifest = await getManifest(baseUrl, manifest?.getAttribute('href'));

		parsedManifest.icons.forEach((icon) => {
			icons.push({
				href: new URL(icon.src, baseUrl).href,
				type: icon.type,
				sizes: icon.sizes
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
	// TODO: add open graph
	const title = htmlDocument.querySelector('title')?.textContent;
	const metaTitle = htmlDocument.querySelector('meta[name$="title"], meta[itemprop="name"]')?.getAttribute('content');

	return title ?? metaTitle;
}

function parseDescription(htmlDocument: Document) {
	// TODO: add open graph
	const description = htmlDocument.querySelector('meta[name$="description"], meta[itemprop="description"]')?.getAttribute('content');

	return description;
}

function parseImage(htmlDocument: Document) {
	// TODO: add open graph
	const image = htmlDocument.querySelector('meta[name$="image"], meta[itemprop="image"]')?.getAttribute('content');

	return image;
}

export function extractMedatada(html: string) {
	// TODO: add support for oembed?

	let parsedDocument: Document;

	if (canParseXml(html)) {
		parsedDocument = parseXhtml(html);
	} else {
		parsedDocument = parseHtml(html);
	}

	return {
		title: parseTitle(parsedDocument),
		description: parseDescription(parsedDocument),
		image: parseImage(parsedDocument)
	};
}
