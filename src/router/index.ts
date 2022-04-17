import { createRouter, createWebHistory } from 'vue-router';
import { i18n, loadLocaleMessages, useLocale } from '../components/i18n';
import HomeView from '../views/HomeView.vue';
import FeedView from '../views/FeedView.vue';
import ItemView from '../views/ItemView.vue';
import AddFeed from '../views/AddFeed.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView
		},
		{
			path: '/add',
			name: 'add',
			component: AddFeed
		},
		{
			path: '/feed/:feedId',
			name: 'feed',
			component: FeedView,
			props: true
		},
		{
			path: '/feed/:feedId/:itemId',
			name: 'item',
			component: ItemView,
			props: true
		}
	]
});

router.beforeEach(async (_origin, _destination, next) => {
	// TODO: review if this is the best option?
	const locale = useLocale();

	// Load locale messages
	if (i18n.global.availableLocales.includes(locale.value)) {
		await loadLocaleMessages(locale.value);
	}

	next();
});

export default router;
