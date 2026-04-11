import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import style from './style.css?inline' with { type: 'css' };

@customElement('n-menu')
export class NavBar extends LitElement {
	static override readonly styles = unsafeCSS(style);

	@property({ type: String, reflect: true, attribute: 'feed-id' })
	feedId = '';

	override render() {
		return html`
		<nav>
			<ul>
				<li>
					<router-link to="/">
						<sr-only>Home</sr-only>
						<iconify-icon icon="fluent:home-24-regular" aria-hidden="true"></iconify-icon>
					</router-link>
				</li>
				<li>
					<button type="button">
						<sr-only>Add Feed</sr-only>
						<iconify-icon icon="fluent:star-add-24-regular" aria-hidden="true"></iconify-icon>
					</button>
				</li>
				<li role="separator"><hr role="presentation" /></li>
				<li id="feed-config">
					<button type="button">
						<sr-only>Settings</sr-only>
						<iconify-icon icon="fluent:settings-24-regular" aria-hidden="true"></iconify-icon>
					</button>
				</li>
			</ul>
			<button type="button" popovertarget="mobile-menu" popoveraction="open">
				<sr-only>Menu</sr-only>
				<iconify-icon icon="fluent:navigation-24-regular" aria-hidden="true"></iconify-icon>
			</button>

			<dialog popover id="mobile-menu">
				<!-- TODO: mobile menu -->
			</dialog>

			<n-add-feed-view></n-add-feed-view>
			<n-settings-view></n-settings-view>
		</nav>
		`;
	}
}
