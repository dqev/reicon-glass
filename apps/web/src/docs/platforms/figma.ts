import type { PlatformDoc } from "./types";

export const figmaDoc: PlatformDoc = {
  id: "figma",
  name: "Figma Library",
  badge: "Figma",
  tagline: "Official Figma component library for UI designers with 2,600+ icons in Outline & Filled variants.",
  pkg: "figma-library",
  install: "Open Figma -> Community -> Search 'Reicon Icon Library' -> Duplicate to Drafts",
  basicUsage: `1. Open Reicon Component Library in Figma
2. Publish as Team Library or copy components directly to your design file
3. Switch icon variants seamlessly using Component Variant properties (Style: Outline / Filled)`,
  notes: [
    "Pixel-perfect grid alignment.",
    "1:1 name parity with reicon npm packages."
  ]
};
