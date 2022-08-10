<template>
	<item-card
		v-for="item of itemList"
		:key="item.id"

		class="flex-grow-1 ma-4"
		:feed-id="item.feedId"
		:item-id="item.id"
		:thumb="item.image"

		:title="item.title"
		:date="item.date"
		:author="item.author"
		:tags="item.tags"
		:content="item.content"
	>
	</item-card>
</template>

<script lang="ts" setup>
	// TODO: add check for feedId and force reload the view
	import { useObservable } from '@vueuse/rxjs';
	import type { Observable } from 'rxjs';

	import { listUnreadItems } from '../db';
	import type { FeedItem } from '../components/feeds/feedItem';
	import ItemCard from '../components/ItemCard.vue';

	const props = defineProps({
		feedId: {
			type: String,
			required: true
		}
	});

	const itemList = useObservable(listUnreadItems(props.feedId) as unknown as Observable<FeedItem[]>);
</script>
