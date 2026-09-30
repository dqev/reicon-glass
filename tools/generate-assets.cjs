#!/usr/bin/env node
/**
 * tools/generate-assets.cjs — Generates LLM context files and SEO assets directly in public/.
 *
 * Generated files:
 *  - apps/web/public/llms.txt
 *  - apps/web/public/llms-full.txt
 *  - apps/web/public/sitemap.xml (index page only)
 *  - apps/web/public/robots.txt
 *
 * Usage: node tools/generate-assets.cjs
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'apps', 'web', 'src', 'data', 'icon-data.json');
const WEB_PUBLIC_DIR = path.join(ROOT, 'apps', 'web', 'public');
const ROOT_PUBLIC_DIR = path.join(ROOT, 'public');

const BASE_URL = 'https://glass.reicon.dev';

function toPascalCase(str) {
  return str
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join('');
}

console.log('Reading apps/web/src/data/icon-data.json for LLM & SEO asset generation...');
if (!fs.existsSync(DATA_PATH)) {
  console.error(`Error: Could not find icon data at ${DATA_PATH}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));

const categoriesMap = {};
const allIconsList = [];
const uniqueIconsMap = new Map();
const pascalLowerSet = new Set();

for (const [catKey, catIcons] of Object.entries(data.categories || {})) {
  const iconEntries = Object.entries(catIcons || {});
  if (iconEntries.length === 0) continue;

  categoriesMap[catKey] = [];

  for (const [iconKey, iconObj] of iconEntries) {
    let pascal = toPascalCase(iconKey);
    if (pascalLowerSet.has(pascal.toLowerCase())) {
      pascal += toPascalCase(catKey);
    }
    pascalLowerSet.add(pascal.toLowerCase());

    const tags = Array.isArray(iconObj.tags) && iconObj.tags.length > 0
      ? iconObj.tags
      : [iconKey.replace(/-/g, ' ')];

    const iconItem = {
      key: iconKey,
      pascal,
      category: catKey,
      tags
    };

    categoriesMap[catKey].push(iconItem);
    allIconsList.push(iconItem);

    if (!uniqueIconsMap.has(iconKey)) {
      uniqueIconsMap.set(iconKey, iconItem);
    }
  }
}

allIconsList.sort((a, b) => a.key.localeCompare(b.key));
const totalIcons = allIconsList.length;
const uniqueIcons = uniqueIconsMap.size;
const totalCategories = Object.keys(categoriesMap).length;
const nowISO = new Date().toISOString();
const nowYYYYMMDD = nowISO.split('T')[0];

console.log(`Found ${totalIcons} icons (${uniqueIcons} unique) across ${totalCategories} categories.`);

// Ensure public directories exist
[WEB_PUBLIC_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Remove legacy agent.json files if present
const legacyFiles = [
  path.join(WEB_PUBLIC_DIR, 'agent.json'),
  path.join(ROOT, 'apps', 'web', 'src', 'data', 'agent.json')
];
legacyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`Removed legacy file: ${file}`);
  }
});

function writePublicFile(filename, content) {
  fs.writeFileSync(path.join(WEB_PUBLIC_DIR, filename), content, 'utf-8');
  if (fs.existsSync(ROOT_PUBLIC_DIR)) {
    fs.writeFileSync(path.join(ROOT_PUBLIC_DIR, filename), content, 'utf-8');
  }
}

// -------------------------------------------------------------
// 1. GENERATE public/llms.txt
// -------------------------------------------------------------
const categorySummaryLines = Object.entries(categoriesMap)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([cat, icons]) => {
    const sampleKeys = icons.slice(0, 8).map(i => `\`${i.key}\``).join(', ');
    const moreCount = icons.length > 8 ? ` +${icons.length - 8} more` : '';
    return `- **${cat}** (${icons.length}): ${sampleKeys}${moreCount}`;
  })
  .join('\n');

const llmsTxtContent = `# Reicon — Free Glass SVG Icons for Designers & Developers

> Official curated rounded SVG & glass icon library built for AI Coding Agents (Cursor, Claude, Copilot, ChatGPT, Antigravity) & modern web developers.

## How Icon Integration Works
Reicon provides free, beautifully designed SVG icons rendered with real-time 3D glass aesthetics. You can copy SVG markup, React JSX components, or CSS styles directly.

### 1. Direct SVG Usage
Embed SVG markup directly into HTML:
\`\`\`html
<svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
  <!-- Icon path code -->
</svg>
\`\`\`

### 2. React JSX Component Pattern
\`\`\`jsx
export function Icon({ size = 24, color = "currentColor", className = "", ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} {...props}>
      {/* Icon path code */}
    </svg>
  );
}
\`\`\`

## Icon Styling Rules for AI Agents
1. **Size Standards**:
   - \`16\`: Micro badges, inline status tags.
   - \`20\`: Buttons, form inputs, compact lists.
   - \`24\`: Default UI navigation, headers, action buttons.
   - \`32\`: Card headers, hero features, highlighted actions.
   - \`48\`: Empty states, landing page hero illustrations.

2. **Coloring Strategy**:
   - \`fill="currentColor"\` (Recommended): Inherits parent element CSS font color automatically. Perfect for dark mode, hover states, and theme switching.
   - Custom hex/hsl: \`fill="#9B8AFB"\` or CSS variables \`fill="var(--accent-color)"\`.

3. **Flex Layout Alignment**:
   \`\`\`html
   <button class="btn">
     <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><!-- ... --></svg>
     <span>Download File</span>
   </button>
   \`\`\`
   CSS: \`.btn { display: inline-flex; align-items: center; gap: 8px; }\`

## Categories Directory (${totalCategories} Categories, ${totalIcons} Total Icons, ${uniqueIcons} Unique)
${categorySummaryLines}

## Links & Resources
- Website: ${BASE_URL}/
- Full Specifications: ${BASE_URL}/llms-full.txt
- GitHub: https://github.com/dqev/reicon-glass
- License: MIT
`;

