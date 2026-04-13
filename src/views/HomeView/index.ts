import type { Feed } from '../../js/Feed/Feed';
import type { RouterView } from '../../js/router/router';

import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { map } from 'lit/directives/map.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';
import { Database } from '../../js/database';

// TODO: add better fallback state

@customElement('n-home-view')
export class HomeView extends LitElement implements RouterView {
	@state()
	private feeds: Feed[] = [];

	override createRenderRoot() {
		return this;
	}

	async #loadFeeds() {
		this.requestUpdate();
		this.feeds = await Database.listFeeds();
	}

	navigate() {
		void this.#loadFeeds();

		return 'Home';
	}

	override render() {
		const feedList = map(this.feeds, (feed) =>
			html`
				<n-feed-card
					feed-id="${feed.id}"
					unread-count="${feed.unreadCount}"
					total-count="${feed.items.length}"
					last-updated="${feed.lastUpdated.toString()}"
				>
					${when(feed.name, () => html`<span slot="title">${feed.name}</span>`)}
					${when(feed.icon, () => html`<img slot="icon" src="${feed.icon ?? ''}" alt="${feed.name}" />`)}
					${when(feed.description, () => unsafeHTML(feed.description))}
				</n-feed-card>
			`);

		const fallback = html`<p>No feeds yet, try <router-link to="/add-feed">adding a new feed</router-link>.</p>`;

		return html`
			<h1>Noriture</h1>
			${when(this.feeds.length, () => feedList, () => fallback)}
		`;
	}

	override async connectedCallback() {
		super.connectedCallback();

		await this.#loadFeeds();
	}
}
