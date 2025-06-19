const __variableDynamicImportRuntimeHelper = (glob, path, segs) => {
  const v = glob[path];
  if (v) {
    return typeof v === "function" ? v() : Promise.resolve(v);
  }
  return new Promise((_, reject) => {
    (typeof queueMicrotask === "function" ? queueMicrotask : setTimeout)(
      reject.bind(
        null,
        new Error(
          "Unknown variable dynamic import: " + path + (path.split("/").length !== segs ? ". Note that variables only represent file names one level deep." : "")
        )
      )
    );
  });
};
async function load({ params }) {
  const post = await __variableDynamicImportRuntimeHelper(/* @__PURE__ */ Object.assign({ "../md/amet-lobortis-sapien-sapien-2023-08-03.md": () => import('./amet-lobortis-sapien-sapien-2023-08-03-Dkrwp52Z.js'), "../md/donec-dapibus-duis-2023-09-22.md": () => import('./donec-dapibus-duis-2023-09-22-DLOx7bVQ.js'), "../md/first-post.md": () => import('./first-post-Bd10XfMe.js'), "../md/id-nulla-ultrices-2023-12-02.md": () => import('./id-nulla-ultrices-2023-12-02-DgRfVxws.js'), "../md/in-faucibus-2023-09-23.md": () => import('./in-faucibus-2023-09-23-Z5DQGAV6.js'), "../md/magna-2024-05-18.md": () => import('./magna-2024-05-18-CPQ5OCF9.js'), "../md/media-test.md": () => import('./media-test-BitCuN0c.js'), "../md/mi-integer-ac-2023-07-07.md": () => import('./mi-integer-ac-2023-07-07-C-fz06wQ.js'), "../md/next-post.md": () => import('./next-post-DAQt1114.js'), "../md/quisque-ut-erat-curabitur-2023-09-14.md": () => import('./quisque-ut-erat-curabitur-2023-09-14-BhdRE8jS.js'), "../md/sapien-2023-07-20.md": () => import('./sapien-2023-07-20-BTRxtYQL.js'), "../md/sapien-a-libero-nam-2023-06-30.md": () => import('./sapien-a-libero-nam-2023-06-30-ByyWFcGj.js'), "../md/vitae-nisi-nam-ultrices-2024-04-26.md": () => import('./vitae-nisi-nam-ultrices-2024-04-26-Cj3HXrR8.js'), "../md/volutpat-quam-pede-lobortis-2023-08-26.md": () => import('./volutpat-quam-pede-lobortis-2023-08-26-f9AYBg48.js'), "../md/vulputate-2023-10-26.md": () => import('./vulputate-2023-10-26-3X6fs8od.js') }), `../md/${params.slug}.md`, 3);
  const { title, date } = post.metadata;
  const content = post.default;
  return {
    content,
    title,
    date
  };
}

var _page = /*#__PURE__*/Object.freeze({
  __proto__: null,
  load: load
});

const index = 6;
let component_cache;
const component = async () => component_cache ??= (await import('./_page.svelte-LwRqZ9nN.js')).default;
const universal_id = "src/routes/posts/[slug]/+page.js";
const imports = ["_app/immutable/nodes/6.BY3AKLpj.js","_app/immutable/chunks/Dp1pzeXC.js","_app/immutable/chunks/CNxMpzt5.js","_app/immutable/chunks/C_I3Pzvd.js","_app/immutable/chunks/b-Rpt_S2.js","_app/immutable/chunks/CDubzdnj.js"];
const stylesheets = [];
const fonts = [];

export { component, fonts, imports, index, stylesheets, _page as universal, universal_id };
//# sourceMappingURL=6-CoHZN1ij.js.map
