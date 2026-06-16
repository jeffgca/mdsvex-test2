import _ from 'lodash-es'

const allPostFiles = import.meta.glob('/src/routes/posts/md/*.md')

const iterablePostFiles = Object.entries(allPostFiles)

let currentIds = {}

const _posts = await Promise.all(
	iterablePostFiles.map(async ([path, resolver]) => {
		let post = await resolver()

		const postPath = path
			.replace('/src/routes', '')
			.replace('/md', '')
			.replace(/\.md$/, '')

		let kebab = _.kebabCase(post.metadata.title)
		let curId

		if (_.has(currentIds, kebab)) {
			currentIds[kebab] += 1
			curId = `${kebab}-${currentIds[kebab]}`
		} else {
			currentIds[kebab] = 1
			curId = kebab
		}

		console.log('post.default', post.default)

		let ret = {
			date: post.metadata.date,
			title: post.metadata.title,
			path: postPath,
			content: post.default,
			id: curId,
		}

		return ret
	}),
)

const all = _.orderBy(_posts, ['date'], ['desc'])

export const posts = $state(all) // export allPosts
