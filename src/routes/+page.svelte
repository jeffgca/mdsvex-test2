<script>
// @ts-nocheck

import Posts from "$lib/components/Posts.svelte"


	/**
	 * @typedef {Object} Props
	 * @property {any} data - import { BugOutline } from 'flowbite-svelte-icons'
	 */

	/** @type {Props} */
	let { data } = $props();
let summary = true
const size = 6

</script>

<Posts {data} {size} {summary}/>
