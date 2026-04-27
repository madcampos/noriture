/* oxlint-disable max-lines, typescript/no-non-null-assertion */

import { assert, describe, test } from 'vitest';
import { parseXml } from '../utils/parsing.ts';
import { sanitizeContentHtml } from '../utils/sanitizer.ts';
import {
	parseAuthor,
	parseCategories,
	parseContents,
	parseContentThumbnail,
	parseEnclosure,
	parseFeedItems,
	parseItemId,
	parseItemUrl,
	parseMediaContent,
	parseMediaItem,
	parsePublishedDate,
	parseSummary,
	parseTitle,
	parseUpdatedDate
} from './FeedItem.ts';

describe('Feed Item ID', () => {
	test('RSS GUID', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<guid>[ITEM ID]</guid>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const itemId = parseItemId(itemXml);

		assert.equal(itemId, '[ITEM ID]');
	});

	test('RSS link', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<link>[ITEM ID]</link>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const itemId = parseItemId(itemXml);

		assert.equal(itemId, '[ITEM ID]');
	});

	test('Atom ID', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<id>[ITEM ID]</id>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const itemId = parseItemId(itemXml);

		assert.equal(itemId, '[ITEM ID]');
	});

	test('Atom link with `rel=self`', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<link rel="self" href="[ITEM ID]" />
			</entry>
		</feed>
		`).querySelector('entry')!;

		const itemId = parseItemId(itemXml);

		assert.equal(itemId, '[ITEM ID]');
	});

	test('Atom link with no `rel`', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<link href="[ITEM ID]" />
			</entry>
		</feed>
		`).querySelector('entry')!;

		const itemId = parseItemId(itemXml);

		assert.equal(itemId, '[ITEM ID]');
	});

	test('Random UUID', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry></entry>
		</feed>
		`).querySelector('entry')!;

		const itemId = parseItemId(itemXml);

		assert.notEqual(itemId, '[ITEM ID]');
		assert(/[0-9a-f-]{36}/.test(itemId));
	});
});

describe('Feed Item URL', () => {
	test('RSS link', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<link>https://example.com/rss-link</link>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const itemUrl = parseItemUrl(itemXml);

		assert.equal(itemUrl?.href, 'https://example.com/rss-link');
	});

	test('RSS GUID', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<guid>https://example.com/rss-guid</guid>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const itemUrl = parseItemUrl(itemXml);

		assert.equal(itemUrl?.href, 'https://example.com/rss-guid');
	});

	test('RSS GUID is not permlink', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<guid isPermaLink="false">not-a-link</guid>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const itemUrl = parseItemUrl(itemXml);

		assert(itemUrl === undefined);
	});

	test('RSS GUID is permlink', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<guid isPermaLink="true">https://example.com/rss-guid-perm</guid>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const itemUrl = parseItemUrl(itemXml);

		assert.equal(itemUrl?.href, 'https://example.com/rss-guid-perm');
	});

	test('Atom Link', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<link href="https://example.com/atom-link" />
			</entry>
		</feed>
		`).querySelector('entry')!;

		const itemUrl = parseItemUrl(itemXml);

		assert.equal(itemUrl?.href, 'https://example.com/atom-link');
	});

	test('Atom ID is a URN', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<id>urn:uuid:60a76c80-d399-11d9-b93C-0003939e0af6</id>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const itemUrl = parseItemUrl(itemXml);

		assert(itemUrl === undefined);
	});

	test('Atom ID is a link', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<id>https://example.com/atom-id-link</id>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const itemUrl = parseItemUrl(itemXml);

		assert.equal(itemUrl?.href, 'https://example.com/atom-id-link');
	});

	test('No link provided', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry></entry>
		</feed>
		`).querySelector('entry')!;

		const itemUrl = parseItemUrl(itemXml);

		assert(itemUrl === undefined);
	});
});

describe('Feed Item Title', () => {
	test('Title exists', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<title>[FEED ITEM TITLE]</title>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const title = parseTitle(itemXml);

		assert.equal(title, '[FEED ITEM TITLE]');
	});

	test('Title with html', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<title><![CDATA[[FEED ITEM <b>TITLE</b>]]]></title>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const title = parseTitle(itemXml);

		assert.equal(title, '[FEED ITEM <b>TITLE</b>]');
	});

	test('Missing title', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item></item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const title = parseTitle(itemXml);

		assert.equal(title, undefined);
	});
});

describe('Feed Item Author', () => {
	test('RSS author with name and email', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<author>john@example.com (John Doe)</author>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'John Doe');
		assert.equal(author.email, 'john@example.com');
	});

	test('RSS author with only name', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<author>John Doe</author>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'John Doe');
		assert.equal(author.email, undefined);
	});

	test('RSS author with only email', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<author>john@example.com</author>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'john@example.com');
		assert.equal(author.email, undefined);
	});

	test('Atom author with name and email', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<author>
					<name>John Doe</name>
					<email>john@example.com</email>
				</author>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'John Doe');
		assert.equal(author.email, 'john@example.com');
	});

	test('Atom author with only name', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<author>
					<name>John Doe</name>
				</author>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'John Doe');
		assert.equal(author.email, undefined);
	});

	test('Atom author with only email', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<author>
					<email>john@example.com</email>
				</author>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'john@example.com');
		assert.equal(author.email, 'john@example.com');
	});

	test('Atom contributor with name and email', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<contributor>
					<name>Jane Doe</name>
					<email>jane@example.com</email>
				</contributor>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'Jane Doe');
		assert.equal(author.email, 'jane@example.com');
	});

	test('Atom contributor with only name', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<contributor>
					<name>Jane Doe</name>
				</contributor>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'Jane Doe');
		assert.equal(author.email, undefined);
	});

	test('Atom contributor with only email', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<contributor>
					<email>jane@example.com</email>
				</contributor>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'jane@example.com');
		assert.equal(author.email, 'jane@example.com');
	});

	test('No author', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry></entry>
		</feed>
		`).querySelector('entry')!;

		const author = parseAuthor(itemXml);

		assert.equal(author.name, 'No Author');
		assert.equal(author.email, undefined);
	});
});

