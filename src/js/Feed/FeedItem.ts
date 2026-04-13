import type { FeedId } from './Feed.ts';

export const MEDIA_TYPES = ['image', 'video', 'audio', 'document', 'executable', 'unknown'] as const;

export interface FeedMedia {
	/** The media's type. */
	type: typeof MEDIA_TYPES[number];
	/** The media's URL. */
	url: string;
	/** The media's mime type. */
	mimeType: string;
	/** The media's size in bytes. */
	size: number;
}

export type FeedItemId = Brand<string, 'feedItemId'>;

export interface FeedItem {
	/** The item's unique identifier. */
	id: FeedItemId;
	/** The item's title that will be displayed to the user. */
	feedId: FeedId;
	/** The item's tags. */
	title?: string;
	/** The item's author. */
	author?: {
		/** The author's name. */
		name: string,
		/** The author's email. */
		email?: string
	};
	/** The item's date */
	date?: Date;
	/** The item's image */
	image?: string;
	/** The item's content. */
	content: string;
	/** The item's media. */
	media: FeedMedia[];
	/** The item's URL. */
	url?: string;
	/** The item's read status. */
	isRead: boolean;
	/** The item's feed id. */
	tags: string[];
}

function parseItemId(item: Element) {
	// TODO: addl ink and get a better id
	const itemId = item.querySelector('id, guid[isPermaLink="true"]')?.textContent.trim() ?? crypto.randomUUID();

	// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
	return itemId as FeedItemId;
}

function parseItemUrl(item: Element) {
	return item.querySelector('link, id, guid[isPermaLink="true"]')?.textContent.trim() ?? item.querySelector('link')?.href;
}

function parseTitle(item: Element) {
	return item.querySelector('title')?.textContent.trim();
}

function parseAuthor(item: Element) {
	const authorNestedTag = item.querySelector('author > name, contributor > name');
	const authorDirectTag = item.querySelector('author, creator');
	const authorText = (authorNestedTag ?? authorDirectTag)?.textContent.trim().replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1');

	if (authorText) {
		const { name, email } = (/(?<email>.+?) \((?<name>.+?)\)/u).exec(authorText)?.groups ?? {};

		return {
			name: name ?? authorText,
			email
		};
	}

	return undefined;
}

function parseMediaContent(item: Element) {
	const mediaItems = [...item.getElementsByTagName('media:content')].map((mediaItem) => ({
		url: mediaItem.getAttribute('url') ?? '',
		mimeType: mediaItem.getAttribute('type') ?? '',
		size: Number.parseInt(mediaItem.getAttribute('fileSize') ?? '0', 10),
		type: MEDIA_TYPES.find((type) => type === mediaItem.getAttribute('medium')) ?? 'unknown'
	}));

	if (item.querySelector('enclosure')) {
		const enclosureMedia: FeedMedia = {
			url: item.querySelector('enclosure')?.getAttribute('url') ?? '',
			mimeType: item.querySelector('enclosure')?.getAttribute('type') ?? '',
			size: Number.parseInt(item.querySelector('enclosure')?.getAttribute('length') ?? '0', 10),
			type: MEDIA_TYPES.find((type) => item.querySelector(`enclosure[type^=${type}]`)) ?? 'unknown'
		};

		mediaItems.push(enclosureMedia);
	}

	const enclosureImage = item.querySelector('enclosure[type^=image]')?.getAttribute('url');
	const mediaThumbnail = item.getElementsByTagName('media:thumbnail')[0]?.getAttribute('url');

	return {
		mediaItems,
		enclosureImage,
		mediaThumbnail
	};
}

function parseContentThumbnail(content?: string) {
	if (!content) {
		return;
	}

	// TODO: what if it is not html?
	const parsedContent = new window.DOMParser().parseFromString(content, 'text/html');
	const parsedThumbnail = parsedContent.querySelector('img')?.getAttribute('src')?.trim();

	return parsedThumbnail;
}

function parseItemDate(item: Element) {
	const publicationDate = item.querySelector('pubDate, published')?.textContent.trim();
	const lastModified = item.querySelector('lastBuildDate, updated')?.textContent.trim();

	if (publicationDate || lastModified) {
		try {
			const date = new Date((publicationDate ?? lastModified) ?? '');

			if (!Number.isNaN(date.getTime())) {
				return date;
			}
		} catch {
			return new Date();
		}
	}

	return new Date();
}

function parseCategories(item: Element) {
	return [
		...new Set(
			[...item.querySelectorAll('category')].map((category) => {
				const label = category.getAttribute('label');
				const term = category.getAttribute('term');
				const textContent = category.textContent.trim().replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1');

				return label ?? term ?? textContent;
			}).filter((category) => category)
		)
	];
}

// TODO: split into actual content and summary
function parseContents(item: Element) {
	return (item.querySelector('description, content')?.textContent ?? item.querySelector('summary')?.textContent)?.trim();
}

export function extractItems(feed: Document, feedId: FeedId) {
	const items: FeedItem[] = [...feed.querySelectorAll('item, entry')].map((item) => {
		const { mediaItems, enclosureImage, mediaThumbnail } = parseMediaContent(item);
		const content = parseContents(item);
		const contentThumbnail = parseContentThumbnail(content);
		const date = parseItemDate(item);
		const title = parseTitle(item);

		if (!title && !content) {
			return undefined;
		}

		return {
			id: parseItemId(item),
			feedId,
			isRead: false,
			title,
			author: parseAuthor(item),
			content: content ?? '',
			url: parseItemUrl(item),
			image: enclosureImage ?? mediaThumbnail ?? contentThumbnail,
			tags: parseCategories(item),
			date,
			media: mediaItems
		};
	}).filter((item) => item !== undefined);

	return items;
}

export function extractUnreadItemsIds(items: FeedItem[]) {
	return items.filter((item) => !item.isRead).map((item) => item.id);
}
