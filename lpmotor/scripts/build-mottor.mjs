import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { build, transformWithEsbuild } from "vite";
import react from "@vitejs/plugin-react";

const project = new URL("../", import.meta.url);
const source = (path) => fileURLToPath(new URL(path, project));
const output = new URL(".mottor/", project);

const prefixes = {
  header: "bnav",
  hero: "bhro",
  about: "babt",
  team: "btim",
  services: "bsvc",
  promotions: "bpro",
  prices: "bprc",
  reviews: "brev",
  contacts: "bcnt",
  footer: "bftr",
};
const classPattern = new RegExp(
  "(?<![\\w-])(" + Object.keys(prefixes).join("|") + ")-(?=[a-z])",
  "g",
);
const replaceSectionClasses = (text) =>
  text.replace(classPattern, (_, name) => prefixes[name] + "-");

const mottorClasses = {
  name: "mottor-section-classes",
  enforce: "pre",
  transform(code, id) {
    if (id.startsWith(source("src/")) && id.endsWith(".tsx"))
      return replaceSectionClasses(code);
  },
};

const config = {
  root: source("./"),
  configFile: false,
  plugins: [mottorClasses, react()],
  define: { "process.env.NODE_ENV": '"production"' },
  logLevel: "warn",
};

const client = await build({
  ...config,
  build: {
    lib: {
      entry: source("src/app/mottor-client.tsx"),
      formats: ["es"],
      fileName: "mottor",
    },
    minify: "esbuild",
    write: false,
  },
});
const bundled = client[0].output.find((file) => file.type === "chunk")?.code;
const script = bundled
  ? (
      await transformWithEsbuild(bundled, "mottor.bundle.js", {
        loader: "js",
        minify: true,
      })
    ).code
  : "";
if (!script || /<\/script/i.test(script) || /(^|\n)export\s/.test(script)) {
  throw new Error("The section script must be valid as a classic script.");
}
new Function("sectionJs", script);

await build({
  ...config,
  build: {
    ssr: source("src/app/mottor-server.tsx"),
    outDir: fileURLToPath(output),
    emptyOutDir: true,
  },
});
const { renderSections } = await import(new URL("mottor-server.js", output));
const css = (name) =>
  readFile(new URL("src/styles/" + name + ".css", project), "utf8");
const [tokens, ambient, booking, fonts, index] = await Promise.all([
  css("tokens"),
  css("ambient"),
  css("booking"),
  css("fonts"),
  readFile(new URL("index.html", project), "utf8"),
]);
const pageHead = index.match(
  /<script\b[\s\S]+?<\/script>\s*<script\b[\s\S]+?<\/script>/,
)?.[0];
if (!pageHead)
  throw new Error(
    "The site template is missing the Telegram and theme scripts.",
  );

const bookingCss = (
  await transformWithEsbuild(booking, "booking.css", {
    loader: "css",
    minify: true,
  })
).code;
const pageBody =
  '<div id="bomond-floating-root"></div><style>' + bookingCss + "</style>";
const sections = await Promise.all(
  renderSections().map(async ({ name, prefix, html }) => {
    if (
      /<(?:html|head|body|style|script|meta|link)\b|\sstyle=|\son[a-z]+=/i.test(
        html,
      )
    ) {
      throw new Error("Restricted Mottor HTML in " + name);
    }
    if (html.includes("<!-- -->")) {
      throw new Error(
        "LPmotor removes React text separators in " +
          name +
          ". Combine adjacent text into one JSX expression.",
      );
    }
    for (const match of html.matchAll(/\sclass="([^"]+)"/g)) {
      if (
        match[1]
          .split(/\s+/)
          .some((className) => !className.startsWith(prefix + "-"))
      ) {
        throw new Error("Unscoped class in " + name + ": " + match[1]);
      }
    }
    const style = replaceSectionClasses(await css(name)).replace(
      /(^|,)\s*::view-transition/gm,
      "$1 html:has(." + prefix + "-island)::view-transition",
    );
    const scopedTokens =
      name === "header"
        ? tokens
            .replace(/:root/g, "html:has(.bnav-island)")
            .replace(
              /html\[data-theme="dark"\]/g,
              'html[data-theme="dark"]:has(.bnav-island)',
            )
        : "";
    const scopedAmbient = !html.includes("data-ambient-backdrop")
      ? ""
      : ambient
          .replaceAll("[data-ambient-backdrop]", "." + prefix + "-aurora")
          .replace(/:root/g, "html:has(." + prefix + "-island)")
          .replace(
            /html\[data-(theme|season)="([^"]+)"\]/g,
            'html[data-$1="$2"]:has(.' + prefix + "-island)",
          );
    const sectionCss = (
      await transformWithEsbuild(
        scopedTokens + style + scopedAmbient,
        name + ".css",
        { loader: "css", minify: true },
      )
    ).code;

    if (
      /position:\s*fixed|@font-face|@import|z-index:\s*(?:[6-9]|\d{2,})\b/.test(
        sectionCss,
      )
    ) {
      throw new Error("Restricted Mottor CSS in " + name);
    }
    return {
      name,
      ms_html: html,
      ms_css: sectionCss,
      ms_js: name === "header" ? script : "",
    };
  }),
);

const payload = {
  sections,
  code: { head: pageHead, body: pageBody, enabled: true },
};
const serialized = JSON.stringify(payload);
const version = createHash("sha256")
  .update(serialized)
  .digest("hex")
  .slice(0, 12);
await mkdir(output, { recursive: true });
await writeFile(new URL("payload.json", output), serialized);

const sectionRuntime = `const sectionJs = {
  ready: callback => callback(),
  addEventListener: (target, event, listener, capture) => target.addEventListener(event, listener, capture),
  removeEventListener: (target, event, listener, capture) => target.removeEventListener(event, listener, capture),
  createIntersectionObserver: (callback, options) => new IntersectionObserver(callback, options),
  createMutationObserver: callback => new MutationObserver(callback),
  setTimeout: (callback, delay) => window.setTimeout(callback, delay),
  clearTimeout: id => window.clearTimeout(id)
};`;
const preview = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,follow"><title>Стенд Bomond</title>
<style>body{margin:0}${fonts}${sections.map(({ ms_css }) => ms_css).join("\n")}</style>
${pageHead}</head><body>${sections.map(({ ms_html }) => ms_html).join("\n")}
${pageBody}<script>${sectionRuntime}\n${script}</script></body></html>`;
await writeFile(new URL("preview.html", output), preview);
console.log(
  "LPmotor " + version + " · " + Buffer.byteLength(preview) + " bytes",
);
