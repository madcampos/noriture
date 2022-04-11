import type { Ref } from 'vue';

export interface FeedItem {
	/** The item's unique identifier. */
	id: ReturnType<typeof crypto.randomUUID>,
	/** The item's title that will be displayed to the user. */
	title: Ref<string>,
	/** The item's author. */
	author: Ref<string>,
	/** The item's date */
	date: Ref<Date>,
	/** The item's image */
	image: Ref<string>,
	/** The item's content. */
	content: Ref<string>,
	/** The item's URL. */
	url: Ref<string>,
	/** The item's read status. */
	read: Ref<boolean>,
	/** The item's feed id. */
	feedId: ReturnType<typeof crypto.randomUUID>
}
