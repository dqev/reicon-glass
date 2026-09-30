import { memo, useCallback } from "react";
import { IconRenderer } from "./IconRenderer";
import { toKebabCase } from "../../utils/iconDataLoader";
import { playClickSound } from "../../utils/sound";

export interface IconCardProps {
  name: string;
  kebab?: string;
  category: string;
  code?: string;
  size: number;
  weight: "outline" | "filled";
  color: string;
  strokeWidth?: number;
  onInspect: (name: string, category: string) => void;
}

export const IconCard = memo(function IconCard({
  name,
  kebab,
  category,
  code,
  size,
  weight,
  color,
  strokeWidth,
  onInspect,
}: IconCardProps) {
  const kebabName = kebab || toKebabCase(name);

  const handleInspect = useCallback(() => {
    playClickSound();
    onInspect(name, category);
  }, [onInspect, name, category]);

  return (
    <div
      title={`${name} · ${category}`}
      onClick={handleInspect}
      className="aspect-square relative flex flex-col items-center justify-between p-3.5 rounded-[18px] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] group cursor-pointer select-none"
      style={{ contentVisibility: "auto", containIntrinsicSize: "auto 180px" }}
    >
      {/* Main Icon Display */}
      <div className="my-auto py-2 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
        <IconRenderer
          name={kebabName}
          code={code}
          size={size}
          weight={weight}
          color={color}
          strokeWidth={strokeWidth}
        />
      </div>

      {/* Bottom Name Readout */}
      <span className="text-[11px] sm:text-xs font-[450] text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] truncate max-w-full text-center tracking-tight">
        {name}
      </span>
    </div>
  );
});
