import { mdsvex } from 'mdsvex'
import relativeImages from 'mdsvex-relative-images'
import adapterGhpages from 'svelte-adapter-ghpages'
import imgLinks from '@pondorasti/remark-img-links'
import 'dotenv/config'

// console.log('XXX ENV', process.env)
// import RemarkLinkRewrite from 'remark-link-rewrite'
console.log(
	'xxx ENV',
	process.env.BUILD_MODE,
	process.env.PAGES_BASE,
	process.env.BLOG_URL,
	process.env.BLOG_TITLE,
)

let blogUrl = '/'
let plugins = []

plugins.push(relativeImages)

if (process.env.BUILD_MODE === 'production') {
	blogUrl = `${process.env.BLOG_URL}${process.env.PAGES_BASE}/`
	plugins.push([imgLinks, { absolutePath: blogUrl }])
}

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
		base: process.env.BUILD_MODE === 'production' ? process.env.PAGES_BASE : '',
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
