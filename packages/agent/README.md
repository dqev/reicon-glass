<div align="center">

<br/>
<br/>

<img src="https://reicon.dev/readme-assets/banner.webp" alt="Reicon Agent" width="200" />

<br/>

### Official Reicon Agent core package — 1100+ curated rounded SVG icons built for AI Coding Agents & developers

[![npm](https://img.shields.io/npm/v/reicon-agent?style=flat-square&label=reicon-agent&color=9B8AFB)](https://www.npmjs.com/package/reicon-agent)
[![Docs](https://img.shields.io/badge/Docs-agent.reicon.dev-9B8AFB?style=flat-square)](https://agent.reicon.dev)
[![License](https://img.shields.io/badge/License-MIT-9B8AFB?style=flat-square)](https://github.com/dqev/reicon-agent/blob/main/LICENSE)

</div>

<br/>

## CDN Quickstart

Just include the CDN script in your HTML `<head>`:

```html
<script src="https://cdn.jsdelivr.net/npm/reicon-agent/cdn/reicon.js"></script>

<!-- Use Web Component anywhere -->
<re-icon icon="home" size="24" color="#9B8AFB"></re-icon>
<re-icon icon="search" size="20"></re-icon>
<re-icon icon="arrow-down" size="32" color="#6E54F5"></re-icon>
```

---

## NPM Installation

```bash
npm install reicon-agent
# or
pnpm add reicon-agent
# or
yarn add reicon-agent
```

### Usage in JavaScript / React / Frameworks

```javascript
import { Home, ArrowDown, User } from 'reicon-agent';

// Appends SVG Element directly to DOM
document.body.appendChild(Home({ size: 24, color: '#9B8AFB' }));

// String SVG markup for SSR / React innerHTML:
const svgString = ArrowDown.toSvg({ size: 24, color: '#6E54F5' });
```

---

## Properties & Attributes

| Attribute | Type | Default | Description |
| --- | --- | --- | --- |
| `icon` | `string` | — | Icon kebab-case key (e.g., `home`, `user`, `search`) |
| `size` | `number \| string` | `24` | Icon width and height in pixels |
| `color` | `string` | `currentColor` | Primary SVG stroke/fill color |
| `stroke-width` | `number \| string` | — | Optional stroke width override |

---

## License

Free for commercial and personal use under the [MIT License](https://github.com/dqev/reicon-agent/blob/main/LICENSE).

