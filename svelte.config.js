import { mdsvex } from 'mdsvex'
import relativeImages from 'mdsvex-relative-images'
// import adapter from '@sveltejs/adapter-static'
import adapterGhpages from 'svelte-adapter-ghpages'

const config = {
	kit: {
		adapter: adapterGhpages({
			// default options are shown
			pages: 'build',
			assets: 'build',
			fallback: null,
		}),
	},
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.svx', '.md'],
			remarkPlugins: [relativeImages],
		}),
	],
}

export default config
