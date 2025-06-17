<script>
// @ts-nocheck


// console.log('here')

import Posts from "$lib/components/Posts.svelte"

	let { data } = $props();
let summary = false
const size = 6

</script>

<Posts {data} size={size} summary />

<style>

</style>