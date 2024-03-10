/// <reference types="urlpattern-polyfill" />
import type {} from 'typed-query-selector/strict';

import type { NavBar } from '../components/NavBar';
import type { RouterLink } from '../router/router-link';

declare global {
	interface HTMLElementTagNameMap {
		'router-link': RouterLink,
		'n-nav-bar': NavBar,
	}
}
