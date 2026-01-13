import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import { posts_store } from './posts.js'

describe('posts_store', () => {
	it('should be a writable store', () => {
		expect(posts_store).toBeDefined()
		expect(posts_store.subscribe).toBeDefined()
	})

	it('should have an initial value with posts property', () => {
		const value = get(posts_store)
		expect(value).toHaveProperty('posts')
	})

	it('should allow subscribing to changes', () => {
		let receivedValue = false

		const unsubscribe = posts_store.subscribe((value) => {
			expect(value).toBeDefined()
			receivedValue = true
		})

		expect(receivedValue).toBe(true)
		unsubscribe()
	})
})
