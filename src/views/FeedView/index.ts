import type { Feed } from '../../js/Feed/Feed.ts';
import type { RouteLocation, RouterView } from '../../js/router/router.ts';

import { html, LitElement, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { when } from 'lit/directives/when.js';
import { Database } from '../../js/database.ts';

// TODO: add better structure

@customElement('n-feed-view')
export class FeedView extends LitElement implements RouterView {
	@state()
	private feed?: Feed;

	async #loadFeed(feedId: string) {
		this.feed = await Database.getFeed(feedId);
	}

	#interceptLinkClick(evt: MouseEvent) {
		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
		const target = evt.target as HTMLElement;

		if (target.matches('a')) {
			evt.preventDefault();

			window.open(target.href, '_blank');
		}
	}

	navigate({ params: { id: feedId } }: RouteLocation<'/feed/:id'>) {
		void this.#loadFeed(feedId);

		return 'Feed';
	}

	override render() {
		return html`
			<n-main-layout feed-id="${this.feed?.id ?? nothing}">
				<div slot="header">
					<picture>
						${
			when(
				this.feed?.icon,
				() => html`<img src="${this.feed?.icon ?? ''}" alt="${this.feed?.title ?? ''}" />`,
				() => html`<iconify-icon icon="fluent:star-48-regular" inline></iconify-icon>`
			)
		}
					</picture>
					<h1>${this.feed?.title ?? 'No title'}</h1>
					<aside>
						<span>
							<small>${this.feed?.updatedAt.toLocaleString() ?? 'Never'}</small>
							<small>(${this.feed?.unreadCount ?? 0} / ${this.feed?.items.length ?? 0})</small>
						</span>
					</aside>
				</div>
				<div id="description" @click="${this.#interceptLinkClick}">
					${
			when(
				this.feed?.description,
				() => unsafeHTML(this.feed?.description ?? ''),
				() => html`<p>This feed has no description.</p>`
			)
		}
				</div>
				<ul>
					${
			this.feed?.items.map((item) =>
				html`
						<li>
							<n-item-card
								feed-id="${this.feed?.id ?? ''}"
								item-id="${item.id}"
								title="${item.title ?? 'No title'}"
								author="${item.author ?? ''}"
								date="${item.date?.toLocaleString() ?? ''}"
							>
								${
					when(
						item.image,
						() => html`<img src="${item.image ?? ''}" alt="${item.title ?? 'No title'}" />`
					)
				}
								${unsafeHTML(item.content)}
							</n-item-card>
						</li>
					`
			)
		}
				</ul>
			</n-main-layout>
		`;
	}
}
