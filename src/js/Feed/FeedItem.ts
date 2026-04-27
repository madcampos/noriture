/* oxlint-disable typescript/prefer-nullish-coalescing, typescript/no-unsafe-type-assertion, typescript/consistent-type-assertions */

import { getMediaTypeFromMime, getMimeTypeFromExtension, type MediaType } from '../utils/mime-types.ts';
import { parseDate, parseUrl } from '../utils/parsing.ts';
import { sanitizeContentHtml, sanitizeInlineHtml, sanitizeInlineText, stripCData } from '../utils/sanitizer.ts';
import type { FeedId } from './Feed.ts';

export interface FeedMedia {
	type: MediaType;
	url: string;
	mimeType?: string;
	sizeInBytes: number;
}

export interface FeedItemAuthor {
	name: string;
	email?: string;
}

export type FeedItemId = Brand<string, 'feedItemId'>;

export interface FeedItem {
	id: FeedItemId;
	feedId: FeedId;
	title?: string;
	author: FeedItemAuthor;
	publishedAt?: Date;
	updatedAt?: Date;
	image?: string;
	summary?: string;
	content?: string;
	media: FeedMedia[];
	url?: string;
	isRead: boolean;
	categories: string[];
}

export function parseItemId(item: Element) {
	const rssGuid = item.querySelector('guid')?.textContent.trim();
	const rssLink = item.querySelector('link:not([href])')?.textContent.trim();
	const atomId = item.querySelector('id')?.textContent.trim();
	const atomLink = item.querySelector('link[href]:is([rel="self"], :not([rel]))')?.getAttribute('href')?.trim();

	const itemId = rssGuid || rssLink || atomId || atomLink || crypto.randomUUID();

	return itemId as FeedItemId;
}

export function parseItemUrl(item: Element) {
	const rssLink = item.querySelector('link:not([href])')?.textContent.trim();
	const rssGuid = item.querySelector('guid:not([isPermaLink="false"])')?.textContent.trim();
	const atomLink = item.querySelector('link[href]:is([rel="self"], :not([rel]))')?.getAttribute('href')?.trim();
	const atomId = item.querySelector('id')?.textContent.trim();

	return parseUrl(rssLink, rssGuid, atomLink, atomId);
}

export function parseTitle(item: Element) {
	const title = item.querySelector('title')?.textContent;

	return sanitizeInlineHtml(stripCData(title));
}

export function parseAuthor(item: Element) {
	const rssAuthor = item.querySelector('author:not(:has(> *))')?.textContent;

	const atomAuthor = item.querySelector('author > name')?.textContent;
	const atomEmail = item.querySelector('author > email')?.textContent;

	const atomContributor = item.querySelector('contributor > name')?.textContent;
	const atomContributorEmail = item.querySelector('contributor > email')?.textContent;

	if (rssAuthor) {
		const sanitizedRssAuthor = sanitizeInlineText(stripCData(rssAuthor));
		const { name, email } = (/(?<email>.+?) \((?<name>.+?)\)/u).exec(sanitizedRssAuthor ?? '')?.groups ?? {};

		return {
			name: name ?? email ?? sanitizedRssAuthor ?? 'No Author',
			email
		} satisfies FeedItemAuthor;
	}

	const sanitizedAuthor = sanitizeInlineText(stripCData(atomAuthor ?? atomContributor));
	const sanitizedEmail = sanitizeInlineText(stripCData(atomEmail ?? atomContributorEmail));

	return {
		name: sanitizedAuthor ?? sanitizedEmail ?? 'No Author',
		email: sanitizedEmail
	} satisfies FeedItemAuthor;
}

export function parseMediaItem(mediaItem: Element, item: Element) {
	const playerUrl = item.querySelector('player')?.getAttribute('url');
	const parsedPlayerUrl = parseUrl(playerUrl);

	if (parsedPlayerUrl) {
		return {
			type: 'embedded' as MediaType,
			url: parsedPlayerUrl.href,
			sizeInBytes: 0
		} satisfies FeedMedia;
	}

	const url = mediaItem.getAttribute('url');
	const parsedUrl = parseUrl(url);

	if (!parsedUrl) {
		return;
	}

	const mimeType = mediaItem.getAttribute('type') ?? getMimeTypeFromExtension(parsedUrl.href);
	const size = Number.parseInt(mediaItem.getAttribute('fileSize') ?? '0', 10);

	const typeAttribute = mediaItem.getAttribute('medium') as MediaType | null;
	const typeFromMime = getMediaTypeFromMime(mimeType);

	return {
		type: typeAttribute ?? typeFromMime ?? 'unknown',
		url: parsedUrl.href,
		mimeType,
		sizeInBytes: size
	} satisfies FeedMedia;
}

