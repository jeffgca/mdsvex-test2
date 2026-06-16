<script>
	// import { formatDate } from '$lib/utils'
	/**
	 * @typedef {Object} Props
	 * @property {any} [post]
	 * @property {boolean} [summary]
	 */

	/** @type {Props} */
	let { post = [] } = $props()
	import { resolve } from '$app/paths'

	// $inspect('post', post)
</script>

<div>
	<h2>
		<a href={resolve(post.path)}>
			{post.title}
		</a>
	</h2>
	<post.content />
	<div>Published {new Date(post.date).toDateString()}</div>
</div>
