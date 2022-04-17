<template>
	<h1>Feed item view page</h1>
	{{ feedId }}

	<item-card
		v-for="item of itemList"
		:key="item.id"
		:feed-id="item.feedId"
		:item-id="item.id"
		:thumb="item.image"
	>
		<template #title>
			{{ item.title }}
		</template>
		<template #date>
			{{ item.date }}
		</template>
		<template #author>
			{{ item.author }}
		</template>
		<template #tags>
			{{ item.tags.join(', ') }}
		</template>
	</item-card>
</template>

<script lang="ts" setup>
	import { useObservable } from '@vueuse/rxjs';
	import type { Observable } from 'rxjs';
	import { listUnreadItems } from '../components/db';
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
