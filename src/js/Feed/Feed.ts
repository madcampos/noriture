import { cleanCData, parseDate, parseInlineHtml, parseText, parseUrl } from '../utils/parsing.ts';
import { parseFeedItems } from './FeedItem.ts';

export type FeedType = 'atom' | 'rss' | 'youtube' | 'podcast';

export type FeedDisplayType = 'list' | 'podcast' | 'images' | 'video';

export type FeedLastUpdated = Date | 'DownloadError' | 'ParseError';

export type FeedId = Brand<string, 'feedId'>;

export interface Feed {
	id: FeedId;
	title?: string;
	description?: string;
	siteUrl?: string;
	feedUrl: string;
	icon?: string;
	categories: string[];
	type: FeedType;
	displayType: FeedDisplayType;
	updatedAt: FeedLastUpdated;
}

export function parseFeedType(feed: Document): FeedType {
	if (feed.lookupNamespaceURI('yt')) {
		return 'youtube';
	}

	for (const namespaceUri of ['itunes', 'spotify', 'podcast', 'googleplay']) {
		if (feed.lookupNamespaceURI(namespaceUri)) {
			return 'podcast';
		}
	}

	const type = feed.querySelector('feed') ? 'atom' : 'rss';

	return type;
}

export function parseName(feed: Document) {
	const rssTitle = feed.querySelector('channel > title')?.textContent.trim();
	const atomTitle = feed.querySelector('feed > title')?.textContent.trim();

	return parseInlineHtml(cleanCData(rssTitle ?? atomTitle));
}

export function parseDescription(feed: Document) {
	const rssDescription = feed.querySelector('channel > description')?.textContent.trim();
	const atomDescription = feed.querySelector('feed > subtitle')?.textContent.trim();

	const encodedContent = feed.querySelector('channel > encoded')?.textContent.trim();

	// oxlint-disable-next-line typescript/prefer-nullish-coalescing
	return parseInlineHtml(cleanCData(rssDescription || atomDescription || encodedContent));
}

export function parseSiteUrl(feed: Document) {
	const rssUrl = feed.querySelector('channel > link:not(:empty)')?.textContent.trim();
	const rssIconUrl = feed.querySelector('channel > image > link')?.textContent.trim();
	const atomUrl = feed.querySelector('feed > link:not([rel="self"])')?.getAttribute('href')?.trim();

	return parseUrl(rssUrl, rssIconUrl, atomUrl);
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
	const rssCategories = [...feed.querySelectorAll('channel > category:not(:empty)')].map((category) => {
		const categoryText = category.textContent.trim();

		return parseText(cleanCData(categoryText)) ?? '';
	});

	const atomCategories = [...feed.querySelectorAll('feed > category')].map((category) => {
		const categoryLabel = category.getAttribute('label')?.trim();
		const categoryTerm = category.getAttribute('term')?.trim();

		// oxlint-disable-next-line typescript/prefer-nullish-coalescing
		return categoryLabel || categoryTerm || '';
	});

	const itunesCategories = [...feed.querySelectorAll('channel > category[text]')].map((category) => category.getAttribute('text')?.trim() ?? '');

	const combinedCategories = [...rssCategories, ...atomCategories, ...itunesCategories].filter((category) => category);

	return [...new Set(combinedCategories)];
}

function parseIcon(feed: Document) {
	const rssImage = feed.querySelector('channel > image > url')?.textContent;

	const atomIcon = feed.querySelector('feed > icon')?.textContent;
	const atomLogo = feed.querySelector('feed > logo')?.textContent;

	const itunesImage = feed.querySelector('image[url]')?.getAttribute('url');

	const podcastImage = feed.querySelector('image[href]')?.getAttribute('href');

	return parseUrl(rssImage, atomIcon, atomLogo, itunesImage, podcastImage);
}

export function parseFeedId(feed: Document) {
	const rssId = feed.querySelector('channel > link:not(:empty)')?.textContent;
	const atomId = feed.querySelector('feed > id')?.textContent;
	const atomSelfLink = feed.querySelector('feed > link[href][rel="self"], feed > link[href]:only-of-type')?.getAttribute('href');

	// oxlint-disable-next-line typescript/prefer-nullish-coalescing
	const feedId = (rssId || atomId || atomSelfLink || crypto.randomUUID()).trim();

	// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
	return feedId as FeedId;
}

function parseDefaultDisplayType(_feed: Document, feedType: FeedType): FeedDisplayType {
	if (feedType === 'youtube') {
		return 'video';
	}

	if (feedType === 'podcast') {
		return 'podcast';
	}

	return 'list';
}

export function parseFeed(feedDocument: XMLDocument, url: string) {
	const feedType = parseFeedType(feedDocument);
	const feedId = parseFeedId(feedDocument);

	const feed: Feed = {
		id: feedId,
		type: feedType,
		title: parseName(feedDocument),
		description: parseDescription(feedDocument),
		siteUrl: parseSiteUrl(feedDocument)?.href,
		feedUrl: url,
		updatedAt: parseLastUpdate(feedDocument),
		categories: parseCategories(feedDocument),
		icon: parseIcon(feedDocument)?.href,
		displayType: parseDefaultDisplayType(feedDocument, feedType)
	};

	const feedItems = parseFeedItems(feedDocument, feedId);

	return {
		feed,
		items: feedItems
	};
}
