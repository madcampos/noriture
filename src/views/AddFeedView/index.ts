import type { Feed } from '../../packages/Feed/Feed';
import type { RouterView } from '../../router/router';

import { html, LitElement } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { sanitize } from '../../js/plugins/sanitization';
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

	render() {
		return html`
			<header>
				<h1>Add feed</h1>
				<section>
					<input type="url" placeholder="Feed URL" @input="${(evt: InputEvent) => {
				const target = evt.target as HTMLInputElement;

				this.feedUrl = target.value;
			}}"/>

					<button type="button" ?disabled="${!this.feedUrl && !this.isLoadingFeed}" @click="${async () => {
				try {
					this.isLoadingFeed = true;

					const url = new URL(this.feedUrl);
					this.newFeed = await fetchFeed(url.href);
				} catch (err) {
					console.error(err);
				} finally {
					this.isLoadingFeed = false;
				}

			}}">🔎</button>
				</section>
			</header>

			<article ?hidden="${this.newFeed === null}">
				<header>
					<picture>
						<img
							?hidden="${!this.newFeed?.icon}"
							src="${this.newFeed?.icon ?? ''}"
							alt="${this.newFeed?.name ?? ''}"
						>
					</picture>
					<h1>${this.newFeed?.name ?? ''}</h1>
					<button type="button" @click="${() => {
				// TODO: add feed to the database
				console.log('Add feed');
			}}">Add Feed</button>
					<aside>
						<span>${this.newFeed?.lastUpdated?.toLocaleString() ?? 'Never updated'}</span>
					</aside>
				</header>
				<p
					@click="${(evt: MouseEvent) => {
				const target = evt.target as HTMLElement;

				if (target.matches('a')) {
					evt.preventDefault();
				}
			}}"
				>${unsafeHTML(sanitize(this.newFeed?.description ?? 'This feed has no description.'))}</p>
			</article>
		`;
	}
}
