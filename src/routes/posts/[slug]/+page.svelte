<script>
	let { data } = $props()
</script>

<article class="prose">
	<h1>{data.title}</h1>
	<data.content />
	<p>Published {new Date(data.date).toDateString()}</p>
</article>
