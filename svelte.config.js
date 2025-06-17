import { mdsvex } from 'mdsvex'
import relativeImages from 'mdsvex-relative-images'
import adapter from '@sveltejs/adapter-node'

const config = {
	kit: { adapter: adapter() },
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.svx', '.md'],
			remarkPlugins: [relativeImages],
		}),
	],
}

export default config
