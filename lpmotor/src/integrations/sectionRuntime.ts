export type SectionRuntime = {
  ready: (callback: () => void) => void;
  addEventListener: (
    target: EventTarget,
    type: string,
    listener: EventListener,
  ) => void;
  removeEventListener: (
    target: EventTarget,
    type: string,
    listener: EventListener,
  ) => void;
  createIntersectionObserver: (
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit,
  ) => IntersectionObserver | null;
  createMutationObserver: (
    callback: MutationCallback,
  ) => MutationObserver | null;
  setTimeout: (callback: () => void, milliseconds: number) => number;
  clearTimeout: (id: number) => void;
};

let sectionRuntime: SectionRuntime | undefined;

export function setSectionRuntime(runtime: SectionRuntime) {
  sectionRuntime = runtime;
}

export function listen(
  target: EventTarget,
  type: string,
  listener: EventListener,
) {
  const runtime = sectionRuntime;
  if (runtime) {
    runtime.addEventListener(target, type, listener);
    return () => runtime.removeEventListener(target, type, listener);
  }
  target.addEventListener(type, listener);
  return () => target.removeEventListener(type, listener);
}

export function delay(callback: () => void, milliseconds: number) {
  const runtime = sectionRuntime;
  if (runtime) {
    const id = runtime.setTimeout(callback, milliseconds);
    return () => runtime.clearTimeout(id);
  }
  const id = window.setTimeout(callback, milliseconds);
  return () => window.clearTimeout(id);
}

export function observeIntersections(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
) {
  if (sectionRuntime)
    return sectionRuntime.createIntersectionObserver(callback, options);
  return "IntersectionObserver" in window
    ? new IntersectionObserver(callback, options)
    : null;
}

export function observeMutations(callback: MutationCallback) {
  if (sectionRuntime) return sectionRuntime.createMutationObserver(callback);
  return new MutationObserver(callback);
}
