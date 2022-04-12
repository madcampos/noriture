import { shallowRef, watch } from 'vue';
import type { Feed } from './feed';

const feedList = shallowRef<Record<string, Feed | undefined>>({});

export function useFeedList() {
	if (Object.keys(feedList.value).length === 0) {
		// TODO: load feeds from IDB
	}

	watch(feedList, (feeds) => {
		// TODO: save feeds IDB
	});

	return feedList;
}