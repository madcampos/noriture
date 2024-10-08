import { sanitize } from '../../js/util/sanitization.ts';

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

export interface FeedItem {
	/** The item's unique identifier. */
	id: ReturnType<typeof crypto.randomUUID>;
	/** The item's title that will be displayed to the user. */
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
	read: boolean;
	/** The item's feed id. */
	feedId: ReturnType<typeof crypto.randomUUID>;
	/** The item's tags. */
	tags: string[];
}

function extractItemId(item: Element) {
	return item.querySelector('guid:not([isPermaLink="true"])')?.textContent?.trim() ?? crypto.randomUUID();
}

function extractItemUrl(item: Element) {
	return item.querySelector('link, id, guid[isPermaLink="true"]')?.textContent?.trim() ?? item.querySelector('link')?.href;
}

function extractItemTitle(item: Element) {
	return item.querySelector('title')?.textContent?.trim();
}

function extractItemAuthor(item: Element) {
	const authorNestedTag = item.querySelector('author > name, contributor > name');
	const authorDirectTag = item.querySelector('author, creator');
	const authorText = (authorNestedTag ?? authorDirectTag)?.textContent?.trim()?.replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1');

	if (authorText) {
		const { name, email } = (/(?<email>.+?) \((?<name>.+?)\)/u).exec(authorText)?.groups ?? {};

		return {
			name: name ?? authorText,
			email
		};
	}

	return undefined;
}

function extractMediaContent(item: Element) {
	const mediaItems = [...item.getElementsByTagName('media:content')].map((mediaItem) => ({
		url: mediaItem.getAttribute('url') ?? '',
		mimeType: mediaItem.getAttribute('type') ?? '',
		size: Number.parseInt(mediaItem.getAttribute('fileSize') ?? '0'),
		type: MEDIA_TYPES.find((type) => type === mediaItem.getAttribute('medium')) ?? 'unknown'
	}));

	if (item.querySelector('enclosure')) {
		const enclosureMedia: FeedMedia = {
			url: item.querySelector('enclosure')?.getAttribute('url') ?? '',
			mimeType: item.querySelector('enclosure')?.getAttribute('type') ?? '',
			size: Number.parseInt(item.querySelector('enclosure')?.getAttribute('length') ?? '0'),
			type: MEDIA_TYPES.find((type) => item.querySelector(`enclosure[type^=${type}]`)) ?? 'unknown'
		};

		mediaItems.push(enclosureMedia);
	}

	const enclosureImage = item.querySelector('enclosure[type^=image]')?.getAttribute('url');
	const mediaThumbnail = (item.getElementsByTagName('media:thumbnail')[0] as Element | null)?.getAttribute('url');

	return {
		mediaItems,
		enclosureImage,
		mediaThumbnail
	};
}

function extractContentThumbnail(content: string) {
	const parsedContent = new window.DOMParser().parseFromString(content, 'text/html');
	const parsedThumbnail = parsedContent.querySelector('img')?.getAttribute('src')?.trim();

	return parsedThumbnail;
}

function extractItemDate(item: Element) {
	const publicationDate = item.querySelector('pubDate, published')?.textContent?.trim();
	const lastModified = item.querySelector('lastBuildDate, updated')?.textContent?.trim();

	if (publicationDate || lastModified) {
		return new Date((publicationDate ?? lastModified) as string);
	}

	return new Date();
}

function extractItemCategories(item: Element) {
	return [
		...new Set(
			[...item.querySelectorAll('category')].map((category) => {
				const label = category.getAttribute('label');
				const term = category.getAttribute('term');
				const textContent = category.textContent?.trim()?.replace(/^<!\[CDATA\[(.*)\]\]>$/iu, '$1');

				return label ?? term ?? textContent;
			}).filter((category) => category)
		)
	] as string[];
}

function extractItemContents(item: Element) {
	const content = item.querySelector('description, content')?.textContent ?? item.querySelector('summary')?.textContent ?? '';

	return sanitize(content.trim());
}

export function extractItems(feed: Document, feedId: string) {
	const items: FeedItem[] = [...feed.querySelectorAll('item')].map((item) => {
		const { mediaItems, enclosureImage, mediaThumbnail } = extractMediaContent(item);
		const content = extractItemContents(item);
		const contentThumbnail = extractContentThumbnail(content);
		const date = extractItemDate(item);
		const title = extractItemTitle(item);

		if (!title && !content) {
			return undefined;
		}

		return {
			id: extractItemId(item),
			feedId,
			read: false,
			title,
			author: extractItemAuthor(item),
			content,
			url: extractItemUrl(item),
			image: enclosureImage ?? mediaThumbnail ?? contentThumbnail,
			tags: extractItemCategories(item),
			date,
			media: mediaItems
		};
	}).filter((item) => item !== undefined) as FeedItem[];

	return items;
}

export function extractUnreadItemsIds(items: FeedItem[]) {
	return items.filter((item) => !item.read).map((item) => item.id);
}
