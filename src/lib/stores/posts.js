import { writable } from 'svelte/store'
import { fetchMarkdownPosts } from '$lib/utils/index'
let posts = []
;(async () => {
	posts = await fetchMarkdownPosts()
})()

export const posts_store = writable({ posts })
