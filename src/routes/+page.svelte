<script>
// @ts-nocheck

import Posts from "$lib/components/Posts.svelte"
import { BugOutline } from 'flowbite-svelte-icons'

export let data
let summary = true
const size = 6

</script>

<!-- <h1>
  <a href="/">
    <span>
      <BugOutline transform="rotate(135)" />
    </span> 
  </a>
</h1> -->

<Posts {data} {size} {summary}/>
