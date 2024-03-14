import type { IDBPDatabase } from 'idb';
import { openDB } from 'idb';
import type { Feed } from '../packages/Feed/Feed';
import type { FeedItem } from '../packages/Feed/FeedItem';
import { asFeed, asFeedItem, asSavedFeed, asSavedFeedItem, type SavedFeed, type SavedFeedItem } from './feed-mapper';

const DATABASE_VERSION = 1;

export class Database {
	static #database: IDBPDatabase<{
		feeds: {
			key: 'id',
			value: SavedFeed,
			indexes: {
				feedUrl: string,
				siteUrl: string,
				feedCategories: string[]
			}
		},
		feedItems: {
			key: 'id',
			value: SavedFeedItem,
			indexes: {
				feedId: string,
				itemUrl: string,
				itemTags: string[],
				isRead: [string, 0 | 1]
			}
		}
	}>;

	static async #getConnection() {
		this.#database ||= await openDB('noriture', DATABASE_VERSION, {
			upgrade(database) {
				const feedsStore = database.createObjectStore('feeds', { keyPath: 'id' });
				const feedItemsStore = database.createObjectStore('feedItems', { keyPath: 'id' });

				feedsStore.createIndex('feedUrl', 'feedUrl', { unique: true });
				feedsStore.createIndex('siteUrl', 'siteUrl');
				feedsStore.createIndex('feedCategories', 'categories', { multiEntry: true });

				feedItemsStore.createIndex('feedId', 'feedId');
				feedItemsStore.createIndex('itemUrl', 'url');
				feedItemsStore.createIndex('itemTags', 'tags', { multiEntry: true });
				feedItemsStore.createIndex('isRead', ['feedId', 'read'], { unique: false });
			}
		});

		return this.#database;
	}

	static async listFeeds() {
		const database = await this.#getConnection();
		const feeds = await database.getAll('feeds');

		return feeds.map((feed) => asFeed(feed, []));
	}

	static async listFeedItems(feedId: string) {
		const database = await this.#getConnection();
		const feedItems = await database.getAllFromIndex('feedItems', 'feedId', IDBKeyRange.only(feedId));

		return feedItems.map((item) => asFeedItem(item));
	}

	static async listUnreadFeedItems(feedId: string) {
		const database = await this.#getConnection();
		const feedItems = await database.getAllFromIndex('feedItems', 'isRead', IDBKeyRange.only([feedId, 0]));

		return feedItems.map((item) => asFeedItem(item));
	}

	static async getFeedItem(itemId: string) {
		const database = await this.#getConnection();

		const feedItem = await database.get('feedItems', IDBKeyRange.only(itemId));

		if (!feedItem) {
			throw new Error(`Feed item with id ${itemId} does not exist`);
		}

		return asFeedItem(feedItem);
	}

	static async getFeed(feedId: string): Promise<Feed> {
		const database = await this.#getConnection();

		const feed = await database.get('feeds', IDBKeyRange.only(feedId));

		if (!feed) {
			throw new Error(`Feed with id ${feedId} does not exist`);
		}

		if (feed.lastUpdated === 'DownloadError' || feed.lastUpdated === 'ParseError') {
			throw new Error(`Feed with id ${feedId} has an error`);
		}

		const items = await Database.listFeedItems(feedId);

		return asFeed(feed, items);
	}

	static async hasFeed(feedUrl: string) {
		const database = await this.#getConnection();

		return (await database.getFromIndex('feeds', 'feedUrl', feedUrl)) !== undefined;
	}

	static async saveFeedItems(feedId: string, items: FeedItem[]) {
		const database = await this.#getConnection();

		const existingItems = await database.getAllFromIndex('feedItems', 'feedId', IDBKeyRange.only(feedId));

		return Promise.all(items.map(async (item) => {
			// TODO: review how we check if an item is duplicated.
			const existingItemIndex = existingItems.findIndex((existingItem) => existingItem.url === item.url);

			if (existingItemIndex !== -1) {
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				item.id = existingItems[existingItemIndex]!.id;
				item.read = false;
			}

			return database.add('feedItems', asSavedFeedItem(item, feedId));
		}));
	}

	static async saveFeed(feed: Feed) {
		const database = await this.#getConnection();

		const existingFeed = await database.getFromIndex('feeds', 'feedUrl', feed.feedUrl);

		if (existingFeed) {
			throw new Error(`Feed with id ${feed.id} already exists`);
		}

		await Database.saveFeedItems(feed.id, feed.items);

		return database.put('feeds', asSavedFeed(feed));
	}

	static async updateFeed(feedId: string, items: FeedItem[]) {
		const database = await this.#getConnection();

		const feed = await database.get('feeds', IDBKeyRange.only(feedId));

		if (!feed) {
			throw new Error(`Feed with id ${feedId} does not exist`);
		}

		await Database.saveFeedItems(feedId, items);

		return database.put('feeds', asSavedFeed({
			...(feed as Feed),
			lastUpdated: new Date()
		}));
	}

	static async markFeedItemRead(itemId: string) {
		const database = await this.#getConnection();

		const item = await database.get('feedItems', IDBKeyRange.only(itemId));

		if (!item) {
			throw new Error(`Item with id ${itemId} does not exist`);
		}

		return database.put('feedItems', {
			...item,
			read: 1
		});
	}

	static async markFeedItemUnread(itemId: string) {
		const database = await this.#getConnection();

		const item = await database.get('feedItems', IDBKeyRange.only(itemId));

		if (!item) {
			throw new Error(`Item with id ${itemId} does not exist`);
		}

		return database.put('feedItems', {
			...item,
			read: 0
		});
	}

	static async deleteFeed(feedId: string) {
		const database = await this.#getConnection();

		await database.delete('feeds', IDBKeyRange.only(feedId));
		await database.delete('feedItems', IDBKeyRange.only(feedId));
	}

	static async deleteFeedItem(itemId: string) {
		const database = await this.#getConnection();

		await database.delete('feedItems', IDBKeyRange.only(itemId));
	}
}
