import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import style from './style.css?inline' with { type: 'css' };

@customElement('n-feed-card')
export class FeedCard extends LitElement {
	static override readonly styles = unsafeCSS(style);

	@property({ type: String, reflect: true, attribute: 'feed-id' })
	feedId?: string;
	@property({ type: Number, reflect: true, attribute: 'unread-count' })
	unreadCount = 0;
	@property({ type: Number, reflect: true, attribute: 'total-count' })
	totalCount = 0;
	@property({ type: String, reflect: true, attribute: 'last-updated' })
	lastUpdated = 'Never Updated';

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
					<slot name="feed-action"></slot>
				</header>

				<aside>
					<span>
						<small>${this.lastUpdated}</small>
						<small>(${this.unreadCount} / ${this.totalCount})</small>
					</span>
				</aside>
				<card-content>
					<slot>
						<p>This feed has no description.</p>
					</slot>
				</card-content>
				<footer>
					<router-link to="${this.feedId ? `/feed/${this.feedId}` : nothing}">View Feed</router-link>
				</footer>
			</article>
		`;
	}
}
