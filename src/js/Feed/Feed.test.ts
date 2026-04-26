// oxlint-disable max-lines

import { afterEach, assert, beforeEach, describe, test, vi } from 'vitest';
import { parseXml } from '../utils/parsing.ts';
import {
	parseCategories,
	parseDescription,
	parseFeedId,
	parseFeedType,
	parseIcon,
	parseLastUpdate,
	parseName,
	parseSiteUrl
} from './Feed.ts';

describe('Feed ID', () => {
	test('RSS', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<link>[FEED ID]</link>
			</channel>
		</rss>
		`);

		const feedId = parseFeedId(feedXml);

		assert.equal(feedId, '[FEED ID]');
	});

	test('Atom `id`', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<id>[FEED ID]</id>
		</feed>
		`);

		const feedId = parseFeedId(feedXml);

		assert.equal(feedId, '[FEED ID]');
	});

	test('Atom only `link`', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<link href="[FEED ID]" />
		</feed>
		`);

		const feedId = parseFeedId(feedXml);

		assert.equal(feedId, '[FEED ID]');
	});

	test('Atom self `link`', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<link rel="alternate" href="[SITE URL]" />
			<link rel="self" href="[FEED ID]" />
		</feed>
		`);

		const feedId = parseFeedId(feedXml);

		assert.equal(feedId, '[FEED ID]');
	});

	test('Random UUID', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed></feed>
		`);

		const feedId = parseFeedId(feedXml);

		assert.notEqual(feedId, '[FEED ID]');
		assert(/[0-9a-f-]{36}/iu.test(feedId));
	});
});

describe('Feed Type', () => {
	test('Youtube type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"></feed>
		`);

		const feedType = parseFeedType(feedXml);
		assert.equal(feedType, 'youtube');
	});

	test('Podcast: iTunes type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"></rss>
		`);

		const feedType = parseFeedType(feedXml);
		assert.equal(feedType, 'podcast');
	});

	test('Podcast: Spotify type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:spotify="http://www.spotify.com/ns/rss"></rss>
		`);

		const feedType = parseFeedType(feedXml);
		assert.equal(feedType, 'podcast');
	});

	test('Podcast: podcast type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:podcast="https://podcastindex.org/namespace/1.0"></rss>
		`);

		const feedType = parseFeedType(feedXml);
		assert.equal(feedType, 'podcast');
	});

	test('Podcast: Google Play type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed xmlns:googleplay="http://www.google.com/schemas/play-podcasts/1.0"></feed>
		`);

		const feedType = parseFeedType(feedXml);
		assert.equal(feedType, 'podcast');
	});

	test('RSS', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss></rss>
		`);

		const feedType = parseFeedType(feedXml);
		assert.equal(feedType, 'rss');
	});

	test('Atom', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed></feed>
		`);

		const feedType = parseFeedType(feedXml);
		assert.equal(feedType, 'atom');
	});
});

describe('Feed Name', () => {
	test('RSS Title', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<title>[FEED TITLE]</title>
			</channel>
		</rss>
		`);

		const feedTitle = parseName(feedXml);

		assert.equal(feedTitle, '[FEED TITLE]');
	});

	test('Atom Title', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<title>[FEED TITLE]</title>
		</feed>
		`);

		const feedTitle = parseName(feedXml);

		assert.equal(feedTitle, '[FEED TITLE]');
	});

	test('Missing Name', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed></feed>
		`);

		const feedTitle = parseName(feedXml);

		assert.equal(feedTitle, undefined);
	});
});

describe('Feed Description', () => {
	test('RSS description', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<description>[FEED DESCRIPTION]</description>
			</channel>
		</rss>
		`);

		const description = parseDescription(feedXml);

		assert.equal(description, '[FEED DESCRIPTION]');
	});

	test('Atom description', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<subtitle>[FEED DESCRIPTION]</subtitle>
		</feed>
		`);

		const description = parseDescription(feedXml);

		assert.equal(description, '[FEED DESCRIPTION]');
	});

	test('Description with `content:encoded`', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:content="http://purl.org/rss/1.0/modules/content/">
			<channel>
				<content:encoded><![CDATA[<p>[FEED DESCRIPTION]</p>]]></content:encoded>
			</channel>
		</rss>
		`);

		const description = parseDescription(feedXml);

		assert.equal(description, '[FEED DESCRIPTION]');
	});

	test('Description with HTML', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<description><![CDATA[<b>[FEED DESCRIPTION]</b>]]></description>
			</channel>
		</rss>
		`);

		const description = parseDescription(feedXml);

		assert.equal(description, '<b>[FEED DESCRIPTION]</b>');
	});

	test('Missing Description', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed></feed>
		`);

		const description = parseDescription(feedXml);

		assert.equal(description, undefined);
	});
});

describe('Feed Site URL', () => {
	test('RSS link text contents', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<link>https://example.com/rss</link>
			</channel>
		</rss>
		`);

		const siteUrl = parseSiteUrl(feedXml);

		assert.equal(siteUrl?.href, 'https://example.com/rss');
	});

	test('RSS link text contents inside of an image tag', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<image>
					<link>https://example.com/image-link</link>
				</image>
			</channel>
		</rss>
		`);

		const siteUrl = parseSiteUrl(feedXml);

		assert.equal(siteUrl?.href, 'https://example.com/image-link');
	});

	test('Atom link href attribute', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<link rel="alternate" href="https://example.com/atom" />
		</feed>
		`);

		const siteUrl = parseSiteUrl(feedXml);

		assert.equal(siteUrl?.href, 'https://example.com/atom');
	});

	test('Missing site url', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed></feed>
		`);

		const siteUrl = parseSiteUrl(feedXml);

		assert.equal(siteUrl, undefined);
	});
});

