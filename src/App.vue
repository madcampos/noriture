<template>
	<header>
		<nav>
			<router-link to="/">
				Home
			</router-link>
		</nav>
	</header>

	<router-view />
</template>

<script setup lang="ts">
	import { RouterLink, RouterView } from 'vue-router';
</script>
