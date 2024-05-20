<script>
// @ts-nocheck

export let data
let posts = []


$: {
  data.posts.then(result => { 
    posts = result 
    console.log('result', result)
  })
}


let hasPosts = false
import _ from 'lodash-es'

</script>

<h1>jeff.ca</h1>

<div>
  {#if posts.length > 0}
  <ul>
    {#each posts as post}
      <li>
        <h2>
          <a href={post.path}>
            {post.meta.title}
          </a>
        </h2>
        Published {post.meta.date}
      </li>
    {/each}
  </ul>
  {:else}
    <div>No posts yet?</div>
  {/if}
</div>

