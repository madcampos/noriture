import type { Feed } from '../../packages/Feed/Feed';
import type { RouterView } from '../../router/router';

import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';
import { fetchFeed } from '../../packages/Feed/Feed';

@customElement('n-add-feed-view')
export class AddFeedView extends LitElement implements RouterView {
	@state() private isLoadingFeed = false;
	@state() private newFeed: Feed | null = null;
	@state() private feedUrl = '';

	navigate() {
		return 'Add Feed';
	}

	override createRenderRoot() {
		return this;
	}

	async #loadFeed(evt: SubmitEvent) {
		evt.preventDefault();

		try {
			this.isLoadingFeed = true;

			const url = new URL(this.feedUrl);

			this.newFeed = await fetchFeed(url.href);
		} catch (err) {
			console.error(err);
		} finally {
			this.isLoadingFeed = false;
		}
	}

	#addFeed() {
		// TODO: add feed to the database
		console.log('Add feed');
	}

	#updateFeedUrl(evt: InputEvent) {
		const target = evt.target as HTMLInputElement;

		this.feedUrl = target.value;
	}

	override render() {
		return html`
			<n-main-layout>
				<h1 slot="header">Add feed</h1>
				<section slot="header">
					<form @submit="${this.#loadFeed}">
						<input type="url" placeholder="Feed URL" @input="${this.#updateFeedUrl}"/>

						<button ?disabled="${!this.feedUrl && !this.isLoadingFeed}">
							<iconify-icon icon="fluent:search-24-regular" title="Search Feed"></iconify-icon>
						</button>
					</form>
				</section>

				<progress ?hidden="${!this.isLoadingFeed}">Loading feed...</progress>

				<n-feed-card
					?hidden="${this.newFeed === null}"
					last-updated="${this.newFeed?.lastUpdated.toLocaleString() ?? nothing}"
					total-count="${this.newFeed?.items.length ?? nothing}"
					unread-count="${this.newFeed?.unreadCount ?? nothing}"
				>
					${when(this.newFeed?.icon, () => html`
						<img
							?hidden="${!this.newFeed?.icon}"
							src="${this.newFeed?.icon ?? ''}"
							alt="${this.newFeed?.name ?? ''}"
							slot="icon"
						>
					`)}
					${when(this.newFeed?.name, () => html`<span slot="title">${this.newFeed?.name ?? ''}</span>`)}

					<button type="button" @click="${this.#addFeed}" slot="aside">
						<iconify-icon icon="fluent:star-add-24-regular" title="Add Feed"></iconify-icon>
					</button>

					${when(this.newFeed?.description, () => unsafeHTML(this.newFeed?.description ?? ''))}
				</n-feed-card>
			</n-main-layout>
		`;
	}
}
