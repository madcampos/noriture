import templateString from './FeedCard.html?raw';

export class FeedCard extends HTMLElement {
	static get observedAttributes() { return ['feed-id', 'unread-count']; }

	#root: ShadowRoot;
	#unreadCount: HTMLSpanElement;

	constructor() {
		super();

		const template = document.createElement('template');

		template.innerHTML = templateString;

		this.#root = this.attachShadow({ mode: 'closed' });
		this.#root.appendChild(template.content.cloneNode(true));

		this.#unreadCount = this.#root.querySelector('[slot=unread-count]') as HTMLSpanElement;
	}

	get feedId() {
		return this.getAttribute('feed-id') ?? '';
	}

	set feedId(value: string) {
		this.setAttribute('feed-id', value);
	}

	get unreadCount() {
		return Number.parseInt(this.getAttribute('unread-count') ?? '0');
	}

	set unreadCount(value: number) {
		this.setAttribute('unread-count', value.toString());
	}

	attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if (oldValue !== newValue) {
			if (name === 'feed-id') {
				this.#root.querySelector('router-link')?.setAttribute('to', newValue);
			} else if (name === 'unread-count') {
				this.#unreadCount.textContent = newValue;
			}
		}
	}
}

customElements.define('feed-card', FeedCard);
