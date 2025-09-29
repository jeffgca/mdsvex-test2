import ogs from 'open-graph-scraper'

export async function getOpenGraph(url) {
	try {
		const options = { url: url }
		const { error, result } = await ogs(options)
		if (error) {
			console.error('Error fetching Open Graph data:', error)
			return null
		}
		return result
	} catch (err) {
		console.error('Exception in getOpenGraph:', err)
		return null
	}
}

export async function getTwitterCard(url) {
	try {
		// const options = { url: url }
		let response = await fetch(
			'https://publish.twitter.com/oembed?url=' + encodeURIComponent(url),
		)
		// let

		return await response.text()
	} catch (err) {
		console.error('Exception in getTwitterCard:', err)
		return null
	}
}

let xUrl = 'https://x.com/Gladd/status/1970972739348705317'

console.log(
	// await getOpenGraph(),
	// await getOpenGraph('https://ogp.me/'),
	await getTwitterCard(xUrl),
)
