import type { PlatformDoc } from "./types";

export const docsDoc: PlatformDoc = {
  id: "docs",
  name: "Select",
  badge: "Select",
  tagline: "Reicon is a free, open-source SVG icon library featuring 2,700+ handcrafted UI icons with native packages for React, Vue, Svelte, Vanilla JS, Flutter, and more.",
  pkg: "reicon",
  install: `# Vanilla JS / Web Component
npm install reicon

# React
npm install reicon-react

# React Native
npm install reicon-react-native

# Vue
npm install reicon-vue

# Svelte
npm install reicon-svelte

# Flutter
flutter pub add reicon_flutter`,
  basicUsage: `<!-- HTML / Web Component Usage (Zero Config via CDN) -->
<script src="https://cdn.jsdelivr.net/npm/reicon/cdn/reicon.js"></script>

<re-icon icon="sparkles" size="24" color="currentColor"></re-icon>
<re-icon icon="user" size="20" stroke-width="2"></re-icon>

<!-- Modern JS / TS DOM Import -->
import { Home, ShieldCheck } from 'reicon';
document.body.appendChild(Home({ size: 24 }));`,
  customization: `/* Customize icon sizing & color in CSS */
re-icon {
  display: inline-flex;
  align-items: center;
  color: var(--accent-color, currentColor);
}

re-icon:hover {
  transform: scale(1.08);
  transition: transform 0.18s ease;
}`,
};
