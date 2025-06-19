import { w as writable } from './index4-gI53b4yj.js';
import { f as fetchMarkdownPosts } from './index-Bh6SL4NG.js';

let posts = [];
(async () => {
  posts = await fetchMarkdownPosts();
})();
const posts_store = writable({ posts });

export { posts_store as p };
//# sourceMappingURL=posts-DvuMrJ2_.js.map
