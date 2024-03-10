import { html, LitElement } from 'lit';
import { customElement } from 'lit/decorators.js';
import type { RouterView } from '../../router/router';

@customElement('n-feed-view')
export class FeedView extends LitElement implements RouterView {
	navigate() {
		return 'Feed';
	}

	override render() {
		// TODO: Add the actual data binding
		return html`<header>
			<h1>{{title}}</h1>
			<aside>
				<!-- TODO: add unread count -->
				<span>{{date}}</span>
				<p>{{description}}</p>
				<!-- TODO: add feed buttons -->
			</aside>
			<picture>
				<img src="{{image}}" alt="{{title}}">
			</picture>
		</header>
		<template id="item-card">
			<item-card
				title="{{title}}"
				image="{{image}}"
				link="{{link}}"
				author="{{author}}"
				date="{{date}}"
				tags="{{tags}}"
			>
				{{content}}
			</item-card>
		</template>`;
	}
}
