import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import style from './style.css?inline' assert { type: 'css' };

@customElement('n-main-layout')
export class MainLayout extends LitElement {
	static override readonly styles = unsafeCSS(style);

	override render() {
		return html`
			<n-nav-bar></n-nav-bar>
			<section class="main-section">
				<header>
					<slot name="header"></slot>
				</header>
				<slot></slot>
			</section>
		`;
	}
}
