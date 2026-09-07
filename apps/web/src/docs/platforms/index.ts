import type { PlatformDoc } from "./types";
import { docsDoc } from "./docs";
import { reactDoc } from "./react";
import { vueDoc } from "./vue";
import { svelteDoc } from "./svelte";
import { htmlDoc } from "./html";
import { javascriptDoc } from "./javascript";
import { reactNativeDoc } from "./react-native";
import { flutterDoc } from "./flutter";
import { mcpDoc } from "./mcp";
import { vscodeDoc } from "./vscode";
import { antigravityDoc } from "./antigravity";
import { svgDoc } from "./svg";
import { figmaDoc } from "./figma";

export type { PlatformDoc };
export { docsDoc };

export const PLATFORM_DOCS: PlatformDoc[] = [
  docsDoc,
  reactDoc,
  vueDoc,
  svelteDoc,
  htmlDoc,
  javascriptDoc,
  reactNativeDoc,
  flutterDoc,
  mcpDoc,
  vscodeDoc,
  antigravityDoc,
  svgDoc,
  figmaDoc,
];
