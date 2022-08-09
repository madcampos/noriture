import { openDB } from 'idb/with-async-ittr';
import type { IDBPDatabase } from 'idb/with-async-ittr';
import type { Feed } from '../components/feeds/feed';
import type { FeedItem } from '../components/feeds/feedItem';

const DATABASE_VERSION = 1;

type SavedFeed = Omit<Feed, 'items' | 'unreadCount' | 'unreadItemIds'>;

export class Database {
	static #database: IDBPDatabase<{
		feeds: {
			key: 'id',
			value: SavedFeed,
			indexes: {
				feedUrl: string,
				feedCategories: string[]
			}
		},
		feedItems: {
			key: 'id',
			value: FeedItem,
			indexes: {
				feedId: string,
				itemUrl: string,
				itemTags: string[],
				isRead: [string, 0 | 1]
			}
		}
	}>;

	static async #getConnection() {
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/strict-boolean-expressions
		if (!this.#database) {
			this.#database = await openDB('noriture', DATABASE_VERSION, {
				upgrade(database) {
					const feedsStore = database.createObjectStore('feeds', { keyPath: 'id' });
					const feedItemsStore = database.createObjectStore('feedItems', { keyPath: 'id' });

					feedsStore.createIndex('feedUrl', 'feedUrl', { unique: true });
					feedsStore.createIndex('feedCategories', 'categories', { multiEntry: true });

					feedItemsStore.createIndex('feedId', 'feedId');
					feedItemsStore.createIndex('itemUrl', 'url');
					feedItemsStore.createIndex('itemTags', 'tags', { multiEntry: true });
					feedItemsStore.createIndex('isRead', ['feedId', 'read'], { unique: false });
				}
			});
		}

		return this.#database;
	}

	static async listFeeds() {
		const database = await this.#getConnection();

		return database.getAll('feeds');
	}

	static async listFeedItems(feedId: string) {
		const database = await this.#getConnection();

		return database.getAll('feedItems', IDBKeyRange.only(feedId));
	}

	static async listUnreadFeedItems(feedId: string) {
		const database = await this.#getConnection();

		return database.getAllFromIndex('feedItems', 'isRead', IDBKeyRange.only([feedId, 0]));
	}

	static async getFeedItem(itemId: string) {
		const database = await this.#getConnection();

		return database.get('feedItems', IDBKeyRange.only(itemId));
	}

	static async getFeed(feedId: string): Promise<Feed> {
		const database = await this.#getConnection();

		const feed = await database.get('feeds', IDBKeyRange.only(feedId));

		if (!feed) {
			throw new Error(`Feed with id ${feedId} does not exist`);
		}

		const items = await Database.listFeedItems(feedId);
		const unreadItems = items.filter((item) => !item.read);

		return {
			...feed,
			items,
			unreadItemIds: unreadItems.map((item) => item.id),
			unreadCount: unreadItems.length
		};
	}

	static async saveFeedItems(feedId: string, items: FeedItem[]) {
		const database = await this.#getConnection();

		const existingItems = await database.getAllFromIndex('feedItems', 'feedId', IDBKeyRange.only(feedId));

		return Promise.all(items.map(async (item) => {
			const existingItemIndex = existingItems.findIndex((existingItem) => existingItem.url === item.url);

			if (existingItemIndex !== -1) {
				item.id = existingItems[existingItemIndex].id;
			}

			return database.add('feedItems', {
				...item,
				feedId,
				read: false
			});
		}));
	}

	static async saveFeed(feed: Feed) {
		const database = await this.#getConnection();

		const existingFeed = await database.getFromIndex('feeds', 'feedUrl', feed.feedUrl);

		if (existingFeed) {
			throw new Error(`Feed with id ${feed.id} already exists`);
		}

		await Database.saveFeedItems(feed.id, feed.items);

		return database.put('feeds', {
			feedUrl: feed.feedUrl,
			id: feed.id,
			name: feed.name,
			categories: [...feed.categories],
			type: feed.type,
			displayType: feed.displayType,
			siteUrl: feed.siteUrl,
			description: feed.description,
			icon: feed.icon,
			lastUpdated: feed.lastUpdated,
			backgroundColor: feed.backgroundColor ?? '',
			color: feed.color ?? ''
		});
	}

	static async updateFeed(feedId: string, items: FeedItem[]) {
		const database = await this.#getConnection();

		const feed = await database.get('feeds', IDBKeyRange.only(feedId));

		if (!feed) {
			throw new Error(`Feed with id ${feedId} does not exist`);
		}

		await Database.saveFeedItems(feedId, items);

		return database.put('feeds', {
			...feed,
			lastUpdated: new Date()
		});
	}

	static async markFeedItemRead(itemId: string) {
		const database = await this.#getConnection();

		const item = await database.get('feedItems', IDBKeyRange.only(itemId));

		if (!item) {
			throw new Error(`Item with id ${itemId} does not exist`);
		}

		return database.put('feedItems', {
			...item,
			read: true
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
			read: false
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
