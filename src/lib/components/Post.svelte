<script>
	// import { formatDate } from '$lib/utils'
	/**
	 * @typedef {Object} Props
	 * @property {any} [post]
	 * @property {boolean} [summary]
	 */

	/** @type {Props} */
	let { post = [], summary = false } = $props()
	import { base } from '$app/paths'
</script>

<div>
	<h2>
		<a href="{base}{post.path}">
			{post.title}
		</a>
	</h2>

	{#if summary === true}
		{@html post.summary.html}
		<div><a href="{base}{post.path}">Read more...</a></div>
	{:else}
		{@html post.content.html}
	{/if}
	<div>Published {new Date(post.date).toDateString()}</div>
</div>
