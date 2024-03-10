import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { RouterView } from '../../router/router';

@customElement('n-configure-feed-view')
export class ConfigureFeedView extends LitElement implements RouterView {
	navigate() {
		return 'Configure Feed';
	}

	override render() {
		return html`<h1>Configure feed</h1>`;
	}
}
