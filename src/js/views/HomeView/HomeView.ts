import type { View } from '../../router/router';
import templateString from './HomeView.html?raw';

export class HomeView implements View {
	#root: HTMLElement;

	#feedCardTemplate: HTMLTemplateElement;

	constructor(rootElement: HTMLElement) {
		const template = document.createElement('template');

		template.innerHTML = templateString;

		this.#root = rootElement;
		this.#root.appendChild(template.content.cloneNode(true));

		this.#feedCardTemplate = this.#root.querySelector('#feed-card') as HTMLTemplateElement;

		this.#root.removeChild(this.#feedCardTemplate);
	}

	get template() {
		return templateString;
	}

	get rootElement() {
		return this.#root;
	}

	render() {
		// TODO: render the feed cards
	}
}
