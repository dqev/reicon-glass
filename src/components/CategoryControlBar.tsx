import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { getColorPalette } from "../utils/themeColors";
import { playClickSound } from "../utils/sound";

export interface CategoryControlBarProps {
  theme?: "dark" | "light";
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  showAllCategories: boolean;
  onToggleShowAllCategories: () => void;
  size: number;
  onSizeChange: (s: number) => void;
  color: string;
  onColorChange: (c: string) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  searchInputRef?: React.RefObject<any>;
}

export function CategoryControlBar({
  theme = "dark",
  categories,
  selectedCategory,
  onSelectCategory,
  showAllCategories,
  onToggleShowAllCategories,
  size,
  onSizeChange,
  color,
  onColorChange,
  search = "",
  onSearchChange,
  searchInputRef,
}: CategoryControlBarProps) {
  const reduced = useReducedMotion();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 10);
  const hasMoreCategories = categories.length > 10;

  const colorShades = getColorPalette(theme);
  const activeColorIndex = colorShades.findIndex(
    (s) => s.hex.toLowerCase() === color.toLowerCase()
  );
  const activeShade = activeColorIndex >= 0 ? colorShades[activeColorIndex] : colorShades[0];

  const handleCycleColor = () => {
    playClickSound();
    const nextIndex = (activeColorIndex + 1) % colorShades.length;
    onColorChange(colorShades[nextIndex].hex);
  };

  return (
    <div className="flex flex-col gap-2.5 w-full pb-1 relative z-30">
      {/* MOBILE ONLY ROW 1: Search Bar (compact h-8 on mobile) */}
      {onSearchChange && (
        <div className="sm:hidden relative flex h-8.5 w-full items-center gap-2.5 rounded-full bg-[var(--bg-btn)] px-3.5 border-none select-none">
          <svg
            width="14"
            height="14"
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
            placeholder="Search 2,676+ icons... (/)"
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent border-none text-xs text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] focus:outline-none"
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xs shrink-0 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* MAIN ROW: Category Dropdown + Search (Desktop) + Size Pills + Swatch */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2.5 w-full">
        {/* Category Dropdown Button (Compact h-8.5 on mobile, h-10 on desktop) */}
        <div className="relative shrink-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setDropdownOpen((prev) => !prev);
            }}
            className="h-8.5 sm:h-10 px-3 sm:px-4 rounded-full text-xs sm:text-sm font-[550] leading-none whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 sm:gap-2 bg-[var(--bg-btn)] text-[var(--text-primary)] hover:bg-[var(--bg-btn-hover)] border-none"
          >
            <span className="text-[var(--text-muted)] font-normal">Category:</span>
            <span className="font-semibold">{selectedCategory}</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className={`transition-transform duration-200 shrink-0 ${dropdownOpen ? "rotate-180" : ""}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {/* Dropdown Menu (Scrollable max-h-64) */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                transition={{ duration: 0.15 }}
                className="absolute top-10 sm:top-12 left-0 w-48 sm:w-52 max-h-64 overflow-y-auto rounded-2xl bg-[var(--dropdown-bg)] border-none backdrop-blur-2xl p-1.5 z-50 shadow-none scrollbar-thin flex flex-col gap-0.5"
              >
                {categories.map((cat) => {
                  const active = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        playClickSound();
                        onSelectCategory(cat);
                        setDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-[550] transition cursor-pointer flex items-center justify-between ${
                        active
                          ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] font-semibold"
                          : "text-[var(--text-secondary)] hover:bg-[var(--bg-btn)] hover:text-[var(--text-primary)]"
                      }`}
                    >
                      <span>{cat}</span>
                      {active && <span className="text-xs font-bold">✓</span>}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* DESKTOP ONLY INLINE SEARCH BAR (h-10 rounded-full) */}
        {onSearchChange && (
          <div className="hidden sm:flex relative h-10 flex-1 min-w-[140px] max-w-md items-center gap-3 rounded-full bg-[var(--bg-btn)] px-4 border-none select-none mr-auto">
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
              placeholder="Search 2,676+ icons... (/)"
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
              <kbd className="hidden md:inline-flex h-5 items-center rounded border border-[var(--border-medium)] px-1.5 font-mono text-[10px] text-[var(--text-muted)] select-none">
                /
              </kbd>
            )}
          </div>
        )}

        {/* RIGHT: Control Box (Size Pills & Color Swatch) */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
          {/* Mobile Size options (Compact h-8.5 on mobile) */}
          <div className="h-8.5 sm:hidden flex items-center gap-0.5 bg-[var(--bg-btn)] p-0.5 rounded-full border-none backdrop-blur-2xl select-none">
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
                  className={`relative h-7.5 flex cursor-pointer items-center justify-center gap-1 rounded-full px-2 text-[11px] font-mono font-[550] leading-none motion-safe:active:scale-[0.97] ${
                    active ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="size-pill-active-mobile"
                      aria-hidden="true"
                      className="absolute inset-[2px] rounded-full bg-[var(--bg-btn-hover)]"
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

          {/* Desktop Size options (h-10 on desktop) */}
          <div className="h-10 hidden sm:flex items-center gap-0.5 bg-[var(--bg-btn)] p-1 rounded-full border-none backdrop-blur-2xl select-none">
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
                  className={`relative h-8 flex cursor-pointer items-center justify-center gap-1 rounded-full px-3 text-xs font-mono font-[550] leading-none motion-safe:active:scale-[0.97] ${
                    active ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="size-pill-active-desktop"
                      aria-hidden="true"
                      className="absolute inset-[2px] rounded-full bg-[var(--bg-btn-hover)]"
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

          {/* Accent Color Swatch Toggle Pill (Compact h-8.5 w-8.5 on mobile, h-10 w-10 on desktop) */}
          <button
            type="button"
            onClick={handleCycleColor}
            aria-label={`Cycle accent color (current: ${activeShade.name})`}
            className="h-8.5 w-8.5 sm:h-10 sm:w-10 rounded-full flex items-center justify-center bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] border-none cursor-pointer shrink-0 motion-safe:active:scale-[0.97]"
            title={`Click to cycle accent color (${activeShade.name})`}
          >
            <span
              className="size-3.5 sm:size-4 rounded-full border border-[var(--border-medium)] shadow-sm"
              style={{ backgroundColor: activeShade.hex }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
