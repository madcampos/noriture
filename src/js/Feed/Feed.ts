import { canParseXml, cleanCData, parseDate, parseHtml, parseUrl, parseXhtml, parseXml } from '../utils/parsing.ts';

export type FeedType = 'atom' | 'rss' | 'youtube' | 'podcast';

export type FeedDisplayType = 'list' | 'podcast' | 'images' | 'video';

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

function parseFeedType(feed: Document): FeedType {
	if (feed.lookupNamespaceURI('yt')) {
		return 'youtube';
	}

	for (const namespaceUri of ['itunes', 'spotify', 'podcast', 'googleplay']) {
		if (feed.lookupNamespaceURI(namespaceUri)) {
			return 'podcast';
		}
	}

	const type = feed.querySelector('channel') ? 'rss' : 'atom';

	return type;
}

function parseName(feed: Document) {
	const rssTitle = feed.querySelector('channel > title')?.textContent;
	const atomTitle = feed.querySelector('feed > title')?.textContent;

	return cleanCData(rssTitle ?? atomTitle ?? 'Untitled');
}

function parseDescription(feed: Document) {
	const rssDescription = feed.querySelector('channel > description')?.textContent;
	const atomDescription = feed.querySelector('feed > subtitle')?.textContent;

	return cleanCData(rssDescription ?? atomDescription ?? '');
}

function parseSiteUrl(feed: Document) {
	const rssUrl = feed.querySelector('channel > link')?.textContent.trim();
	const rssIconUrl = feed.querySelector('channel > image > link')?.textContent;
	const atomUrl = feed.querySelector('feed > link')?.textContent.trim();
	const atomId = feed.querySelector('feed > id')?.textContent.trim();

	return parseUrl(rssUrl, rssIconUrl, atomUrl, atomId);
}

function parseLastUpdate(feed: Document): FeedLastUpdated {
	const rssLastUpdate = feed.querySelector('channel > lastBuildDate')?.textContent;
	const rssPublishDate = feed.querySelector('channel > pubDate')?.textContent;

	const atomLastUpdate = feed.querySelector('feed > updated')?.textContent;
	const atomPublishDate = feed.querySelector('feed > published')?.textContent;

	const dateToParse = (rssLastUpdate ?? rssPublishDate ?? atomLastUpdate ?? atomPublishDate)?.trim();

	return parseDate(dateToParse) ?? new Date();
}

function parseCategories(feed: Document) {
	const rssCategories = [...feed.querySelectorAll('channel > category')].map((category) => category.textContent);
	const atomCategories = [...feed.querySelectorAll('feed > category')].map((category) => category.getAttribute('term')).filter((category) => category !== null);

	const combinedCategories = [...rssCategories, ...atomCategories];
	const normalizedCategories = combinedCategories.map((category) => cleanCData(category));
	const filteredCategories = normalizedCategories.filter((category) => category);

	return [...new Set(filteredCategories)];
}

function parseIcon(feed: Document) {
	const rssImage = feed.querySelector('channel > image > url')?.textContent;

	const atomIcon = feed.querySelector('feed > icon')?.textContent;
	const atomLogo = feed.querySelector('feed > logo')?.textContent;

	return parseUrl(rssImage, atomIcon, atomLogo);
}

function parseFeedId(feed: Document) {
	const rssId = feed.querySelector('channel > link')?.textContent;
	const atomId = feed.querySelector('feed > id')?.textContent;
	const atomSelfLink = feed.querySelector('feed > link[rel="self"], feed > link:only-of-type')?.href;

	const feedId = rssId ?? atomId ?? atomSelfLink ?? crypto.randomUUID();

	// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
	return feedId as FeedId;
}

function parseDefaultDsplayType(feed: Document, feedType: FeedType): FeedDisplayType {
	if (feedType === 'youtube') {
		return 'video';
	}

	if (feedType === 'podcast') {
		return 'podcast';
	}

	// TODO: check for enclsures for images/video

	return 'list';
}

export function parseFeed(feedDocument: XMLDocument, url: string) {
	const feedType = parseFeedType(feedDocument);

	const feed: Feed = {
		id: parseFeedId(feedDocument),
		type: feedType,
		name: parseName(feedDocument),
		description: parseDescription(feedDocument),
		siteUrl: parseSiteUrl(feedDocument)?.href,
		feedUrl: url,
		lastUpdated: parseLastUpdate(feedDocument),
		categories: parseCategories(feedDocument),
		icon: parseIcon(feedDocument)?.href,
		displayType: parseDefaultDsplayType(feedDocument, feedType)
	};

	// TODO: parse feed items?

	return feed;
}

// TODO: should this return just the xml document?
// TODO: should it return metadata and the website as well?
// Sequence of steps:
// 0. entrypoint: take feed url, run all the steps and terurn feed + feed items + metadata
// 1. fecth feed, return the xml text
// 2. parse feed take text as input and return a feed + feed items
// 2.1 recursively parse feed items from xml document
// 3. find site url, takes the feed url, the feed, and return the site url
// 4. find metadata from site url
// 5. Only update with metadata missing parts from feed
export async function fetchFeed(url: string, redirectCount = 0): Promise<Feed | undefined> {
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

	let siteHtml: Document | undefined = undefined;

	if (canParseXml(text)) {
		try {
			const xml = parseXml(text);

			if (xml.querySelector('html')) {
				throw new TypeError('Document is XHTML and not a Feed');
			}

			return parseFeed(xml, url);
		} catch (err) {
			if (err instanceof TypeError) {
				siteHtml = parseXhtml(text);
			}

			throw err;
		}
	} else {
		siteHtml = parseHtml(text);
	}

	// TODO: parse document metadata

	const parsedFeedUrl = siteHtml.querySelector('link[type="application/rss+xml"], link[type="application/atom+xml"]')?.getAttribute('href');

	if (!parsedFeedUrl) {
		throw new Error('Could not find feed URL');
	}

	if (redirectCount > MAX_REDIRECTS) {
		throw new Error('Too many redirects');
	}

	return fetchFeed(parsedFeedUrl, redirectCount + 1);
}
