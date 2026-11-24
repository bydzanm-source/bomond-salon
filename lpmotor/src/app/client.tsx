import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";

const root = document.getElementById("root");
if (!root) throw new Error("Bomond root element is missing.");

if (root.firstElementChild) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
