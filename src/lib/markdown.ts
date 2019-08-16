import showdown from "showdown";
import h from "hyperscript";

export class Markdown {
  private converter: showdown.Converter;

  constructor() {
    this.converter = new showdown.Converter({
      tables: true,
      parseImgDimensions: true
    });
    this.converter.setFlavor("github");

    this.converter.addExtension({
      type: "lang",
      filter(text) {
        const rowRegex = /(?:(?:^|\r?\n)(?:\| )?(?:(?:.* \| )+.+)*(?:.* \| )+.+(?: \|)?(?:$|\r?\n))+/m;

        text = text.replace(rowRegex, (p0) => {
          return h("table.table", p0.trim().split("\n").map((pi) => {
            pi = pi.trim().replace(/^|/, "").replace(/|$/, "")

            return h("tr", pi.split(" | ").map((x) => x.trim()).map((qi) => {
              return h("td", qi);
            }))
          })).outerHTML;
        });

        return text;
      }
    })
  }

  md2html(md: string) {
    return this.converter.makeHtml(md);
  }
}

export const md = new Markdown();
