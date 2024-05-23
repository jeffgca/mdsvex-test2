<script>
	import '../app.css'
	import '$lib/styles/style.css'
	import Header from '$lib/components/Header.svelte'
	import Footer from '$lib/components/Footer.svelte'

	import { posts_store } from '$lib/stores/posts'

	export let data

	$posts_store = data

</script>

<div class="wrapper">
	<Header></Header>
	
	<main class="prose">
		<slot></slot>
	</main>
	
	<Footer />
</div>

<style>

@import '../css/prism.css';

.wrapper {
	border-radius: 10px;
	border: 1px solid #ababab;
	margin: 10px;
}

</style>
