import type { FeedCard } from '../../components/FeedCard/FeedCard';
import { Database } from '../../db';
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

	async #loadCards() {
		const feeds = await Database.listFeeds();

		for (const feed of feeds) {
			const template = this.#feedCardTemplate.content.cloneNode(true) as HTMLElement;
			const card = template.querySelector('feed-card') as FeedCard;

			card.feedId = `/feed/${feed.id}`;
			card.unreadCount = feed.unreadCount;

			(card.querySelector('[slot=title]') as HTMLSpanElement).textContent = feed.name;
			(card.querySelector('[slot=description]') as HTMLSpanElement).textContent = feed.description ?? '';
			(card.querySelector('[slot=last-updated]') as HTMLSpanElement).textContent = feed.lastUpdated.toLocaleString();
			(card.querySelector('[slot=image]') as HTMLImageElement).src = feed.icon ?? '';

			this.#root.appendChild(card);
		}
	}

	render() {
		this.#root.querySelectorAll('feed-card').forEach((card) => card.remove());
		void this.#loadCards();
	}
}
