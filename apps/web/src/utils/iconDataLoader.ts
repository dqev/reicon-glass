import iconData from "../data/icon-data.json";

export interface IconMetaItem {
  name: string;
  kebab: string;
  category: string;
  keywords: string[];
  code: string;
}

const ICON_CODE_MAP = new Map<string, string>();
const parsedIcons: IconMetaItem[] = [];

if (iconData && (iconData as any).categories) {
  Object.entries((iconData as any).categories).forEach(([catKey, iconsMap]: [string, any]) => {
    const categoryName = catKey
      .split("-")
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");

    Object.entries(iconsMap).forEach(([kebabKey, iconObj]: [string, any]) => {
      const pascalName = kebabKey
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");
      
      const keywords = Array.isArray(iconObj.tags) ? iconObj.tags : [kebabKey];
      const code = iconObj.code || "";

      ICON_CODE_MAP.set(kebabKey, code);
      parsedIcons.push({
        name: pascalName,
        kebab: kebabKey,
        category: categoryName,
        keywords,
        code,
      });
    });
  });
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
