import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('n-nav-bar')
export class NavBar extends LitElement {
	@property({ type: String }) feedId = '';

	render() {
		return html`<nav>
			<ul>
				<slot name="back-button">
					<li>
						<router-link href="/">Home</router-link>
					</li>
				</slot>
				<li>
					<router-link href="/add-feed">Add Feed</router-link>
				</li>

				${this.feedId ? html`
					<li>
						<router-link href="/feed/${this.feedId}/configure">Configure</router-link>
					</li>
				` : ''}
			</ul>
		</nav>`;
	}
}
