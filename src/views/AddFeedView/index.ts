import type { Feed } from '../../packages/Feed/Feed';
import type { RouterView } from '../../router/router';

import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';

import { Database } from '../../db';
import { fetchFeed } from '../../packages/Feed/Feed';

@customElement('n-add-feed-view')
export class AddFeedView extends LitElement implements RouterView {
	@state()
	private isLoadingFeed = false;
	@state()
	private newFeed: Feed | null = null;
	@state()
	private feedUrl = '';
	@state()
	private error = '';
	@state()
	private hasFeed = false;

	navigate() {
		this.hasFeed = false;
		this.error = '';
		this.feedUrl = '';
		this.newFeed = null;

		return 'Add Feed';
	}

	override createRenderRoot() {
		return this;
	}

	async #loadFeed(evt: SubmitEvent) {
		evt.preventDefault();

		if (!this.feedUrl || this.isLoadingFeed) {
			return;
		}

		try {
			this.isLoadingFeed = true;

			const url = new URL(this.feedUrl);

			this.newFeed = await fetchFeed(url.href);

			this.hasFeed = await Database.hasFeed(this.feedUrl);
		} catch (err) {
			this.error = err.message;
			console.error(err);
		} finally {
			this.isLoadingFeed = false;
		}
	}

	async #addFeed(evt: MouseEvent) {
		const target = evt.currentTarget as HTMLButtonElement;

		if (target.hasAttribute('aria-disabled')) {
			return;
		}

		if (!this.newFeed) {
			return;
		}

		try {
			this.isLoadingFeed = true;

			await Database.saveFeed(this.newFeed);

			this.hasFeed = true;
		} catch (err) {
			this.error = err.message;
			console.error(err);
		} finally {
			this.isLoadingFeed = false;
		}
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

						<button ?aria-disabled="${!this.feedUrl && !this.isLoadingFeed}">
							<iconify-icon icon="fluent:search-24-regular" title="Search Feed"></iconify-icon>
						</button>
					</form>
				</section>

				<progress ?hidden="${!this.isLoadingFeed}">Loading feed...</progress>

				${when(this.error, () => html`<n-error-message>${this.error}</n-error-message>`)}

				<n-feed-card
					?hidden="${this.newFeed === null}"
					last-updated="${this.newFeed?.lastUpdated.toLocaleString() ?? nothing}"
					total-count="${this.newFeed?.items.length ?? nothing}"
					unread-count="${this.newFeed?.unreadCount ?? nothing}"
				>
					${
			when(this.newFeed?.icon, () =>
				html`
						<img
							?hidden="${!this.newFeed?.icon}"
							src="${this.newFeed?.icon ?? ''}"
							alt="${this.newFeed?.name ?? ''}"
							slot="icon"
						>
					`)
		}
					${when(this.newFeed?.name, () => html`<span slot="title">${this.newFeed?.name ?? ''}</span>`)}

					<button
						type="button"
						slot="aside"
						?aria-disabled="${this.isLoadingFeed || this.hasFeed}"
						@click="${this.#addFeed}"
					>
						<iconify-icon icon="fluent:star-add-24-regular" title="Add Feed"></iconify-icon>
					</button>

					${when(this.newFeed?.description, () => unsafeHTML(this.newFeed?.description ?? ''))}
				</n-feed-card>
			</n-main-layout>
		`;
	}
}