describe('Feed Item Media', () => {
	test('No URL exist', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:content />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const mediaXml = itemXml.querySelector('content')!;

		const media = parseMediaItem(mediaXml, itemXml);

		assert.equal(media, undefined);
	});

	test('Player URL exist', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:player url="https://example.com/player" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const mediaXml = itemXml.querySelector('content')!;

		const media = parseMediaItem(mediaXml, itemXml);

		assert.equal(media?.url, 'https://example.com/player');
		assert.equal(media?.mimeType, undefined);
		assert.equal(media?.type, 'embedded');
		assert.equal(media?.sizeInBytes, 0);
	});

	test('Mime type is provided', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:content url="https://example.com/image.jpg" type="image/jpeg" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const mediaXml = itemXml.querySelector('content')!;

		const media = parseMediaItem(mediaXml, itemXml);

		assert.equal(media?.url, 'https://example.com/image.jpg');
		assert.equal(media?.mimeType, 'image/jpeg');
		assert.equal(media?.type, 'image');
		assert.equal(media?.sizeInBytes, 0);
	});

	test('Mime type is inferred', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:content url="https://example.com/image.jpg" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const mediaXml = itemXml.querySelector('content')!;

		const media = parseMediaItem(mediaXml, itemXml);

		assert.equal(media?.url, 'https://example.com/image.jpg');
		assert.equal(media?.mimeType, 'image/jpeg');
		assert.equal(media?.type, 'image');
		assert.equal(media?.sizeInBytes, 0);
	});

	test('Mime type cannot be inferred', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:content url="https://example.com/url-without-extension" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const mediaXml = itemXml.querySelector('content')!;

		const media = parseMediaItem(mediaXml, itemXml);

		assert.equal(media?.url, 'https://example.com/url-without-extension');
		assert.equal(media?.mimeType, undefined);
		assert.equal(media?.type, 'unknown');
		assert.equal(media?.sizeInBytes, 0);
	});

	test('Size is provided', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:content url="https://example.com/image.jpg" type="image/jpeg" fileSize="1024" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const mediaXml = itemXml.querySelector('content')!;

		const media = parseMediaItem(mediaXml, itemXml);

		assert.equal(media?.url, 'https://example.com/image.jpg');
		assert.equal(media?.mimeType, 'image/jpeg');
		assert.equal(media?.type, 'image');
		// oxlint-disable-next-line no-magic-numbers
		assert.equal(media?.sizeInBytes, 1024);
	});

	test('Type is provided by `medium` attribute', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:content url="https://example.com/video.mp4" medium="video" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const mediaXml = itemXml.querySelector('content')!;

		const media = parseMediaItem(mediaXml, itemXml);

		assert.equal(media?.url, 'https://example.com/video.mp4');
		assert.equal(media?.mimeType, 'video/mp4');
		assert.equal(media?.type, 'video');
		assert.equal(media?.sizeInBytes, 0);
	});
});

