<script>
// @ts-nocheck

import _ from 'lodash-es'

import { posts_store } from "$lib/stores/posts"
import Post from '$lib/components/Post.svelte';

console.log('posts_store', $posts_store)

let posts = $posts_store.posts

</script>

<h1>Archive of all posts</h1>

<div>
  {#if posts.length > 0}
    <ul>
      {#each posts as post}
        <Post {post} />
      {/each}
    </ul>    
  {/if}

</div>