writePublicFile('llms.txt', llmsTxtContent);

// -------------------------------------------------------------
// 2. GENERATE public/llms-full.txt
// -------------------------------------------------------------
const categoryFullSections = Object.entries(categoriesMap)
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([cat, icons]) => {
    const iconLines = icons
      .map(i => `  - \`${i.key}\` (React: \`<${i.pascal} />\`): ${i.tags.join(', ')}`)
      .join('\n');
    return `### Category: ${cat.toUpperCase()} (${icons.length} icons)\n${iconLines}`;
  })
  .join('\n\n');

const llmsFullTxtContent = `# Reicon — Full LLM Icon Registry & Specifications
Generated: ${nowISO}
Total Icons: ${totalIcons} (${uniqueIcons} unique)
Total Categories: ${totalCategories}

> Complete machine-readable icon registry mapping all Reicon icons to their kebab-case keys, React JSX component names, categories, and descriptive search tags.

---

## 1. Direct SVG & JSX Integration Directives for AI Coding Agents

When building web applications, HTML pages, or React UI components:
1. **Direct SVG / React JSX**: Render icons as clean inline SVGs or reusable React components.
2. **Standard ViewBox**: All icons use standard 24x24 viewBox (\`0 0 24 24\`).
3. **Color Inheritance**: Use \`fill="currentColor"\` or CSS custom properties for dynamic theming.

---

## 2. Complete Icon Registry (${totalIcons} Icons)

${categoryFullSections}

---

## 3. Specifications & Links

- Website: ${BASE_URL}/
- Full LLM Specs: ${BASE_URL}/llms-full.txt
- GitHub: https://github.com/dqev/reicon-glass
- License: MIT
`;

writePublicFile('llms-full.txt', llmsFullTxtContent);

// -------------------------------------------------------------
// 3. GENERATE public/sitemap.xml (Index page only)
// -------------------------------------------------------------
const sitemapXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${BASE_URL}/</loc>
    <lastmod>${nowYYYYMMDD}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

writePublicFile('sitemap.xml', sitemapXmlContent);

// -------------------------------------------------------------
// 4. GENERATE public/robots.txt
// -------------------------------------------------------------
const robotsTxtContent = `# robots.txt for ${BASE_URL}/
User-agent: *
Allow: /

Sitemap: ${BASE_URL}/sitemap.xml
`;

writePublicFile('robots.txt', robotsTxtContent);

console.log(`Successfully generated SEO & LLM assets in apps/web/public/:`);
console.log(`- apps/web/public/llms.txt`);
console.log(`- apps/web/public/llms-full.txt`);
console.log(`- apps/web/public/sitemap.xml (Index page only)`);
console.log(`- apps/web/public/robots.txt`);
