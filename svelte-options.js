import adapter from '@sveltejs/adapter-static'

import 'dotenv/config'

const pagesBase = process.env.PAGES_BASE?.replace(/^\/+|\/+$/g, '')

const config = {
	adapter: adapter({
		// default options are shown
		pages: 'build',
		assets: 'build',
		fallback: 'index.html',
		strict: false,
	}),
	prerender: {
		handleUnseenRoutes: 'warn',
	},
	alias: {
		$lib: 'src/lib',
	},
	paths: {
		base:
			process.env.BUILD_MODE === 'production' && pagesBase
				? `/${pagesBase}`
				: '',
	},
}

export default config
