import { html, LitElement, unsafeCSS } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import style from './style.css?inline' assert { type: 'css' };

@customElement('n-nav-bar')
export class NavBar extends LitElement {
	static override readonly styles = unsafeCSS(style);

	@property({ type: String, reflect: true, attribute: 'feed-id' })
	feedId = '';

	override render() {
		return html`<nav>
			<ul>
				<slot name="back-button">
					<li>
						<router-link to="/">
							<iconify-icon icon="fluent:rss-24-regular" title="Home"></iconify-icon>
						</router-link>
					</li>
				</slot>
				<li>
					<router-link to="/add-feed">
						<iconify-icon icon="fluent:star-add-24-regular" title="Add Feed"></iconify-icon>
					</router-link>
				</li>
				<li role="separator"><hr role="presentation" /></li>

				${
			this.feedId
				? html`
						<li id="feed-config">
							<router-link to="/feed/${this.feedId}/configure">
								<iconify-icon icon="fluent:settings-24-regular" title="Configure Feed"></iconify-icon>
							</router-link>
						</li>
					`
				: ''
		}
			</ul>
		</nav>`;
	}
}
