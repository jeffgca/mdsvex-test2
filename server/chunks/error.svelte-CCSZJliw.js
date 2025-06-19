import { e as escape_html } from './attributes-C9VcdF3X.js';
import { p as push, a as pop, g as getContext } from './index3-CcTBkwz9.js';
import { s as stores } from './client-D6jiDWsq.js';
import './exports-Cv9LZeD1.js';
import './index4-gI53b4yj.js';

({
  check: stores.updated.check
});
function context() {
  return getContext("__request__");
}
const page$1 = {
  get error() {
    return context().page.error;
  },
  get status() {
    return context().page.status;
  }
};
const page = page$1;
function Error$1($$payload, $$props) {
  push();
  $$payload.out += `<h1>${escape_html(page.status)}</h1> <p>${escape_html(page.error?.message)}</p>`;
  pop();
}

export { Error$1 as default };
//# sourceMappingURL=error.svelte-CCSZJliw.js.map
