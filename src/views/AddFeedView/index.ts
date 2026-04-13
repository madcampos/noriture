import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';

import { Database } from '../../js/database.js';
import type { Feed } from '../../js/Feed/Feed.js';
import { fetchFeed } from '../../js/Feed/Feed.js';
import type { RouterView } from '../../js/router/router.js';

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
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
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
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const target = evt.target as HTMLInputElement;

		this.feedUrl = target.value;
	}

	override render() {
		const icon = when(this.newFeed?.icon, () =>
			html`
			<img
				?hidden="${!this.newFeed?.icon}"
				src="${this.newFeed?.icon ?? ''}"
				alt="${this.newFeed?.name ?? ''}"
				slot="icon"
			>
		`);

		const feedCard = html`
			<n-feed-card
				?hidden="${this.newFeed === null}"
				last-updated="${this.newFeed?.lastUpdated.toLocaleString() ?? nothing}"
				total-count="${this.newFeed?.items.length ?? nothing}"
				unread-count="${this.newFeed?.unreadCount ?? nothing}"
			>
				${icon}
				${when(this.newFeed?.name, () => html`<span slot="title">${this.newFeed?.name ?? ''}</span>`)}

				<button
					type="button"
					slot="feed-action"
					?aria-disabled="${this.isLoadingFeed || this.hasFeed}"
					@click="${this.#addFeed}"
				>
					<sr-only>Add feed</sr-only>
					<iconify-icon icon="fluent:star-add-24-regular" aria-hidde="true"></iconify-icon>
				</button>

				${when(this.newFeed?.description, () => unsafeHTML(this.newFeed?.description ?? ''))}
			</n-feed-card>
		`;

		return html`
			<dialog popover id="add-feed-view" closeby="closerequest">
				<form @submit="${this.#loadFeed}">
				<header>
					<h2>Add Feed</h2>
				</header>
				<dialog-content>
					<input-wrapper>
						<input-wrapper>
							<label for="feed-url">Feed URL</label>
							<input
								type="url"
								name="feed-url"
								id="feed-url"
								placeholder="Feed URL"
								@input="${this.#updateFeedUrl}"
							/>
							${when(this.error, () => html`<input-error>${this.error}</input-error>`)}
						</input-wrapper>

						<button
							?aria-disabled="${!this.feedUrl && !this.isLoadingFeed}"
							type="submit"
						>
							<sr-only>Search Feed</sr-only>
							<iconify-icon icon="fluent:search-24-regular" aria-hidden="true"></iconify-icon>
						</button>
					</input-wrapper>

					<progress ?hidden="${!this.isLoadingFeed}">Loading feed...</progress>

					${feedCard}
				</dialog-content>
			</form>
		</dialog>
		`;
	}
}
