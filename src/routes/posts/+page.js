import { fetchMarkdownPosts } from '$lib/utils/index'

export const load = async () => {
	let posts = await fetchMarkdownPosts()

	return {
		posts
	}
}
