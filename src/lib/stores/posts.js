import { writable } from 'svelte/store'
import { fetchMarkdownPosts } from '$lib/utils/index'

let posts = await fetchMarkdownPosts()

// console.log('posts', posts)

export const posts_store = writable({ posts })