describe('Feed Item Enclosure', () => {
	test('Enclosure does not exist', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<enclosure length="2048" type="audio/mpeg" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const enclosure = parseEnclosure(itemXml);

		assert.equal(enclosure, undefined);
	});

	test('Url is missing', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<enclosure />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const enclosure = parseEnclosure(itemXml);

		assert.equal(enclosure, undefined);
	});

	test('Mime type is provided', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<enclosure url="https://example.com/audio.mp3" type="audio/mpeg" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const enclosure = parseEnclosure(itemXml);

		assert.equal(enclosure?.url, 'https://example.com/audio.mp3');
		assert.equal(enclosure?.mimeType, 'audio/mpeg');
		assert.equal(enclosure?.type, 'audio');
		assert.equal(enclosure?.sizeInBytes, 0);
	});

	test('Mime type is inferred', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<enclosure url="https://example.com/audio.mp3" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const enclosure = parseEnclosure(itemXml);

		assert.equal(enclosure?.url, 'https://example.com/audio.mp3');
		assert.equal(enclosure?.mimeType, 'audio/mpeg');
		assert.equal(enclosure?.type, 'audio');
		assert.equal(enclosure?.sizeInBytes, 0);
	});

	test('Mime type cannot be inferred', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<enclosure url="https://example.com/unknown" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const enclosure = parseEnclosure(itemXml);

		assert.equal(enclosure?.url, 'https://example.com/unknown');
		assert.equal(enclosure?.mimeType, undefined);
		assert.equal(enclosure?.type, 'unknown');
		assert.equal(enclosure?.sizeInBytes, 0);
	});

	test('Size is provided', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<enclosure url="https://example.com/audio.mp3" length="1" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;
		const enclosure = parseEnclosure(itemXml);

		assert.equal(enclosure?.url, 'https://example.com/audio.mp3');
		assert.equal(enclosure?.mimeType, 'audio/mpeg');
		assert.equal(enclosure?.type, 'audio');
		assert.equal(enclosure?.sizeInBytes, 1);
	});
});

