import { f as fetchMarkdownPosts } from './index-Bh6SL4NG.js';
import { j as json } from './index2-BIAFQWR9.js';
import 'lodash-es';
import './index3-CcTBkwz9.js';
import './attributes-C9VcdF3X.js';

const GET = async () => {
  const posts = await fetchMarkdownPosts();
  return json(posts);
};

export { GET };
//# sourceMappingURL=_server-Cz5qN8Zf.js.map
