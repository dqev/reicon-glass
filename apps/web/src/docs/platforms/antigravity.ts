import type { PlatformDoc } from "./types";

export const antigravityDoc: PlatformDoc = {
  id: "antigravity",
  name: "Antigravity",
  badge: "Antigravity",
  tagline: "Official Reicon icon extension for Google Antigravity & Open VSX registry.",
  pkg: "dqev.reicon",
  install: "code --install-extension dqev.reicon",
  basicUsage: `1. Open Extension Manager in Antigravity or VSCodium
2. Search "dqev.reicon" or install via terminal:
   code --install-extension dqev.reicon
3. Press Cmd+Shift+P (or Ctrl+Shift+P) and search "Reicon: Insert Icon"`,
  customization: `// Open VSX Item URL:
// https://open-vsx.org/vscode/item?itemName=dqev.reicon`,
  notes: [
    "Inline hover previews inside TSX, JSX, Vue, Svelte, and HTML templates.",
    "Intellisense auto-suggestions for all 2,700+ icon names.",
    "Full compatibility with Google Antigravity, Cursor, and VSCodium editors via Open VSX."
  ]
};
