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
	const response = await fetch(`/proxy?url=${encodeURIComponent(url)}`, {
		method: 'GET',
		credentials: 'omit',
		redirect: 'follow'
	});

	if (!response.ok) {
		throw new Error(`Could not fetch feed: ${response.status} ${await response.text()}`);
	}

	const text = await response.text();

	if (canParseXml(text)) {
		return text;
	}

	if (redirectCount > MAX_REDIRECTS) {
		throw new Error('Too many redirects');
	}

	const siteHtml = parseHtml(text);
	const parsedFeedUrl = getFeedUrl(siteHtml);

	if (!parsedFeedUrl) {
		throw new Error('Could not find feed URL');
	}

	return getFeedText(parsedFeedUrl, redirectCount + 1);
}

async function fetchFeedFromXhtml(xhtmlText: string) {
	const siteHtml = parseXhtml(xhtmlText);
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
			feedResult = await fetchFeedFromXhtml(feedText);
		}

		throw err;
	}

	if (feedResult.feed.siteUrl) {
		const metadata = await parseMetadata(feedResult.feed.siteUrl);

		// TODO: fill in missing information
	}
}

// TODO: add diffing for feed and items
