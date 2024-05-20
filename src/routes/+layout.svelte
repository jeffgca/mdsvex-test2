<script>
	import '../app.css'

	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import '$lib/styles/style.css'
</script>

<Header></Header>

<main>
	<slot></slot>
</main>

<Footer />

<style></style>
