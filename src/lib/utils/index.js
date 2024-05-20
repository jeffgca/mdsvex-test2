// function getContents(globbedPosts) {
// 	return globbedPosts[Object.keys(globbedPosts)[0]].default.render()
// }

export const fetchMarkdownPosts = async () => {
	const allPostFiles = import.meta.glob('/src/routes/posts/md/*.md')

	const iterablePostFiles = Object.entries(allPostFiles)

	const posts = await Promise.all(
		iterablePostFiles.map(async ([path, resolver]) => {
			let post = await resolver()
			const postPath = path.slice(11, -3)

			return {
				meta: post.metadata,
				path: postPath.replace('/md', '')
			}
		})
	)

	console.log('in fetchMarkdownPosts', posts)

	return posts
}
