<template>
	<v-card>
		<v-card-title v-if="title">
			{{ title }}
		</v-card-title>
		<v-card-subtitle>
			<v-chip v-if="author !== ''" size="small">
				{{ author }}
			</v-chip>
			<span v-if="author && date">
				●
			</span>
			<v-chip v-if="date" size="small">
				{{ formatDate(date) }}
			</v-chip>
		</v-card-subtitle>
		<v-card-content>
			<v-card-text>
				<!-- eslint-disable-next-line vue/no-v-html -->
				<article v-html="content"></article>
			</v-card-text>

			<v-card-subtitle v-if="tags.length > 0">
				<v-divider></v-divider>
				<v-chip v-for="tag of tags" :key="(tag as string)" size="small">
					{{ tag }}
				</v-chip>
			</v-card-subtitle>
		</v-card-content>
		<v-card-actions>
			<v-btn :to="{ name: 'item', params: { feedId, itemId } }">
				Read Item
			</v-btn>
			<!-- TODO: add buttons for share, mark as read, bookmark and "options" (?) -->
		</v-card-actions>
	</v-card>
</template>

<script lang="ts" setup>
	import { VBtn, VCard, VCardActions, VCardContent, VCardSubtitle, VCardText, VCardTitle, VChip, VDivider } from 'vuetify/components';
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
