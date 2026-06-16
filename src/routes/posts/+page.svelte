<script>
	// @ts-nocheck

	import { posts_store } from '$lib/stores/posts'
	import Post from '$lib/components/Post.svelte'

	let posts = $posts_store.posts

	console.log('posts', posts)
</script>

<div class="prose">
	<h1 class="page-title">Archive of all posts</h1>
	{#if posts.length > 0}
		{#each posts as post (post.id)}
			<Post {post} summary="true" />
		{/each}
	{/if}
</div>
