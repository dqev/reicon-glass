export interface IconMetaItem {
  name: string;
  kebab: string;
  category: string;
  keywords: string[];
  code: string;
}

const ICON_CODE_MAP = new Map<string, string>();
let parsedIcons: IconMetaItem[] = [];
let loaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

export function toKebabCase(str: string): string {
  if (!str) return "";
  if (str.includes("-")) return str.toLowerCase();
  return str
    .replace(/([a-z])([A-Z0-9])/g, "$1-$2")
    .replace(/([0-9])([a-zA-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

function titleCase(key: string): string {
  return key
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function ingest(iconData: unknown): void {
  ICON_CODE_MAP.clear();
  const next: IconMetaItem[] = [];
  const categories = (iconData as { categories?: Record<string, Record<string, { tags?: unknown; code?: unknown }>> })
    ?.categories;
  if (categories) {
    Object.entries(categories).forEach(([catKey, iconsMap]) => {
      const categoryName = titleCase(catKey);
      Object.entries(iconsMap).forEach(([kebabKey, iconObj]) => {
        const pascalName = titleCase(kebabKey).replace(/ /g, "");
        const keywords = Array.isArray(iconObj.tags) ? (iconObj.tags as string[]) : [kebabKey];
        const code = typeof iconObj.code === "string" ? iconObj.code : "";
        ICON_CODE_MAP.set(kebabKey, code);
        next.push({ name: pascalName, kebab: kebabKey, category: categoryName, keywords, code });
      });
    });
  }
  parsedIcons = next;
  loaded = true;
  listeners.forEach((fn) => fn());
}

// Loads the icon bundle as a separate chunk so first paint isn't blocked by
// ~3.5MB of icon data. Safe to call repeatedly; loads once.
export function initIcons(): Promise<void> {
  if (loadPromise) return loadPromise;
  loadPromise = import("../data/icon-data.bundle.json").then((mod) => {
    ingest((mod as { default?: unknown }).default ?? mod);
  });
  return loadPromise;
}

export function iconsLoaded(): boolean {
  return loaded;
}

export function subscribeIcons(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getAllIcons(): IconMetaItem[] {
  return parsedIcons;
}

export function getIconCode(kebab: string): string {
  return ICON_CODE_MAP.get(kebab) || "";
}

export function getIconCodeForCategory(kebab: string, category: string): string {
  const found = parsedIcons.find((i) => i.kebab === kebab && i.category === category);
  if (found) return found.code;
  return ICON_CODE_MAP.get(kebab) || "";
}

export function getIconMeta(kebab: string, category: string): IconMetaItem | undefined {
  return parsedIcons.find((i) => i.kebab === kebab && i.category === category);
}
