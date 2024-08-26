import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import style from './style.css?inline' assert { type: 'css' };

@customElement('n-item-card')
export class ItemCard extends LitElement {
	static override readonly styles = unsafeCSS(style);

	@property({ type: String, reflect: true })
	feedId = '';
	@property({ type: String, reflect: true })
	itemId = '';
	@property({ type: String, reflect: true })
	override title = '';
	@property({ type: String, reflect: true })
	author = '';
	@property({ type: String, reflect: true })
	date = '';
	@property({ type: Array })
	tags: string[] = [];

	#interceptLinkClick(evt: MouseEvent) {
		const target = evt.target as HTMLElement;

		if (target.matches('a')) {
			evt.preventDefault();

			window.open((target as HTMLAnchorElement).href, '_blank');
		}
	}

	override render() {
		return html`
			<article>
				<picture>
					<router-link to="${this.feedId && this.itemId ? `/feed/${this.feedId}/item/${this.itemId}` : nothing}">
						<slot name="icon">
							<iconify-icon
								icon="fluent:star-48-regular"
								inline
								width="3rem"
							></iconify-icon>
						</slot>
					</router-link>
				</picture>
				<header>
					<h2>
						<router-link to="${this.feedId && this.itemId ? `/feed/${this.feedId}/item/${this.itemId}` : nothing}">
							${this.title}
						</router-link>
					</h2>
					<aside>
						<span>
							<small>${this.author}</small>
							<small id="author-date-separator">●</small>
							<small>${this.date}</small>
						</span>
					</aside>
				</header>
				<div id="content" @click="${this.#interceptLinkClick}">
					<slot>
						<p>This item has no content.</p>
					</slot>
				</div>
				<footer>
					<aside id="tags">
						${this.tags.map((tag) => html`<small>${tag}</small>`)}
					</aside>
					<router-link to="${this.feedId && this.itemId ? `/feed/${this.feedId}/item/${this.itemId}` : nothing}">
						<iconify-icon icon="fluent:link-20-regular" inline></iconify-icon>
						Read item
					</router-link>
					<!-- TODO: add buttons for share, mark as read, bookmark and "options" (?) -->
				</footer>
			</article>
		`;
	}
}
