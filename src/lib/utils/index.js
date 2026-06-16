export async function fetchMarkdownPosts() {
	const postFiles = import.meta.glob('/src/routes/posts/md/*.md')

	return Promise.all(
		Object.entries(postFiles).map(async ([filePath, resolver]) => {
			const post = await resolver()
			const slug = filePath.replace(/^.*\//, '').replace(/\.md$/, '')
			const metadata = post.metadata ?? {}

			return {
				date: metadata.date ?? '',
				title: metadata.title ?? '',
				path: slug,
				summary: {
					html: metadata.description ?? '',
				},
			}
		}),
	)
}
