import { fetchProxied } from '../utils/fetch.ts';
import { parseHtml, parseXml } from '../utils/parsing.ts';
import { type Feed, parseFeed } from './Feed.ts';
import { parseMetadata } from './Metadata.ts';

export function getFeedUrl(htmlDocument: Document) {
	const parsedFeedUrl = htmlDocument.querySelector('link[type="application/rss+xml"], link[type="application/atom+xml"]')?.getAttribute('href') ?? undefined;

	return parsedFeedUrl;
}

export async function getFeedText(url: string, redirectCount = 0) {
	const MAX_REDIRECTS = 5;
	const response = await fetchProxied(url);

	const text = await response.text();

	try {
		parseXml(text);

		return {
			text,
			url
		};
	} catch (err) {
		if (err instanceof TypeError) {
			if (redirectCount > MAX_REDIRECTS) {
				throw new Error('Too many redirects', { cause: err });
			}

			const siteHtml = parseHtml(text, url);
			const parsedFeedUrl = getFeedUrl(siteHtml);

			if (!parsedFeedUrl) {
				throw new Error('Could not find feed URL', { cause: err });
			}

			const result = await getFeedText(parsedFeedUrl, redirectCount + 1);
			// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unnecessary-type-assertion
			const textFromHtml = result.text as string;

			return {
				url: parsedFeedUrl,
				text: textFromHtml
			};
		}

		throw err;
	}
}

export async function fetchFeed(url: string) {
	const { text, url: feedUrl } = await getFeedText(url);
	const xml = parseXml(text);

	return parseFeed(xml, feedUrl);
}

export async function enhanceFeedWithMetadata(feed: Feed) {
	if (!feed.siteUrl) {
		return feed;
	}

	const metadata = await parseMetadata(feed.siteUrl);

	feed.icon ??= metadata?.icon ?? metadata?.image?.url;
	feed.title ??= metadata?.title;
	feed.description ??= metadata?.description;

	return feed;
}
