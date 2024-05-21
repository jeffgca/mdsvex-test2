<script>
	export let data;
</script>

<article>
	<p>Published: {data.date}</p>
	<svelte:component this={data.content} />
</article>