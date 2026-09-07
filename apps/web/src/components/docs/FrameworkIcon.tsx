const LOGO_MAP: Record<string, string> = {
  javascript: "/framework-logos/js.svg",
  react: "/framework-logos/react.svg",
  "react-native": "/framework-logos/react-native.svg",
  vue: "/framework-logos/vue.svg",
  svelte: "/framework-logos/svelte.svg",
  flutter: "/framework-logos/flutter.svg",
  figma: "/framework-logos/figma.svg",
  vscode: "/framework-logos/vscode.svg",
  mcp: "/framework-logos/mcp.svg",
  svg: "/framework-logos/js.svg",
  docs: "/assets/favicon.svg",
};

export function FrameworkIcon({ id, size = 18 }: { id: string; size?: number }) {
  const src = LOGO_MAP[id] || LOGO_MAP.javascript;
  return (
    <img
      src={src}
      alt={`${id} logo`}
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        display: "block",
        flexShrink: 0,
      }}
    />
  );
}
