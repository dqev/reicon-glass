#!/usr/bin/env node
/**
 * build.cjs — Generates `reicon-agent` ESM/UMD/CDN package from root icons.json
 *
 * Usage: node scripts/build.cjs  (or npm run build)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(__dirname, '..', '..', 'data', 'icons.json');
const SRC = path.join(__dirname, '..', 'src');
const DIST = path.join(__dirname, '..', 'dist');

function toPascalCase(str) {
  return str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

function stripSvgWrapper(code) {
  if (!code) return '';
  return code
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')
    .replace(/>\s+</g, '><')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeForJS(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

console.log('Reading root icons.json …');
const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

const icons = [];
const pascalLowerSet = new Set();

for (const [catKey, catData] of Object.entries(data.categories || {})) {
  for (const [iconKey, icon] of Object.entries(catData.icons || {})) {
    let pascal = toPascalCase(iconKey);

    if (pascalLowerSet.has(pascal.toLowerCase())) {
      pascal += toPascalCase(catKey);
    }
    pascalLowerSet.add(pascal.toLowerCase());

    const innerCode = stripSvgWrapper(icon.code || '');
    if (innerCode) {
      icons.push({
        kebab: iconKey,
        pascal,
        category: catKey,
        code: innerCode,
        description: Array.isArray(icon.description) ? icon.description : [icon.description || '']
      });
    }
  }
}

icons.sort((a, b) => a.pascal.localeCompare(b.pascal));
console.log(`Found ${icons.length} curated icons`);

// Auto-generate data/icons-state.json & data/icon-names.json on build
const DATA_DIR = path.join(ROOT, '..', 'data');
const categoryCounts = {};
const iconNames = icons.map(i => i.kebab).sort();

for (const icon of icons) {
  categoryCounts[icon.category] = (categoryCounts[icon.category] || 0) + 1;
}

const iconsState = {
  totalIcons: icons.length,
  totalCategories: Object.keys(categoryCounts).length,
  updatedAt: new Date().toISOString(),
  categoryCounts
};

fs.writeFileSync(path.join(DATA_DIR, 'icons-state.json'), JSON.stringify(iconsState, null, 2));
fs.writeFileSync(path.join(DATA_DIR, 'icon-names.json'), JSON.stringify(iconNames, null, 2));
console.log(`Generated data/icons-state.json & data/icon-names.json with ${icons.length} icons.`);

// Clean & prepare src/icons/
fs.rmSync(path.join(SRC, 'icons'), { recursive: true, force: true });
fs.mkdirSync(path.join(SRC, 'icons'), { recursive: true });

const barrelExports = [];
const dtsExports = [];

for (const icon of icons) {
  const kebab = icon.kebab;
  const escapedCode = escapeForJS(icon.code);

  const iconJS = `import createIcon from '../createIcon.js';

/**
 * @name ${icon.pascal}
 * @description Reicon Agent SVG icon function.
 * @param {import('../createIcon').IconOptions} [options] - Options
 * @returns {SVGSVGElement} SVG Element
 */
const ${icon.pascal} = createIcon('${icon.pascal}', \`${escapedCode}\`);

export { ${icon.pascal} };
export default ${icon.pascal};
`;

  fs.writeFileSync(path.join(SRC, 'icons', `${icon.pascal}.js`), iconJS);

  const iconDTS = `import { IconFunction } from '../createIcon';

/**
 * @name ${icon.pascal}
 * @description Reicon Agent SVG icon function.
 * @param {import('../createIcon').IconOptions} [options] - Options
 * @returns {SVGSVGElement} SVG Element
 */
declare const ${icon.pascal}: IconFunction;
export { ${icon.pascal} };
export default ${icon.pascal};
`;

  fs.writeFileSync(path.join(SRC, 'icons', `${icon.pascal}.d.ts`), iconDTS);

  barrelExports.push(`export { ${icon.pascal} } from './icons/${icon.pascal}.js';`);
  dtsExports.push(`export { ${icon.pascal} } from './icons/${icon.pascal}.js';`);
}

