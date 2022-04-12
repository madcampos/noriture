<template>
	<router-link :to="{ name: 'feed-item-list', params: { feedId } }">
		<h1><slot /></h1>
	</router-link>
</template>

<script lang="ts" setup>
	import { RouterLink } from 'vue-router';
	import { readRssFeed } from './feeds/rss';

	defineProps({
		feedId: {
			type: String,
			required: true
		}
	});

	void readRssFeed('https://xkcd.com/rss.xml');
</script>
