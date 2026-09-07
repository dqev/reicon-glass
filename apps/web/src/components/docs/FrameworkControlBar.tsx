import { memo } from "react";
import { getColorPalette } from "../../utils/themeColors";
import { playClickSound } from "../../utils/sound";

export interface FrameworkControlBarProps {
  color?: string;
  onColorChange?: (c: string) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  searchInputRef?: React.RefObject<any>;
  onOpenCmdk?: () => void;
}

export const FrameworkControlBar = memo(function FrameworkControlBar({
  color = "#9B8AFB",
  onColorChange,
  search = "",
  onSearchChange,
  searchInputRef,
  onOpenCmdk,
}: FrameworkControlBarProps) {
  const colorShades = getColorPalette();
  const activeColorIndex = colorShades.findIndex(
    (s) => s.hex.toLowerCase() === color.toLowerCase()
  );
  const activeShade = activeColorIndex >= 0 ? colorShades[activeColorIndex] : colorShades[0];

  const handleCycleColor = () => {
    playClickSound();
    const nextIndex = (activeColorIndex + 1) % colorShades.length;
    if (onColorChange) {
      onColorChange(colorShades[nextIndex].hex);
    }
  };

  return (
    <div className="flex flex-col gap-2.5 w-full pb-1 relative z-30 select-none">
      {/* SEARCH BAR + COLOR SWATCH (Single row on Mobile & Desktop) */}
      <div className="flex items-center gap-2 w-full">
        {/* SEARCH BAR */}
        {onSearchChange && (
          <div className="relative flex h-8.5 sm:h-10 flex-1 max-w-full sm:max-w-md items-center gap-2.5 sm:gap-3 rounded-full bg-[var(--bg-btn)] px-3.5 sm:px-4 border-none select-none">
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              className="text-[var(--text-muted)] shrink-0"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search framework docs... (⌘K)"
              spellCheck={false}
              autoComplete="off"
              className="w-full bg-transparent border-none text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] focus:outline-none"
            />
            {search ? (
              <button
                type="button"
                onClick={() => onSearchChange("")}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs shrink-0 cursor-pointer"
              >
                ✕
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenCmdk?.()}
                title="Open Command Palette (⌘K)"
                className="hidden md:inline-flex h-5 items-center gap-0.5 rounded border border-[var(--border-medium)] px-1.5 font-mono text-[10px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition cursor-pointer select-none"
              >
                <span className="text-[11px] font-bold">⌘</span>K
              </button>
            )}
          </div>
        )}

        {/* ACCENT COLOR SWATCH TOGGLE PILL */}
        {onColorChange && (
          <button
            type="button"
            onClick={handleCycleColor}
            aria-label={`Cycle accent color (current: ${activeShade.name})`}
            className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] border-none cursor-pointer shrink-0 motion-safe:active:scale-[0.97] ml-auto"
            title={`Click to cycle accent color (${activeShade.name})`}
          >
            <span
              className="size-3.5 sm:size-4 rounded-full border border-[var(--border-medium)] shadow-sm"
              style={{ backgroundColor: activeShade.hex }}
            />
          </button>
        )}
      </div>
    </div>
  );
});
