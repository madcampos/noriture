import type { View } from '../../router/router';
import templateString from './ConfigureFeedView.html?raw';

export class ConfigureFeedView implements View {
	#root: HTMLElement;

	constructor(rootElement: HTMLElement) {
		const template = document.createElement('template');

		template.innerHTML = templateString;

		this.#root = rootElement;
		this.#root.appendChild(template.content.cloneNode(true));
	}

	get template() {
		return templateString;
	}

	get rootElement() {
		return this.#root;
	}

	render() {
		// TODO: render the content
	}
}
