import { isRef, ref, type Ref } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
export const DEFAULT_REFRESH_RATE = 60 * 60;

export function useDefaultRefreshRate(refreshRate?: Ref<number> | number) {
	if (isRef(refreshRate)) {
		return refreshRate;
	}

	return ref(refreshRate ?? DEFAULT_REFRESH_RATE);
}
