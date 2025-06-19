import { mdsvex } from 'mdsvex'
import relativeImages from 'mdsvex-relative-images'
import adapterGhpages from 'svelte-adapter-ghpages'

const ghpagesBase = '/mdsvex-test2'

const config = {
	kit: {
		adapter: adapterGhpages({
			// default options are shown
			pages: 'build',
			assets: 'build',
			fallback: null,
		}),
	},
	paths: {
		base: process.env.NODE_ENV === 'production' ? ghpagesBase : '',
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