describe('Feed Item Media Content', () => {
	test('No media items', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item></item>
			</channel>
		</rss>
		`).querySelector('item')!;

		//
		const { mediaItems, mainImage } = parseMediaContent(itemXml);

		assert.equal(mediaItems.length, 0);
		assert.equal(mainImage, undefined);
	});

	test('Media item exist', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:content url="https://example.com/video.mp4" medium="video" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const { mediaItems, mainImage } = parseMediaContent(itemXml);

		assert.equal(mediaItems.length, 1);
		assert.equal(mediaItems[0]?.url, 'https://example.com/video.mp4');
		assert.equal(mainImage, undefined);
	});

	test('Media thumbnail image', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:thumbnail url="https://example.com/thumbnail.jpg" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const { mediaItems, mainImage } = parseMediaContent(itemXml);

		assert.equal(mediaItems.length, 0);
		assert.equal(mainImage, 'https://example.com/thumbnail.jpg');
	});

	test('Itunes image', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
			<channel>
				<item>
					<itunes:image href="https://example.com/itunes.jpg" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const { mediaItems, mainImage } = parseMediaContent(itemXml);

		assert.equal(mediaItems.length, 0);
		assert.equal(mainImage, 'https://example.com/itunes.jpg');
	});

	test('Podcast image', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:podcast="https://podcastindex.org/namespace/1.0">
			<channel>
				<item>
					<podcast:image href="https://example.com/podcast.jpg" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const { mediaItems, mainImage } = parseMediaContent(itemXml);

		assert.equal(mediaItems.length, 0);
		assert.equal(mainImage, 'https://example.com/podcast.jpg');
	});

	test('Media items image', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:content url="https://example.com/image.jpg" medium="image" />
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const { mediaItems, mainImage } = parseMediaContent(itemXml);

		assert.equal(mediaItems.length, 1);
		assert.equal(mainImage, 'https://example.com/image.jpg');
	});
});

describe('Feed Item Content Thumbnail', () => {
	test('No content', () => {
		const thumbnail = parseContentThumbnail(undefined);

		assert.equal(thumbnail, undefined);
	});

	test('No thumbnail', () => {
		const content = sanitizeContentHtml('<p>Some content without images</p>');
		const thumbnail = parseContentThumbnail(content);

		assert.equal(thumbnail, undefined);
	});

	test('Thumbnail exists', () => {
		const content = sanitizeContentHtml('<p><img src="https://example.com/image.jpg" /></p>');
		const thumbnail = parseContentThumbnail(content);

		assert.equal(thumbnail, 'https://example.com/image.jpg');
	});
});

describe('Feed Item Published Date', () => {
	test('RSS published date', () => {
		const testDate = new Date('2026-04-25T12:00:00.000Z');
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<pubDate>${testDate.toUTCString()}</pubDate>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const date = parsePublishedDate(itemXml);

		assert.equal(date?.toISOString(), testDate.toISOString());
	});

	test('Atom published date', () => {
		const testDate = new Date('2026-04-25T12:00:00.000Z');
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<published>${testDate.toISOString()}</published>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const date = parsePublishedDate(itemXml);

		assert.equal(date?.toISOString(), testDate.toISOString());
	});

	test('Missing published date', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry></entry>
		</feed>
		`).querySelector('entry')!;

		const date = parsePublishedDate(itemXml);

		assert.equal(date, undefined);
	});
});

describe('Feed Item Updated Date', () => {
	test('Atom updated', () => {
		const testDate = new Date('2026-04-25T12:00:00.000Z');
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<updated>${testDate.toISOString()}</updated>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const date = parseUpdatedDate(itemXml);

		assert.equal(date?.toISOString(), testDate.toISOString());
	});

	test('Missing updated date', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry></entry>
		</feed>
		`).querySelector('entry')!;

		const date = parseUpdatedDate(itemXml);

		assert.equal(date, undefined);
	});
});

describe('Feed Item Categories', () => {
	test('RSS categories', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<category>[ITEM CATEGORY]</category>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const categories = parseCategories(itemXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[ITEM CATEGORY]');
	});

	test('Atom categories from `label`', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<category label="[ITEM CATEGORY]" />
			</entry>
		</feed>
		`).querySelector('entry')!;

		const categories = parseCategories(itemXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[ITEM CATEGORY]');
	});

	test('Atom categories from `term`', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<category term="[ITEM CATEGORY]" />
			</entry>
		</feed>
		`).querySelector('entry')!;

		const categories = parseCategories(itemXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[ITEM CATEGORY]');
	});

	test('Media categories', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:category>[ITEM CATEGORY]</media:category>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const categories = parseCategories(itemXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[ITEM CATEGORY]');
	});

	test('Repeated categories', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<category>[ITEM CATEGORY]</category>
					<category>[ITEM CATEGORY]</category>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const categories = parseCategories(itemXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[ITEM CATEGORY]');
	});

	test('Combined categories from different sources', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<category>[ITEM CATEGORY RSS]</category>
					<category label="[ITEM CATEGORY ATOM LABEL]" />
					<category term="[ITEM CATEGORY ATOM TERM]" />
					<media:category>[ITEM CATEGORY MEDIA]</media:category>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const categories = parseCategories(itemXml);

		// oxlint-disable-next-line no-magic-numbers
		assert.equal(categories.length, 4);
		assert.include(categories, '[ITEM CATEGORY RSS]');
		assert.include(categories, '[ITEM CATEGORY ATOM LABEL]');
		assert.include(categories, '[ITEM CATEGORY ATOM TERM]');
		assert.include(categories, '[ITEM CATEGORY MEDIA]');
	});

	test('Categories with HTML and CData', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<category><![CDATA[<b>[ITEM CATEGORY]</b>]]></category>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const categories = parseCategories(itemXml);

		assert.equal(categories.length, 1);
		assert.include(categories, '[ITEM CATEGORY]');
	});

	test('Empty categories', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<category></category>
					<category> </category>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const categories = parseCategories(itemXml);

		assert.equal(categories.length, 0);
	});
});

describe('Feed Item Summary', () => {
	test('RSS description', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<description>This is a summary</description>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const summary = parseSummary(itemXml);

		assert.equal(summary, 'This is a summary');
	});

	test('Atom summary', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<summary>This is an atom summary</summary>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const summary = parseSummary(itemXml);

		assert.equal(summary, 'This is an atom summary');
	});

	test('Media description', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<media:description>This is a media description</media:description>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const summary = parseSummary(itemXml);

		assert.equal(summary, 'This is a media description');
	});

	test('Summary with CData and HTML', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss>
			<channel>
				<item>
					<description><![CDATA[This is a <b>summary</b> with HTML]]></description>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const summary = parseSummary(itemXml);

		assert.equal(summary, 'This is a <b>summary</b> with HTML');
	});

	test('Missing summary', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry></entry>
		</feed>
		`).querySelector('entry')!;

		const summary = parseSummary(itemXml);

		assert.equal(summary, undefined);
	});
});

