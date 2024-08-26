import { html, LitElement, nothing, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import style from './style.css?inline' assert { type: 'css' };

@customElement('n-main-layout')
export class MainLayout extends LitElement {
	static override readonly styles = unsafeCSS(style);

	@property({ type: String, reflect: true, attribute: 'feed-id' })
	feedId = '';

	override render() {
		return html`
			<n-nav-bar feed-id="${this.feedId ? this.feedId : nothing}"></n-nav-bar>
			<section class="main-section">
				<header>
					<slot name="header"></slot>
				</header>
				<slot></slot>
			</section>
		`;
	}
}
