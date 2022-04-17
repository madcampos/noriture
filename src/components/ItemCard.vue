<template>
	<router-link :to="{ name: 'item', params: { feedId, itemId } }">
		<article>
			<header>
				<h3><slot name="title"></slot></h3>
				<p><slot name="date"></slot></p>
			</header>
			<picture>
				<img
					crossorigin="anonymous"
					referrerpolicy="no-referrer"
					:src="`${proxyUrl}${thumb}`"
				/>
			</picture>
			<section>
				<p><slot name="author"></slot></p>
				<p><slot name="tags"></slot></p>
			</section>
		</article>
	</router-link>
</template>

<script lang="ts" setup>
	import { RouterLink } from 'vue-router';
	import { useProxyUrl } from './feeds/proxy';

	const proxyUrl = useProxyUrl();

	defineProps({
		itemId: {
			type: String,
			required: true
		},
		feedId: {
			type: String,
			required: true
		},
		thumb: {
			type: String,
			required: true
		}
	});
</script>
