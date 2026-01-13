import { describe, it, expect } from 'vitest'

describe('Basic Math Operations', () => {
	it('adds 1 + 2 to equal 3', () => {
		expect(1 + 2).toBe(3)
	})

	it('subtracts 5 - 3 to equal 2', () => {
		expect(5 - 3).toBe(2)
	})

	it('multiplies 3 * 4 to equal 12', () => {
		expect(3 * 4).toBe(12)
	})

	it('divides 10 / 2 to equal 5', () => {
		expect(10 / 2).toBe(5)
	})
})

describe('String Operations', () => {
	it('concatenates strings correctly', () => {
		expect('Hello' + ' ' + 'World').toBe('Hello World')
	})

	it('checks string length', () => {
		expect('Vitest'.length).toBe(6)
	})
})

describe('Array Operations', () => {
	it('creates an array with correct length', () => {
		const arr = [1, 2, 3, 4, 5]
		expect(arr).toHaveLength(5)
	})

	it('filters array correctly', () => {
		const numbers = [1, 2, 3, 4, 5]
		const evens = numbers.filter((n) => n % 2 === 0)
		expect(evens).toEqual([2, 4])
	})

	it('maps array correctly', () => {
		const numbers = [1, 2, 3]
		const doubled = numbers.map((n) => n * 2)
		expect(doubled).toEqual([2, 4, 6])
	})
})
