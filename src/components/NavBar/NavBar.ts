import { html } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('n-nav-bar')
export class NavBar extends HTMLElement {
	render() {
		return html`<nav>
			<ul>
				<li>
					<router-link href="/">Home</router-link>
				</li>
			</ul>
		</nav>`;
	}
}
