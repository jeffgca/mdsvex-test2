export async function fetchMarkdownPosts() {
	const postFiles = import.meta.glob('/src/routes/posts/md/*.md')

	return Promise.all(
		Object.entries(postFiles).map(async ([filePath, resolver]) => {
			const post = await resolver()
			const slug = filePath.split('/').pop()?.replace(/\.md$/, '')

			return {
				date: post.metadata?.date,
				title: post.metadata?.title,
				path: slug,
				summary: {
					html: post.metadata?.description ?? '',
				},
			}
		}),
	)
}
