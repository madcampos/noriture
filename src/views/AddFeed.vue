<template>
	<h1>Add feed</h1>
	<input
		type="url"
		placeholder="Feed URL"
		v-model="feedUrl"
	/>
	<button type="button" :disabled="isSearchDisabled" @click="findFeed()">
		🔎
	</button>
	<div v-if="feed.id">
		<h2>{{ feed.name }}</h2>
		<p>{{ feed.description }}</p>
		<button type="button" @click="addFeed()">
			Add Feed
		</button>
	</div>
</template>

<script lang="ts" setup>
	import { ref } from 'vue';
	import { type Feed, fetchFeed, parseFeed } from '../components/feeds/feed';
	import { saveFeed } from '../components/db';

	const feedUrl = ref('');
	const feed = ref<Feed>({} as unknown as Feed);
	const isSearchDisabled = ref(false);
	const isAddDisabled = ref(true);

	async function findFeed() {
		try {
			isSearchDisabled.value = true;

			void new URL(feedUrl.value);

			const response = await fetch(`https://thingproxy.freeboard.io/fetch/${feedUrl.value}`, {
				method: 'GET',
				credentials: 'omit',
				redirect: 'follow'
			});

			const text = await response.text();

			if (text.startsWith('<?xml')) {
				feed.value = parseFeed(text, feedUrl.value);
			} else {
				const siteHtml = new window.DOMParser().parseFromString(text, 'text/html');
				const parsedFeedUrl = siteHtml.querySelector('link[type="application/rss+xml"], linke[type="application/atom+xml"]')?.getAttribute('href') ?? '';

				feed.value = await fetchFeed(parsedFeedUrl);
			}
		} catch (err) {
			console.error(err);
		} finally {
			isSearchDisabled.value = false;
		}
	}

	async function addFeed() {
		isAddDisabled.value = true;
		// TODO: check if feedUrl already exists
		await saveFeed(feed.value);
		isAddDisabled.value = false;
	}
</script>
