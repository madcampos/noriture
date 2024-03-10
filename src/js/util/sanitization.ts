/* eslint-disable @stylistic/array-bracket-newline, @stylistic/array-element-newline */
import DOMPurify from 'dompurify';

export function sanitize(html: string) {
	return DOMPurify.sanitize(html, {
		USE_PROFILES: { html: true },
		ALLOWED_TAGS: ['p', 'br', 'b', 'i', 'strong', 'em', 'a', 'img', 'hr', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tr', 'th', 'td'],
		ALLOWED_ATTR: ['href', 'src', 'alt'],
		FORBID_ATTR: ['style', 'on*'],
		FORBID_CONTENTS: ['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta', 'title']
	});
}
