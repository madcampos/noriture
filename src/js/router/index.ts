import { Router } from './router';

Router.init({
	baseUrl: import.meta.env.BASE_URL,
	beforeEach: () => {
		// TODO: load locale messages
	},
	routes: [
		{
			path: '/',
			handler: (origin, destination) => {
				console.log('Home');
				console.log(origin, destination);
			}
		},
		{
			path: '/feeds',
			handler: (origin, destination) => {
				console.log('Feeds');
				console.log(origin, destination);
			}
		},
		{
			path: '/feed/:id',
			handler: (origin, destination) => {
				console.log('Feed');
				console.log(origin, destination);
			}
		},
		{
			path: '/feed/:id/:itemId',
			handler: (origin, destination) => {
				console.log('Feed Item');
				console.log(origin, destination);
			}
		}
	]
});

document.querySelector('button')?.addEventListener('click', async () => {
	await Router.navigate('/feeds');
});
