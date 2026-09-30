// Pure ESM build of the Glass icon renderer.
// Previously this file mixed a UMD wrapper (module.exports / define / globalThis)
// with `export` statements, which causes Vite/Rolldown to warn:
// "The CommonJS `module` variable is treated as a global variable in an
// ECMAScript module". This file is now ESM-only — import it via
// `import Glass from "../vendor/glass/glass.js"`.

// Preset Base Colors
const themes = {
  slate: { name: 'Slate', color: '#64748B' },
  ocean: { name: 'Ocean Blue', color: '#2563EB' },
  ice: { name: 'Ice Blue', color: '#0284C7' },
  midnight: { name: 'Onyx Midnight', color: '#27272A' },
  indigo: { name: 'Indigo Pulse', color: '#4F46E5' },
  violet: { name: 'Deep Violet', color: '#7C3AED' },
  emerald: { name: 'Emerald Teal', color: '#059669' },
  sunset: { name: 'Sunset Berry', color: '#E11D48' },
  amber: { name: 'Warm Amber', color: '#D97706' },
  frost: { name: 'Silver Frost', color: '#94A3B8' }
};

// Color conversion helpers (RGB <-> HSL)
function hexToRgb(hex) {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

function rgbToHex(r, g, b) {
  const toHex = c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, l };
}

