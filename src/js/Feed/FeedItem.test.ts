/* oxlint-disable max-lines, typescript/no-non-null-assertion */

import { assert, describe, test } from 'vitest';
import { parseXml } from '../utils/parsing.ts';
import { sanitizeContentHtml } from '../utils/sanitizer.ts';
import { parseAuthor, parseContentThumbnail, parseEnclosure, parseItemId, parseItemUrl, parseMediaContent, parseMediaItem, parseTitle } from './FeedItem.ts';

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

		assert(itemId === '[ITEM ID]');
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

		assert(itemId === '[ITEM ID]');
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

		assert(itemId === '[ITEM ID]');
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

		assert(itemId === '[ITEM ID]');
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

		assert(itemId === '[ITEM ID]');
	});

	test('Random UUID', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry></entry>
		</feed>
		`).querySelector('entry')!;

		const itemId = parseItemId(itemXml);

		assert(itemId !== '[ITEM ID]');
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

		assert(itemUrl?.href === 'https://example.com/rss-link');
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

		assert(itemUrl?.href === 'https://example.com/rss-guid');
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

		assert(itemUrl?.href === 'https://example.com/rss-guid-perm');
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

		assert(itemUrl?.href === 'https://example.com/atom-link');
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

		assert(itemUrl?.href === 'https://example.com/atom-id-link');
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

		assert(title === '[FEED ITEM TITLE]');
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

		assert(title === '[FEED ITEM <b>TITLE</b>]');
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

		assert(title === undefined);
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

		assert(author.name === 'John Doe');
		assert(author.email === 'john@example.com');
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
		assert(author.name === 'John Doe');
		assert(author.email === undefined);
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
		assert(author.name === 'john@example.com');
		assert(author.email === undefined);
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

		assert(author.name === 'John Doe');
		assert(author.email === 'john@example.com');
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

		assert(author.name === 'John Doe');
		assert(author.email === undefined);
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

		assert(author.name === 'john@example.com');
		assert(author.email === 'john@example.com');
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

		assert(author.name === 'Jane Doe');
		assert(author.email === 'jane@example.com');
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

		assert(author.name === 'Jane Doe');
		assert(author.email === undefined);
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

		assert(author.name === 'jane@example.com');
		assert(author.email === 'jane@example.com');
	});

	test('No author', () => {
		const itemXml = parseXml(`<?xml version="1.0" encoding="UTF-8"?>
		<feed>
			<entry></entry>
		</feed>
		`).querySelector('entry')!;

		const author = parseAuthor(itemXml);

		assert(author.name === 'No Author');
		assert(author.email === undefined);
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

		assert(media === undefined);
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

		assert(media?.url === 'https://example.com/player');
		assert(media.mimeType === undefined);
		assert(media.type === 'embedded');
		assert(media.sizeInBytes === 0);
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

		assert(media?.url === 'https://example.com/image.jpg');
		assert(media.mimeType === 'image/jpeg');
		assert(media.type === 'image');
		assert(media.sizeInBytes === 0);
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

		assert(media?.url === 'https://example.com/image.jpg');
		assert(media.mimeType === 'image/jpeg');
		assert(media.type === 'image');
		assert(media.sizeInBytes === 0);
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

		assert(media?.url === 'https://example.com/url-without-extension');
		assert(media.mimeType === undefined);
		assert(media.type === 'unknown');
		assert(media.sizeInBytes === 0);
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

		assert(media?.url === 'https://example.com/image.jpg');
		assert(media.mimeType === 'image/jpeg');
		assert(media.type === 'image');
		// oxlint-disable-next-line no-magic-numbers
		assert(media.sizeInBytes === 1024);
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

		assert(media?.url === 'https://example.com/video.mp4');
		assert(media.mimeType === 'video/mp4');
		assert(media.type === 'video');
		assert(media.sizeInBytes === 0);
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

		assert(enclosure === undefined);
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

		assert(enclosure === undefined);
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

		assert(enclosure?.url === 'https://example.com/audio.mp3');
		assert(enclosure.mimeType === 'audio/mpeg');
		assert(enclosure.type === 'audio');
		assert(enclosure.sizeInBytes === 0);
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

		assert(enclosure?.url === 'https://example.com/audio.mp3');
		assert(enclosure.mimeType === 'audio/mpeg');
		assert(enclosure.type === 'audio');
		assert(enclosure.sizeInBytes === 0);
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

		assert(enclosure?.url === 'https://example.com/unknown');
		assert(enclosure.mimeType === undefined);
		assert(enclosure.type === 'unknown');
		assert(enclosure.sizeInBytes === 0);
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

		assert(enclosure?.url === 'https://example.com/audio.mp3');
		assert(enclosure.mimeType === 'audio/mpeg');
		assert(enclosure.type === 'audio');
		assert(enclosure.sizeInBytes === 1);
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

		assert(mediaItems.length === 0);
		assert(mainImage === undefined);
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

		assert(mediaItems.length === 1);
		assert(mediaItems[0]!.url === 'https://example.com/video.mp4');
		assert(mainImage === undefined);
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

		assert(mediaItems.length === 0);
		assert(mainImage === 'https://example.com/thumbnail.jpg');
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

		assert(mediaItems.length === 0);
		assert(mainImage === 'https://example.com/itunes.jpg');
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

		assert(mediaItems.length === 0);
		assert(mainImage === 'https://example.com/podcast.jpg');
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

		assert(mediaItems.length === 1);
		assert(mainImage === 'https://example.com/image.jpg');
	});
});

describe('Feed Item Content Thumbnail', () => {
	test('No content', () => {
		const thumbnail = parseContentThumbnail(undefined);

		assert(thumbnail === undefined);
	});

	test('No thumbnail', () => {
		const content = sanitizeContentHtml('<p>Some content without images</p>');
		const thumbnail = parseContentThumbnail(content);

		assert(thumbnail === undefined);
	});

	test('Thumbnail exists', () => {
		const content = sanitizeContentHtml('<p><img src="https://example.com/image.jpg" /></p>');
		const thumbnail = parseContentThumbnail(content);

		assert(thumbnail === 'https://example.com/image.jpg');
	});

	test('Srcset thumbnail', () => {
		const content = sanitizeContentHtml('<p><img srcset="https://example.com/image-1x.jpg 1x, https://example.com/image-2x.jpg 2x" /></p>');
		const thumbnail = parseContentThumbnail(content);

		assert(thumbnail === 'https://example.com/image-1x.jpg');
	});
});
