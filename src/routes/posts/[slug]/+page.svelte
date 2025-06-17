<script>
	let { data } = $props();
</script>

<article class="prose">
	<data.content />
	<p>Published {new Date(data.date).toDateString()}</p>
</article>