function hslToRgb(h, s, l) {
  h /= 360;
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

/**
 * Single-Color Auto-Shading Algorithm
 * Given any single base hex color, computes:
 * - Light Highlight Stop (top specular fill)
 * - Mid Tone Stop (core fill)
 * - Deep Shade Stop (bottom cavity gradient)
 * - Shadow Color (RGBA ambient shadow)
 */
function createPalette(baseHex) {
  const rgb = hexToRgb(baseHex || '#2563EB');
  const { h, s, l } = rgbToHsl(rgb.r, rgb.g, rgb.b);

  // 1. Light Highlight Stop (lighten towards top specular light)
  const lLight = Math.min(0.96, l + (1.0 - l) * 0.65);
  const sLight = Math.max(0.15, s * 0.75);
  const rgbLight = hslToRgb(h, sLight, lLight);

  // 2. Mid Tone Stop
  const lMid = Math.max(0.25, Math.min(0.85, l * 1.02));
  const rgbMid = hslToRgb(h, s, lMid);

  // 3. Deep Shade Stop (darker bottom shade)
  const lDark = Math.max(0.1, l * 0.45);
  const sDark = Math.min(1.0, s * 1.25);
  const rgbDark = hslToRgb(h, sDark, lDark);

  // 4. Ambient Drop Shadow Color
  const lShadow = Math.max(0.04, l * 0.2);
  const sShadow = Math.min(1.0, s * 1.3);
  const rgbShadow = hslToRgb(h, sShadow, lShadow);
  const shadowRgba = `rgba(${Math.round(rgbShadow.r)}, ${Math.round(rgbShadow.g)}, ${Math.round(rgbShadow.b)}, 0.65)`;

  return {
    gradient: [
      rgbToHex(rgbLight.r, rgbLight.g, rgbLight.b),
      rgbToHex(rgbMid.r, rgbMid.g, rgbMid.b),
      rgbToHex(rgbDark.r, rgbDark.g, rgbDark.b)
    ],
    shadow: shadowRgba,
    baseColor: baseHex
  };
}

function generateId(prefix = 'glass') {
  return `${prefix}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Main function to convert any path/SVG code to standalone 3D glassy SVG
 * Accepts:
 * - `options.color`: Single hex color string e.g. '#EF4444' (calculates auto-shading)
 * - `options.theme`: Preset theme key string e.g. 'ocean'
 * - `options.colors`: Explicit 3-stop array [light, mid, deep]
 */
function convert(input, options = {}) {
  if (!input) return '';

  let cleanPath = input.trim();
  if (!cleanPath.includes('<path')) {
    cleanPath = `<path d="${cleanPath}" fill="currentColor"/>`;
  } else if (!cleanPath.includes('fill=')) {
    cleanPath = cleanPath.replace('<path', '<path fill="currentColor"');
  }

  // Determine base color & calculate auto palette
  let palette;
  if (options.color) {
    palette = createPalette(options.color);
  } else if (options.colors && Array.isArray(options.colors)) {
    palette = {
      gradient: options.colors,
      shadow: options.shadow || 'rgba(50, 46, 75, 0.55)'
    };
  } else {
    const themeKey = options.theme || 'slate';
    const themeObj = themes[themeKey] || themes.slate;
    palette = createPalette(themeObj.color);
  }

  const uid = options.id || generateId('glass');
  const size = options.size || 240;
  const colors = palette.gradient;

  // NOTE: no outer drop-shadow on purpose — all shading stays clipped to the
  // glyph alpha via the outer mask, so nothing bleeds onto card backgrounds.
  // Depth comes from the engrave filter (inner cavity + edge light) only.
  return `<svg width="${size}" height="${size}" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" class="glass-icon-glyph">
  <mask id="glyph_${uid}" maskUnits="userSpaceOnUse" x="0" y="0" width="240" height="240" style="mask-type: alpha;">
    <g transform="translate(24 24) scale(8)">
      <g fill="white" color="white">
        <g>${cleanPath}</g>
      </g>
    </g>
  </mask>
  <g mask="url(#glyph_${uid})">
    <g filter="url(#engrave_${uid})">
      <g mask="url(#glyph_${uid})">
        <rect x="0" y="0" width="240" height="240" fill="url(#ink_${uid})"></rect>
      </g>
    </g>
  </g>
  <defs>
    <filter id="engrave_${uid}" x="-50%" y="-50%" width="200%" height="200%" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
      <feFlood flood-opacity="0" result="bg"></feFlood>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix>
      <feMorphology radius="24.2857" operator="erode" in="SourceAlpha"></feMorphology>
      <feOffset dx="14.5714" dy="17"></feOffset>
      <feGaussianBlur stdDeviation="9.71429"></feGaussianBlur>
      <feColorMatrix type="matrix" values="0 0 0 0 0.270757 0 0 0 0 0.230207 0 0 0 0 0.53433 0 0 0 0.35 0"></feColorMatrix>
      <feBlend mode="multiply" in2="bg" result="d1"></feBlend>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"></feColorMatrix>
      <feMorphology radius="24.2857" operator="erode" in="SourceAlpha"></feMorphology>
      <feOffset dx="4.85714" dy="4.85714"></feOffset>
      <feGaussianBlur stdDeviation="2.42857"></feGaussianBlur>
      <feColorMatrix type="matrix" values="0 0 0 0 0.0469801 0 0 0 0 0 0 0 0 0 0.352351 0 0 0 0.25 0"></feColorMatrix>
      <feBlend mode="multiply" in2="d1" result="d2"></feBlend>
      <feBlend mode="normal" in="SourceGraphic" in2="d2" result="shape"></feBlend>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="softTL"></feColorMatrix>
      <feOffset dx="-2.42857" dy="-2.42857"></feOffset>
      <feGaussianBlur stdDeviation="1.21429"></feGaussianBlur>
      <feComposite in2="softTL" operator="arithmetic" k2="-1" k3="1"></feComposite>
      <feColorMatrix type="matrix" values="0 0 0 0 0.130195 0 0 0 0 0.188321 0 0 0 0 0.420823 0 0 0 0.3 0"></feColorMatrix>
      <feBlend mode="normal" in2="shape" result="i1"></feBlend>
      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0" result="softBR"></feColorMatrix>
      <feOffset dx="2.42857" dy="2.42857"></feOffset>
      <feGaussianBlur stdDeviation="1.21429"></feGaussianBlur>
      <feComposite in2="softBR" operator="arithmetic" k2="-1" k3="1"></feComposite>
      <feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.9 0"></feColorMatrix>
      <feBlend mode="normal" in2="i1" result="i2"></feBlend>
    </filter>

    <radialGradient id="ink_${uid}" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(120 80) rotate(70) scale(180 360)">
      <stop stop-color="${colors[0]}"></stop>
      <stop offset="0.5" stop-color="${colors[1]}"></stop>
      <stop offset="1" stop-color="${colors[2]}"></stop>
    </radialGradient>
  </defs>
</svg>`;
}

function render(target, input, options = {}) {
  const svgMarkup = convert(input, options);
  let el = typeof target === 'string' ? document.querySelector(target) : target;
  if (el && el.nodeType) {
    el.innerHTML = svgMarkup;
  }
  return svgMarkup;
}

const Glass = {
  themes: themes,
  createPalette: createPalette,
  convert: convert,
  render: render
};

export default Glass;
export { Glass, themes, createPalette, convert, render };
