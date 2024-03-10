async function getManifest(baseUrl: string, manifestPath?: string | null) {
	const manifestUrl = new URL(manifestPath ?? '/app.webmanifest', baseUrl);
	let manifestResponse = await fetch(manifestUrl.href);

	if (!manifestResponse.ok) {
		const fallbackManifestUrl = new URL(manifestPath ?? '/manifest.json', baseUrl);

		manifestResponse = await fetch(fallbackManifestUrl.href);
	}

	if (!manifestResponse.ok) {
		throw new Error(`Failed to fetch manifest at ${manifestUrl.href}`);
	}

	return manifestResponse.json();
}

async function getMsApplicationConfig(baseUrl: string, configPath?: string | null) {
	const configUrl = new URL(configPath ?? '/browserconfig.xml', baseUrl);
	const configResponse = await fetch(configUrl.href);

	if (!configResponse.ok) {
		throw new Error(`Failed to fetch config at ${configUrl.href}`);
	}

	const documentParser = new DOMParser();
	const configDocument = documentParser.parseFromString(await configResponse.text(), 'text/xml');

	return configDocument;
}

export async function extractIcon(html: string, baseUrl: string) {
	const icons = [];

	const parser = new DOMParser();
	const parsedDocument = parser.parseFromString(html, 'text/html');

	const iconLinks = parsedDocument.querySelectorAll('link[rel~="icon"], link[rel^="apple-touch-icon"], link[rel="apple-touch-startup-image"], link[rel="mask-icon"], link[rel="fluid-icon"]');
	const ieIcons = parsedDocument.querySelectorAll('meta[name="msapplication-TileImage"], meta[name^="msapplication-square"], meta[name^="msapplication-wide"]');

	const ieConfig = parsedDocument.querySelector('meta[name="msapplication-config"]');
	const manifest = parsedDocument.querySelector('link[rel="manifest"]');

	iconLinks.forEach((iconLink) => {
		icons.push({
			href: new URL(iconLink.getAttribute('href') as string, baseUrl).href,
			type: iconLink.getAttribute('type'),
			sizes: iconLink.getAttribute('sizes')
		});
	});

	ieIcons.forEach((ieIcon) => {
		icons.push({
			href: new URL(ieIcon.getAttribute('content') as string, baseUrl).href,
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
				href: new URL(msconfigIcon.getAttribute('src') as string, baseUrl).href,
				type: 'image/png',
				sizes: msconfigIcon.tagName.replace(/^(?:square|wide)(.+)logo$/giu, '$1') || '256x256'
			});
		});
	} catch {
		// Ignore errors
	}

	try {
		const parsedManifest = await getManifest(baseUrl, manifest?.getAttribute('href'));

		parsedManifest.icons.forEach((icon: { src: string, type: string, sizes: string }) => {
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

		const aSizes = first.sizes.split('x').map((size) => Number.parseInt(size));
		const bSizes = second.sizes.split('x').map((size) => Number.parseInt(size));
		const aSizesSum = aSizes.reduce((sum, size) => sum + size, 0);
		const bSizesSum = bSizes.reduce((sum, size) => sum + size, 0);
		const sizesDifference = aSizesSum - bSizesSum;

		return typeDifference || sizesDifference;
	})[0]?.href;
}

export function extractMedatada(html: string) {
	const parser = new DOMParser();
	const parsedDocument = parser.parseFromString(html, 'text/html');

	const title = parsedDocument.querySelector('title')?.textContent;
	const metaTitle = parsedDocument.querySelector('meta[name$="title"], meta[itemprop="name"]')?.getAttribute('content');
	const description = parsedDocument.querySelector('meta[name$="description"], meta[itemprop="description"]')?.getAttribute('content');

	const image = parsedDocument.querySelector('meta[name$="image"], meta[itemprop="image"]')?.getAttribute('content');

	return {
		title: title ?? metaTitle,
		description,
		image
	};
}
