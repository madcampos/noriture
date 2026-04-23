export const htmlSanitizer = new Sanitizer({
	removeElements: [
		'base',
		'dialog',
		'embed',
		'fencedframe',
		'form',
		'head',
		'iframe',
		'link',
		'meta',
		'object',
		'script',
		'style',
		'template',
		'use'
	],
	replaceWithChildrenElements: ['body'],
	removeAttributes: ['style', 'autoplay', 'class', 'contenteditable']
});

htmlSanitizer.removeUnsafe();

// TODO: does this need a base url as well?
export function parseContentHtml(unsafeString?: string) {
	if (!unsafeString) {
		return;
	}

	const template = document.createElement('template');

	template.setHTML(unsafeString, { sanitizer: htmlSanitizer });

	return template.content;
}

export function parseText(unsafeString?: string) {
	return parseContentHtml(unsafeString)?.textContent;
}

export function cleanCData(text?: string) {
	return text
		?.trim()
		.replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1')
		.trim();
}

export function canParseXml(text: string) {
	if (!text.trim()) {
		return false;
	}

	if (!text.startsWith('<?xml')) {
		return false;
	}

	return true;
}

export function parseXml(text: string) {
	if (!text.trim()) {
		throw new RangeError('Empty XML text');
	}

	if (!text.startsWith('<?xml')) {
		throw new SyntaxError('Document does not start with "<?xml"');
	}

	const xml = new DOMParser().parseFromString(text, 'text/xml');

	if (xml.querySelector('parsererror')) {
		throw new SyntaxError('Invalid XML document');
	}

	// oxlint-disable-next-line typescript/consistent-type-assertions
	return xml as XMLDocument;
}

export function parseHtml(text: string, baseUrl: string) {
	if (!text.trim()) {
		throw new RangeError('Empty HTML text');
	}

	const html = new DOMParser().parseFromString(text, 'text/html');

	if (!html.querySelector('base')) {
		html.head.insertAdjacentHTML('afterbegin', `<base href="${baseUrl}" />`);
	}

	// oxlint-disable-next-line typescript/consistent-type-assertions
	return html as HTMLDocument;
}

export function parseXhtml(text: string, baseUrl: string) {
	if (!text.trim()) {
		throw new RangeError('Empty HTML text');
	}

	const xhtml = new DOMParser().parseFromString(text, 'application/xhtml+xml');

	if (!xhtml.querySelector('base')) {
		xhtml.head.insertAdjacentHTML('afterbegin', `<base href="${baseUrl}" />`);
	}

	// oxlint-disable-next-line typescript/consistent-type-assertions
	return xhtml as XMLDocument;
}

export function parseDate(dateToParse: unknown) {
	const isString = typeof dateToParse === 'string';
	const isNumber = typeof dateToParse === 'number';
	const isDate = dateToParse instanceof Date;

	if (!isString && !isNumber && !isDate) {
		return undefined;
	}

	try {
		const parsedDate = new Date(dateToParse);

		if (Number.isNaN(parsedDate.getTime())) {
			throw new Error('Date is NaN');
		}

		return parsedDate;
	} catch (err) {
		console.error(err);
	}

	return undefined;
}

export function parseUrlWithBase(urlToParse?: unknown, baseUrl?: string) {
	if (typeof urlToParse !== 'string') {
		return;
	}

	if (!URL.canParse(urlToParse.trim(), baseUrl)) {
		return;
	}

	const url = new URL(urlToParse.trim(), baseUrl);

	if (!url.protocol.startsWith('http')) {
		return;
	}

	return url;
}

export function parseUrl(...urlList: unknown[]) {
	for (const urltoParse of urlList) {
		const url = parseUrlWithBase(urltoParse);

		if (!url) {
			continue;
		}

		return url;
	}

	return undefined;
}
