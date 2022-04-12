<template>
	<h1>Feed item view page</h1>
	{{ feedId }}
</template>

<script lang="ts" setup>
	defineProps({
		feedId: {
			type: String,
			required: true
		}
	});
</script>
