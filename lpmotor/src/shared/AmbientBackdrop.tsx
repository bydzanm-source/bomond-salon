import "../styles/ambient.css";

export function AmbientBackdrop({ className }: { className: string }) {
  return <div className={className} data-ambient-backdrop aria-hidden="true" />;
}
