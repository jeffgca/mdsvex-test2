export const prerender = true

// import { posts_store } from '$lib/stores/posts'

export async function load(ev) {
	let posts = await ev.fetch('/api/posts')
	let json = await posts.json()
	return {
		posts: json,
	}
}
