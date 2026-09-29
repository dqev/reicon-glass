import { memo, type RefObject } from "react";
import { IconCard } from "./IconCard";
import type { IconMetaItem } from "../../utils/iconDataLoader";

export interface IconGridWallProps {
  displayedIcons: IconMetaItem[];
  size: number;
  weight?: "outline" | "filled";
  color: string;
  strokeWidth?: number;
  onInspect: (name: string, category: string) => void;
  onCopyNotice: (msg: string) => void;
  loadMoreRef: RefObject<HTMLDivElement | null>;
  hasMoreToLoad: boolean;
}

export const IconGridWall = memo(function IconGridWall(props: IconGridWallProps) {
  const {
    displayedIcons,
    size,
    weight = "outline",
    color,
    strokeWidth,
    onInspect,
    onCopyNotice,
    loadMoreRef,
    hasMoreToLoad,
  } = props;

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Grid Wall Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 w-full">
        {/* Icon Cards Wall — stable onInspect keeps memo working, infinite scroll preserved via sentinel */}
        {displayedIcons.map((icon) => (
          <IconCard
            key={`${icon.category}::${icon.kebab}`}
            name={icon.name}
            kebab={icon.kebab}
            category={icon.category}
            code={icon.code}
            size={size}
            weight={weight}
            color={color}
            strokeWidth={strokeWidth}
            onInspect={onInspect}
            onCopyNotice={onCopyNotice}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel — always rendered to keep observer stable */}
      <div ref={loadMoreRef} className="h-12 w-full pointer-events-none flex items-center justify-center">
        {hasMoreToLoad && (
          <span className="text-[11px] font-mono text-[var(--text-muted)] animate-pulse">
            Loading more…
          </span>
        )}
      </div>
    </div>
  );
});
