import { e as escape_html } from './attributes-C9VcdF3X.js';
import { p as push, a as pop } from './index3-CcTBkwz9.js';

function _page($$payload, $$props) {
  push();
  let { data } = $$props;
  $$payload.out += `<article class="prose"><!---->`;
  data.content($$payload, {});
  $$payload.out += `<!----> <p>Published ${escape_html(new Date(data.date).toDateString())}</p></article>`;
  pop();
}

export { _page as default };
//# sourceMappingURL=_page.svelte-LwRqZ9nN.js.map
