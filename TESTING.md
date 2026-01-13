# Vitest Testing Setup

This project uses **Vitest** for testing, a next-generation testing framework powered by Vite.

## ✅ Installation Complete

Vitest and testing utilities are installed with the following packages:

```bash
pnpm add -D vitest @testing-library/svelte @testing-library/jest-dom jsdom @vitest/ui
```

## Configuration

Vitest is configured in [vite.config.js](vite.config.js) with the following settings:

- **Test environment**: jsdom (for DOM testing)
- **Globals**: Enabled (no need to import describe, it, expect in every file)
- **Setup file**: [src/setupTests.js](src/setupTests.js) (extends matchers and cleanup)
- **Coverage**: Configured with v8 provider
- **Component tests**: Excluded for now (requires browser mode for Svelte 5)

## Running Tests

```bash
# Run tests in watch mode
pnpm test

# Run tests with UI (interactive browser interface)
pnpm test:ui

# Run tests once (CI mode)
pnpm test:run

# Generate coverage report
pnpm coverage
```

## Current Test Results

All **34 tests** are passing across 4 test files:

- ✅ [src/index.test.js](src/index.test.js) - Basic math and array operations (9 tests)
- ✅ [src/lib/vitest-examples.test.js](src/lib/vitest-examples.test.js) - Comprehensive examples (18 tests)
- ✅ [src/lib/stores/posts.test.js](src/lib/stores/posts.test.js) - Svelte store tests (3 tests)
- ✅ [src/lib/utils/index.test.js](src/lib/utils/index.test.js) - Utility function tests (4 tests)

## Test Structure

Tests are located alongside the files they test with `.test.js` or `.spec.js` extensions:

```
src/
├── index.test.js
├── lib/
│   ├── vitest-examples.test.js  (comprehensive examples)
│   ├── stores/
│   │   ├── posts.js
│   │   └── posts.test.js
│   └── utils/
│       ├── index.js
│       └── index.test.js
└── setupTests.js
```

## Writing Tests

### Basic Test Example

```javascript
import { describe, it, expect } from 'vitest'

describe('Math Operations', () => {
	it('adds two numbers', () => {
		expect(1 + 2).toBe(3)
	})
})
```

### Testing Svelte Components

```javascript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import MyComponent from './MyComponent.svelte'

describe('MyComponent', () => {
	it('renders correctly', () => {
		const { container } = render(MyComponent)
		expect(container).toBeTruthy()
	})
})
```

### Testing Stores

```javascript
import { describe, it, expect } from 'vitest'
import { get } from 'svelte/store'
import { myStore } from './myStore.js'

describe('myStore', () => {
	it('has correct initial value', () => {
		const value = get(myStore)
		expect(value).toBeDefined()
	})
})
```

### Testing Async Functions

```javascript
import { describe, it, expect } from 'vitest'

describe('Async Operations', () => {
	it('fetches data correctly', async () => {
		const data = await fetchData()
		expect(data).toBeDefined()
	})
})
```

## Available Matchers

With `@testing-library/jest-dom`, you have access to many useful matchers:

- `toBeInTheDocument()`
- `toHaveTextContent(text)`
- `toBeVisible()`
- `toBeDisabled()`
- `toHaveClass(className)`
- And many more...

## Coverage

Coverage reports are generated in the `coverage/` directory when running:

```bash
pnpm coverage
```

View the HTML report by opening `coverage/index.html` in your browser.

## Best Practices

1. **Test behavior, not implementation** - Focus on what the user sees and does
2. **Keep tests simple and focused** - One assertion per test when possible
3. **Use descriptive test names** - Clearly state what is being tested
4. **Mock external dependencies** - Use `vi.mock()` for API calls
5. **Clean up after tests** - The setup file handles cleanup automatically

## Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [Testing Library Svelte](https://testing-library.com/docs/svelte-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
