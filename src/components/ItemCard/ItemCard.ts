import templateString from './ItemCard.html?raw';

export class ItemCard extends HTMLElement {
	static get observedAttributes() { return ['title', 'image', 'link', 'author', 'date', 'tags']; }

	#root: ShadowRoot;

	constructor() {
		super();

		const template = document.createElement('template');

		template.innerHTML = templateString;

		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(template.content.cloneNode(true));
	}
}

customElements.define('item-card', ItemCard);
