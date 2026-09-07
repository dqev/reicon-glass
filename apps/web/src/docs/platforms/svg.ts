import type { PlatformDoc } from "./types";

export const svgDoc: PlatformDoc = {
  id: "svg",
  name: "Raw SVG",
  badge: "Raw SVG",
  tagline: "Clean, optimized raw SVG code for inline embedding, Figma, or custom SVG pipelines.",
  pkg: "raw-svg",
  install: "# No installation needed — copy raw vector markup directly from Explorer",
  basicUsage: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
  <polyline points="9 22 9 12 15 12 15 22" />
</svg>`,
  notes: [
    "Clean 24x24 viewport vector paths.",
    "Ideal for direct HTML embedding, CSS background images, or micro-optimizations."
  ]
};
