import { mdsvex } from 'mdsvex'
import relativeImages from 'mdsvex-relative-images'
import adapterGhpages from 'svelte-adapter-ghpages'

console.log('xxx BUILD_MODE', process.env.BUILD_MODE)

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
		base: process.env.BUILD_MODE === 'production' ? ghpagesBase : '',
	},
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.svx', '.md'],
			remarkPlugins: [relativeImages],
		}),
	],
}

console.log('XXX', config.paths)

export default config
