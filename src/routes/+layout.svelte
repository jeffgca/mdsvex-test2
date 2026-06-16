<script>
	import '../app.css'
	import '$lib/styles/style.css'
	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'

	let { children } = $props()
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
