import { Router } from './router';

import { AddFeedView } from '../views/AddFeedView';
import { ConfigureFeedView } from '../views/ConfigureFeedView';
import { FeedItemView } from '../views/FeedItemView';
import { FeedView } from '../views/FeedView';
import { HomeView } from '../views/HomeView';

Router.init({
	baseUrl: '/',
	appTitle: 'Noriture',
	routes: [
		{
			path: '/',
			view: HomeView
		},
		{
			path: '/add-feed',
			view: AddFeedView
		},
		{
			path: '/feed/:id',
			view: FeedView
		},
		{
			path: '/feed/:id/configure',
			view: ConfigureFeedView
		},
		{
			path: '/feed/:id/item/:itemId',
			view: FeedItemView
		}
	]
});
