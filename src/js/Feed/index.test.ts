import { describe, expect, test, vi } from 'vitest';
import { parseHtml } from '../utils/parsing.ts';
import type { Feed } from './Feed.ts';
import { enhanceFeedWithMetadata, fetchFeed, fetchFeedFromXhtml, getFeedText, getFeedUrl } from './index.ts';

vi.mock(import('../utils/fetch.ts'), () => ({
	fetchProxied: async (url: string) => {
		const parsedUrl = new URL(url);

		if (parsedUrl.href === 'https://example.com/rss.xml') {
			return Promise.resolve(new Response('<?xml version="1.0"?><rss></rss>'));
		}

		if (parsedUrl.href === 'https://example.com/autodiscovery') {
			return Promise.resolve(new Response('<link type="application/rss+xml" href="https://example.com/rss.xml" />'));
		}

		if (parsedUrl.href === 'https://example.com/redirect') {
			return Promise.resolve(new Response('<link type="application/rss+xml" href="https://example.com/redirect-1" />'));
		}

		if (parsedUrl.href === 'https://example.com/redirect-1') {
			return Promise.resolve(new Response('<link type="application/rss+xml" href="https://example.com/rss.xml" />'));
		}

		if (parsedUrl.href === 'https://example.com/no-feed') {
			return Promise.resolve(new Response('<head></head>'));
		}

		if (parsedUrl.href === 'https://example.com/loop') {
			return Promise.resolve(new Response('<link type="application/rss+xml" href="https://example.com/loop" />'));
		}

		if (parsedUrl.href === 'https://example.com/xhtml-page') {
			return Promise.resolve(
				new Response(`<?xml version="1.0" encoding="UTF-8"?>
				<html xmlns="http://www.w3.org/1999/xhtml">
					<head>
						<link type="application/rss+xml" href="https://example.com/rss.xml" />
					</head>
				</html>`)
			);
		}

		return Promise.reject(new Error(`Not found: ${url}`));
	},
	getImageSizes: async () => Promise.resolve(undefined)
}));

describe('Get feed URL', () => {
	test('RSS feed link', () => {
		const htmlDocument = parseHtml('<link type="application/rss+xml" href="https://example.com/rss.xml" />');
		const feedUrl = getFeedUrl(htmlDocument);

		expect(feedUrl).toBe('https://example.com/rss.xml');
	});

	test('Atom feed link', () => {
		const htmlDocument = parseHtml('<link type="application/atom+xml" href="https://example.com/atom.xml" />');
		const feedUrl = getFeedUrl(htmlDocument);

		expect(feedUrl).toBe('https://example.com/atom.xml');
	});

	test('No feed links', () => {
		const htmlDocument = parseHtml('No links');
		const feedUrl = getFeedUrl(htmlDocument);

		expect(feedUrl).toBe(undefined);
	});
});

describe('Get feed text', () => {
	test('Get feed text from URL', async () => {
		const text = await getFeedText('https://example.com/rss.xml');
		expect(text).toBe('<?xml version="1.0"?><rss></rss>');
	});

	test('Get feed from HTML (autodiscovery)', async () => {
		const text = await getFeedText('https://example.com/autodiscovery');
		expect(text).toBe('<?xml version="1.0"?><rss></rss>');
	});

	test('Get feed after redirect', async () => {
		const text = await getFeedText('https://example.com/redirect');
		expect(text).toBe('<?xml version="1.0"?><rss></rss>');
	});

	test('Exceed max redirect', async () => {
		const promise = getFeedText('https://example.com/loop');

		await expect(promise).rejects.toThrow('Too many redirects');
	});

	test('No feed text', async () => {
		const promise = getFeedText('https://example.com/no-feed');

		await expect(promise).rejects.toThrow('Could not find feed URL');
	});
});

describe('Fetch feed from XHTML', () => {
	test('Feed in link', async () => {
		const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
		<html xmlns="http://www.w3.org/1999/xhtml">
			<head>
				<link rel="alternate" type="application/rss+xml" href="https://example.com/rss.xml" />
			</head>
		</html>
		`;

		const feed = await fetchFeedFromXhtml(xhtml, 'https://example.com');

		expect(feed.feed.feedUrl).toBe('https://example.com/rss.xml');
	});

	test('No feed', async () => {
		const xhtml = `<?xml version="1.0" encoding="UTF-8"?>
		<html xmlns="http://www.w3.org/1999/xhtml"></html>
		`;

		const feed = fetchFeedFromXhtml(xhtml, 'https://example.com');

		await expect(feed).rejects.toThrow('Could not find feed URL');
	});
});

describe('Fetch feed', () => {
	test('Fetch feed', async () => {
		const result = await fetchFeed('https://example.com/rss.xml');

		expect(result.feed.feedUrl).toBe('https://example.com/rss.xml');
	});

	test('Document is XHTML', async () => {
		const result = await fetchFeed('https://example.com/xhtml-page');

		expect(result.feed.feedUrl).toBe('https://example.com/rss.xml');
	});

	test('No feed', async () => {
		const promise = fetchFeed('https://example.com/no-feed');

		await expect(promise).rejects.toThrow('Could not find feed URL');
	});
});

describe('Enhance feed with metadata', () => {
	test('No site URL', async () => {
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const feed = {
			siteUrl: undefined
		} as Feed;

		const result = await enhanceFeedWithMetadata(feed);

		expect(result).toBe(feed);
	});
});
