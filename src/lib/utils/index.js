import _ from 'lodash-es'

/**
 * get the first paragraph from the html.
 */
function getSummary(html) {
	let regex = new RegExp(/\<p [\s\S]+?\>([\S\s]+?)\<\/p>/, 'g')
	let results = [...html.matchAll(regex)].shift()

	console.log('getSummary', results[1])

	if (results[0].length > 2) {
		return { html: `<p>${results[1]}</p>` }
	} else {
		return false
	}
}

export const fetchMarkdownPosts = async () => {
	const allPostFiles = import.meta.glob('/src/routes/posts/md/*.md')

	const iterablePostFiles = Object.entries(allPostFiles)

	const posts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			let post = await resolver()
			let content = { html: '' }
			let summary = { html: '' }
			if (_.has(post, 'default') && _.has(post.default, 'render')) {
				content = await post.default.render()
				summary = getSummary(content.html)
			}

			const postPath = path.replace('/src/routes', '').replace('/md', '').replace(/\.md$/, '')

			return {
				meta: post.metadata,
				path: postPath,
				content: content,
				summary: summary
			}
		})
	)
	return posts
}
