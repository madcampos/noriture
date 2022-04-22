import Dexie, { liveQuery, type Table } from 'dexie';
import { type Ref, unref } from 'vue';
import type { Feed } from '../components/feeds/feed';
import type { FeedItem } from '../components/feeds/feedItem';

const DATABASE_VERSION = 1;

type SavedFeed = Omit<Feed, 'items'>;

class Database extends Dexie {
	feeds!: Table<SavedFeed, SavedFeed['id']>;
	feedItems!: Table<FeedItem, FeedItem['id']>;

	constructor() {
		super('noriture');
		this.version(DATABASE_VERSION).stores({
			feeds: '&id, name, &feedUrl, *categories, type, displayType, lastUpdated',
			feedItems: '&id, title, url, date, feedId, *tags, read'
		});
	}
}

const database = new Database();

export function listUnreadItems(feedId: string) {
	return liveQuery(async () => database.feedItems.where('feedId').equals(feedId).and((item) => !item.read).toArray());
}

export async function saveFeedItems(items: FeedItem[] | Ref<FeedItem[]>) {
	const itemsValue = unref(items);

	const existingItems = await database.feedItems.where('url').anyOf(itemsValue.map((item) => item.url)).toArray();
	const existingItemsUrls = existingItems.map((item) => item.url);

	const newItems = itemsValue.filter((item) => !existingItemsUrls.includes(item.url));
	const updatedItems = itemsValue.filter((item) => {
		const isExistingItem = existingItemsUrls.includes(item.url);

		if (!isExistingItem) {
			return false;
		}

		const updatedItemDate = item.date ?? new Date();
		const savedItemDate = existingItems.find((existingItem) => existingItem.url === item.url)?.date ?? updatedItemDate;
		const isUpdated = updatedItemDate > savedItemDate;

		return isUpdated;
	});

	return database.feedItems.bulkPut([...newItems, ...updatedItems].map((item) => ({
		feedId: item.feedId,
		id: item.id,
		title: item.title,
		url: item.url,
		date: item.date,
		author: item.author,
		content: item.content,
		image: item.image,
		read: item.read,
		tags: [...item.tags],
		...(item.media && { media: item.media.map((media) => ({
			url: media.url,
			size: media.size,
			mimeType: media.mimeType,
			type: media.type
		})) })
	})));
}

export async function getFeedItem(id: string) {
	return database.feedItems.get({ id }) as Promise<FeedItem>;
}

export function listFeeds() {
	return liveQuery(async () => database.feeds.toArray());
}

export async function getFeed(id: string) {
	return database.feeds.get({ id });
}

export async function saveFeed(feed: Feed | Ref<Feed>) {
	const feedValue = unref(feed);

	const existingFeed = await database.feeds.where('feedUrl').equals(feedValue.feedUrl).first();

	if (existingFeed) {
		throw new Error('Feed already exists');
	}

	await saveFeedItems(feedValue.items);

	return database.feeds.add({
		feedUrl: feedValue.feedUrl,
		id: feedValue.id,
		name: feedValue.name,
		categories: [...feedValue.categories],
		type: feedValue.type,
		displayType: feedValue.displayType,
		siteUrl: feedValue.siteUrl,
		description: feedValue.description,
		icon: feedValue.icon,
		lastUpdated: feedValue.lastUpdated,
		backgroundColor: feedValue.backgroundColor ?? '',
		color: feedValue.color ?? '',
		unreadCount: feedValue.unreadCount,
		unreadItemIds: [...feedValue.unreadItemIds]
	});
}

export async function updateFeed(feedId: string, items: FeedItem[]) {
	await database.feeds.update(feedId, { lastUpdated: new Date() });
	await saveFeedItems(items);
}
