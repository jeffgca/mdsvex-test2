import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import Footer from './Footer.svelte'

describe('Footer Component', () => {
	it('should render without crashing', () => {
		const { container } = render(Footer)
		expect(container).toBeTruthy()
	})

	it('should be a footer element', () => {
		const { container } = render(Footer)
		const footer = container.querySelector('footer')
		expect(footer).toBeTruthy()
	})
})
