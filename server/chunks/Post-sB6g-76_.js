import { b as attr, e as escape_html } from './attributes-C9VcdF3X.js';
import { p as push, a as pop } from './index3-CcTBkwz9.js';
import { h as html } from './html-FW6Ia4bL.js';

function Post($$payload, $$props) {
  push();
  let { post = [], summary = false } = $$props;
  $$payload.out += `<div><h2><a${attr("href", post.path)}>${escape_html(post.title)}</a></h2> `;
  if (summary === true) {
    $$payload.out += "<!--[-->";
    $$payload.out += `${html(post.summary.html)} <div><a${attr("href", post.path)}>Read more...</a></div>`;
  } else {
    $$payload.out += "<!--[!-->";
    $$payload.out += `${html(post.content.html)}`;
  }
  $$payload.out += `<!--]--> <div>Published ${escape_html(new Date(post.date).toDateString())}</div></div>`;
  pop();
}

export { Post as P };
//# sourceMappingURL=Post-sB6g-76_.js.map