describe('Feed Last Updated', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	test('RSS lastBuildDate', () => {
		const testDate = new Date('2026-04-25T12:00:00.000Z');
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<lastBuildDate>${testDate.toUTCString()}</lastBuildDate>
			</channel>
		</rss>
		`);

		const updatedAt = parseLastUpdate(feedXml);

		assert(updatedAt instanceof Date);
		assert.equal(updatedAt.toISOString(), testDate.toISOString());
	});

	test('RSS pubDate', () => {
		const testDate = new Date('2026-04-25T12:00:00.000Z');
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<pubDate>${testDate.toUTCString()}</pubDate>
			</channel>
		</rss>
		`);

		const updatedAt = parseLastUpdate(feedXml);

		assert(updatedAt instanceof Date);
		assert.equal(updatedAt.toISOString(), testDate.toISOString());
	});

	test('Atom updated', () => {
		const testDate = new Date('2026-04-25T12:00:00.000Z');
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<updated>${testDate.toISOString()}</updated>
		</feed>
		`);

		const updatedAt = parseLastUpdate(feedXml);

		assert(updatedAt instanceof Date);
		assert.equal(updatedAt.toISOString(), testDate.toISOString());
	});

	test('Atom published', () => {
		const testDate = new Date('2026-04-25T12:00:00.000Z');
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<published>${testDate.toISOString()}</published>
		</feed>
		`);

		const updatedAt = parseLastUpdate(feedXml);

		assert(updatedAt instanceof Date);
		assert.equal(updatedAt.toISOString(), testDate.toISOString());
	});

	test('Fallback to new Date() if missing', () => {
		const now = new Date('2026-04-25T12:00:00.000Z');
		vi.setSystemTime(now);

		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed></feed>
		`);

		const updatedAt = parseLastUpdate(feedXml);

		assert(updatedAt instanceof Date);
		assert.equal(updatedAt.toISOString(), now.toISOString());
	});
});

describe('Feed Categories', () => {
	test('RSS categories', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<category>[FEED CATEGORY]</category>
			</channel>
		</rss>
		`);

		const categories = parseCategories(feedXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[FEED CATEGORY]');
	});

	test('Atom categories from `labels`', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<category label="[FEED CATEGORY]" />
		</feed>
		`);

		const categories = parseCategories(feedXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[FEED CATEGORY]');
	});

	test('Atom categories from `terms`', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<category term="[FEED CATEGORY]" />
		</feed>
		`);

		const categories = parseCategories(feedXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[FEED CATEGORY]');
	});

	test('iTunes categories', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
			<channel>
				<itunes:category text="[FEED CATEGORY]" />
			</channel>
		</rss>
		`);

		const categories = parseCategories(feedXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[FEED CATEGORY]');
	});

	test('Repeated categories', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<category>[FEED CATEGORY]</category>
				<category>[FEED CATEGORY]</category>
			</channel>
		</rss>
		`);

		const categories = parseCategories(feedXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[FEED CATEGORY]');
	});

	test('Combined categories across formats', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
			<channel>
				<category>[FEED CATEGORY RSS]</category>
				<itunes:category text="[FEED CATEGORY ITUNES]" />
			</channel>
		</rss>
		`);

		const categories = parseCategories(feedXml);

		// oxlint-disable-next-line no-magic-numbers
		assert.equal(categories.length, 2);
		assert.include(categories, '[FEED CATEGORY RSS]');
		assert.include(categories, '[FEED CATEGORY ITUNES]');
	});

	test('Categories with HTML and CData', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<category><![CDATA[<b>[FEED CATEGORY]</b>]]></category>
			</channel>
		</rss>
		`);

		const categories = parseCategories(feedXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[FEED CATEGORY]');
	});

	test('Empty categories', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<category></category>
				<category>    </category>
			</channel>
		</rss>
		`);

		const categories = parseCategories(feedXml);

		assert.equal(categories.length, 0);
	});
});

describe('Feed Icon', () => {
	test('RSS image', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<image>
					<url>https://example.com/rss-image.png</url>
				</image>
			</channel>
		</rss>
		`);

		const icon = parseIcon(feedXml);

		assert.equal(icon?.href, 'https://example.com/rss-image.png');
	});

	test('Atom icon', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<icon>https://example.com/atom-icon.png</icon>
		</feed>
		`);

		const icon = parseIcon(feedXml);

		assert.equal(icon?.href, 'https://example.com/atom-icon.png');
	});

	test('Atom logo', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<logo>https://example.com/atom-logo.png</logo>
		</feed>
		`);

		const icon = parseIcon(feedXml);

		assert.equal(icon?.href, 'https://example.com/atom-logo.png');
	});

	test('iTunes image', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
			<channel>
				<itunes:image href="https://example.com/itunes-image.png" />
			</channel>
		</rss>
		`);

		const icon = parseIcon(feedXml);

		assert.equal(icon?.href, 'https://example.com/itunes-image.png');
	});

	test('Podcast image', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:podcast="https://podcastindex.org/namespace/1.0">
			<channel>
				<podcast:image href="https://example.com/podcast-image.png" />
			</channel>
		</rss>
		`);

		const icon = parseIcon(feedXml);

		assert.equal(icon?.href, 'https://example.com/podcast-image.png');
	});

	test('Missing icon', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed></feed>
		`);

		const icon = parseIcon(feedXml);

		assert.equal(icon, undefined);
	});
});
