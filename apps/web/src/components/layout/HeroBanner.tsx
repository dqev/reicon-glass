import type { RefObject } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { IconRenderer } from "../explorer/IconRenderer";
import reiconSvg from "../../../public/assets/reicon.svg?raw";

const HERO_ICONS: Array<{ kebab: string; size: number; code?: string }> = [
  { kebab: "sparkles", size: 30 },
  { kebab: "heart", size: 38 },
  { kebab: "reicon-logo", size: 46, code: reiconSvg },
  { kebab: "rocket", size: 38 },
  { kebab: "crown", size: 30 },
];

export function HeroHeaderBanner(_props?: {
  color?: string;
  onCopyNotice?: (msg: string) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}) {
  const color = _props?.color || "#9B8AFB";
  const reduced = useReducedMotion();

  return (
    <div className="flex flex-col items-center text-center gap-5 sm:gap-6 py-10 sm:py-16 select-none">
      {/* Glass icon strip — same accent color as the grid */}
      <div className="flex items-end justify-center gap-2 sm:gap-3" aria-hidden="true">
        {HERO_ICONS.map((icon, i) => (
          <motion.span
            key={icon.kebab}
            className="inline-flex"
            animate={reduced ? undefined : { y: [0, -6, 0] }}
            transition={
              reduced
                ? { duration: 0 }
                : { duration: 3 + i * 0.45, repeat: Infinity, ease: "easeInOut" }
            }
          >
            <IconRenderer name={icon.kebab} code={icon.code} size={icon.size} color={color} lazy={false} />
          </motion.span>
        ))}
      </div>

      <h1 className="text-lg sm:text-2xl font-[550] leading-[1.4] tracking-[-0.3px] text-[var(--text-primary)] flex flex-col items-center gap-1.5 sm:gap-2 text-center">
        <span>Glass Icons For</span>
        <span className="text-[var(--text-secondary)]">Designers &amp; Developers</span>
      </h1>
    </div>
  );
}
