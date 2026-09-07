import type { PlatformDoc } from "./types";

export const vscodeDoc: PlatformDoc = {
  id: "vscode",
  name: "VS Code Extension",
  badge: "VS Code",
  tagline: "Autocompletion, inline hover previews, and instant icon insertion in VS Code.",
  pkg: "reicon-vscode",
  install: "code --install-extension dqev.reicon-vscode",
  basicUsage: `1. Press Cmd+Shift+P (or Ctrl+Shift+P)
2. Type "Reicon: Search & Insert Icon"
3. Select icon to copy component code or SVG inline!`,
  notes: [
    "Inline hover previews inside TSX, Vue, and Svelte templates.",
    "Intellisense auto-suggestions for all 2,600+ icon names."
  ]
};
