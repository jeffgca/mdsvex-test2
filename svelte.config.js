import adapter from '@sveltejs/adapter-static'
import { mdsvex } from 'mdsvex'
import relativeImages from 'mdsvex-relative-images'

const config = {
	kit: {
		adapter: adapter()
	},
	extensions: ['.svelte', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.md'],
			remarkPlugins: [relativeImages]
		})
	]
}

export default config
