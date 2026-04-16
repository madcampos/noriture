export function cleanCData(text: string) {
	return text
		.trim()
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

export function parseHtml(text: string) {
	if (!text.trim()) {
		throw new RangeError('Empty HTML text');
	}

	const html = new DOMParser().parseFromString(text, 'text/html');

	// oxlint-disable-next-line typescript/consistent-type-assertions
	return html as HTMLDocument;
}

export function parseXhtml(text: string) {
	if (!text.trim()) {
		throw new RangeError('Empty HTML text');
	}

	const xhtml = new DOMParser().parseFromString(text, 'application/xhtml+xml');

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

export function parseUrl(...urlList: unknown[]) {
	for (const urltoParse of urlList) {
		if (!urltoParse) {
			continue;
		}

		if (typeof urltoParse !== 'string') {
			continue;
		}

		if (!URL.canParse(urltoParse.trim())) {
			continue;
		}

		const url = new URL(urltoParse.trim());

		if (!url.protocol.startsWith('http')) {
			continue;
		}

		return url;
	}

	return undefined;
}
