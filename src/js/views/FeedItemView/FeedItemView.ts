import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { RouterView } from '../../router/router';

@customElement('n-feed-item-view')
export class FeedItemView extends LitElement implements RouterView {
	navigate() {
		return 'Feed Item';
	}

	render() {
		// TODO: Add the actual data binding
		return html`<header>
			<router-link to="/">Back</router-link>
			<h1>{{ title }}</h1>
			<aside>
				<span>{{author}}</span>
				<span id="author-date-separator">●</span>
				<span>{{date}}</span>
			</aside>
		</header>
		<article></article>`;
	}
}
