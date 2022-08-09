const DEFAULT_PROXY_URL = import.meta.env.PROXY_URL;

export const proxyUrl = (new Proxy({ proxy: '' }, {
	get(_target, _prop) {
		const proxyUrlFromStorage = localStorage.getItem('proxy-url');

		return proxyUrlFromStorage ?? DEFAULT_PROXY_URL;
	},
	set(_target, _prop, value) {
		if (typeof value !== 'string') {
			throw new TypeError('value must be a string');
		}

		localStorage.setItem('proxy-url', value);

		return true;
	}
})).proxy;

export async function get(url: string) {
	const response = await fetch(`${proxyUrl}${url}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	return response;
}

export function resolveUrl(url: string) {
	return `${proxyUrl}${url}`;
}
