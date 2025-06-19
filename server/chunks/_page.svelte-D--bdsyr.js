import { p as push, M as store_get, e as ensure_array_like, N as unsubscribe_stores, a as pop } from './index3-CcTBkwz9.js';
import { p as posts_store } from './posts-DvuMrJ2_.js';
import { P as Post } from './Post-sB6g-76_.js';
import './attributes-C9VcdF3X.js';
import './index4-gI53b4yj.js';
import './index-Bh6SL4NG.js';
import 'lodash-es';
import './html-FW6Ia4bL.js';

function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let posts = store_get($$store_subs ??= {}, "$posts_store", posts_store).posts;
  $$payload.out += `<div class="prose"><h1 class="page-title">Archive of all posts</h1> `;
  if (posts.length > 0) {
    $$payload.out += "<!--[-->";
    const each_array = ensure_array_like(posts);
    $$payload.out += `<!--[-->`;
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let post = each_array[$$index];
      Post($$payload, { post });
    }
    $$payload.out += `<!--]-->`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--></div>`;
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-D--bdsyr.js.map
