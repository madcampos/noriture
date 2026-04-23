import { fetchProxied } from '../utils/fetch.ts';
import { canParseXml, parseHtml, parseXhtml, parseXml } from '../utils/parsing.ts';
import { type Feed, parseFeed } from './Feed.ts';
import type { FeedItem } from './FeedItem.ts';
import { parseMetadata } from './Metadata.ts';

function getFeedUrl(htmlDocument: Document) {
	const parsedFeedUrl = htmlDocument.querySelector('link[type="application/rss+xml"], link[type="application/atom+xml"]')?.getAttribute('href') ?? undefined;

	return parsedFeedUrl;
}

async function getFeedText(url: string, redirectCount = 0) {
	const MAX_REDIRECTS = 5;
	const response = await fetchProxied(url);

	const text = await response.text();

	if (canParseXml(text)) {
		return text;
	}

	if (redirectCount > MAX_REDIRECTS) {
		throw new Error('Too many redirects');
	}

	const siteHtml = parseHtml(text, url);
	const parsedFeedUrl = getFeedUrl(siteHtml);

	if (!parsedFeedUrl) {
		throw new Error('Could not find feed URL');
	}

	return getFeedText(parsedFeedUrl, redirectCount + 1);
}

async function fetchFeedFromXhtml(xhtmlText: string, baseUrl: string) {
	const siteHtml = parseXhtml(xhtmlText, baseUrl);
	const feedUrl = getFeedUrl(siteHtml);

	if (!feedUrl) {
		throw new Error('Could not find feed URL');
	}

	const feedText = await getFeedText(feedUrl);
	const xml = parseXml(feedText);

	return parseFeed(xml, feedUrl);
}

export async function fetchFeed(url: string) {
	const feedText = await getFeedText(url);

	let feedResult: { feed: Feed, items: FeedItem[] };

	try {
		const xml = parseXml(feedText);

		if (xml.querySelector('html')) {
			throw new TypeError('Document is XHTML and not a Feed');
		}

		feedResult = parseFeed(xml, url);
	} catch (err) {
		if (err instanceof TypeError) {
			feedResult = await fetchFeedFromXhtml(feedText, url);
		}

		throw err;
	}

	return feedResult;
}

export async function enhanceFeedWithMetadata(feed: Feed) {
	if (!feed.siteUrl) {
		return feed;
	}

	const metadata = await parseMetadata(feed.siteUrl);

	feed.icon ??= metadata.icon ?? metadata.image?.url;
	feed.title ??= metadata.title;
	feed.description ??= metadata.description;

	return feed;
}
