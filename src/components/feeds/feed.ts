import { type Ref, ref, type UnwrapNestedRefs } from 'vue';
import type { FeedItem } from './feedItem';
import { useRefreshRate } from './refreshRate';

type FeedType = 'rss' | 'atom' | 'youtube';

type FeedDisplayType = 'list' | 'thumbs' | 'podcast' | 'video' | 'comics';

export interface Feed {
	/** The feed's unique identifier. */
	id: ReturnType<typeof crypto.randomUUID>,
	/** The feed's title that will be displayed to the user. */
	name: Ref<string>,
	/** The feed's description that will be displayed to the user. */
	description: Ref<string>,
	/** The feed's URL that will be displayed to the user. */
	siteUrl: Ref<string>,
	/** The feed's URL. */
	feedUrl: Ref<string>,
	/** The feed's icon that will be displayed to the user. */
	icon: Ref<string>,
	/** The feed's color that will be displayed to the user. */
	color: Ref<string>,
	/** The feed's background color that will be displayed to the user. */
	backgroundColor: Ref<string>,
	/** The feed's categories that will be displayed to the user. */
	categories: Ref<string[]>,
	/** The feed's type. */
	type: Ref<FeedType>,
	/** The feed's display type. */
	displayType: Ref<FeedDisplayType>,
	/** The feeds's refresh interval in seconds. */
	refreshRate: Ref<number>,
	/** The feeds's last updated date. */
	lastUpdated: Ref<Date>,
	/** The number of unread items. */
	unreadCount: Ref<number>,
	/** The list of ids for the unread items. */
	unreadItemIds: Ref<ReturnType<typeof crypto.randomUUID>[]>,
	/** The list of items in the feed. */
	items: Ref<FeedItem[]>
}

type FeedConstructor = Partial<UnwrapNestedRefs<Feed>>;

function createFeed(feed: FeedConstructor = {}) {
	const feedId = feed.id ?? crypto.randomUUID();
	const name = ref(feed.name ?? '');
	const description = ref(feed.description ?? '');
	const siteUrl = ref(feed.siteUrl ?? '');
	const icon = ref(feed.icon ?? '');
	const color = ref(feed.color ?? '');
	const backgroundColor = ref(feed.backgroundColor ?? '');
	const categories = ref(feed.categories ?? []);
	const type = ref(feed.type ?? 'rss');
	const displayType = ref(feed.displayType ?? 'list');
	const refreshRate = ref(feed.refreshRate ?? useRefreshRate(undefined, feedId));
	const lastUpdated = ref(new Date());
	const unreadCount = ref(0);
	const unreadItemIds = ref<ReturnType<typeof crypto.randomUUID>[]>([]);
	const items = ref<FeedItem[]>([]);

	return {
		id: feedId,
		name,
		description,
		siteUrl,
		feedUrl: feed.feedUrl,
		icon,
		color,
		backgroundColor,
		categories,
		type,
		displayType,
		refreshRate,
		lastUpdated,
		unreadCount,
		unreadItemIds,
		items
	};
}

export function useFeed(feedConstructor: FeedConstructor = {}) {
	// TODO: check if the feed is already in DB.

	const feed = createFeed(feedConstructor);

	// TODO: append to list of feeds/save to db.

	return feed;
}
