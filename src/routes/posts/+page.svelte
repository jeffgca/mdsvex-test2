<script>
	import Post from '$lib/components/Post.svelte'

	let { data } = $props()
</script>

<div class="prose">
	<h1 class="page-title">Archive of all posts</h1>
	{#if data.posts.length > 0}
		{#each data.posts as post (post.id)}
			<Post {post} />
		{/each}
	{/if}
</div>
