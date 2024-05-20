import { fetchMarkdownPosts } from '$lib/utils/index'

export const load = async ({ fetch }) => {
	// const response = await fetch(`/api/posts`)
	// const posts = await response.json()

	let posts = fetchMarkdownPosts()

	return {
		posts
	}
}
