import { b as attr } from './attributes-C9VcdF3X.js';

const _ImgSkullPng = "/_app/immutable/assets/skull.BYp831gU.png";
const metadata = {
  "title": "Testing media in content",
  "description": "Something...",
  "date": "2024-05-22T00:00:00.000Z"
};
const { title, description, date } = metadata;
function Media_test_md($$payload) {
  $$payload.out += `<p>This is a test of pictures and embeds located directly in /static/</p> <p><img src="/img/trash_panda.png" alt="Trash panda icon"/></p> <p>This is a test of a picture located on a relative path?</p> <p><img${attr("src", _ImgSkullPng)} alt="Flaming skull icon"/></p> <p>This is a twitter / x link:</p> <p><a href="https://x.com/SaltagreppoD2/status/1793330694459912247" rel="nofollow">https://x.com/SaltagreppoD2/status/1793330694459912247</a></p> <p>This is a youtube link:</p> <p><a href="https://www.youtube.com/watch?v=MTpyHB8KIy4" rel="nofollow">https://www.youtube.com/watch?v=MTpyHB8KIy4</a></p>`;
}

export { Media_test_md as default, metadata };
//# sourceMappingURL=media-test-BitCuN0c.js.map
