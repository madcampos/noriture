import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Router } from './router';

@customElement('router-link')
export class RouterLink extends LitElement {
	@property({ type: String, reflect: true })
	// oxlint-disable-next-line id-length
	to?: string;

	#click(evt: MouseEvent) {
		evt.preventDefault();
		evt.stopPropagation();

		// oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unsafe-type-assertion
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
