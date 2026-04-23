import { CategoryMap } from '../utils/mime-types.ts';
import { cleanCData, parseContentHtml, parseDate, parseText, parseUrl } from '../utils/parsing.ts';
import type { FeedId } from './Feed.ts';

const MEDIA_TYPES = ['image', 'text', 'audio', 'video', 'document', 'executable', 'unknown'] as const;

type MediaType = typeof MEDIA_TYPES[number];

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

function parseItemId(item: Element) {
	const rssGuid = item.querySelector('guid')?.textContent.trim();
	const rssLink = item.querySelector('link:not([href])')?.textContent.trim();
	const atomId = item.querySelector('id')?.textContent.trim();
	const atomLink = item.querySelector('link[href]:is([rel="self"], :not([rel]))')?.href.trim();

	// oxlint-disable-next-line typescript/prefer-nullish-coalescing
	const itemId = rssGuid || rssLink || atomId || atomLink || crypto.randomUUID();

	// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
	return itemId as FeedItemId;
}

function parseItemUrl(item: Element) {
	const rssLink = item.querySelector('link:not([href])')?.textContent.trim();
	const rssGuid = item.querySelector('guid:not([isPermaLink="false"])')?.textContent.trim();
	const atomLink = item.querySelector('link[href]:is([rel="self"], :not([rel]))')?.href.trim();
	const atomId = item.querySelector('id')?.textContent.trim();

	return parseUrl(rssLink, rssGuid, atomLink, atomId);
}

function parseTitle(item: Element) {
	const title = item.querySelector('title')?.textContent;

	return cleanCData(title);
}

// TODO: review
function parseAuthor(item: Element) {
	const rssAuthor = item.querySelector('author:not(:has(> *))')?.textContent;

	const atomAuthor = item.querySelector('author > name')?.textContent;
	const atomEmail = item.querySelector('author > email')?.textContent;

	const atomContributor = item.querySelector('contributor > name')?.textContent;
	const atomContributorEmail = item.querySelector('contributor > email')?.textContent;

	if (rssAuthor) {
		const { name = 'No Author', email } = (/(?<email>.+?) \((?<name>.+?)\)/u).exec(cleanCData(rssAuthor) ?? '')?.groups ?? {};

		return {
			name,
			email
		} satisfies FeedItemAuthor;
	}

	return {
		name: cleanCData(atomAuthor ?? atomContributor) ?? 'No Author',
		email: (atomEmail || atomContributorEmail) ? cleanCData(atomEmail ?? atomContributorEmail ?? '') : undefined
	} satisfies FeedItemAuthor;
}

function parseTypeFromMime(mimeType?: string) {
	const typeFromMime: MediaType = CategoryMap[mimeType ?? ''] ?? 'unknown';

	return typeFromMime;
}

// TODO: review
function parseMediaItem(mediaItem: Element, item: Element) {
	const url = mediaItem.getAttribute('url') ?? item.querySelector('player')?.getAttribute('url') ?? undefined;
	const parsedUrl = parseUrl(url);

	if (!parsedUrl) {
		return;
	}

	const mimeType = mediaItem.getAttribute('type') ?? undefined;
	const size = Number.parseInt(mediaItem.getAttribute('fileSize') ?? '0', 10);

	// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
	const typeAttribute = mediaItem.getAttribute('medium') as MediaType | null;
	const typeFromMime = parseTypeFromMime(mimeType);

	return {
		type: typeAttribute ?? typeFromMime,
		url: parsedUrl.href,
		mimeType,
		sizeInBytes: size
	} satisfies FeedMedia;
}

// TODO: review
function parseEnclosure(item?: Element | null) {
	if (!item) {
		return;
	}

	const url = parseUrl(item.getAttribute('url'));

	if (!url) {
		return;
	}

	const mimeType = item.getAttribute('type') ?? undefined;
	const type = parseTypeFromMime(mimeType);
	const size = Number.parseInt(item.getAttribute('length') ?? '0', 10);

	return {
		type,
		url: url.href,
		mimeType,
		sizeInBytes: size
	} satisfies FeedMedia;
}

// TODO: review
function parseMediaContent(item: Element) {
	const mediaItems = [
		...[...item.getElementsByTagName('media:content')].map((mediaItem) => parseMediaItem(mediaItem, item)),
		parseEnclosure(item.querySelector('enclosure'))
	].filter((mediaItem) => mediaItem !== undefined);

	const mediaThumbnail = item.querySelector('thumbnail[url]')?.getAttribute('url');

	const itunesImage = item.querySelector('image[url]')?.getAttribute('url');

	const podcastImage = item.querySelector('image[href]')?.getAttribute('href');

	return {
		mediaItems,
		mainImage: parseUrl(mediaThumbnail, itunesImage, podcastImage, mediaItems.find(({ type }) => type === 'image')?.url)?.href
	};
}

function parseContentThumbnail(content?: string) {
	if (!content) {
		return;
	}

	// TODO: add baseurl?
	const parsedContent = parseContentHtml(content);
	// TODO: also query for picture
	const parsedThumbnail = parsedContent?.querySelector('img')?.getAttribute('src');

	return parseUrl(parsedThumbnail)?.href;
}

// TODO: review
function parsePublishedDate(item: Element) {
	const rssPublishDate = item.querySelector('pubDate')?.textContent;
	const atomPublishDate = item.querySelector('published')?.textContent;

	return parseDate(rssPublishDate ?? atomPublishDate);
}

// TODO: review
function parseUpdatedDate(item: Element) {
	const atomUpdatedDate = item.querySelector('updated')?.textContent;

	return parseDate(atomUpdatedDate);
}

function parseCategories(item: Element) {
	// INFO: this also queries `media:category` elements
	const rssCategories = [...item.querySelectorAll('category:has(> *)')].map((category) => {
		const categoryText = category.textContent;

		return parseText(cleanCData(categoryText)) ?? '';
	});

	const atomCategories = [...item.querySelectorAll('category:empty')].map((category) => {
		const categoryLabel = category.getAttribute('label')?.trim();
		const categoryTerm = category.getAttribute('term')?.trim();

		// oxlint-disable-next-line typescript/prefer-nullish-coalescing
		return categoryLabel || categoryTerm || '';
	});

	const combinedCategories = [...rssCategories, ...atomCategories].filter((category) => category);

	return [...new Set(combinedCategories)];
}

function parseSummary(item: Element) {
	// INFO: this also queries `media:description` elements
	const rssSummary = item.querySelector('description')?.textContent.trim();
	const atomSummary = item.querySelector('summary')?.textContent.trim();

	// oxlint-disable-next-line typescript/prefer-nullish-coalescing
	return cleanCData(rssSummary || atomSummary);
}

function parseContents(item: Element) {
	const atomExternalContent = item.querySelector('content[src]')?.getAttribute('src');

	if (atomExternalContent) {
		const externalUrl = parseUrl(atomExternalContent)?.href;

		if (!externalUrl) {
			return;
		}

		return `<a href="${externalUrl}">${externalUrl}</a>`;
	}

	const atomInlineContent = item.querySelector('content:is([type="text"], [type="html"], [type="xhtml"])')?.textContent.trim();
	const encodedContent = item.querySelector('encoded')?.textContent.trim();

	// oxlint-disable-next-line typescript/prefer-nullish-coalescing
	return cleanCData(atomInlineContent || encodedContent);
}

export function parseFeedItems(feed: Document, feedId: FeedId) {
	const items: FeedItem[] = [...feed.querySelectorAll('item, entry')].map((item) => {
		const title = parseTitle(item);
		const content = parseContents(item);

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
			content: content,
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
