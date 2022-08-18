import type { Feed } from '../packages/Feed/Feed';
import type { FeedItem } from '../packages/Feed/FeedItem';


export type SavedFeed = Omit<Feed, 'items' | 'unreadCount' | 'unreadItemIds' | 'lastUpdated'> & {
	lastUpdated: string
};

export type SavedFeedItem = Omit<FeedItem, 'date' | 'read'> & {
	date?: string,
	read: 0 | 1
};

export function asSavedFeed(feed: Feed): SavedFeed {
	return {
		feedUrl: feed.feedUrl,
		id: feed.id,
		name: feed.name,
		categories: [...feed.categories],
		type: feed.type,
		displayType: feed.displayType,
		siteUrl: feed.siteUrl,
		description: feed.description,
		icon: feed.icon,
		lastUpdated: typeof feed.lastUpdated === 'string' ? feed.lastUpdated : feed.lastUpdated.toISOString(),
		backgroundColor: feed.backgroundColor,
		color: feed.color
	};
}

export function asFeed(feed: SavedFeed, items: FeedItem[]): Feed {
	const unreadItems = items.filter((item) => !item.read);

	return {
		...feed,
		lastUpdated: new Date(feed.lastUpdated),
		items,
		unreadCount: unreadItems.length,
		unreadItemIds: unreadItems.map((item) => item.id)
	};
}

export function asSavedFeedItem(item: FeedItem, feedId: string): SavedFeedItem {
	return {
		...item,
		feedId,
		date: item.date ? item.date.toISOString() : undefined,
		read: item.read ? 1 : 0
	};
}

export function asFeedItem(item: SavedFeedItem): FeedItem {
	return {
		...item,
		date: item.date ? new Date(item.date) : undefined,
		read: item.read === 1
	};
}
