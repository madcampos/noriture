<template>
	<header>
		<button type="button" @click.stop="isDrawerOpen = !isDrawerOpen">
			Menu
		</button>
		<h1>{{ title }}</h1>
		<button type="button">
			Config
		</button>
	</header>
	<aside>
		<nav-bar @update-app-title="(feed) => title = feed.name"></nav-bar>
	</aside>
	<main>
		<router-view></router-view>
	</main>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { RouterView } from 'vue-router';
	import NavBar from './components/NavBar.vue';

	const isDrawerOpen = ref(false);
	const title = ref('Noriture');
</script>
