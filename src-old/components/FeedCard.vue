<template>
	<router-link :to="{ name: 'feed', params: { feedId } }">
		<h1><slot></slot></h1>
	</router-link>
</template>

<script lang="ts" setup>
	import { RouterLink } from 'vue-router';

	defineProps({
		feedId: {
			type: String,
			required: true
		}
	});
</script>
