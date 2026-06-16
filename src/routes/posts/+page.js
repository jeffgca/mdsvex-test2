// import _ from 'lodash-es'

import { posts } from '$lib/components/data/posts.svelte'

export async function load() {
	return { posts }
}
