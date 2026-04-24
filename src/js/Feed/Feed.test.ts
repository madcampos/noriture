import { assert, describe, test } from 'vitest';
import { parseXml } from '../utils/parsing.ts';
import { parseDescription, parseFeedId, parseFeedType, parseName, parseSiteUrl } from './Feed.ts';

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

		assert(feedId === '[FEED ID]');
	});

	test('Atom `id`', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed>
				<id>[FEED ID]</id>
			</feed>
		`);

		const feedId = parseFeedId(feedXml);

		assert(feedId === '[FEED ID]');
	});

	test('Atom only `link`', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed>
				<link href="[FEED ID]" />
			</feed>
		`);

		const feedId = parseFeedId(feedXml);

		assert(feedId === '[FEED ID]');
	});

	test('Atom self `link`', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed>
				<link rel="alternate" href="[SITE URL]" />
				<link rel="self" href="[FEED ID]" />
			</feed>
		`);

		const feedId = parseFeedId(feedXml);

		assert(feedId === '[FEED ID]');
	});

	test('Random UUID', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed></feed>
		`);

		const feedId = parseFeedId(feedXml);

		assert(feedId !== '[FEED ID]');
	});
});

describe('Feed Type', () => {
	test('Youtube type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed xmlns:yt="http://www.youtube.com/xml/schemas/2015"></feed>
		`);

		const feedType = parseFeedType(feedXml);
		assert(feedType === 'youtube');
	});

	test('Podcast: iTunes type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"></rss>
		`);

		const feedType = parseFeedType(feedXml);
		assert(feedType === 'podcast');
	});

	test('Podcast: Spotify type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<rss xmlns:spotify="http://www.spotify.com/ns/rss"></rss>
		`);

		const feedType = parseFeedType(feedXml);
		assert(feedType === 'podcast');
	});

	test('Podcast: podcast type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<rss xmlns:podcast="https://podcastindex.org/namespace/1.0"></rss>
		`);

		const feedType = parseFeedType(feedXml);
		assert(feedType === 'podcast');
	});

	test('Podcast: Google Play type', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed xmlns:googleplay="http://www.google.com/schemas/play-podcasts/1.0"></feed>
		`);

		const feedType = parseFeedType(feedXml);
		assert(feedType === 'podcast');
	});

	test('RSS', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<rss></rss>
		`);

		const feedType = parseFeedType(feedXml);
		assert(feedType === 'rss');
	});

	test('Atom', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed></feed>
		`);

		const feedType = parseFeedType(feedXml);
		assert(feedType === 'atom');
	});
});

describe('Feed Name', () => {
	test('RSS Title', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<rss><channel><title>[FEED TITLE]</title></channel></rss>
		`);

		const feedTitle = parseName(feedXml);

		assert(feedTitle === '[FEED TITLE]');
	});

	test('Atom Title', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed><title>[FEED TITLE]</title></feed>
		`);

		const feedTitle = parseName(feedXml);

		assert(feedTitle === '[FEED TITLE]');
	});

	test('Missing Name', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed></feed>
		`);

		const feedTitle = parseName(feedXml);

		assert(feedTitle === undefined);
	});
});

describe('Feed Description', () => {
	test('RSS description', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<rss><channel><description>[FEED DESCRIPTION]</description></channel></rss>
		`);

		const description = parseDescription(feedXml);

		assert(description === '[FEED DESCRIPTION]');
	});

	test('Atom description', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed><subtitle>[FEED DESCRIPTION]</subtitle></feed>
		`);

		const description = parseDescription(feedXml);

		assert(description === '[FEED DESCRIPTION]');
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

		assert(description === '[FEED DESCRIPTION]');
	});

	test('Missing Description', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed></feed>
		`);

		const description = parseDescription(feedXml);

		assert(description === undefined);
	});
});

describe('Feed Site URL', () => {
	test('RSS link text contents', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<rss><channel><link>https://example.com/rss</link></channel></rss>
		`);

		const siteUrl = parseSiteUrl(feedXml);

		assert(siteUrl?.href === 'https://example.com/rss');
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

		assert(siteUrl?.href === 'https://example.com/image-link');
	});

	test('Atom link href attribute', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed><link rel="alternate" href="https://example.com/atom" /></feed>
		`);

		const siteUrl = parseSiteUrl(feedXml);

		assert(siteUrl?.href === 'https://example.com/atom');
	});

	test('Missing site url', () => {
		const feedXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
			<feed></feed>
		`);

		const siteUrl = parseSiteUrl(feedXml);

		assert(siteUrl === undefined);
	});
});
