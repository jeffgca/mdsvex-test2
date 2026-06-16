import { describe, it, expect } from 'vitest'

import { fetchMarkdownPosts } from './index.js'

describe('fetchMarkdownPosts', () => {
	it('loads markdown posts with feed-compatible fields', async () => {
		const posts = await fetchMarkdownPosts()

		expect(Array.isArray(posts)).toBe(true)
		expect(posts.length).toBeGreaterThan(0)

		for (const post of posts) {
			expect(post).toHaveProperty('title')
			expect(post).toHaveProperty('date')
			expect(post).toHaveProperty('path')
			expect(typeof post.path).toBe('string')
			expect(post.path).not.toContain('/')
			expect(post).toHaveProperty('summary')
			expect(post.summary).toHaveProperty('html')
		}
	})
})
