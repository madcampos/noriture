import { get } from '../../util/fetch';
import { extractItems, extractUnreadItemsIds, type FeedItem } from './feedItem';

type FeedType = 'rss' | 'atom' | 'youtube';

type FeedDisplayType = 'list' | 'thumbs' | 'podcast' | 'video' | 'comics';

type FeedLastUpdated = Date | 'DownloadError' | 'ParseError';

export interface Feed {
	/** The feed's unique identifier. */
	id: ReturnType<typeof crypto.randomUUID>,
	/** The feed's title that will be displayed to the user. */
	name: string,
	/** The feed's description that will be displayed to the user. */
	description?: string,
	/** The feed's URL that will be displayed to the user. */
	siteUrl?: string,
	/** The feed's URL. */
	feedUrl: string,
	/** The feed's icon that will be displayed to the user. */
	icon?: string,
	/** The feed's color that will be displayed to the user. */
	color?: string,
	/** The feed's background color that will be displayed to the user. */
	backgroundColor?: string,
	/** The feed's categories that will be displayed to the user. */
	categories: string[],
	/** The feed's type. */
	type: FeedType,
	/** The feed's display type. */
	displayType: FeedDisplayType,
	/** The feeds's last updated date. */
	lastUpdated: FeedLastUpdated,
	/** The number of unread items. */
	unreadCount: number,
	/** The list of ids for the unread items. */
	unreadItemIds: ReturnType<typeof crypto.randomUUID>[],
	/** The list of items in the feed. */
	items: FeedItem[]
}

function extractFeedType(feed: Document) {
	return feed.querySelector('channel') ? 'rss' : 'atom';
}

function extractFeedName(feed: Document) {
	return feed.querySelector('channel > title, feed > title')?.textContent ?? 'Untitled';
}

function extractFeedDescription(feed: Document) {
	return feed.querySelector('channel > description, feed > subtitle')?.textContent?.trim()?.replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1');
}

function extractFeedSiteUrl(feed: Document) {
	return feed.querySelector('channel > |link, feed > link, feed > id')?.textContent?.trim();
}

function extractFeedLastUpdate(feed: Document) {
	const lastUpdate = new Date(feed.querySelector('channel > lastBuildDate, feed > updated, pubDate')?.textContent ?? '');

	if (!isNaN(lastUpdate.getTime())) {
		return lastUpdate;
	}

	return new Date();
}

function extractFeedCategories(feed: Document) {
	const rssCategories = [...feed.querySelectorAll('channel > category')].map((category) => category.textContent);
	const atomCategories = [...feed.querySelectorAll('feed > category')].map((category) => category.getAttribute('term'));

	return [...new Set([...rssCategories, ...atomCategories].map((category) => category?.trim()?.replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1')).filter((category) => category))] as string[];
}

function extractFeedIcon(feed: Document) {
	return feed.querySelector('channel > image > url, feed > icon, feed > logo')?.textContent?.trim();
}

export function parseFeed(feedText: string, url: string, id?: string) {
	const feedId = id ?? crypto.randomUUID();
	const xml = new window.DOMParser().parseFromString(feedText, 'text/xml');
	const items = extractItems(xml, feedId);
	const unreadItemIds = extractUnreadItemsIds(items);

	const feed: Feed = {
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

export async function fetchFeed(url: string) {
	const response = await get(url);

	const text = await response.text();
	const feed = parseFeed(text, url);

	return feed;
}
