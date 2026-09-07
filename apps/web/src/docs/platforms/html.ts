import type { PlatformDoc } from "./types";

export const htmlDoc: PlatformDoc = {
  id: "html",
  name: "HTML",
  badge: "HTML / CDN",
  tagline: "No build step required. Drop the 1-line CDN script tag into <head> and use <re-icon> anywhere in HTML.",
  pkg: "reicon-agent",
  install: '<script src="https://cdn.jsdelivr.net/npm/reicon-agent/cdn/reicon.js"></script>',
  basicUsage: `<!-- 1-line CDN setup in <head> -->
<script src="https://cdn.jsdelivr.net/npm/reicon-agent/cdn/reicon.js"></script>

<!-- Render anywhere in your HTML -->
<re-icon icon="home" size="24"></re-icon>
<re-icon icon="shield-check" size="32" color="#9B8AFB" weight="filled"></re-icon>
<re-icon icon="alarm" size="28" stroke-width="1.5"></re-icon>`,
  customization: `<!-- Customize via HTML attributes or CSS classes -->
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
  notes: [
    "Zero build step required. Works in plain HTML5 files.",
    "Web component registers custom element <re-icon> automatically."
  ]
};
