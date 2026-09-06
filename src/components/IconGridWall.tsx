import React from "react";
import { IconCard } from "./IconCard";
import type { IconMetaItem } from "../views/HeroExplorerView";

export interface IconGridWallProps {
  displayedIcons: IconMetaItem[];
  size: number;
  weight?: "outline" | "filled";
  color: string;
  strokeWidth?: number;
  onInspect: (name: string, category: string) => void;
  onCopyNotice: (msg: string) => void;
  loadMoreRef: React.RefObject<any>;
  hasMoreToLoad: boolean;
}

export function IconGridWall(props: IconGridWallProps) {
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
        {/* Icon Cards Wall */}
        {displayedIcons.map((icon) => (
          <IconCard
            key={icon.kebab}
            name={icon.name}
            kebab={icon.kebab}
            category={icon.category}
            size={size}
            weight={weight}
            color={color}
            strokeWidth={strokeWidth}
            onInspect={(name) => onInspect(name, icon.category)}
            onCopyNotice={onCopyNotice}
          />
        ))}
      </div>

      {/* Infinite Scroll Sentinel */}
      {hasMoreToLoad && (
        <div ref={loadMoreRef} className="h-12 w-full pointer-events-none" />
      )}
    </div>
  );
}
