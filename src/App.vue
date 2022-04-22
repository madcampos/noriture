<template>
	<v-app>
		<v-app-bar app color="primary" prominent>
			<v-app-bar-nav-icon @click.stop="isDrawerOpen = !isDrawerOpen"></v-app-bar-nav-icon>
			<v-app-bar-title>
				{{ title }}
			</v-app-bar-title>
			<v-btn icon="mdi-cog" to="/feeds"></v-btn>
		</v-app-bar>

		<v-navigation-drawer v-model="isDrawerOpen">
			<nav-bar @update-app-title="(feed) => title = feed.name"></nav-bar>
		</v-navigation-drawer>

		<v-main>
			<v-container fluid>
				<router-view></router-view>
			</v-container>
		</v-main>
	</v-app>
</template>

<script setup lang="ts">
	import { ref } from 'vue';
	import { RouterView } from 'vue-router';
	import { VApp, VAppBar, VAppBarNavIcon, VAppBarTitle, VBtn, VContainer, VMain, VNavigationDrawer } from 'vuetify/components';
	import NavBar from './components/NavBar.vue';

	const isDrawerOpen = ref(false);
	const title = ref('Noriture');
</script>
