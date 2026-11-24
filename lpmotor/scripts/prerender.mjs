import { readFile, writeFile } from "node:fs/promises";
import { canonicalUrl, renderPage } from "../.prerender/server.js";

const index = new URL("../dist/index.html", import.meta.url);
const indexable = process.env.BOMOND_INDEXABLE === "1";
const template = await readFile(index, "utf8");
const { head, body } = renderPage(indexable);

if (
  !template.includes("<!-- bomond:head -->") ||
  !template.includes("<!-- bomond:app -->")
) {
  throw new Error("Vite template is missing Bomond prerender markers.");
}

await writeFile(
  index,
  template
    .replace("<!-- bomond:head -->", () => head)
    .replace("<!-- bomond:app -->", () => body),
);

await writeFile(
  new URL("../dist/robots.txt", import.meta.url),
  "User-agent: *\nAllow: /\n" +
    (indexable ? "Sitemap: " + canonicalUrl + "sitemap.xml\n" : ""),
);

await writeFile(
  new URL("../dist/sitemap.xml", import.meta.url),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>' +
    canonicalUrl +
    "</loc></url></urlset>\n",
);
