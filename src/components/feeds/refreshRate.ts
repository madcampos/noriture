import { isRef, ref, type Ref, watch } from 'vue';

/* eslint-disable @typescript-eslint/no-magic-numbers, no-inline-comments, line-comment-position */
export const DEFAULT_REFRESH_RATE = 60 * 60;
export const DEFAULT_REFRESH_RATE_LIST = [
	60 * 1, // 1 minute
	60 * 5, // 5 minutes
	60 * 10, // 10 minutes
	60 * 15, // 15 minutes
	60 * 30, // 30 minutes
	60 * 60, // 1 hour
	60 * 60 * 2, // 2 hours
	60 * 60 * 6, // 6 hours
	60 * 60 * 12, // 12 hours
	60 * 60 * 24, // 24 hours
	60 * 60 * 24 * 30, // 1 month
	-1 // Manually
];
export const DEFAULT_ITEM_UPDATE_COUNT = 100;
export const DEFAULT_ITEM_UPDATE_COUNT_LIST = [100, 200, 500, 1000, 2000, 5000, 10000];
/* eslint-enable @typescript-eslint/no-magic-numbers, no-inline-comments, line-comment-position */

export function useRefreshRate(refreshRate?: Ref<number> | number, feedId = 'default') {
	const refreshRateFromStorage = localStorage.getItem(`refresh-rate-${feedId}`);
	const fallbackRefreshRate = Number.parseInt(refreshRateFromStorage ?? DEFAULT_REFRESH_RATE.toString());
	let normalizedRefreshRate = refreshRate ?? fallbackRefreshRate;

	if (!isRef(normalizedRefreshRate)) {
		normalizedRefreshRate = ref(normalizedRefreshRate);
	}

	watch(normalizedRefreshRate, (newValue) => {
		localStorage.setItem(`refresh-rate-${feedId}`, newValue.toString());
	});

	return normalizedRefreshRate;
}

export function useFeedUpdateItemsCount(itemUpdateCount?: Ref<number> | number, feedId = 'default') {
	const itemUpdateCountFromStorage = localStorage.getItem(`item-update-count-${feedId}`);
	const fallbackItemUpdateCount = Number.parseInt(itemUpdateCountFromStorage ?? DEFAULT_ITEM_UPDATE_COUNT.toString());
	let normalizedUpdateCount = itemUpdateCount ?? fallbackItemUpdateCount;

	if (!isRef(normalizedUpdateCount)) {
		normalizedUpdateCount = ref(normalizedUpdateCount);
	}

	watch(normalizedUpdateCount, (newValue) => {
		localStorage.setItem(`update-items-count-${feedId}`, newValue.toString());
	});

	return normalizedUpdateCount;
}
