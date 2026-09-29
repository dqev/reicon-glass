import { useState, memo, useCallback } from "react";
import { IconRenderer, toKebabCase } from "./IconRenderer";
import { CopyMorphIcon } from "../common/CopyIconTransition";
import { playClickSound } from "../../utils/sound";
import { copyToClipboard } from "../../utils/clipboard";
import { getGlassSvg } from "../../utils/glassCache";

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
  onCopyNotice: (msg: string) => void;
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
  onCopyNotice,
}: IconCardProps) {
  const [copiedJsx, setCopiedJsx] = useState(false);

  const kebabName = kebab || toKebabCase(name);
  const jsxCode = `<re-icon icon="${kebabName}" size={${size}} color="${color}"></re-icon>`;

  const handleInspect = useCallback(() => {
    playClickSound();
    onInspect(name, category);
  }, [onInspect, name, category]);

  const handleCopyJsx = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    void copyToClipboard(jsxCode).then((ok) => {
      if (ok) {
        setCopiedJsx(true);
        onCopyNotice(`Copied <re-icon icon="${kebabName}" />`);
        setTimeout(() => setCopiedJsx(false), 1400);
      }
    });
  };

  const handleDownloadSvg = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    // Prefer this card's own code so duplicate kebab names across
    // categories download the correct SVG.
    const rawCode = code || "";
    const svgContent = rawCode
      ? getGlassSvg(rawCode, kebabName, color, size)
      : `<re-icon icon="${kebabName}" size="${size}" color="${color}"></re-icon>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${kebabName}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onCopyNotice(`Downloaded ${name}.svg`);
  };

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

      {/* Hover Micro Action Buttons: 1 Copy, 1 Download (Hidden on Mobile, Hover on Desktop) */}
      <div className="hidden sm:flex absolute inset-x-2 bottom-2 items-center justify-end gap-1 opacity-0 translate-y-1 transition-all duration-150 group-hover:opacity-100 group-hover:translate-y-0 z-10">
        <button
          type="button"
          onClick={handleCopyJsx}
          title="Copy React Code"
          className="size-7 rounded-full bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] text-[var(--text-primary)] flex items-center justify-center motion-safe:active:scale-[0.97]"
        >
          <CopyMorphIcon copied={copiedJsx} />
        </button>
        <button
          type="button"
          onClick={handleDownloadSvg}
          title="Download SVG"
          className="size-7 rounded-full bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] flex items-center justify-center hover:opacity-90 motion-safe:active:scale-[0.97]"
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
      </div>
    </div>
  );
});
