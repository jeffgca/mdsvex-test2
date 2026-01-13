import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Example utility functions to test
function add(a, b) {
	return a + b
}

function multiply(a, b) {
	return a * b
}

function divide(a, b) {
	if (b === 0) throw new Error('Cannot divide by zero')
	return a / b
}

async function fetchUser(id) {
	// Simulated async operation
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve({ id, name: `User ${id}`, email: `user${id}@example.com` })
		}, 100)
	})
}

// ==== BASIC TESTS ====
describe('Basic Math Operations', () => {
	it('should add two numbers correctly', () => {
		expect(add(2, 3)).toBe(5)
		expect(add(-1, 1)).toBe(0)
		expect(add(0, 0)).toBe(0)
	})

	it('should multiply two numbers correctly', () => {
		expect(multiply(3, 4)).toBe(12)
		expect(multiply(-2, 5)).toBe(-10)
		expect(multiply(0, 100)).toBe(0)
	})

	it('should divide two numbers correctly', () => {
		expect(divide(10, 2)).toBe(5)
		expect(divide(7, 2)).toBe(3.5)
	})

	it('should throw error when dividing by zero', () => {
		expect(() => divide(10, 0)).toThrow('Cannot divide by zero')
	})
})

// ==== ASYNC TESTS ====
describe('Async Operations', () => {
	it('should fetch user data', async () => {
		const user = await fetchUser(1)
		expect(user).toEqual({
			id: 1,
			name: 'User 1',
			email: 'user1@example.com',
		})
	})

	it('should handle multiple async calls', async () => {
		const [user1, user2] = await Promise.all([fetchUser(1), fetchUser(2)])

		expect(user1.id).toBe(1)
		expect(user2.id).toBe(2)
	})
})

// ==== MATCHERS DEMO ====
describe('Various Matchers', () => {
	it('demonstrates equality matchers', () => {
		expect(2 + 2).toBe(4)
		expect({ name: 'John' }).toEqual({ name: 'John' })
		expect([1, 2, 3]).toEqual([1, 2, 3])
	})

	it('demonstrates truthiness matchers', () => {
		expect(true).toBeTruthy()
		expect(false).toBeFalsy()
		expect(null).toBeNull()
		expect(undefined).toBeUndefined()
		expect('string').toBeDefined()
	})

	it('demonstrates number matchers', () => {
		expect(10).toBeGreaterThan(5)
		expect(5).toBeLessThan(10)
		expect(10).toBeGreaterThanOrEqual(10)
		expect(5).toBeLessThanOrEqual(5)
		expect(0.1 + 0.2).toBeCloseTo(0.3)
	})

	it('demonstrates string matchers', () => {
		expect('Hello World').toMatch(/World/)
		expect('testing').toContain('test')
	})

	it('demonstrates array/object matchers', () => {
		const items = ['apple', 'banana', 'orange']
		expect(items).toContain('banana')
		expect(items).toHaveLength(3)

		const user = { name: 'John', age: 30 }
		expect(user).toHaveProperty('name')
		expect(user).toHaveProperty('age', 30)
	})
})

// ==== MOCKING DEMO ====
describe('Mocking Functions', () => {
	it('should track function calls', () => {
		const mockFn = vi.fn()

		mockFn('arg1')
		mockFn('arg2')

		expect(mockFn).toHaveBeenCalledTimes(2)
		expect(mockFn).toHaveBeenCalledWith('arg1')
		expect(mockFn).toHaveBeenLastCalledWith('arg2')
	})

	it('should mock return values', () => {
		const mockFn = vi.fn()
		mockFn.mockReturnValue(42)

		expect(mockFn()).toBe(42)

		mockFn.mockReturnValueOnce(100)
		expect(mockFn()).toBe(100)
		expect(mockFn()).toBe(42)
	})

	it('should mock async functions', async () => {
		const mockAsyncFn = vi.fn()
		mockAsyncFn.mockResolvedValue({ success: true })

		const result = await mockAsyncFn()
		expect(result).toEqual({ success: true })
	})
})

// ==== SETUP AND TEARDOWN ====
describe('Setup and Teardown', () => {
	let testData

	beforeEach(() => {
		testData = { count: 0 }
	})

	afterEach(() => {
		testData = null
	})

	it('should have fresh testData', () => {
		expect(testData.count).toBe(0)
		testData.count++
	})

	it('should have fresh testData again', () => {
		expect(testData.count).toBe(0)
	})
})

// ==== ERROR HANDLING ====
describe('Error Handling', () => {
	it('should catch errors', () => {
		const throwError = () => {
			throw new Error('Something went wrong')
		}

		expect(throwError).toThrow()
		expect(throwError).toThrow('Something went wrong')
		expect(throwError).toThrow(Error)
	})

	it('should handle async errors', async () => {
		const asyncError = async () => {
			throw new Error('Async error')
		}

		await expect(asyncError()).rejects.toThrow('Async error')
	})
})
