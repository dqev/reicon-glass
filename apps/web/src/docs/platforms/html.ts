import type { PlatformDoc } from "./types";

export const htmlDoc: PlatformDoc = {
  id: "javascript",
  name: "Vanilla JS / CDN",
  badge: "Vanilla JS / CDN",
  tagline: "No framework required. Use via 1-line CDN script tag or DOM element factories in pure JS.",
  pkg: "reicon",
  install: '<script src="https://cdn.jsdelivr.net/npm/reicon/cdn/reicon.js"></script>',
  basicUsage: `<!-- 1-line CDN setup in <head> -->
<script src="https://cdn.jsdelivr.net/npm/reicon/cdn/reicon.js"></script>

<!-- Render anywhere in your HTML -->
<re-icon icon="home" size="24"></re-icon>
<re-icon icon="shield-check" size="32" color="#9B8AFB" weight="filled"></re-icon>
<re-icon icon="alarm" size="28" stroke-width="1.5"></re-icon>`,
  customization: `/* Customize via HTML attributes or CSS classes */
<re-icon icon="home" size="16"></re-icon>
<re-icon icon="heart" color="#ef4444"></re-icon>
<re-icon icon="star" weight="filled"></re-icon>

<style>
  re-icon {
    color: #9B8AFB;
    transition: transform 0.2s ease;
  }
  re-icon:hover {
    transform: scale(1.1);
  }
</style>`,
  directImport: `// NPM Vanilla JS DOM factory usage
import { Home, ShieldCheck } from 'reicon';

const homeElement = Home({ size: 24 });
document.body.appendChild(homeElement);`,
  extraTitle: "Server-Side Rendering (SVG String Output)",
  extraCode: `import { Home } from 'reicon';

// Get raw SVG string in Node.js / Express / Bun
const svgString = Home.toSvg({ size: 24, color: 'currentColor' });
res.send(\`<div class="icon-wrap">\${svgString}</div>\`);`,
  notes: [
    "Zero dependencies. Tiny memory footprint.",
    "Web component registers custom element `<re-icon>` automatically."
  ]
};
