<script>
	// @ts-nocheck

	import { run } from 'svelte/legacy'

	// @ts-nocheck

	import { goto } from '$app/navigation'

	import _ from 'lodash-es'
	import { Pagination } from 'flowbite-svelte'

	import Post from './Post.svelte'

	/**
	 * @typedef {Object} Props
	 * @property {any} data
	 * @property {number} [size]
	 * @property {boolean} [summary]
	 */

	/** @type {Props} */
	let { data, size = 6, summary = true } = $props()

	function getPages(posts, size, path) {
		let l = posts.length

		if (!path) {
			path = '/'
		}

		let numPages = Math.floor(l / size)
		if (l % size !== 0) {
			numPages++
		}

		return _.map(_.range(numPages), (i) => {
			let _index = i + 1
			return {
				name: _index,
				href: `${path}${_index}`,
			}
		})
	}

	function getPosts(allPosts, slug, size) {
		let _startIndex = (slug - 1) * size
		let _endIndex = _startIndex + size

		// console.log('indexes', _startIndex, _endIndex)

		let posts = allPosts.slice(_startIndex, _endIndex)
		return posts
	}

	let slug = 1
	let pages = getPages(data.posts, size)
	let posts = $state([])

	let currentSlug = $state(slug)

	run(() => {
		if (!data.slug) {
			currentSlug = slug
		} else {
			currentSlug = data.slug
		}

		posts = getPosts(data.posts, currentSlug, size)
	})

	function prev() {
		if (currentSlug > 1) {
			goto(`/${currentSlug - 1}`)
		}
	}

	function next() {
		if (currentSlug < pages.length) {
			goto(`/${parseInt(currentSlug) + 1}`)
		}
	}
</script>

<div class="content-wrapper prose">
	{#if posts.length > 0}
		{#each posts as post}
			<!-- <Post {post} {summary} /> -->
			<Post {post} />
		{/each}
	{:else}
		<div>No posts yet?</div>
	{/if}
</div>

<div class="pager-wrapper">
	<Pagination {pages} large on:previous={prev} on:next={next} />
</div>

<style>
	div.content-wrapper {
		margin-bottom: 2em;
	}

	div.pager-wrapper {
		display: flex;
		/* flex: content; */
		align-items: center;
	}
</style>
