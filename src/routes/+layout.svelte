<script>
	import '../app.css'
	import '$lib/styles/style.css'
	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'

	import { posts_store } from '$lib/stores/posts'

	let { data, children } = $props()

	$posts_store = data
</script>

<div class="wrapper">
	<Header />

	<main>
		{@render children?.()}
	</main>

	<Footer />
</div>

<style>
</style>
