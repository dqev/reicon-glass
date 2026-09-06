import { useEffect, useRef } from "react";
import { squirclePath } from "./squircle";

export function useSmoothCorners<T extends HTMLElement>(
  radius: number,
  smoothing = 60,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof CSS === "undefined" ||
      !CSS.supports("clip-path", 'path("M0 0H1V1H0Z")')
    ) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const box = entries[0]?.borderBoxSize?.[0];
      const width = box ? box.inlineSize : el.offsetWidth;
      const height = box ? box.blockSize : el.offsetHeight;
      if (!width || !height) return;
      const d = squirclePath({
        width,
        height,
        radius,
        smoothing: Math.min(Math.max(smoothing, 0), 100) / 100,
      });
      el.style.clipPath = `path("${d}")`;
      el.style.borderRadius = "0px";
    });
    observer.observe(el);

    return () => {
      observer.disconnect();
      if (el) {
        el.style.clipPath = "";
        el.style.borderRadius = "";
      }
    };
  }, [radius, smoothing]);

  return ref;
}
