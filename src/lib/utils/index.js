import _ from 'lodash-es'
import { render } from 'svelte/server'

/**
 * get the first paragraph from the html.
 */
function getSummary(html) {
	let regex = new RegExp(/<p>([\S\s]+?)<\/p>/, 'gm')
	let results = [...html.matchAll(regex)].shift()

	// console.log('XXX getSummary', results)

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
	return ret
}

export const fetchMarkdownPosts = async () => {
	const allPostFiles = import.meta.glob('/src/routes/posts/md/*.md')

	const iterablePostFiles = Object.entries(allPostFiles)

	const posts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			let post = await resolver()

			let content = { html: 'content XXX' }
			let summary = { html: 'summary XXX' }

			if (_.has(post, 'default')) {
				// console.log('XXX got here', post.default)
				let _tmp = post.default
				content = render(_tmp, { props: {} }).html

				summary = getSummary(content)

				// console.log('XXX Summary', summary)
			} else {
				console.warn('XXX no render function found on post', post)
			}

			const postPath = path
				.replace('/src/routes', '')
				.replace('/md', '')
				.replace(/\.md$/, '')

			let ret = {
				date: post.metadata.date,
				title: post.metadata.title,
				path: postPath,
				content: content,
				summary: summary,
			}

			return ret
		}),
	)

	return _.orderBy(posts, ['date'], ['desc'])
}
