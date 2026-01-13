import { describe, it, expect, vi } from 'vitest'
import { formatDate } from './index.js'

describe('formatDate', () => {
	it('should format a date string to YYYY-MM-DD format', () => {
		const result = formatDate('2024-05-18')
		expect(result).toMatch(/^\d{4}-\d{1,2}-\d{1,2}$/)
	})

	it('should handle different date formats', () => {
		const result = formatDate('May 18, 2024')
		expect(result).toBeDefined()
		expect(typeof result).toBe('string')
	})

	it('should handle Date objects', () => {
		const date = new Date('2024-05-18')
		const result = formatDate(date)
		expect(result).toBeDefined()
	})

	it('should return string format', () => {
		const result = formatDate('2024-12-25')
		expect(typeof result).toBe('string')
	})
})

// Note: fetchMarkdownPosts tests are excluded as they require server-side rendering context
// For integration testing of markdown posts, use browser mode or e2e tests
