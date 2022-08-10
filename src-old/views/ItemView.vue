<template>
	<router-link :to="`/feed/${feedId}`">
		Back
	</router-link>
	<h1>{{ title }}</h1>
	<!-- eslint-disable-next-line vue/no-v-html -->
	<article v-html="content">
	</article>
</template>

<script lang="ts" setup>
	import { RouterLink } from 'vue-router';
	import { ref } from 'vue';
	import { getFeedItem } from '../db';

	const title = ref('Loading...');
	const content = ref('');

	const props = defineProps({
		itemId: {
			type: String,
			required: true
		},
		feedId: {
			type: String,
			required: true
		}
	});

	void getFeedItem(props.itemId).then((item) => {
		title.value = item.title;
		content.value = item.content;
	});
</script>
