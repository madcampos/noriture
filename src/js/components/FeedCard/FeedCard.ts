import templateString from './FeedCard.html?raw';

export class FeedCard extends HTMLElement {
	static get observedAttributes() { return ['feedId']; }

	#root: ShadowRoot;

	constructor() {
		super();

		const template = document.createElement('template');

		template.innerHTML = templateString;

		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(template.content.cloneNode(true));
	}
}

customElements.define('feed-card', FeedCard);
