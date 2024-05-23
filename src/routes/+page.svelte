<script>
// @ts-nocheck

import { posts_store } from "$lib/stores/posts"
import Post from "$lib/components/Post.svelte";
import { BugOutline } from 'flowbite-svelte-icons'
let posts = $posts_store.posts

</script>

<h1>
  <a href="/">
    <span>
      <BugOutline />
    </span> 
    <span>jeff.ca</span>
  </a>
</h1>

<div>
  {#if posts.length > 0}
    {#each posts as post}
        <Post {post} summary={true}/>
    {/each}
  {:else}
    <div>No posts yet?</div>
  {/if}
</div>

<!-- <style></style> -->