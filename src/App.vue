<template>
	<header>
		<nav>
			<router-link to="/">
				🏠 Home
			</router-link>
			<router-link to="/feeds">
				➕ Add a feed
			</router-link>
		</nav>
	</header>

	<router-view></router-view>
</template>

<script setup lang="ts">
	import { RouterLink, RouterView } from 'vue-router';
</script>
