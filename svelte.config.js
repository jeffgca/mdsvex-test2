import { mdsvex, escapeSvelte } from 'mdsvex'
import relativeImages from 'mdsvex-relative-images'
import adapter from '@sveltejs/adapter-static'
import imgLinks from '@pondorasti/remark-img-links'
import { createHighlighter } from 'shiki'

// import { getOpenGraph, getTwitterCard } from './src/lib/scripts/opengraph.js'
import 'dotenv/config'

let blogUrl = '/'
let plugins = []

plugins.push(relativeImages)

if (process.env.BUILD_MODE === 'production') {
	blogUrl = `${process.env.BLOG_URL}${process.env.PAGES_BASE}/`
	plugins.push([imgLinks, { absolutePath: blogUrl }])
}

const theme = 'github-dark'

const highlighter = await createHighlighter({
	themes: [theme],
	langs: ['javascript', 'typescript'],
})

const config = {
	kit: {
		adapter: adapter({
			// default options are shown
			pages: 'build',
			assets: 'build',
			fallback: null,
		}),
		prerender: {
			handleUnseenRoutes: 'warn',
		},
	},
	paths: {
		base: process.env.BUILD_MODE === 'production' ? process.env.PAGES_BASE : '',
	},
	extensions: ['.svelte', '.svx', '.md'],
	preprocess: [
		mdsvex({
			extensions: ['.svx', '.md'],
			remarkPlugins: plugins,
			highlight: {
				highlighter: async (code, lang) => {
					const html = escapeSvelte(
						highlighter.codeToHtml(code, { lang, theme }),
					)
					return `{@html \`${html}\` }`
				},
			},
		}),
	],
}

// console.log('XXX', config.paths)

export default config
