import { registerSW } from 'virtual:pwa-register';

// eslint-disable-next-line @typescript-eslint/no-magic-numbers
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const updateSW = registerSW({
	onNeedRefresh: () => {
		// TODO: show refresh popup
		// TODO: call updateSW();
	},
	onOfflineReady: () => {
		// TODO: show offline ready message
	},
	onRegistered: (workerRegistration) => {
		if (workerRegistration?.active) {
			setInterval(() => {
				void workerRegistration.update();
			}, ONE_HOUR_IN_MS);
		}
	}
});
