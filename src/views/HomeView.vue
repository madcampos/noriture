<template>
	<h1>{{ $t('messages.mainView') }}</h1>

	<feed-card v-for="feed of feedList" :key="feed.id" :feed-id="feed.id">
		{{ feed?.name.value }}
	</feed-card>
</template>

<script lang="ts" setup>
	import FeedCard from '../components/FeedCard.vue';
	import { useFeed } from '../components/feeds';

	const feedList = new Array(10).fill(0).map((_, i) => useFeed({ name: `Feed ${i}` }));
</script>
