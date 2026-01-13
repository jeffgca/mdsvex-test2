import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Header from './Header.svelte'

describe('Header Component', () => {
	it('should render without crashing', () => {
		const { container } = render(Header)
		expect(container).toBeTruthy()
	})

	it('should contain navigation elements', () => {
		const { container } = render(Header)
		const header = container.querySelector('header')
		expect(header).toBeTruthy()
	})
})
