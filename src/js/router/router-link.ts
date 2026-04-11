import { html, LitElement, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import { Router } from './router';

@customElement('router-link')
export class RouterLink extends LitElement {
	@property({ type: String, reflect: true })
	// oxlint-disable-next-line id-length
	to?: string;

	#click(evt: MouseEvent) {
		if (!(evt.currentTarget instanceof HTMLAnchorElement)) {
			return;
		}

		evt.preventDefault();
		evt.stopPropagation();

		if (this.to) {
			void Router.navigate(this.to);
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

@customElement('router-button')
export class RouterButton extends LitElement {
	@property({ type: String, reflect: true })
	// oxlint-disable-next-line id-length
	to?: string;

	#click(evt: MouseEvent) {
		if (!(evt.currentTarget instanceof HTMLButtonElement)) {
			return;
		}

		if (this.to) {
			void Router.navigate(this.to);
		} else {
			console.warn('[⛵️] RouterLink is missing "to" attribute');
		}
	}

	override render() {
		return html`
			<button type="button" @click=${(evt: MouseEvent) => this.#click(evt)}>
				<slot></slot>
			</button>
		`;
	}
}
