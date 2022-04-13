<template>
	<router-link :to="{ name: 'feed-item-list', params: { feedId } }">
		<h1><slot /></h1>
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
