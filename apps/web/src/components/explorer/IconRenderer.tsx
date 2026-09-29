import React, { useEffect, useMemo, useRef, useState } from "react";
import { getIconCode } from "../../utils/iconDataLoader";
import { getGlassSvg } from "../../utils/glassCache";

export interface IconRendererProps {
  name: string;
  code?: string;
  size?: number;
  weight?: "outline" | "filled";
  color?: string;
  strokeWidth?: number;
  rotation?: number;
  flipH?: boolean;
  flipV?: boolean;
  className?: string;
  style?: React.CSSProperties;
  lazy?: boolean;
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

function useInView<T extends HTMLElement>(enabled: boolean, rootMargin = "400px"): [React.RefObject<T | null>, boolean] {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(() => !enabled);
  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    if (inView) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { rootMargin },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [enabled, rootMargin, inView]);
  return [ref, inView];
}

export const IconRenderer = React.memo(function IconRenderer({
  name,
  code,
  size = 48,
  color = "#9B8AFB",
  rotation = 0,
  flipH = false,
  flipV = false,
  className = "",
  style = {},
  lazy = true,
}: IconRendererProps) {
  const kebabName = toKebabCase(name);
  const rawCode = code || getIconCode(kebabName);
  const [viewRef, inView] = useInView<HTMLDivElement>(lazy);

  const glassSvg = useMemo(() => {
    if (!rawCode || (lazy && !inView)) return "";
    return getGlassSvg(rawCode, kebabName, color, size);
  }, [rawCode, kebabName, color, size, lazy, inView]);

  const transformParts: string[] = [];
  if (rotation) transformParts.push(`rotate(${rotation}deg)`);
  if (flipH) transformParts.push("scaleX(-1)");
  if (flipV) transformParts.push("scaleY(-1)");

  const combinedStyle: React.CSSProperties = useMemo(
    () => ({
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      width: size,
      height: size,
      ...(transformParts.length > 0 ? { transform: transformParts.join(" ") } : null),
      ...style,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rotation, flipH, flipV, size, JSON.stringify(style)],
  );

  if (!glassSvg) {
    return (
      <div ref={viewRef} style={combinedStyle} className={className}>
        <re-icon icon={kebabName} size={size} color={color} />
      </div>
    );
  }

  return (
    <div
      ref={viewRef}
      style={combinedStyle}
      className={className}
      dangerouslySetInnerHTML={{ __html: glassSvg }}
    />
  );
});
