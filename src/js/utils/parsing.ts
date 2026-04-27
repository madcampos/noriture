/* oxlint-disable typescript/consistent-type-assertions */

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

	return xml as XMLDocument;
}

export function parseHtml(text: string, baseUrl?: string) {
	if (!text.trim()) {
		throw new RangeError('Empty HTML text');
	}

	const html = new DOMParser().parseFromString(text, 'text/html');

	if (baseUrl && !html.querySelector('base')) {
		html.head.insertAdjacentHTML('afterbegin', `<base href="${baseUrl}" />`);
	}

	return html as HTMLDocument;
}

export function parseXhtml(text: string, baseUrl: string) {
	if (!text.trim()) {
		throw new RangeError('Empty HTML text');
	}

	const xhtml = new DOMParser().parseFromString(text, 'application/xhtml+xml');

	if (!xhtml.querySelector('base')) {
		xhtml.querySelector('html')?.insertAdjacentHTML('afterbegin', `<base href="${baseUrl}" />`);
	}

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

export function parseIntWithFallback(value: unknown, fallback: number) {
	if (['undefined', 'bigint', 'symbol', 'function'].includes(typeof value)) {
		return fallback;
	}

	if (value === null) {
		return fallback;
	}

	// oxlint-disable-next-line typescript/no-base-to-string
	const parsedValue = Number.parseInt(value?.toString() ?? '', 10);

	if (Number.isNaN(parsedValue)) {
		return fallback;
	}

	return parsedValue;
}
