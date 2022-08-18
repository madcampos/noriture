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

export const feedRefreshRate = new Proxy<Record<string, number>>({}, {
	get(_target, feedId) {
		if (typeof feedId !== 'string') {
			throw new TypeError('property must be a string');
		}

		const refreshRateFromStorage = localStorage.getItem(`refresh-rate-${feedId}`);

		return Number.parseInt(refreshRateFromStorage ?? DEFAULT_REFRESH_RATE.toString());
	},
	set(_target, feedId, refreshRate) {
		if (typeof feedId !== 'string') {
			throw new TypeError('property must be a string');
		}

		if (typeof refreshRate !== 'number') {
			throw new TypeError('value must be a number');
		}

		if (refreshRate < 0) {
			throw new TypeError('value must be a positive number');
		}

		if (!DEFAULT_REFRESH_RATE_LIST.includes(refreshRate)) {
			throw new TypeError('value must be one of the default values');
		}

		localStorage.setItem(`refresh-rate-${feedId}`, refreshRate.toString());

		return true;
	}
});

export const feedItemUpdateCount = new Proxy<Record<string, number>>({}, {
	get(_target, feedId) {
		if (typeof feedId !== 'string') {
			throw new TypeError('property must be a string');
		}

		const updateCountFromStorage = localStorage.getItem(`update-count-${feedId}`);

		return Number.parseInt(updateCountFromStorage ?? DEFAULT_ITEM_UPDATE_COUNT.toString());
	},
	set(_target, feedId, updateCount) {
		if (typeof feedId !== 'string') {
			throw new TypeError('property must be a string');
		}

		if (typeof updateCount !== 'number') {
			throw new TypeError('value must be a number');
		}

		if (updateCount < 0) {
			throw new TypeError('value must be a positive number');
		}
		if (!DEFAULT_ITEM_UPDATE_COUNT_LIST.includes(updateCount)) {
			throw new TypeError('value must be one of the default values');
		}

		localStorage.setItem(`update-count-${feedId}`, updateCount.toString());

		return true;
	}
});
