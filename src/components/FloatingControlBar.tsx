import { motion, useReducedMotion } from "framer-motion";
import { getColorPalette } from "../utils/themeColors";
import { playClickSound } from "../utils/sound";

export function FloatingControlBar({
  size,
  onSizeChange,
  color,
  onColorChange,
  theme = "dark",
  hidden = false,
}: {
  size: number;
  onSizeChange: (s: number) => void;
  color: string;
  onColorChange: (c: string) => void;
  theme?: "dark" | "light";
  hidden?: boolean;
}) {
  const reduced = useReducedMotion();
  const colorShades = getColorPalette(theme);
  const activeIndex = colorShades.findIndex(
    (s) => s.hex.toLowerCase() === color.toLowerCase()
  );
  const activeShade = activeIndex >= 0 ? colorShades[activeIndex] : colorShades[0];

  const handleCycleColor = () => {
    playClickSound();
    const nextIndex = (activeIndex + 1) % colorShades.length;
    onColorChange(colorShades[nextIndex].hex);
  };

  return (
    <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2">
      <motion.div
        animate={{ y: hidden ? 16 : 0, opacity: hidden ? 0 : 1 }}
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
        }
        aria-hidden={hidden}
        style={{ pointerEvents: hidden ? "none" : "auto" }}
      >
        <fieldset
          aria-label="Icon Size and Accent Control"
          className="flex items-center gap-1 rounded-full bg-[var(--bg-card)] p-1.5 backdrop-blur-2xl border border-[var(--border-subtle)] shadow-xl select-none"
        >
          {/* Mobile Size options container (visible on mobile < sm) */}
          <div className="sm:hidden flex items-center gap-0.5">
            {[38, 48, 58].map((s) => {
              const active = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playClickSound();
                    onSizeChange(s);
                  }}
                  className={`relative flex cursor-pointer items-center gap-1 rounded-full py-1.5 px-2.5 text-[11px] font-mono font-[550] leading-none transition-colors motion-safe:active:scale-[0.97] ${
                    active ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="float-size-mobile"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-[var(--bg-btn-hover)]"
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 480, damping: 40 }
                      }
                    />
                  )}
                  <span className="relative z-[1]">{s}px</span>
                </button>
              );
            })}
          </div>

          {/* Desktop Size options container (visible on desktop >= sm) */}
          <div className="hidden sm:flex items-center gap-0.5">
            {[48, 64, 84].map((s) => {
              const active = s === size;
              return (
                <button
                  key={s}
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    playClickSound();
                    onSizeChange(s);
                  }}
                  className={`relative flex cursor-pointer items-center gap-1 rounded-full py-1.5 px-3 text-xs font-mono font-[550] leading-none transition-colors motion-safe:active:scale-[0.97] ${
                    active ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="float-size-desktop"
                      aria-hidden="true"
                      className="absolute inset-0 rounded-full bg-[var(--bg-btn-hover)]"
                      transition={
                        reduced
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 480, damping: 40 }
                      }
                    />
                  )}
                  <span className="relative z-[1]">{s}px</span>
                </button>
              );
            })}
          </div>

          {/* Separator */}
          <div className="h-4 w-px bg-[var(--border-medium)] my-auto mx-1" />

          {/* Accent Color Swatch Toggle - Fixed width so pill size never shifts */}
          <button
            type="button"
            onClick={handleCycleColor}
            className="relative flex w-[96px] cursor-pointer items-center gap-2 rounded-full py-1.5 px-3 text-xs font-[550] leading-none transition-colors text-[var(--text-primary)] hover:bg-[var(--bg-btn)] motion-safe:active:scale-[0.97]"
            title="Click to cycle accent color"
          >
            <span
              className="size-3.5 shrink-0 rounded-full border border-[var(--border-medium)] transition-transform shadow-sm"
              style={{ backgroundColor: activeShade.hex }}
            />
            <span className="truncate">{activeShade.name}</span>
          </button>
        </fieldset>
      </motion.div>
    </div>
  );
}
