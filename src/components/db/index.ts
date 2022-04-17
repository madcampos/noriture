import Dexie, { liveQuery, type Table } from 'dexie';
import { type Ref, unref } from 'vue';
import type { Feed } from '../feeds';
import type { FeedItem } from '../feeds/feedItem';

const DATABASE_VERSION = 1;

type SavedFeed = Omit<Feed, 'items'>;

class Database extends Dexie {
	feeds!: Table<SavedFeed, SavedFeed['id']>;
	feedItems!: Table<FeedItem, FeedItem['id']>;

	constructor() {
		super('noriture');
		this.version(DATABASE_VERSION).stores({
			feeds: '&id, name, &url, category, type, displayType',
			feedItems: '&id, title, &url, date, feedId'
		});
	}
}

const database = new Database();

export function listUnreadItems(feedId: string) {
	return liveQuery(async () => database.feedItems.where('feedId').equals(feedId).and((item) => !item.read).toArray());
}

export async function saveFeedItems(items: FeedItem[] | Ref<FeedItem[]>) {
	const itemsValue = unref(items);

	return database.feedItems.bulkPut(itemsValue.map((item) => ({
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

	await saveFeedItems(feedValue.items);

	return database.feeds.add({
		feedUrl: feedValue.siteUrl,
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
