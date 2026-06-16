import _ from 'lodash-es'
import { render } from 'svelte/server'

/**
 * get the first paragraph from the html.
 */
function getSummary(html) {
	let regex = new RegExp(/<p>([\S\s]+?)<\/p>/, 'gm')
	let results = [...html.matchAll(regex)].shift()

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

	let currentIds = {}

	const posts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			let post = await resolver()

			console.log('raw post', post)

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

			// let id = generateIdFromTitle(post.metadata.title, ids)
			let kebab = _.kebabCase(post.metadata.title)

			console.log('kebab', kebab, 'currentIds', currentIds)

			let curId = false

			if (_.has(currentIds, kebab)) {
				currentIds[kebab] += 1
				curId = `${kebab}-${currentIds[kebab]}`
			} else {
				currentIds[kebab] = 1
				curId = kebab
			}

			let ret = {
				date: post.metadata.date,
				title: post.metadata.title,
				path: postPath,
				content: content,
				summary: summary,
				id: curId,
			}

			return ret
		}),
	)

	return _.orderBy(posts, ['date'], ['desc'])
}
