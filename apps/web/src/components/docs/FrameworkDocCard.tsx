import { useState, memo } from "react";
import { type PlatformDoc } from "../../docs/platforms";
import { FrameworkIcon } from "./FrameworkIcon";
import { CopyMorphIcon } from "../common/CopyIconTransition";
import { playClickSound } from "../../utils/sound";
import { copyToClipboard } from "../../utils/clipboard";

export interface FrameworkDocCardProps {
  doc: PlatformDoc;
  size: number;
  onSelectDoc: (doc: PlatformDoc) => void;
  onCopyNotice: (msg: string) => void;
}

export const FrameworkDocCard = memo(function FrameworkDocCard({
  doc,
  size,
  onSelectDoc,
  onCopyNotice,
}: FrameworkDocCardProps) {
  const [copiedInstall, setCopiedInstall] = useState(false);

  const handleCopyInstall = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    void copyToClipboard(doc.install).then((ok) => {
      if (ok) {
        setCopiedInstall(true);
        onCopyNotice(`Copied installation command for ${doc.name}`);
        setTimeout(() => setCopiedInstall(false), 1400);
      }
    });
  };

  const handleOpenDoc = (e: React.MouseEvent) => {
    e.stopPropagation();
    playClickSound();
    onSelectDoc(doc);
  };

  return (
    <div
      title={`${doc.name} · ${doc.pkg}`}
      onClick={handleOpenDoc}
      className="aspect-square relative flex flex-col items-center justify-between p-3.5 rounded-[18px] bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] group cursor-pointer select-none"
    >
      {/* Main Framework Icon Display */}
      <div className="my-auto py-2 flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
        <FrameworkIcon id={doc.id} size={size} />
      </div>

      {/* Bottom Readout: Framework Name & Package Badge */}
      <div className="flex flex-col items-center gap-0.5 max-w-full text-center">
        <span className="text-[11px] sm:text-xs font-[500] text-[var(--text-primary)] truncate max-w-full tracking-tight">
          {doc.name}
        </span>
        <span className="text-[9.5px] sm:text-[10.5px] font-mono text-[var(--text-muted)] truncate max-w-full">
          {doc.pkg}
        </span>
      </div>

      {/* Action Buttons (Hidden on Mobile, Hover on Desktop) */}
      <div className="hidden sm:flex absolute inset-x-2 top-2 items-center justify-end gap-1 opacity-0 transition-all duration-150 group-hover:opacity-100 z-10">
        <button
          type="button"
          onClick={handleCopyInstall}
          title={`Copy ${doc.name} install command`}
          className="size-7 rounded-full bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] text-[var(--text-primary)] flex items-center justify-center motion-safe:active:scale-[0.97]"
        >
          <CopyMorphIcon copied={copiedInstall} />
        </button>
        <button
          type="button"
          onClick={handleOpenDoc}
          title={`View ${doc.name} documentation`}
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
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </div>
  );
});
