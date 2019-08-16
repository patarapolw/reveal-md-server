import pug from "pug";
import { md } from './markdown';
import sass from "node-sass";
import h from "hyperscript";
import shortid from "shortid";

export function compilePug(s: string, data?: any) {
  const id = shortid.generate();
  const pugOptions = {
    filters: {
      settings(text: string) {
        return h("script", {type: "text/template", innerHTML: text.split("\n").map((x) => x.trim()).filter((x) => x).map((x) => `<!-- ${x} -->`).join("\n")}).outerHTML;
      },
      markdown(text: string) {
        return h(`#${id}`, {innerHTML: md.md2html(text)}).outerHTML;
      },
      scss(text: string) {
        return h("style", sass.renderSync({data: `#${id}{${text}}`}).css.toString()).outerHTML;
      }
    }
  }

  return pug.compile(s, pugOptions)(data)
}