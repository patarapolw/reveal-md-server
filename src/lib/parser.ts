import { md } from "./markdown";
import { compilePug } from "./pug";

export function contentToHtml(content: string, type: "markdown" | "pug" = "markdown"): string[][] {
  return (content || "").split(/^---$/gm).map((slideGroup) => {
    return slideGroup.split(/^--$/gm).map((s) => {
      if (type === "pug" || s.trimLeft().startsWith("//pug")) {
        return compilePug(s);
      }
      return md.md2html(s);
    })
  });
}