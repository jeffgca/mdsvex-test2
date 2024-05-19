<script>
	import '../app.css';
	export const prerender = true;

	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import '$lib/styles/style.css';
</script>

<Header></Header>

<main>
	<slot></slot>
</main>

<Footer></Footer>
<slot></slot>

<style></style>
