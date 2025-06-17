<script>
// @ts-nocheck

import _ from 'lodash-es'

import { posts_store } from "$lib/stores/posts"
import Post from '$lib/components/Post.svelte';

let posts = $posts_store.posts

</script>

<div class="prose">
  <h1 class="page-title">Archive of all posts</h1>
  {#if posts.length > 0}
    {#each posts as post}
      <Post {post} />
    {/each}
  {/if}
</div>
