<script>
	export let data;
</script>

<article class="prose">
	<svelte:component this={data.content} />
	<p>Published {new Date(data.date).toDateString()}</p>
</article>