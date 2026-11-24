export type SeasonalSurface = "heading" | "photo";

const content = ":is(.bomond main, [data-bomond-island])";
const landingSelectors = {
  heading: content + " h1 span, " + content + " h2, " + content + " h3",
  photo: content + " img",
};

export function findSeasonalSurfaces(height: number) {
  const heroPhoto = document
    .querySelector(content + " h1")
    ?.closest("section")
    ?.querySelector("img");
  function visible(kind: SeasonalSurface) {
    return Array.from(document.querySelectorAll(landingSelectors[kind])).filter(
      (element) => {
        const rect = element.getBoundingClientRect();
        // The hero portrait may still be loading when the leaves first appear.
        const hasHeight =
          kind === "photo"
            ? rect.height > 65 || element === heroPhoto
            : rect.height > 9;
        return (
          hasHeight &&
          rect.width > 36 &&
          rect.top > 62 &&
          rect.top < height - 8 &&
          getComputedStyle(element).visibility === "visible"
        );
      },
    );
  }
  return { heading: visible("heading"), photo: visible("photo") };
}

export function firstTextLine(element: Element) {
  const text = document.createRange();
  text.selectNodeContents(element);
  return text.getClientRects()[0] ?? element.getBoundingClientRect();
}
