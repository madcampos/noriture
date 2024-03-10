import type { Feed } from '../../packages/Feed/Feed';
import type { RouterView } from '../../router/router';

import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { Database } from '../../db';

@customElement('n-home-view')
export class HomeView extends LitElement implements RouterView {
	static shadowRootOptions = { ...LitElement.shadowRootOptions, delegatesFocus: true };

	@state() private feeds: Feed[] = [];

	constructor() {
		super();

		this.hidden = false;
	}

	createRenderRoot() {
		return this;
	}

	render() {
		return html`
			<n-main-layout>
				<h1 slot="header">Home</h1>
				${this.feeds.length > 0
					? this.feeds.map((feed) => html`
						<feed-card feed-id="/feed/${feed.id}" unread-count="${feed.unreadCount}">
							<span slot="title">${feed.name}</span>
							<span slot="image">${feed.icon}</span>
							<span slot="description">${feed.description}</span>
							<span slot="last-updated">${feed.lastUpdated}</span>
						</feed-card>
					`)
					: html`<p>No feeds yet, try <router-link to="/add-feed">adding a new feed</router-link>.</p>`}
			</n-main-layout>
		`;
	}

	async connectedCallback() {
		super.connectedCallback();
		this.requestUpdate();

		this.feeds = await Database.listFeeds();
	}
}
