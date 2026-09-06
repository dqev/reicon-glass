import React from "react";
import { IconRenderer } from "../explorer/IconRenderer";
import { CopyMorphIcon } from "../common/CopyIconTransition";
import { playClickSound } from "../../utils/sound";

export interface FeaturedHeroCardProps {
  featuredHeroIcon: string;
  featuredHeroKebab: string;
  featuredCategory: string;
  color: string;
  strokeWidth?: number;
  search: string;
  onSearchChange: (val: string) => void;
  searchInputRef: React.RefObject<any>;
  heroCardRef: React.RefObject<any>;
  onRandomize: (e: React.MouseEvent) => void;
  onCopyJsx: (e: React.MouseEvent) => void;
  onCopySvg: (e: React.MouseEvent) => void;
  copiedHeroJsx: boolean;
  copiedHeroSvg: boolean;
  onInspect: (iconName: string, category: string) => void;
}

export function FeaturedHeroCard({
  featuredHeroIcon,
  featuredHeroKebab,
  featuredCategory,
  color,
  strokeWidth,
  search,
  onSearchChange,
  searchInputRef,
  heroCardRef,
  onRandomize,
  onCopyJsx,
  onCopySvg,
  copiedHeroJsx,
  copiedHeroSvg,
  onInspect,
}: FeaturedHeroCardProps) {
  return (
    <label
      ref={heroCardRef}
      className="col-span-2 row-span-2 aspect-square sm:aspect-auto relative flex flex-col items-center justify-between rounded-[20px] bg-[var(--bg-card)] p-4 sm:p-6 cursor-text group select-none overflow-hidden min-h-[280px]"
    >
      {/* Top Card Header */}
      <div className="flex items-center justify-between w-full font-mono text-[12px] text-[var(--text-muted)] z-10">
        <div className="flex items-center gap-2">
          <span>000</span>
          <span className="text-[var(--text-dim)]">/</span>
          <span className="uppercase tracking-wider text-[11px] text-[var(--text-muted)]">interactive</span>
        </div>

        {/* Quick Action Micro Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={(e) => {
              playClickSound();
              onRandomize(e);
            }}
            title="Randomize icon"
            className="size-7 rounded-full bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] text-[var(--text-primary)] flex items-center justify-center motion-safe:active:scale-[0.97] cursor-pointer"
          >
            <IconRenderer name="Shuffle" size={15} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              playClickSound();
              onCopyJsx(e);
            }}
            title="Copy React JSX"
            className="size-7 rounded-full bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] text-[var(--text-primary)] flex items-center justify-center motion-safe:active:scale-[0.97] cursor-pointer"
          >
            <CopyMorphIcon copied={copiedHeroJsx} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              playClickSound();
              onCopySvg(e);
            }}
            title="Copy SVG"
            className="size-7 rounded-full bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] flex items-center justify-center hover:opacity-90 motion-safe:active:scale-[0.97] cursor-pointer"
          >
            <CopyMorphIcon copied={copiedHeroSvg} />
          </button>
        </div>
      </div>

      {/* Featured Icon Stage */}
      <div
        onClick={() => {
          playClickSound();
          onInspect(featuredHeroIcon, featuredCategory);
        }}
        className="my-auto py-4 flex flex-col items-center gap-2 cursor-pointer transition-transform duration-200 group-hover:scale-105"
      >
        <div className="p-3">
          <IconRenderer
            name={featuredHeroKebab}
            size={108}
            color={color}
            strokeWidth={strokeWidth}
          />
        </div>
        <span className="text-xs font-mono text-[var(--text-secondary)] tracking-wider uppercase truncate max-w-full text-center">
          {featuredHeroIcon}
        </span>
      </div>

      {/* Bottom Minimal Search Bar */}
      <div className="flex flex-col items-center gap-3 w-full max-w-[260px] z-10 pb-1">
        <div className="relative w-full flex flex-col items-center">
          <input
            ref={searchInputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            className="w-full bg-transparent border-0 pb-2 text-center text-[var(--text-primary)] text-sm font-medium tracking-[0.14px] placeholder:text-[var(--input-placeholder)] focus:placeholder:text-transparent focus:outline-none"
            placeholder="Type any seed or name..."
          />
          <div className="h-px w-full bg-[var(--border-medium)] group-focus-within:bg-[var(--accent-color,#9B8AFB)] transition-colors opacity-80" />
        </div>
      </div>
    </label>
  );
}
