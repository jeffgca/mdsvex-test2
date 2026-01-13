# Vitest Quick Reference

## Basic Test Structure

```javascript
import { describe, it, expect } from 'vitest'

describe('Feature Name', () => {
	it('should do something', () => {
		expect(actual).toBe(expected)
	})
})
```

## Common Matchers

### Equality

```javascript
expect(value).toBe(5) // Strict equality (===)
expect(obj).toEqual({ name: 'John' }) // Deep equality
expect(arr).toStrictEqual([1, 2, 3]) // Strict deep equality
```

### Truthiness

```javascript
expect(value).toBeTruthy()
expect(value).toBeFalsy()
expect(value).toBeNull()
expect(value).toBeUndefined()
expect(value).toBeDefined()
```

### Numbers

```javascript
expect(value).toBeGreaterThan(3)
expect(value).toBeGreaterThanOrEqual(3)
expect(value).toBeLessThan(5)
expect(value).toBeLessThanOrEqual(5)
expect(0.1 + 0.2).toBeCloseTo(0.3) // Floating point
```

### Strings

```javascript
expect(str).toMatch(/pattern/)
expect(str).toContain('substring')
```

### Arrays and Objects

```javascript
expect(arr).toContain('item')
expect(arr).toHaveLength(3)
expect(obj).toHaveProperty('key')
expect(obj).toHaveProperty('key', value)
```

## Async Testing

```javascript
// Async/await
it('async test', async () => {
	const data = await fetchData()
	expect(data).toBeDefined()
})

// Promises
it('promise test', () => {
	return fetchData().then((data) => {
		expect(data).toBeDefined()
	})
})

// Rejections
it('handles errors', async () => {
	await expect(asyncFn()).rejects.toThrow('Error')
})
```

## Mocking

### Mock Functions

```javascript
import { vi } from 'vitest'

const mockFn = vi.fn()
mockFn('arg')

expect(mockFn).toHaveBeenCalled()
expect(mockFn).toHaveBeenCalledTimes(1)
expect(mockFn).toHaveBeenCalledWith('arg')
expect(mockFn).toHaveBeenLastCalledWith('arg')
```

### Mock Return Values

```javascript
const mockFn = vi.fn()
mockFn.mockReturnValue(42)
mockFn.mockReturnValueOnce(100)
mockFn.mockResolvedValue({ data: 'async' })
mockFn.mockRejectedValue(new Error('fail'))
```

### Mock Modules

```javascript
vi.mock('./module', () => ({
	namedExport: vi.fn(),
	default: vi.fn(),
}))
```

## Setup and Teardown

```javascript
import { beforeEach, afterEach, beforeAll, afterAll } from 'vitest'

beforeAll(() => {
	// Runs once before all tests
})

afterAll(() => {
	// Runs once after all tests
})

beforeEach(() => {
	// Runs before each test
})

afterEach(() => {
	// Runs after each test
})
```

## Skipping and Focusing Tests

```javascript
it.skip('skipped test', () => {
	// This test won't run
})

it.only('only this test', () => {
	// Only this test will run
})

it.todo('future test', () => {
	// Marked as TODO
})
```

## Testing Svelte Stores

```javascript
import { get } from 'svelte/store'
import { myStore } from './store'

it('tests store', () => {
	const value = get(myStore)
	expect(value).toBeDefined()

	myStore.set('new value')
	expect(get(myStore)).toBe('new value')
})

it('subscribes to store', () => {
	const unsubscribe = myStore.subscribe((value) => {
		expect(value).toBeDefined()
	})
	unsubscribe()
})
```

## Error Testing

```javascript
// Synchronous
expect(() => {
	throw new Error('error')
}).toThrow()

expect(() => {
	throw new Error('specific error')
}).toThrow('specific error')

// Asynchronous
await expect(asyncFn()).rejects.toThrow()
```

## Snapshot Testing

```javascript
it('matches snapshot', () => {
	const data = { name: 'John', age: 30 }
	expect(data).toMatchSnapshot()
})
```

## Coverage

```bash
# Run tests with coverage
pnpm coverage

# View coverage report
open coverage/index.html
```

## Useful Flags

```bash
# Watch mode
pnpm test

# Single run
pnpm test:run

# With UI
pnpm test:ui

# Filter by file pattern
pnpm test stores

# Update snapshots
pnpm test -u

# Show test output
pnpm test -- --reporter=verbose
```

## Best Practices

1. **One assertion per test** (when possible)
2. **Descriptive test names** - "should X when Y"
3. **Arrange-Act-Assert** pattern
4. **Mock external dependencies**
5. **Test behavior, not implementation**
6. **Keep tests independent**
7. **Clean up after tests**

## Resources

- [Vitest Docs](https://vitest.dev)
- [API Reference](https://vitest.dev/api/)
- [Expect Matchers](https://vitest.dev/api/expect.html)
- [Vi Utilities](https://vitest.dev/api/vi.html)
