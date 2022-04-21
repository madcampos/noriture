import { ref, watch } from 'vue';

const DEFAULT_PROXY_URL = import.meta.env.VITE_PROXY_URL;

export function useProxyUrl() {
	const storedUrl = localStorage.getItem('proxy-url');
	const url = ref(storedUrl ?? DEFAULT_PROXY_URL);

	watch(url, (newValue) => {
		localStorage.setItem('proxy-url', newValue);
	});

	return url;
}

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
