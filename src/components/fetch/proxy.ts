import { ref, watch } from 'vue';

const DEFAULT_PROXY_URL = 'https://thingproxy.freeboard.io/fetch/';

export function useProxyUrl() {
	const storedProxyUrl = localStorage.getItem('proxy-url');
	const proxyUrl = ref(storedProxyUrl ?? DEFAULT_PROXY_URL);

	watch(proxyUrl, (newValue) => {
		localStorage.setItem('proxy-url', newValue);
	});

	return proxyUrl;
}
