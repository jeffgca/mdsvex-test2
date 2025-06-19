import { mdsvex } from 'mdsvex'
import relativeImages from 'mdsvex-relative-images'
import adapterGhpages from 'svelte-adapter-ghpages'
import imgLinks from '@pondorasti/remark-img-links'
// import RemarkLinkRewrite from 'remark-link-rewrite'
console.log('xxx BUILD_MODE', process.env.BUILD_MODE)

const ghpagesBase = '/mdsvex-test2/'
let blogUrl = '/'
let plugins = [relativeImages]

if (process.env.BUILD_MODE === 'production') {
	blogUrl = `https://jeffgca.github.io/mdsvex-test2/`
	plugins.push([imgLinks, { absolutePath: blogUrl }])
}

// plugins.push(relativeImages)

console.log('XXX plugins', plugins)

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
			remarkPlugins: plugins,
		}),
	],
}

console.log('XXX', config.paths)

export default config
