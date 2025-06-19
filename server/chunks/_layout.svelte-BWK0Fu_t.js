import { b as store_set, p as push, g as getContext, c as spread_attributes, a as pop } from './index3-CcTBkwz9.js';
import { c as clsx, a as clsx$1, b as attr, e as escape_html } from './attributes-C9VcdF3X.js';
import { t as twMerge } from './bundle-mjs-BME7zF0Z.js';
import { p as posts_store } from './posts-DvuMrJ2_.js';
import './index4-gI53b4yj.js';
import './index-Bh6SL4NG.js';
import 'lodash-es';

function BugOutline($$payload, $$props) {
  push();
  const ctx = getContext("iconCtx") ?? {};
  const sizes = {
    xs: "w-3 h-3",
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
    xl: "w-8 h-8"
  };
  let {
    size = ctx.size || "md",
    color = ctx.color || "currentColor",
    title,
    strokeWidth = ctx.strokeWidth || "2",
    desc,
    class: className,
    ariaLabel = "bug outline",
    $$slots,
    $$events,
    ...restProps
  } = $$props;
  let ariaDescribedby = `${title?.id || ""} ${desc?.id || ""}`;
  const hasDescription = !!(title?.id || desc?.id);
  $$payload.out += `<svg${spread_attributes(
    {
      xmlns: "http://www.w3.org/2000/svg",
      fill: "none",
      color,
      ...restProps,
      class: clsx(twMerge(clsx$1("shrink-0", sizes[size], className))),
      "aria-label": ariaLabel,
      "aria-describedby": hasDescription ? ariaDescribedby : void 0,
      viewBox: "0 0 24 24"
    },
    null,
    void 0,
    void 0,
    3
  )}>`;
  if (title?.id && title.title) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<title${attr("id", title.id)}>${escape_html(title.title)}</title>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]-->`;
  if (desc?.id && desc.desc) {
    $$payload.out += "<!--[-->";
    $$payload.out += `<desc${attr("id", desc.id)}>${escape_html(desc.desc)}</desc>`;
  } else {
    $$payload.out += "<!--[!-->";
  }
  $$payload.out += `<!--]--><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"${attr("stroke-width", strokeWidth)} d="M10 5 9 4V3m5 2 1-1V3m-3 6v11m0-11a5 5 0 0 1 5 5m-5-5a5 5 0 0 0-5 5m5-5a4.959 4.959 0 0 1 2.973 1H15V8a3 3 0 0 0-6 0v2h.027A4.959 4.959 0 0 1 12 9Zm-5 5H5m2 0v2a5 5 0 0 0 10 0v-2m2.025 0H17m-9.975 4H6a1 1 0 0 0-1 1v2m12-3h1.025a1 1 0 0 1 1 1v2M16 11h1a1 1 0 0 0 1-1V8m-9.975 3H7a1 1 0 0 1-1-1V8"></path></svg>`;
  pop();
}
function Header($$payload) {
  $$payload.out += `<div><header><nav class="home-link"><a href="/">`;
  BugOutline($$payload, {
    color: "green",
    transform: "rotate(45)",
    size: "xl"
  });
  $$payload.out += `<!----></a></nav> <nav><ul><li><a href="/posts">Archive</a></li> <li><a href="/about">About</a></li></ul></nav></header></div>`;
}
function Footer($$payload) {
  $$payload.out += `<footer class="svelte-12lz24j"><nav><ul class="svelte-12lz24j"><li><a href="/posts">Archive</a></li> <li><a href="/about">About</a></li> <li class="svelte-12lz24j"><a href="/feed" target="_blank" class="svelte-12lz24j"><span class="svelte-12lz24j">Feed</span></a></li></ul></nav></footer>`;
}
function _layout($$payload, $$props) {
  let { data, children } = $$props;
  store_set(posts_store, data);
  $$payload.out += `<div class="wrapper">`;
  Header($$payload);
  $$payload.out += `<!----> <main>`;
  children?.($$payload);
  $$payload.out += `<!----></main> `;
  Footer($$payload);
  $$payload.out += `<!----></div>`;
}

export { _layout as default };
//# sourceMappingURL=_layout.svelte-BWK0Fu_t.js.map
