import { useProxyUrl } from './proxy';

const proxyUrl = useProxyUrl();

export async function get(url: string) {
	const response = await fetch(`${proxyUrl.value}${url}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	return response;
}

export function resolveUrl(url: string) {
	return `${proxyUrl.value}${url}`;
}
