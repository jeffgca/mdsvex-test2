import { mdsvex } from 'mdsvex'
import relativeImages from 'mdsvex-relative-images'
import adapterGhpages from 'svelte-adapter-ghpages'
import RemarkLinkRewrite from 'remark-link-rewrite'

const ghpagesBase = '/mdsvex-test2'

const rewriteOptions = {
	replacer: (url) => {
		if (url.startsWith('/')) {
			return `${ghpagesBase}${url}`
		}
		return url
	},
}

console.log('xxx BUILD_MODE', process.env.BUILD_MODE)

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
			remarkPlugins: [[RemarkLinkRewrite, rewriteOptions], relativeImages],
		}),
	],
}

console.log('XXX', config.paths)

export default config
