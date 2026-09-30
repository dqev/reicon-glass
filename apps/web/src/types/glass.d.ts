interface GlassConverter {
  convert(
    input: string,
    options?: {
      color?: string;
      theme?: string;
      colors?: string[];
      shadow?: string;
      size?: number;
      id?: string;
    },
  ): string;
  render(target: unknown, input: string, options?: Record<string, unknown>): string;
  createPalette?(baseHex: string): { gradient: string[]; shadow: string; baseColor: string };
  themes?: Record<string, { name: string; color: string }>;
}

declare module "*.js" {
  const value: any;
  export default value;
}

declare module "../vendor/glass/glass.js" {
  const Glass: GlassConverter;
  export default Glass;
}

declare module "../../vendor/glass/glass.js" {
  const Glass: GlassConverter;
  export default Glass;
}
