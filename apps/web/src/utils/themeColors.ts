export interface ColorOption {
  hex: string;
  name: string;
}

export const COLOR_SHADES: ColorOption[] = [
  { hex: "#9B8AFB", name: "Lavender" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#38BDF8", name: "Sky Cyan" },
  { hex: "#34D399", name: "Emerald" },
  { hex: "#F472B6", name: "Rose Pink" },
  { hex: "#FBBF24", name: "Amber Gold" },
  { hex: "#FF6B6B", name: "Coral Red" },
];

export function getColorPalette(): ColorOption[] {
  return COLOR_SHADES;
}

export function isValidColor(color: string): boolean {
  return COLOR_SHADES.some((c) => c.hex.toLowerCase() === color.toLowerCase());
}

export function getDefaultColor(): string {
  return "#9B8AFB";
}
