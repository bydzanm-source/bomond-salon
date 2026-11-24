import type { MouseEvent } from "react";

export function followSectionLink(event: MouseEvent<HTMLAnchorElement>) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return false;
  event.preventDefault();
  event.stopPropagation();
  const hash = event.currentTarget.hash;
  if (window.location.hash === hash) {
    document.getElementById(hash.slice(1))?.scrollIntoView({ block: "start" });
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = hash;
  }
  return true;
}
