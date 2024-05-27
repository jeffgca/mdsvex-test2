<script>
// @ts-nocheck

import Posts from "$lib/components/Posts.svelte"
// import { BugOutline } from 'flowbite-svelte-icons'

export let data
let summary = true
const size = 6

</script>

<Posts {data} {size} {summary}/>
