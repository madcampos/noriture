import { AddFeedView } from '../views/AddFeedView/AddFeedView';
import { ConfigureFeedView } from '../views/ConfigureFeedView/ConfigureFeedView';
import { FeedItemView } from '../views/FeedItemView/FeedItemView';
import { FeedView } from '../views/FeedView/FeedView';
import { HomeView } from '../views/HomeView/HomeView';
import { Router } from './router';

Router.init({
	baseUrl: document.location.href,
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
