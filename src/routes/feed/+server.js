import { fetchMarkdownPosts } from '$lib/utils'
const siteURL = 'https://jeffg.ca'
const siteTitle = 'jeff gee dot see, eh'
const siteDescription = 'Random ideas from my virtual desk.'
export const prerender = true

export const GET = async () => {
	const allPosts = await fetchMarkdownPosts()

	// console.log('allPosts', allPosts)
	const sortedPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date))

	const body = render(sortedPosts)
	const options = {
		headers: {
			'Cache-Control': 'max-age=0, s-maxage=3600',
			'Content-Type': 'application/xml'
		}
	}

	return new Response(body, options)
}

const render = (posts) => `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${siteTitle}</title>
<description>${siteDescription}</description>
<link>${siteURL}</link>
<atom:link href="${siteURL}/feed" rel="self" type="application/rss+xml"/>
${posts
	.map(
		(post) => `<item>
<guid isPermaLink="true">${siteURL}/posts/${post.path}</guid>
<title>${post.title}</title>
<link>${siteURL}/posts/${post.path}</link>
<description>${post.summary.html}</description>
<pubDate>${new Date(post.date).toUTCString()}</pubDate>
</item>`
	)
	.join('')}
</channel>
</rss>
`
