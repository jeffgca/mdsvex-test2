// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { render } from 'svelte/server'
import FirstPost, { metadata } from './routes/posts/md/first-post.md'
import MediaPost from './routes/posts/md/media-test.md'

describe('Markdown posts', () => {
	it('renders frontmatter and highlighted code', () => {
		const { body } = render(FirstPost)

		expect(metadata.title).toBe('First Post!')
		expect(body).toContain('class="shiki github-dark"')
		expect(body).toContain('async')
	})

	it('resolves relative images while retaining root-relative images', () => {
		const { body } = render(MediaPost)

		expect(body).toContain('/img/trash_panda.png')
		expect(body).toMatch(/src="[^"]*skull[^"]*\.png"/)
	})
})
