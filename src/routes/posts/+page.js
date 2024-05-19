import { fetchMarkdownPosts } from '$lib/utils/index'

export const load = async ({ fetch }) => {

  let posts = await fetchMarkdownPosts()
	// const response = await fetch(`/api/posts`)
	// const posts = await response.json()

	return {
		posts
	}
}