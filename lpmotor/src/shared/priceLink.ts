import type { MouseEvent } from "react";

export function followPriceLink(event: MouseEvent<HTMLAnchorElement>) {
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return false;
  event.preventDefault();
  const hash = event.currentTarget.hash;
  if (window.location.hash === hash) {
    window.dispatchEvent(new HashChangeEvent("hashchange"));
  } else {
    window.location.hash = hash;
  }
  return true;
}
