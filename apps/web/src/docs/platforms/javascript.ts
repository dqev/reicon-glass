import type { PlatformDoc } from "./types";

export const javascriptDoc: PlatformDoc = {
  id: "javascript",
  name: "JavaScript",
  badge: "Vanilla JS / NPM",
  tagline: "Pure JavaScript integration using the reicon-agent npm package for bundlers, Node.js, and ES modules.",
  pkg: "reicon-agent",
  install: "npm i reicon-agent",
  basicUsage: `// Import reicon-agent package in your JS entry file (Vite, Webpack, Node, etc.)
import "reicon-agent";

// Create DOM element programmatically
const icon = document.createElement("re-icon");
icon.setAttribute("icon", "home");
icon.setAttribute("size", "24");
icon.setAttribute("color", "#9B8AFB");

document.body.appendChild(icon);`,
  customization: `// Dynamic DOM helper in Vanilla JS
function createIconElement(name: string, size = 24, color = "currentColor") {
  const icon = document.createElement("re-icon");
  icon.setAttribute("icon", name);
  icon.setAttribute("size", size.toString());
  icon.setAttribute("color", color);
  return icon;
}

const container = document.getElementById("app");
if (container) {
  container.appendChild(createIconElement("sparkles", 32, "#9B8AFB"));
}`,
  directImport: `// Direct runtime API query in JS
if (window.ReiconAgent?.getIconCode) {
  const svgCode = window.ReiconAgent.getIconCode("sparkles");
  console.log("Raw SVG Code:", svgCode);
}`,
  notes: [
    "Tree-shakeable and zero external runtime dependencies.",
    "Full DOM programmatic API for dynamic rendering in Vanilla JS applications."
  ]
};
