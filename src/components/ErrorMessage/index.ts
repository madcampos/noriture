import { html, LitElement, unsafeCSS } from 'lit';
import { customElement } from 'lit/decorators.js';

import style from './style.css?inline' assert { type: 'css' };

@customElement('n-error-message')
export class ErrorMessage extends LitElement {
	static override readonly styles = unsafeCSS(style);

	override render() {
		return html`
			<div id="error-message">
				<iconify-icon icon="fluent:error-circle-48-regular" inline></iconify-icon>
				<slot></slot>
			</div>
		`;
	}
}
