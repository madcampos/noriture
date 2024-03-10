import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Router } from './router';

@customElement('router-link')
export class RouterLink extends LitElement {
	// eslint-disable-next-line id-length
	@property({ type: String, reflect: true }) to?: string;

	#click(evt: MouseEvent) {
		evt.preventDefault();
		evt.stopPropagation();

		const target = evt.currentTarget as HTMLAnchorElement;

		if (!target.matches('a')) {
			return;
		}

		const path = target.href;

		if (path) {
			void Router.navigate(path);
		} else {
			console.warn('[⛵️] RouterLink is missing "to" attribute');
		}
	}

	override render() {
		return html`
			<a href="${this.to ?? nothing}" @click=${(evt: MouseEvent) => this.#click(evt)}>
				<slot></slot>
			</a>
		`;
	}
}
