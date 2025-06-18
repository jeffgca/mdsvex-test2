import _ from 'lodash-es'
import { render } from 'svelte/server'

/**
 * get the first paragraph from the html.
 */
function getSummary(html) {
	let regex = new RegExp(/<p>([\S\s]+?)<\/p>/, 'gm')
	let results = [...html.matchAll(regex)].shift()

	// console.log('results', results)

	if (results[0].length > 2) {
		return { html: `<p>${results[1]}</p>` }
	} else {
		return false
	}
}

/**
 * Input:
 * Output: YYYY-MM-DD / 2024-05-18
 */
export const formatDate = (dateString) => {
	let dateObj = new Date(dateString)
	let ret = `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`
	console.log('dateString', dateString, ret)

	return ret
}

export const fetchMarkdownPosts = async () => {
	const allPostFiles = import.meta.glob('/src/routes/posts/md/*.md')

	const iterablePostFiles = Object.entries(allPostFiles)

	iterablePostFiles.length = 3

	const posts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			let post = await resolver()
			let content = { html: 'content XXX' }
			let summary = { html: 'summary XXX' }
			if (_.has(post, 'default') && _.has(post.default, 'render')) {
				let _tmp = post.default
				content = render(_tmp, { props: {} }).html

				summary = getSummary(content)
			}

			const postPath = path
				.replace('/src/routes', '')
				.replace('/md', '')
				.replace(/\.md$/, '')

			return {
				date: post.metadata.date,
				title: post.metadata.title,
				path: postPath,
				content: content,
				summary: summary,
			}
		}),
	)

	return _.orderBy(posts, ['date'], ['desc'])
}
