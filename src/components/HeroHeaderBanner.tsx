import { NpmInstall } from "./NpmInstall";
import { WordmarkLogo } from "./WordmarkLogo";

export function HeroHeaderBanner({
  color,
}: {
  color?: string;
  onCopyNotice?: (msg: string) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  searchInputRef?: React.RefObject<any>;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-6 sm:gap-7 py-10 sm:py-16">
      <h1 className="text-lg sm:text-2xl font-[550] leading-[1.35] tracking-[-0.3px] text-[var(--text-primary)] text-balance flex flex-col items-center gap-1.5 sm:gap-2">
        <span>Open-Source Icon Library</span>
        <span className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-center">
          <span>for Designers &amp; Developers by</span>
          <span className="inline-flex items-center justify-center shrink-0 rounded-full bg-[var(--bg-btn)] py-1.5 px-3.5 sm:py-2 sm:px-4 leading-none hover:bg-[var(--bg-btn-hover)] border border-[var(--border-subtle)] my-0.5">
            <WordmarkLogo
              color={color || "var(--accent-color, currentColor)"}
              className="h-[16px] sm:h-[18px] w-auto inline-block select-none pointer-events-none"
            />
          </span>
        </span>
      </h1>
    </div>
  );
}
