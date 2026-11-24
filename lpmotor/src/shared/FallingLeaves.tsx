import "../styles/leaves.css";

export function FallingLeaves() {
  return (
    <div className="falling-leaves" aria-hidden="true">
      {Array.from({ length: 8 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}
