import { parseHtml } from './parsing.ts';

export const maliciousSanitizer = new Sanitizer({
	removeElements: ['base', 'dialog', 'embed', 'fencedframe', 'form', 'head', 'iframe', 'link', 'meta', 'object', 'script', 'style', 'template', 'use'],
	replaceWithChildrenElements: ['body'],
	removeAttributes: ['style', 'autoplay', 'class', 'contenteditable']
});

maliciousSanitizer.removeUnsafe();

export const inlineSanitizer = new Sanitizer({
	elements: ['i', 'em', 'b', 'strong', 'u', 'ins', 's', 'del', 'code', 'kbd', 'var', 'a', 'mark'],
	replaceWithChildrenElements: ['p'],
	removeAttributes: ['style', 'class', 'contenteditable']
});

inlineSanitizer.removeUnsafe();

export function sanitizeContentHtml(unsafeString?: string, baseUrl?: string) {
	if (!unsafeString) {
		return;
	}

	const template = document.createElement('template');

	template.setHTML(unsafeString, { sanitizer: maliciousSanitizer });

	return parseHtml(template.innerHTML, baseUrl).body;
}

export function sanitizeInlineHtml(unsafeString?: string) {
	if (!unsafeString) {
		return;
	}

	const template = document.createElement('template');

	template.setHTML(unsafeString, { sanitizer: inlineSanitizer });

	return template.innerHTML;
}

export function sanitizeInlineText(unsafeString?: string) {
	if (!unsafeString) {
		return;
	}

	const template = document.createElement('template');

	template.setHTML(unsafeString, { sanitizer: inlineSanitizer });

	return template.content.textContent;
}

export function sanitizeContentText(unsafeString?: string, baseUrl?: string) {
	return sanitizeContentHtml(unsafeString, baseUrl)?.textContent;
}

export function stripCData(text?: string) {
	return text
		?.trim()
		.replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1')
		.trim();
}
