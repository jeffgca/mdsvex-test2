<script>
// @ts-nocheck

  export let post = []
  export let summary = false

  import { formatDate } from "$lib/utils"

  // console.log('post', post)/./;
</script>

<div>
  <h2>
    <a href={post.path}>
      {post.meta.title}
    </a>
  </h2>

  {#if summary === true}
    {@html post.summary.html}
    <div><a href={post.path}>Read more...</a></div>
  {:else}
    {@html post.content.html}
  {/if}
  <div>Published {new Date(post.meta.date).toDateString()}</div>
</div>