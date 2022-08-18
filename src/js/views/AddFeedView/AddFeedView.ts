import { fetchFeed } from '../../packages/Feed/Feed';
import type { Feed } from '../../packages/Feed/Feed';
import type { View } from '../../router/router';
import templateString from './AddFeedView.html?raw';
import { sanitize } from '../../plugins/sanitization';

export class AddFeedView implements View {
	#root: HTMLElement;

	#searchButton: HTMLButtonElement;
	#feedUrl: HTMLInputElement;
	#addFeedButton: HTMLButtonElement;
	#newFeedResult: HTMLElement;
	#newFeedTitle: HTMLHeadingElement;
	#newFeedIcon: HTMLImageElement;
	#newFeedDescription: HTMLParagraphElement;
	#newFeedDate: HTMLSpanElement;

	constructor(rootElement: HTMLElement) {
		const template = document.createElement('template');

		template.innerHTML = templateString;

		this.#root = rootElement;
		this.#root.appendChild(template.content.cloneNode(true));

		this.#feedUrl = this.#root.querySelector('#new-feed-url') as HTMLInputElement;
		this.#searchButton = this.#root.querySelector('#search-new-feed') as HTMLButtonElement;

		this.#addFeedButton = this.#root.querySelector('#add-new-feed') as HTMLButtonElement;

		this.#newFeedResult = this.#root.querySelector('#new-feed-result') as HTMLElement;
		this.#newFeedTitle = this.#root.querySelector('#new-feed-title') as HTMLHeadingElement;
		this.#newFeedIcon = this.#root.querySelector('#new-feed-icon') as HTMLImageElement;
		this.#newFeedDescription = this.#root.querySelector('#new-feed-description') as HTMLParagraphElement;
		this.#newFeedDate = this.#root.querySelector('#new-feed-date') as HTMLSpanElement;

		this.#searchButton.addEventListener('click', async () => this.findFeed());

		this.#addFeedButton.addEventListener('click', async () => {
			// TODO: add feed to the database
		});
	}

	get template() {
		return templateString;
	}

	get rootElement() {
		return this.#root;
	}

	renderFeed(feed: Feed) {
		this.#newFeedTitle.textContent = feed.name;

		if (feed.icon) {
			this.#newFeedIcon.hidden = false;
			this.#newFeedIcon.src = feed.icon;
			this.#newFeedIcon.alt = feed.name;
		} else {
			this.#newFeedIcon.hidden = true;
		}

		this.#newFeedDescription.innerHTML = sanitize(feed.description ?? 'This feed has no description.');

		this.#newFeedDescription.querySelectorAll('a').forEach((link) => {
			link.setAttribute('target', '_blank');
			link.setAttribute('rel', 'noopener noreferrer');
		});

		if (feed.lastUpdated instanceof Date) {
			this.#newFeedDate.textContent = feed.lastUpdated.toLocaleString();
		} else {
			this.#newFeedDate.textContent = 'Never updated';
		}

		this.#newFeedResult.hidden = false;
	}

	async findFeed() {
		try {
			this.#searchButton.disabled = true;

			const url = new URL(this.#feedUrl.value);
			const feed = await fetchFeed(url.href);

			this.renderFeed(feed);
		} catch (err) {
			console.error(err);
		} finally {
			this.#searchButton.disabled = false;
		}
	}

	render() {
		this.#newFeedResult.hidden = true;
		this.#feedUrl.value = '';
	}
}