export function parseEnclosure(item: Element) {
	const enclosure = item.querySelector('enclosure');

	if (!enclosure) {
		return;
	}

	const url = parseUrl(enclosure.getAttribute('url'));

	if (!url) {
		return;
	}

	const mimeType = enclosure.getAttribute('type') ?? getMimeTypeFromExtension(url.href);
	const type = getMediaTypeFromMime(mimeType) ?? 'unknown';
	const size = Number.parseInt(enclosure.getAttribute('length') ?? '0', 10);

	return {
		type,
		url: url.href,
		mimeType,
		sizeInBytes: size
	} satisfies FeedMedia;
}

export function parseMediaContent(item: Element) {
	const mediaItems = [
		...[...item.getElementsByTagName('media:content')].map((mediaItem) => parseMediaItem(mediaItem, item)),
		parseEnclosure(item)
	].filter((mediaItem) => mediaItem !== undefined);

	const mediaThumbnail = item.querySelector('thumbnail[url]')?.getAttribute('url');

	// INFO: this matches both iTunes and Podcast namespaces
	const itunesOrPodcastImage = item.querySelector('image[href]')?.getAttribute('href');

	const mediaItemsImage = mediaItems.find(({ type }) => type === 'image')?.url;

	return {
		mediaItems,
		mainImage: parseUrl(mediaThumbnail, itunesOrPodcastImage, mediaItemsImage)?.href
	};
}

export function parseContentThumbnail(content?: Element) {
	if (!content) {
		return;
	}

	const parsedSrc = content.querySelector('img')?.getAttribute('src');

	return parseUrl(parsedSrc)?.href;
}

export function parsePublishedDate(item: Element) {
	const rssPublishDate = item.querySelector('pubDate')?.textContent;
	const atomPublishDate = item.querySelector('published')?.textContent;

	return parseDate(rssPublishDate ?? atomPublishDate);
}

export function parseUpdatedDate(item: Element) {
	const atomUpdatedDate = item.querySelector('updated')?.textContent;

	return parseDate(atomUpdatedDate);
}

export function parseCategories(item: Element) {
	// INFO: this also queries `media:category` elements
	const rssCategories = [...item.querySelectorAll('category:not(:empty)')].map((category) => {
		const categoryText = category.textContent;

		return sanitizeInlineText(stripCData(categoryText)) ?? '';
	});

	const atomCategories = [...item.querySelectorAll('category:empty')].map((category) => {
		const categoryLabel = category.getAttribute('label')?.trim();
		const categoryTerm = category.getAttribute('term')?.trim();

		return categoryLabel || categoryTerm || '';
	});

	const combinedCategories = [...rssCategories, ...atomCategories].filter((category) => category);

	return [...new Set(combinedCategories)];
}

export function parseSummary(item: Element) {
	// INFO: this also queries `media:description` elements
	const rssSummary = item.querySelector('description')?.textContent.trim();
	const atomSummary = item.querySelector('summary')?.textContent.trim();

	return sanitizeInlineHtml(stripCData(rssSummary || atomSummary));
}

export function parseContents(item: Element, baseUrl?: string) {
	const atomExternalContent = item.querySelector('content[src]')?.getAttribute('src');

	if (atomExternalContent) {
		const externalUrl = parseUrl(atomExternalContent)?.href;

		if (!externalUrl) {
			return;
		}

		return sanitizeContentHtml(`<a href="${externalUrl}">${externalUrl}</a>`, baseUrl);
	}

	const atomInlineContent = item.querySelector('content:is([type="text"], [type="html"], [type="xhtml"], :not([type]))')?.textContent.trim();
	const encodedContent = item.querySelector('encoded')?.textContent.trim();

	return sanitizeContentHtml(stripCData(atomInlineContent || encodedContent), baseUrl);
}

export function parseFeedItems(feed: Document, feedId: FeedId, siteUrl?: string) {
	const items: FeedItem[] = [...feed.querySelectorAll('item, entry')].map((item) => {
		const title = parseTitle(item);
		const content = parseContents(item, siteUrl);

		if (!title && !content) {
			return undefined;
		}

		const { mediaItems, mainImage } = parseMediaContent(item);
		const contentThumbnail = parseContentThumbnail(content);

		return {
			id: parseItemId(item),
			feedId,
			title,
			summary: parseSummary(item),
			content: content?.innerHTML,
			isRead: false,
			author: parseAuthor(item),
			url: parseItemUrl(item)?.href,
			image: mainImage ?? contentThumbnail,
			publishedAt: parsePublishedDate(item),
			updatedAt: parseUpdatedDate(item),
			media: mediaItems,
			categories: parseCategories(item)
		};
	}).filter((item) => item !== undefined);

	return items;
}
