import type { UnwrapRef } from 'vue';
import type { Feed } from './feed';
import { extractItems, extractUnreadItemsIds } from './feedItem';

interface XmlFeed extends Omit<UnwrapRef<Feed>, 'backgroundColor' | 'color' | 'refreshRate'> {
	type: 'rss' | 'atom'
}

function extractFeedType(feed: Document) {
	const feedType = feed.querySelector('channel') ? 'rss' : 'atom';

	return feedType;
}

function extractFeedName(feed: Document) {
	const title = feed.querySelector('channel > title, feed > title')?.textContent ?? '';

	return title;
}

function extractFeedDescription(feed: Document) {
	const description = feed.querySelector('channel > description, feed > subtitle')?.textContent ?? '';

	return description;
}

function extractFeedSiteUrl(feed: Document) {
	const siteUrl = feed.querySelector('channel > |link, feed > link, feed > id')?.textContent ?? '';

	return siteUrl;
}

function extractFeedLastUpdate(feed: Document) {
	// TODO: handle invalid dates
	const lastUpdate = new Date(feed.querySelector('channel > lastBuildDate, feed > updated')?.textContent ?? new Date().toISOString());

	return lastUpdate;
}

function extractFeedCategories(feed: Document) {
	const rssCategories = [...feed.querySelectorAll('channel > category')].map((category) => category.textContent ?? '');
	const atomCategories = [...feed.querySelectorAll('feed > category')].map((category) => category.getAttribute('term') ?? '');

	return [...rssCategories, ...atomCategories];
}

function extractFeedIcon(feed: Document) {
	const icon = feed.querySelector('channel > image > url, feed > icon, feed > logo')?.textContent ?? '';

	return icon;
}

export async function readXmlFeed(url: string) {
	const response = await fetch(`https://thingproxy.freeboard.io/fetch/${url}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	const text = await response.text();
	const xml = new window.DOMParser().parseFromString(text, 'text/xml');
	const feedId = crypto.randomUUID();
	const items = extractItems(xml, feedId);
	const unreadItemIds = extractUnreadItemsIds(items);

	const feed: XmlFeed = {
		id: feedId,
		type: extractFeedType(xml),
		name: extractFeedName(xml),
		description: extractFeedDescription(xml),
		siteUrl: extractFeedSiteUrl(xml),
		feedUrl: url,
		lastUpdated: extractFeedLastUpdate(xml),
		categories: extractFeedCategories(xml),
		icon: extractFeedIcon(xml),
		displayType: 'list',
		items,
		unreadItemIds,
		unreadCount: unreadItemIds.length
	};

	return feed;
}
