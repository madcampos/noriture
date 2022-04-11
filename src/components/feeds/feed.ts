import { type Ref, ref, unref, type UnwrapNestedRefs } from 'vue';
import { useFeedList } from './feedList';
import { useDefaultRefreshRate } from './refreshRate';

type FeedType = 'rss' | 'atom' | 'youtube';

type FeedDisplayType = 'list' | 'thumbs' | 'podcast' | 'video';

export interface Feed {
	/** The feed's unique identifier. */
	id: ReturnType<typeof crypto.randomUUID>,
	/** The feed's title that will be displayed to the user. */
	name: Ref<string>,
	/** The feed's description that will be displayed to the user. */
	description: Ref<string>,
	/** The feed's URL that will be displayed to the user. */
	url: Ref<string>,
	/** The feed's icon that will be displayed to the user. */
	icon: Ref<string>,
	/** The feed's color that will be displayed to the user. */
	color: Ref<string>,
	/** The feed's background color that will be displayed to the user. */
	backgroundColor: Ref<string>,
	/** The feed's category that will be displayed to the user. */
	category: Ref<string>,
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
	unreadItemIds: Ref<ReturnType<typeof crypto.randomUUID>[]>
}

type FeedConstructor = Partial<UnwrapNestedRefs<Feed>>;

function createFeed(feed: FeedConstructor = {}) {
	const name = ref(feed.name ?? '');
	const description = ref(feed.description ?? '');
	const url = ref(feed.url ?? '');
	const icon = ref(feed.icon ?? '');
	const color = ref(feed.color ?? '');
	const backgroundColor = ref(feed.backgroundColor ?? '');
	const category = ref(feed.category ?? '');
	const type = ref(feed.type ?? 'rss');
	const displayType = ref(feed.displayType ?? 'list');
	const refreshRate = ref(feed.refreshRate ?? useDefaultRefreshRate());
	const lastUpdated = ref(new Date());
	const unreadCount = ref(0);
	const unreadItemIds = ref<ReturnType<typeof crypto.randomUUID>[]>([]);

	return {
		id: crypto.randomUUID(),
		name,
		description,
		url,
		icon,
		color,
		backgroundColor,
		category,
		type,
		displayType,
		refreshRate,
		lastUpdated,
		unreadCount,
		unreadItemIds
	};
}

export function useFeed(id?: Feed['id'] | Ref<Feed['id']>) {
	const unwrapedId = unref(id ?? '');
	const feedsList = useFeedList();
	let feed = feedsList.value[unwrapedId];

	if (!feed) {
		feed = createFeed();
	}

	return feed;
}
