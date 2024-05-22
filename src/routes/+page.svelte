<script>
// @ts-nocheck

import { posts_store } from "$lib/stores/posts"
import Post from "$lib/components/Post.svelte";
let posts = $posts_store.posts

</script>

<h1>jeff.ca</h1>

<div>
  {#if posts.length > 0}
    {#each posts as post}
      <Post {post} summary={true}/>
    {/each}
  {:else}
    <div>No posts yet?</div>
  {/if}
</div>