// index.js & index.d.ts in src/
const indexJS = `// Auto-generated barrel — do not edit
export { createIcon } from './createIcon.js';

${barrelExports.join('\n')}
`;
fs.writeFileSync(path.join(SRC, 'index.js'), indexJS);

const indexDTS = `// Auto-generated — do not edit
export { createIcon, IconOptions, IconFunction } from './createIcon';

${dtsExports.join('\n')}
`;
fs.writeFileSync(path.join(SRC, 'index.d.ts'), indexDTS);

// Prepare dist/
console.log('Preparing production build in dist/ …');
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(path.join(DIST, 'icons'), { recursive: true });

fs.copyFileSync(path.join(SRC, 'createIcon.js'), path.join(DIST, 'createIcon.js'));
fs.copyFileSync(path.join(SRC, 'createIcon.d.ts'), path.join(DIST, 'createIcon.d.ts'));
fs.copyFileSync(path.join(SRC, 'index.js'), path.join(DIST, 'index.js'));
fs.copyFileSync(path.join(SRC, 'index.d.ts'), path.join(DIST, 'index.d.ts'));

for (const icon of icons) {
  fs.copyFileSync(path.join(SRC, 'icons', `${icon.pascal}.js`), path.join(DIST, 'icons', `${icon.pascal}.js`));
  fs.copyFileSync(path.join(SRC, 'icons', `${icon.pascal}.d.ts`), path.join(DIST, 'icons', `${icon.pascal}.d.ts`));
}

// UMD Bundle
fs.mkdirSync(path.join(DIST, 'umd'), { recursive: true });
const umdEntries = icons
  .map(icon => `  ${icon.pascal}: createIcon('${icon.pascal}', \`${escapeForJS(icon.code)}\`)`)
  .join(',\n');

const umdBundle = `(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.ReiconAgent = {}));
})(this, (function (exports) { 'use strict';

  function escAttr(v) { return String(v).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  function createIcon(displayName, codeString) {
    var icon = function(options) {
      options = options || {};
      var color = options.color;
      var size = options.size || 24;
      var strokeWidth = options.strokeWidth;
      var className = options.className;
      var attrs = options.attrs || {};

      var html = codeString || '';
      if (strokeWidth != null) {
        html = html.replace(/stroke-width="[^"]*"/g, 'stroke-width="' + strokeWidth + '"');
      }

      if (typeof document === 'undefined') return null;

      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      svg.setAttribute('width', String(size));
      svg.setAttribute('height', String(size));
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('fill', 'none');
      svg.setAttribute('class', className ? 'reicon-agent ' + className : 'reicon-agent');
      if (color != null) svg.style.color = color;

      var keys = Object.keys(attrs);
      for (var i = 0; i < keys.length; i++) {
        svg.setAttribute(keys[i], String(attrs[keys[i]]));
      }

      svg.innerHTML = html;
      return svg;
    };

    icon.displayName = displayName;
    icon.iconCode = codeString;
    icon.toSvg = function(options) {
      options = options || {};
      var color = options.color;
      var size = options.size || 24;
      var className = options.className;
      var attrs = options.attrs || {};
      var extraAttrs = Object.keys(attrs).map(function(k) { return escAttr(k) + '="' + escAttr(attrs[k]) + '"'; }).join(' ');
      var styleAttr = color != null ? ' style="color: ' + escAttr(color) + '"' : '';
      return '<svg xmlns="http://www.w3.org/2000/svg" width="' + escAttr(size) + '" height="' + escAttr(size) + '" viewBox="0 0 24 24" fill="none" class="' + escAttr(className ? 'reicon-agent ' + className : 'reicon-agent') + '"' + styleAttr + (extraAttrs ? ' ' + extraAttrs : '') + '>' + codeString + '</svg>';
    };

    return icon;
  }

  exports.createIcon = createIcon;

  var iconsMap = {\n${umdEntries}\n  };

  var iconNames = Object.keys(iconsMap);
  for (var i = 0; i < iconNames.length; i++) {
    exports[iconNames[i]] = iconsMap[iconNames[i]];
  }

}));
`;

fs.writeFileSync(path.join(DIST, 'umd', 'reicon-agent.js'), umdBundle);

