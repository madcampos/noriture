<template>
	<v-list nav>
		<v-list-item to="/" @click="$emit('updateAppTitle', { name: 'Home' } as Feed)">
			<v-list-item-avatar>
				<v-icon>mdi-home</v-icon>
			</v-list-item-avatar>

			<v-list-item-title>Home</v-list-item-title>
		</v-list-item>
		<v-list-item v-for="feed of feedList" :key="feed.id" :to="`/feed/${feed.id}`" @click="$emit('updateAppTitle', feed)">
			<v-list-item-avatar>
				<v-icon>mdi-rss</v-icon>
			</v-list-item-avatar>

			<v-list-item-title>{{ feed.name }}</v-list-item-title>

			<v-badge color="error" :content="feed.unreadCount" inline></v-badge>
		</v-list-item>
	</v-list>
</template>

<script setup lang="ts">
	import { useObservable } from '@vueuse/rxjs';
	import type { Observable } from 'rxjs';
	import { VBadge, VIcon, VList, VListItem, VListItemAvatar, VListItemTitle } from 'vuetify/components';

	import type { Feed } from '../components/feeds';

	import { listFeeds } from '../db';

	defineEmits({
		updateAppTitle: (_feed: Feed) => true
	});

	const feedList = useObservable<Feed[]>(listFeeds() as unknown as Observable<Feed[]>);
</script>
