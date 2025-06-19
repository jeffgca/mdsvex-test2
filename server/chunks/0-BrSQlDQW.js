import './posts-DvuMrJ2_.js';
import './index4-gI53b4yj.js';
import './index3-CcTBkwz9.js';
import './attributes-C9VcdF3X.js';
import './index-Bh6SL4NG.js';
import 'lodash-es';

async function load(ev) {
  let posts = await ev.fetch("/api/posts");
  let json = await posts.json();
  return {
    posts: json
  };
}

var _layout = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 0;
let component_cache;
const component = async () => component_cache ??= (await import('./_layout.svelte-BWK0Fu_t.js')).default;
const universal_id = "src/routes/+layout.js";
const imports = ["_app/immutable/nodes/0.BUG78Pq9.js","_app/immutable/chunks/YCvzgCFP.js","_app/immutable/chunks/D5ALHaBg.js","_app/immutable/chunks/C_I3Pzvd.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/Cghym1yM.js","_app/immutable/chunks/BRvxPYJH.js","_app/immutable/chunks/C2CNzB8j.js"];
const stylesheets = ["_app/immutable/assets/0.CwCY0v_f.css"];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _layout as universal, universal_id };
//# sourceMappingURL=0-BrSQlDQW.js.map
