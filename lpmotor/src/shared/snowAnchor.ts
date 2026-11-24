import { firstTextLine } from "./seasonalSurfaces";

type Glyph = { left: number; top: number; width: number };

function joinSupports(left: Glyph, right: Glyph, maxGap: number) {
  if (
    Math.abs(left.top - right.top) > 2.5 ||
    right.left - left.left - left.width > maxGap
  )
    return;
  return {
    left: left.left,
    top: Math.max(left.top, right.top),
    width: right.left + right.width - left.left,
  };
}

export function headingSupports(heading: Element) {
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return;

  const style = getComputedStyle(heading);
  context.font = [
    style.fontStyle,
    style.fontWeight,
    style.fontSize,
    style.fontFamily,
  ].join(" ");
  const headingBox = heading.getBoundingClientRect();
  const firstLine = firstTextLine(heading);
  const nodes = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
  const range = new Range();
  const glyphs: Glyph[] = [];
  function supports() {
    if (!glyphs.length) return;
    const first = glyphs[0];
    const last = glyphs[glyphs.length - 1];
    if (glyphs.length === 1) return { first, last };
    const maxGap = parseFloat(style.fontSize) * 0.16;
    return {
      first: joinSupports(first, glyphs[1], maxGap) ?? first,
      last: joinSupports(glyphs[glyphs.length - 2], last, maxGap) ?? last,
    };
  }

  for (let node = nodes.nextNode(); node; node = nodes.nextNode()) {
    let offset = 0;
    for (const character of node.textContent ?? "") {
      const start = offset;
      offset += character.length;
      if (!/[\p{L}\p{N}]/u.test(character)) continue;
      range.setStart(node, start);
      range.setEnd(node, offset);
      const glyphBox = range.getBoundingClientRect();
      if (glyphBox.top >= firstLine.bottom) return supports();
      if (!glyphBox.width || glyphBox.bottom <= firstLine.top) continue;

      const metrics = context.measureText(character);
      const fontHeight =
        metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
      // Range boxes include empty space above the ink. Locate the visible letter from its baseline.
      const emptyAbove =
        (glyphBox.height - fontHeight) / 2 +
        metrics.fontBoundingBoxAscent -
        metrics.actualBoundingBoxAscent;
      const width =
        metrics.actualBoundingBoxLeft + metrics.actualBoundingBoxRight;
      if (!Number.isFinite(emptyAbove) || width < 5) continue;

      glyphs.push({
        top: glyphBox.top - headingBox.top + emptyAbove,
        left: glyphBox.left - headingBox.left - metrics.actualBoundingBoxLeft,
        width,
      });
    }
  }
  return supports();
}
