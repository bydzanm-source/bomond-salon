import { renderToString } from "react-dom/server";
import { sections } from "./sections";

export function renderSections() {
  return sections.map(({ name, prefix, Component }) => {
    const markup = renderToString(<Component />).replace(
      /^(?:<link[^>]+rel="preload"[^>]*\/>)+/,
      "",
    );
    return {
      name,
      prefix,
      html: `<div class="${prefix}-island" data-bomond-island="${name}">${markup}</div>`,
    };
  });
}
