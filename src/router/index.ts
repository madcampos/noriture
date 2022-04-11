import { createRouter, createWebHistory } from 'vue-router';
import { i18n, loadLocaleMessages, useLocale } from '../components/i18n';
import HomeView from '../views/HomeView.vue';

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: '/',
			name: 'home',
			component: HomeView
		},
		{
			path: '/about',
			name: 'about',
			// Route level code-splitting
			// This generates a separate chunk (About.[hash].js) for this route
			// Which is lazy-loaded when the route is visited.
			component: async () => import('../views/AboutView.vue')
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
