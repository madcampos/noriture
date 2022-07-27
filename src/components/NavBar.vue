<template>
	<nav>
		<ul>
			<li>
				<router-link to="/" @click="$emit('updateAppTitle', { name: 'Home' } as Feed)">
					<span class="icon">
						<img src="/img/icons/home.svg" alt="Home" />
					</span>
					<span>Home</span>
				</router-link>
			</li>
			<li v-for="feed of feedList" :key="feed.id">
				<router-link :to="`/feed/${feed.id}`" @click="$emit('updateAppTitle', feed)">
					<span class="icon">
						<img :src="feed.icon" :alt="feed.name" />
					</span>
					<span>{{ feed.name }}</span>
					<span v-if="feed.unreadCount > 0" class="badge">
						{{ feed.unreadCount }}
					</span>
				</router-link>
			</li>
		</ul>
	</nav>
</template>

<script setup lang="ts">
	import { RouterLink } from 'vue-router';
	import { useObservable } from '@vueuse/rxjs';
	import type { Observable } from 'rxjs';

	import type { Feed } from '../components/feeds';

	import { listFeeds } from '../db';

	defineEmits({
		updateAppTitle: (_feed: Feed) => true
	});

	const feedList = useObservable<Feed[]>(listFeeds() as unknown as Observable<Feed[]>);
</script>
