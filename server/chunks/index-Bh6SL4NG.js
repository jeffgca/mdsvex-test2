import _ from 'lodash-es';
import { r as render } from './index3-CcTBkwz9.js';

function getSummary(html) {
  let regex = new RegExp(/<p>([\S\s]+?)<\/p>/, "gm");
  let results = [...html.matchAll(regex)].shift();
  if (results[0].length > 2) {
    return { html: `<p>${results[1]}</p>` };
  } else {
    return false;
  }
}
const fetchMarkdownPosts = async () => {
  const allPostFiles = /* @__PURE__ */ Object.assign({ "/src/routes/posts/md/amet-lobortis-sapien-sapien-2023-08-03.md": () => import('./amet-lobortis-sapien-sapien-2023-08-03-Dkrwp52Z.js'), "/src/routes/posts/md/donec-dapibus-duis-2023-09-22.md": () => import('./donec-dapibus-duis-2023-09-22-DLOx7bVQ.js'), "/src/routes/posts/md/first-post.md": () => import('./first-post-Bd10XfMe.js'), "/src/routes/posts/md/id-nulla-ultrices-2023-12-02.md": () => import('./id-nulla-ultrices-2023-12-02-DgRfVxws.js'), "/src/routes/posts/md/in-faucibus-2023-09-23.md": () => import('./in-faucibus-2023-09-23-Z5DQGAV6.js'), "/src/routes/posts/md/magna-2024-05-18.md": () => import('./magna-2024-05-18-CPQ5OCF9.js'), "/src/routes/posts/md/media-test.md": () => import('./media-test-BitCuN0c.js'), "/src/routes/posts/md/mi-integer-ac-2023-07-07.md": () => import('./mi-integer-ac-2023-07-07-C-fz06wQ.js'), "/src/routes/posts/md/next-post.md": () => import('./next-post-DAQt1114.js'), "/src/routes/posts/md/quisque-ut-erat-curabitur-2023-09-14.md": () => import('./quisque-ut-erat-curabitur-2023-09-14-BhdRE8jS.js'), "/src/routes/posts/md/sapien-2023-07-20.md": () => import('./sapien-2023-07-20-BTRxtYQL.js'), "/src/routes/posts/md/sapien-a-libero-nam-2023-06-30.md": () => import('./sapien-a-libero-nam-2023-06-30-ByyWFcGj.js'), "/src/routes/posts/md/vitae-nisi-nam-ultrices-2024-04-26.md": () => import('./vitae-nisi-nam-ultrices-2024-04-26-Cj3HXrR8.js'), "/src/routes/posts/md/volutpat-quam-pede-lobortis-2023-08-26.md": () => import('./volutpat-quam-pede-lobortis-2023-08-26-f9AYBg48.js'), "/src/routes/posts/md/vulputate-2023-10-26.md": () => import('./vulputate-2023-10-26-3X6fs8od.js') });
  const iterablePostFiles = Object.entries(allPostFiles);
  iterablePostFiles.length = 3;
  const posts = await Promise.all(
    iterablePostFiles.map(async ([path, resolver]) => {
      let post = await resolver();
      let content = { html: "content XXX" };
      let summary = { html: "summary XXX" };
      if (_.has(post, "default") && _.has(post.default, "render")) {
        let _tmp = post.default;
        content = render(_tmp, { props: {} }).html;
        summary = getSummary(content);
      }
      const postPath = path.replace("/src/routes", "").replace("/md", "").replace(/\.md$/, "");
      return {
        date: post.metadata.date,
        title: post.metadata.title,
        path: postPath,
        content,
        summary
      };
    })
  );
  return _.orderBy(posts, ["date"], ["desc"]);
};

export { fetchMarkdownPosts as f };
//# sourceMappingURL=index-Bh6SL4NG.js.map
