import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { RouterView } from '../../js/router/router';

// TODO: move to dialog element
// TODO: use general settings instead

@customElement('n-configure-feed-view')
export class ConfigureFeedView extends LitElement implements RouterView {
	navigate() {
		return 'Configure Feed';
	}

	override render() {
		return html`<h1>Configure feed</h1>`;
	}
}
