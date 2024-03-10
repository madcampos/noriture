import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';


import style from './style.css?inline' assert { type: 'css' };

@customElement('n-feed-card')
export class FeedCard extends LitElement {
	static override readonly styles = unsafeCSS(style);

	@property({ type: String, reflect: true, attribute: 'feed-id' }) feedId?: string;
	@property({ type: Number, reflect: true, attribute: 'unread-count' }) unreadCount = 0;
	@property({ type: Number, reflect: true, attribute: 'total-count' }) totalCount = 0;
	@property({ type: String, reflect: true, attribute: 'last-updated' }) lastUpdated = 'Never Updated';

	#interceptLinkClick(evt: MouseEvent) {
		const target = evt.target as HTMLElement;

		if (target.matches('a')) {
			evt.preventDefault();
		}
	}

	override render() {
		return html`
			<article>
				<header>
					<picture>
						<router-link to="${this.feedId ? `/feed/${this.feedId}` : nothing}">
							<slot name="icon">
								<iconify-icon icon="fluent:star-48-regular" inline></iconify-icon>
							</slot>
						</router-link>
					</picture>
					<h2>
						<router-link to="${this.feedId ? `/feed/${this.feedId}` : nothing}">
							<slot name="title">No title</slot>
						</router-link>
					</h2>
				</header>

				<aside>
					<span>
						<small>${this.lastUpdated}</small>
						<small>(${this.unreadCount} / ${this.totalCount})</small>
					</span>
					<slot name="aside"></slot>
				</aside>

				<div id="description" @click="${this.#interceptLinkClick}">
					<slot>
						<p>This feed has no description.</p>
					</slot>
				</div>
			</article>
		`;
	}
}
