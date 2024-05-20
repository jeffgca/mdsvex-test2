<script>
// @ts-nocheck


export let data
import _ from 'lodash-es'

console.log('data', data)

let hasPosts = false

$: {
  console.log('data', data.posts)
}

if (_.has(data, 'posts') && data.posts.length > 0) {
  hasPosts = true
}

</script>

<h1>Archive of all posts</h1>

<div>
  {#if hasPosts === true}
  <ul>
    {#each data.posts as post}
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
  <p>No posts found...</p>
  {/if}
</div>

