export interface ColorOption {
  hex: string;
  name: string;
}

export const DARK_COLOR_SHADES: ColorOption[] = [
  { hex: "#9B8AFB", name: "Lavender" },
  { hex: "#FFFFFF", name: "White" },
  { hex: "#38BDF8", name: "Sky Cyan" },
  { hex: "#34D399", name: "Emerald" },
  { hex: "#F472B6", name: "Rose Pink" },
  { hex: "#FBBF24", name: "Amber Gold" },
  { hex: "#FF6B6B", name: "Coral Red" },
];

export const LIGHT_COLOR_SHADES: ColorOption[] = [
  { hex: "#9B8AFB", name: "Lavender" },
  { hex: "#09090B", name: "Charcoal" },
  { hex: "#0284C7", name: "Sky Cyan" },
  { hex: "#059669", name: "Emerald" },
  { hex: "#E11D48", name: "Rose Pink" },
  { hex: "#D97706", name: "Amber Gold" },
  { hex: "#DC2626", name: "Coral Red" },
];

export function getColorPalette(theme: "dark" | "light"): ColorOption[] {
  return theme === "light" ? LIGHT_COLOR_SHADES : DARK_COLOR_SHADES;
}

export function isValidColorForTheme(color: string, theme: "dark" | "light"): boolean {
  const palette = getColorPalette(theme);
  return palette.some((c) => c.hex.toLowerCase() === color.toLowerCase());
}

export function getDefaultColorForTheme(theme: "dark" | "light"): string {
  return "#9B8AFB";
}