// CDN Web Component Bundle
fs.mkdirSync(path.join(DIST, 'cdn'), { recursive: true });

const cdnIconsMap = {};
for (const icon of icons) {
  cdnIconsMap[icon.kebab] = icon.code;
}

const cdnRuntimeJS = `/*!
 * reicon-agent CDN — drop-in Web Component for 1100+ curated icons.
 * Usage: <re-icon icon="home" size="24" color="#9B8AFB"></re-icon>
 *     or <re-icon-agent icon="home" size="24" color="#9B8AFB"></re-icon-agent>
 */
(function (global) {
  'use strict';

  var ICONS = ${JSON.stringify(cdnIconsMap)};

  class ReiconAgentElement extends HTMLElement {
    static get observedAttributes() {
      return ['icon', 'size', 'color', 'stroke-width', 'class'];
    }

    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
      this._render();
    }

    attributeChangedCallback() {
      this._render();
    }

    _render() {
      var iconName = this.getAttribute('icon');
      var size = this.getAttribute('size') || '24';
      var color = this.getAttribute('color') || 'currentColor';
      var strokeWidth = this.getAttribute('stroke-width');

      if (size && !size.endsWith('px') && !size.endsWith('%') && !size.endsWith('rem') && !size.endsWith('em')) {
        size = size + 'px';
      }

      var code = ICONS[iconName] || '';
      if (!code && iconName) {
        // Fallback search without numbers or hyphens
        var alt = iconName.replace(/-\\d+$/, '');
        code = ICONS[alt] || '';
      }

      if (strokeWidth && code) {
        code = code.replace(/stroke-width="[^"]*"/g, 'stroke-width="' + strokeWidth + '"');
      }

      this.shadowRoot.innerHTML =
        '<style>' +
        ':host{display:inline-flex;align-items:center;justify-content:center;width:' + size + ';height:' + size + ';color:' + color + ';line-height:0;}' +
        'svg{width:100%;height:100%;display:block;}' +
        '</style>' +
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">' +
        (code || '<circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2"/>') +
        '</svg>';
    }
  }

  if (!customElements.get('re-icon-agent')) {
    customElements.define('re-icon-agent', ReiconAgentElement);
  }
  if (!customElements.get('re-icon')) {
    customElements.define('re-icon', class extends ReiconAgentElement {});
  }

  global.ReiconAgent = {
    icons: Object.keys(ICONS),
    getIconCode: function(name) { return ICONS[name] || null; }
  };
})(typeof window !== 'undefined' ? window : globalThis);
`;

fs.writeFileSync(path.join(DIST, 'cdn', 'reicon.js'), cdnRuntimeJS);

// Generate dist/package.json for publishing directly from dist/
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8'));
delete pkg.scripts;
delete pkg.devDependencies;
delete pkg.files;

pkg.main = "./index.js";
pkg.module = "./index.js";
pkg.types = "./index.d.ts";
pkg.unpkg = "./cdn/reicon.js";
pkg.jsdelivr = "./cdn/reicon.js";
pkg.browser = "./cdn/reicon.js";
pkg.exports = {
  ".": {
    "import": "./index.js",
    "types": "./index.d.ts"
  },
  "./icons/*": {
    "import": "./icons/*.js",
    "types": "./icons/*.d.ts"
  },
  "./createIcon": {
    "import": "./createIcon.js",
    "types": "./createIcon.d.ts"
  },
  "./umd/reicon.js": {
    "import": "./umd/reicon-agent.js"
  },
  "./cdn/reicon.js": {
    "import": "./cdn/reicon.js"
  },
  "./cdn/*": {
    "import": "./cdn/*.js"
  }
};

fs.writeFileSync(path.join(DIST, 'package.json'), JSON.stringify(pkg, null, 2));

// Copy README.md to dist/README.md
if (fs.existsSync(path.join(ROOT, 'README.md'))) {
  fs.copyFileSync(path.join(ROOT, 'README.md'), path.join(DIST, 'README.md'));
}

console.log('Build completed successfully in dist/! Ready to publish via `npm publish ./dist`.');
