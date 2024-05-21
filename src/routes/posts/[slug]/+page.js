export async function load({ params }) {
	// console.log('params', params)
	const post = await import(`../md/${params.slug}.md`)
	// console.log('post', post)
	const { title, date } = post.metadata
	const content = post.default

	return {
		content,
		title,
		date
	}
}