describe('Feed Item Content', () => {
	test('Atom external content', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<content src="https://example.com/external-content" />
			</entry>
		</feed>
		`).querySelector('entry')!;

		const content = parseContents(itemXml);

		assert.equal(content?.innerHTML, '<a href="https://example.com/external-content">https://example.com/external-content</a>');
	});

	test('Atom inline content: HTML', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<content type="html"><![CDATA[<p>Inline content</p>]]></content>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const content = parseContents(itemXml);

		assert.equal(content?.innerHTML, '<p>Inline content</p>');
	});

	test('Atom inline content: XHTML', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<content type="xhtml"><![CDATA[<p>Inline content</p>]]></content>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const content = parseContents(itemXml);

		assert.equal(content?.innerHTML, '<p>Inline content</p>');
	});

	test('Atom inline content: Text', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<content type="text"><![CDATA[Inline content]]></content>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const content = parseContents(itemXml);

		assert.equal(content?.innerHTML, 'Inline content');
	});

	test('Atom inline content: No type', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry>
				<content><![CDATA[<p>Inline content</p>]]></content>
			</entry>
		</feed>
		`).querySelector('entry')!;

		const content = parseContents(itemXml);

		assert.equal(content?.innerHTML, '<p>Inline content</p>');
	});

	test('Encoded content', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:content="http://purl.org/rss/1.0/modules/content/">
			<channel>
				<item>
					<content:encoded><![CDATA[<p>Encoded content</p>]]></content:encoded>
				</item>
			</channel>
		</rss>
		`).querySelector('item')!;

		const content = parseContents(itemXml);

		assert.equal(content?.innerHTML, '<p>Encoded content</p>');
	});

	test('No content', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry></entry>
		</feed>
		`).querySelector('entry')!;

		const content = parseContents(itemXml);

		assert.equal(content, undefined);
	});
});

