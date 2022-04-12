import type { Ref } from 'vue';
import type { Feed } from './feed';
import type { FeedItem } from './feedItem';

interface RssFeed extends Feed {
	items: FeedItem[],
	type: Ref<'rss'>
}

export async function readRssFeed(url: string) {
	// TODO: check correctly for proxy
	const response = await fetch(`https://thingproxy.freeboard.io/fetch/${url}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	const text = await response.text();
	const xml = new window.DOMParser().parseFromString(text, 'text/xml');

	console.log(xml);

	// TODO: finish implementation and parsing
}
