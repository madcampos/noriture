/// <reference types="urlpattern-polyfill" />
import type {} from 'typed-query-selector/strict';

import type { RouterLink } from '../router/router-link';

import type { AddFeedView } from '../views/AddFeedView/';
import type { ConfigureFeedView } from '../views/ConfigureFeedView/';
import type { FeedItemView } from '../views/FeedItemView/';
import type { FeedView } from '../views/FeedView/';
import type { HomeView } from '../views/HomeView/';

import type { MainLayout } from '../components/MainLayout';
import type { NavBar } from '../components/NavBar';

declare global {
	interface HTMLElementTagNameMap {
		'router-link': RouterLink,

		// Views
		'n-home-view': HomeView,
		'n-add-feed-view': AddFeedView,
		'n-feed-view': FeedView,
		'n-configure-feed-view': ConfigureFeedView,
		'n-feed-item-view': FeedItemView,

		// Components
		'n-nav-bar': NavBar,
		'n-main-layout': MainLayout
	}
}
