import type { View } from '../../router/router';
import templateString from './FeedView.html?raw';

export class FeedView implements View {
	#root: HTMLElement;

	#itemCardTemplate: HTMLTemplateElement;

	constructor(rootElement: HTMLElement) {
		const template = document.createElement('template');

		template.innerHTML = templateString;

		this.#root = rootElement;
		this.#root.appendChild(template.content.cloneNode(true));

		this.#itemCardTemplate = this.#root.querySelector('#item-card') as HTMLTemplateElement;

		this.#root.removeChild(this.#itemCardTemplate);
	}

	get template() {
		return templateString;
	}

	get rootElement() {
		return this.#root;
	}

	render() {
		// TODO: render the item cards
	}
}
