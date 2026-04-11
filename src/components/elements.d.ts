import type { RouterButton, RouterLink } from '../js/router/router-link';

import type { AddFeedView } from '../views/AddFeedView';
import type { ConfigureFeedView } from '../views/ConfigureFeedView';
import type { FeedItemView } from '../views/FeedItemView';
import type { FeedView } from '../views/FeedView';
import type { HomeView } from '../views/HomeView';

import type { ErrorMessage } from './ErrorMessage';
import type { FeedCard } from './FeedCard';
import type { ItemCard } from './ItemCard';
import type { NavBar } from './Menu';

declare global {
	interface HTMLElementTagNameMap {
		// HTML only elements
		'sr-only': HTMLElement;
		'dialog-content': HTMLElement;
		'input-wrapper': HTMLElement;
		'input-error': HTMLElement;

		'router-link': RouterLink;
		'router-button': RouterButton;

		// Views
		'n-add-feed-view': AddFeedView;
		'n-configure-feed-view': ConfigureFeedView;
		'n-feed-item-view': FeedItemView;
		'n-feed-view': FeedView;
		'n-home-view': HomeView;

		// Components
		'n-error-message': ErrorMessage;
		'n-feed-card': FeedCard;
		'n-item-card': ItemCard;
		'n-menu': NavBar;
	}
}
