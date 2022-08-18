import templateString from './NavBar.html?raw';

export class NavBar extends HTMLElement {
	#root: ShadowRoot;

	constructor() {
		super();

		const template = document.createElement('template');

		template.innerHTML = templateString;

		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(template.content.cloneNode(true));
	}
}

customElements.define('nav-bar', NavBar);
