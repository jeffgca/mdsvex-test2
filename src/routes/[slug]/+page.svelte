<script>
	import Posts from '$lib/components/Posts.svelte'

	let { data } = $props()
	let summary = false
	const size = 6
</script>

<Posts {data} {size} summary />

<style>
</style>
