export type FeedType = 'atom' | 'rss' | 'youtube';

export type FeedDisplayType = 'comics' | 'list' | 'podcast' | 'thumbs' | 'video';

export type FeedLastUpdated = Date | 'DownloadError' | 'ParseError';

export type FeedId = Brand<string, 'feedId'>;

export interface Feed {
	/** The feed's unique identifier. */
	id: FeedId;
	/** The feed's title that will be displayed to the user. */
	name: string;
	/** The feed's description that will be displayed to the user. */
	description?: string;
	/** The feed's URL that will be displayed to the user. */
	siteUrl?: string;
	/** The feed's URL. */
	feedUrl: string;
	/** The feed's icon that will be displayed to the user. */
	icon?: string;
	/** The feed's color that will be displayed to the user. */
	color?: string;
	/** The feed's background color that will be displayed to the user. */
	backgroundColor?: string;
	/** The feed's categories that will be displayed to the user. */
	categories: string[];
	/** The feed's type. */
	type: FeedType;
	/** The feed's display type. */
	displayType: FeedDisplayType;
	/** The feeds's last updated date. */
	lastUpdated: FeedLastUpdated;
}

function parseFeedType(feed: Document) {
	return feed.querySelector('channel') ? 'rss' : 'atom';
}

function parseName(feed: Document) {
	return feed.querySelector('channel > title, feed > title')?.textContent ?? 'Untitled';
}

function parseDescription(feed: Document) {
	const descrition = feed.querySelector('channel > description, feed > subtitle')?.textContent.trim().replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1');

	if (descrition) {
		return descrition;
	}

	return undefined;
}

function parseSiteUrl(feed: Document) {
	return feed.querySelector('channel > |link, feed > link, feed > id')?.textContent.trim();
}

function parseLastUpdate(feed: Document) {
	const lastUpdate = new Date(feed.querySelector('channel > lastBuildDate, feed > updated, pubDate')?.textContent ?? '');

	if (!Number.isNaN(lastUpdate.getTime())) {
		return lastUpdate;
	}

	return new Date();
}

function parseCategories(feed: Document) {
	const rssCategories = [...feed.querySelectorAll('channel > category')].map((category) => category.textContent);
	const atomCategories = [...feed.querySelectorAll('feed > category')].map((category) => category.getAttribute('term'));

	return [
		...new Set(
			[...rssCategories, ...atomCategories]
				.map((category) => category?.trim().replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1'))
				.filter((category) => category !== undefined)
		)
	];
}

function parseIcon(feed: Document) {
	return feed.querySelector('channel > image > url, feed > icon, feed > logo')?.textContent.trim();
}

function parseFeedId(feed: Document) {
	const feedId = feed.querySelector('channel > link, feed > id')?.textContent.trim() ??
		feed.querySelector('feed > link[rel=""self"]')?.href ??
		crypto.randomUUID();

	// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
	return feedId as FeedId;
}

export function parseFeed(feedText: string, url: string) {
	const xml = new window.DOMParser().parseFromString(feedText, 'text/xml');

	if (xml.querySelector('parsererror')) {
		throw new Error('Invalid XML');
	}

	const feed: Feed = {
		id: parseFeedId(xml),
		type: parseFeedType(xml),
		name: parseName(xml),
		description: parseDescription(xml),
		siteUrl: parseSiteUrl(xml),
		feedUrl: url,
		lastUpdated: parseLastUpdate(xml),
		categories: parseCategories(xml),
		icon: parseIcon(xml),
		displayType: 'list'
	};

	return feed;
}

export async function fetchFeed(url: string, redirectCount = 0) {
	const MAX_REDIRECTS = 5;
	const response = await fetch(`/proxy?url=${encodeURIComponent(url)}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	if (!response.ok) {
		throw new Error(`Could not fetch feed: ${response.status} ${await response.text()}`);
	}

	const text = await response.text();
	let feed: Feed;

	if (text.startsWith('<?xml')) {
		feed = parseFeed(text, url);
	} else {
		const siteHtml = new window.DOMParser().parseFromString(text, 'text/html');
		const parsedFeedUrl = siteHtml.querySelector('link[type="application/rss+xml"], link[type="application/atom+xml"]')?.getAttribute('href');

		if (!parsedFeedUrl) {
			throw new Error('Could not find feed URL');
		}

		if (redirectCount > MAX_REDIRECTS) {
			throw new Error('Too many redirects');
		}

		feed = await fetchFeed(parsedFeedUrl, redirectCount + 1);
	}

	return feed;
}
