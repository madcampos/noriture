import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';


import style from './style.css?inline' assert { type: 'css' };

@customElement('n-item-card')
export class ItemCard extends LitElement {
	static override readonly styles = unsafeCSS(style);

	@property({ type: String, reflect: true }) feedId = '';
	@property({ type: String, reflect: true }) itemId = '';
	@property({ type: String, reflect: true }) override title = '';
	@property({ type: String, reflect: true }) link = '';
	@property({ type: String, reflect: true }) author = '';
	@property({ type: String, reflect: true }) date = '';
	@property({ type: Array }) tags: string[] = [];

	override render() {
		return html`
			<article>
				<picture>
					<router-link to="${this.feedId && this.itemId ? `/feed/${this.feedId}/item/${this.itemId}` : nothing}">
						<slot name="icon">
							<iconify-icon icon="fluent:star-48-regular" inline></iconify-icon>
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
				<div id="content">
					<slot>
						<p>This item has no content.</p>
					</slot>
				</div>
				<aside id="tags">
					${this.tags.map((tag) => html`<small>${tag}</small>`)}
				</aside>
				<footer>
					<router-link to="${this.link}">
						<iconify-icon icon="fluent:link-20-regular" inline></iconify-icon>
						Read item
					</router-link>
					<!-- TODO: add buttons for share, mark as read, bookmark and "options" (?) -->
				</footer>
			</article>
		`;
	}
}
