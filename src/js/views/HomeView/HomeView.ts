import type { Feed } from '../../packages/Feed/Feed';
import type { RouterView } from '../../router/router';

import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { Database } from '../../db';

declare global {
	interface GlobalEventHandlersEventMap {
		itemloaded: CustomEvent<{
			index: number,
			total: number,
			name: string
		}>,
		apploaded: CustomEvent<undefined>
	}
}

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

	navigate() {
		this.hidden = false;
	}

	render() {
		return html`
			<h1>Home</h1>

			${this.feeds.map((feed) => html`
				<feed-card feed-id="/feed/${feed.id}" unread-count="${feed.unreadCount}">
					<span slot="title">${feed.name}</span>
					<span slot="image">${feed.icon}</span>
					<span slot="description">${feed.description}</span>
					<span slot="last-updated">${feed.lastUpdated}</span>
				</feed-card>
			`)}
		`;
	}

	async connectedCallback() {
		super.connectedCallback();
		this.requestUpdate();

		this.feeds = await Database.listFeeds();
		this.dispatchEvent(new CustomEvent('apploaded', { bubbles: true, composed: true }));
	}
}
