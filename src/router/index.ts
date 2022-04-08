import { createRouter, createWebHistory } from 'vue-router';
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

export default router;
