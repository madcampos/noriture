<template>
	<section>
		<h2 v-if="title">
			{{ title }}
		</h2>
		<p>
			<span v-if="author !== ''" size="small">
				{{ author }}
			</span>
			<span v-if="author && date">
				●
			</span>
			<span v-if="date" size="small">
				{{ formatDate(date) }}
			</span>
		</p>
		<div>
			<article>
				<!-- eslint-disable-next-line vue/no-v-html -->
				<article v-html="content"></article>
			</article>

			<aside v-if="tags.length > 0">
				<hr />
				<span v-for="tag of tags" :key="(tag as string)" size="small">
					{{ tag }}
				</span>
			</aside>
		</div>
		<footer>
			<router-link :to="{ name: 'item', params: { feedId, itemId } }">
				Read Item
			</router-link>
			<!-- TODO: add buttons for share, mark as read, bookmark and "options" (?) -->
		</footer>
	</section>
</template>

<script lang="ts" setup>
	import { RouterLink } from 'vue-router';
	import { useLocale } from '../plugins/i18n';

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
		},
		title: {
			type: String,
			required: true
		},
		date: {
			type: Date,
			'default': null,
			required: false
		},
		author: {
			type: String,
			'default': null,
			required: false
		},
		tags: {
			type: Array,
			'default': [],
			required: false
		},
		content: {
			type: String,
			'default': null,
			required: false
		}
	});

	function formatDate(date: Date) {
		const locale = useLocale();

		return date.toLocaleDateString(locale.value, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}
</script>
