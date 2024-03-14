/// <reference types="urlpattern-polyfill" />
import type {} from 'typed-query-selector/strict';

import type { RouterLink } from '../router/router-link';

import type { AddFeedView } from '../views/AddFeedView/';
import type { ConfigureFeedView } from '../views/ConfigureFeedView/';
import type { FeedItemView } from '../views/FeedItemView/';
import type { FeedView } from '../views/FeedView/';
import type { HomeView } from '../views/HomeView/';

import type { ErrorMessage } from '../components/ErrorMessage/index.ts';
import type { FeedCard } from '../components/FeedCard';
import type { MainLayout } from '../components/MainLayout';
import type { NavBar } from '../components/NavBar';

declare global {
	interface HTMLElementTagNameMap {
		'router-link': RouterLink,

		// Views
		'n-add-feed-view': AddFeedView,
		'n-configure-feed-view': ConfigureFeedView,
		'n-feed-item-view': FeedItemView,
		'n-feed-view': FeedView,
		'n-home-view': HomeView,

		// Components
		'n-error-message': ErrorMessage,
		'n-feed-card': FeedCard,
		'n-main-layout': MainLayout,
		'n-nav-bar': NavBar
	}
}
