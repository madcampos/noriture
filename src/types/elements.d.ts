/// <reference types="urlpattern-polyfill" />
import type {} from 'typed-query-selector/strict';

import type { RouterLink } from '../router/router-link';

declare global {
	interface HTMLElementTagNameMap {
		'router-link': RouterLink,
	}
}
