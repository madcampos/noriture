<template>
	<h1>{{ $t('messages.mainView') }}</h1>

	<feed-card v-for="feed of feedList" :key="feed.id" :feed-id="feed.id">
		{{ feed.name }}
		{{ feed.unreadCount }}
	</feed-card>
</template>

<script lang="ts" setup>
	import { useObservable } from '@vueuse/rxjs';
	import type { Observable } from 'rxjs';
	import { listFeeds } from '../components/db';
	import FeedCard from '../components/FeedCard.vue';
	import type { Feed } from '../components/feeds/feed';

	const feedList = useObservable<Feed[]>(listFeeds() as unknown as Observable<Feed[]>);
</script>
