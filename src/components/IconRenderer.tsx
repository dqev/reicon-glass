import React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "re-icon": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        icon?: string;
        size?: number | string;
        color?: string;
        "stroke-width"?: number | string;
        [key: string]: any;
      };
    }
  }

  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        "re-icon": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
          icon?: string;
          size?: number | string;
          color?: string;
          "stroke-width"?: number | string;
          [key: string]: any;
        };
      }
    }
  }
}

export interface IconRendererProps {
  name: string;
  size?: number;
  weight?: "outline" | "filled";
  color?: string;
  strokeWidth?: number;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function toKebabCase(str: string): string {
  if (!str) return "";
  if (str.includes("-")) return str.toLowerCase();
  return str
    .replace(/([a-z])([A-Z0-9])/g, "$1-$2")
    .replace(/([0-9])([a-zA-Z])/g, "$1-$2")
    .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();
}

export const IconRenderer = React.memo(function IconRenderer({
  name,
  size = 24,
  color = "currentColor",
  strokeWidth,
  rotation = 0,
  flipH = false,
  flipV = false,
  className = "",
  style = {},
}: IconRendererProps) {
  const kebabName = toKebabCase(name);

  const transformParts: string[] = [];
  if (rotation) transformParts.push(`rotate(${rotation}deg)`);
  if (flipH) transformParts.push("scaleX(-1)");
  if (flipV) transformParts.push("scaleY(-1)");

  const combinedStyle: React.CSSProperties = {
    transform: transformParts.length > 0 ? transformParts.join(" ") : undefined,
    color,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "transform 0.15s ease",
    ...style,
  };

  return (
    <div style={combinedStyle} className={className}>
      <re-icon
        icon={kebabName}
        size={size}
        color={color}
        {...(strokeWidth != null ? { "stroke-width": strokeWidth } : {})}
      ></re-icon>
    </div>
  );
});