describe('Feed Item', () => {
	// oxlint-disable-next-line complexity
	test('Full Atom Item', () => {
		const doc = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed xmlns="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
			<entry>
				<id>tag:example.com,2026:item</id>
				<title>Item &lt;b&gt;Title&lt;/b&gt;</title>
				<link href="https://example.com/item" />
				<author>
					<name>Author Name</name>
					<email>author@example.com</email>
				</author>
				<published>2026-04-25T12:00:00Z</published>
				<updated>2026-04-25T12:00:00Z</updated>
				<summary>Item summary description</summary>
				<content type="html">&lt;p&gt;Full body content with an &lt;img src="https://example.com/content-image.jpg" /&gt;&lt;/p&gt;</content>
				<category term="TEST" />
				<media:content url="https://example.com/media.mp4" medium="video" />
				<media:thumbnail url="https://example.com/poster.jpg" />
			</entry>
		</feed>
		`);

		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const feedId = 'test-feed' as Brand<string, 'feedId'>;
		const items = parseFeedItems(doc, feedId);

		assert.equal(items.length, 1);
		assert.equal(items[0]?.id, 'tag:example.com,2026:item');
		assert.equal(items[0]?.feedId, feedId);
		assert.equal(items[0]?.title, 'Item <b>Title</b>');
		assert.equal(items[0]?.url, 'https://example.com/item');
		assert.equal(items[0]?.author.name, 'Author Name');
		assert.equal(items[0]?.author.email, 'author@example.com');
		assert.equal(items[0]?.publishedAt?.toISOString(), '2026-04-25T12:00:00.000Z');
		assert.equal(items[0]?.updatedAt?.toISOString(), '2026-04-25T12:00:00.000Z');
		assert.equal(items[0]?.summary, 'Item summary description');
		assert.equal(items[0]?.content, '<p>Full body content with an <img src="https://example.com/content-image.jpg"></p>');
		assert.equal(items[0]?.image, 'https://example.com/poster.jpg');
		assert.equal(items[0]?.categories.length, 1);
		assert.include(items[0]?.categories ?? [], 'TEST');
		assert.equal(items[0]?.media.length, 1);
		assert.equal(items[0]?.media[0]?.url, 'https://example.com/media.mp4');
		assert.equal(items[0]?.media[0]?.type, 'video');
		assert.equal(items[0]?.media[0]?.mimeType, 'video/mp4');
	});

	// oxlint-disable-next-line complexity
	test('Full RSS Item', () => {
		const doc = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<rss xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:media="http://search.yahoo.com/mrss/">
			<channel>
				<item>
					<title>Item &lt;b&gt;Title&lt;/b&gt;</title>
					<link>https://example.com/item</link>
					<description>RSS description text</description>
					<content:encoded><![CDATA[<p>Full body content with an <img src="https://example.com/content-image.jpg"></p>]]></content:encoded>
					<author>author@example.com (Author Name)</author>
					<category>TEST</category>
					<pubDate>Sun, 25 Apr 2026 12:00:00 GMT</pubDate>
					<guid isPermaLink="false">guid-123</guid>
					<media:content url="https://example.com/media.mp4" type="video/mp4" />
					<media:thumbnail url="https://example.com/poster.jpg" />
				</item>
			</channel>
		</rss>
		`);

		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const feedId = 'test-feed' as Brand<string, 'feedId'>;
		const items = parseFeedItems(doc, feedId);

		assert.equal(items.length, 1);
		assert.equal(items[0]?.id, 'guid-123');
		assert.equal(items[0]?.feedId, feedId);
		assert.equal(items[0]?.title, 'Item <b>Title</b>');
		assert.equal(items[0]?.url, 'https://example.com/item');
		assert.equal(items[0]?.author.name, 'Author Name');
		assert.equal(items[0]?.author.email, 'author@example.com');
		assert.equal(items[0]?.publishedAt?.toISOString(), '2026-04-25T12:00:00.000Z');
		assert.equal(items[0]?.summary, 'RSS description text');
		assert.equal(items[0]?.content, '<p>Full body content with an <img src="https://example.com/content-image.jpg"></p>');
		assert.equal(items[0]?.image, 'https://example.com/poster.jpg');
		assert.include(items[0]?.categories ?? [], 'TEST');
		assert.equal(items[0]?.media.length, 1);
		assert.equal(items[0]?.media[0]?.url, 'https://example.com/media.mp4');
		assert.equal(items[0]?.media[0]?.type, 'video');
		assert.equal(items[0]?.media[0]?.mimeType, 'video/mp4');
		assert.equal(items[0]?.media[0]?.sizeInBytes, 0);
	});
});
