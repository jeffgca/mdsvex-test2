<script>
	import '../app.css'
	import '$lib/styles/style.css'
	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'

	import { posts_store } from '$lib/stores/posts'

	import { base } from '$app/paths'
	console.log('Layout', base)

	let { data, children } = $props()

	$posts_store = data
</script>

<svelte:head>
	<base href={base} />
</svelte:head>

<div class="wrapper">
	<Header></Header>

	<main>
		{@render children?.()}
	</main>

	<Footer />
</div>

<style>
</style>
