import type { Feed } from '../../packages/Feed/Feed';
import type { RouterView } from '../../router/router';

import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';
import { Database } from '../../db';

@customElement('n-home-view')
export class HomeView extends LitElement implements RouterView {
	@state() private feeds: Feed[] = [];

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
		return html`
			<n-main-layout>
				<h1 slot="header">Home</h1>
				${this.feeds.length > 0
					? this.feeds.map((feed) => html`
						<n-feed-card
							feed-id="${feed.id}"
							unread-count="${feed.unreadCount}"
							total-count="${feed.items.length}"
							last-updated="${feed.lastUpdated?.toLocaleString() ?? nothing}"
						>
							${when(feed.name, () => html`<span slot="title">${feed.name}</span>`)}
							${when(feed.icon, () => html`<img slot="icon" src="${feed.icon ?? ''}" alt="${feed.name ?? ''}" />`)}
							${when(feed.description, () => unsafeHTML(feed.description))}
						</n-feed-card>
					`)
					: html`<p>No feeds yet, try <router-link to="/add-feed">adding a new feed</router-link>.</p>`}
			</n-main-layout>
		`;
	}

	override async connectedCallback() {
		super.connectedCallback();

		await this.#loadFeeds();
	}
}
