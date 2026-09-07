import { WordmarkLogo } from "../common/BrandLogo";

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
    <div className="flex flex-col items-center text-center gap-6 sm:gap-7 py-10 sm:py-16 select-none">
      <h1 className="text-lg sm:text-2xl font-[550] leading-[1.4] tracking-[-0.3px] text-[var(--text-primary)] flex flex-col items-center gap-1.5 sm:gap-2 text-center">
        {/* DESKTOP LAYOUT */}
        <div className="hidden sm:flex items-center justify-center gap-2">
          <span>Open-Source Icon Library by</span>
          <span className="inline-flex items-center justify-center shrink-0 rounded-full bg-[var(--bg-btn)] py-2 px-4 leading-none hover:bg-[var(--bg-btn-hover)] border border-[var(--border-subtle)]">
            <WordmarkLogo
              color={color || "var(--accent-color, currentColor)"}
              className="h-[18px] w-auto inline-block select-none pointer-events-none"
            />
          </span>
        </div>
        <span className="hidden sm:inline">for Designers &amp; Developers</span>

        {/* MOBILE LAYOUT */}
        {/* Line 1 */}
        <span className="sm:hidden">Open-Source Icon Library by</span>
        {/* Line 2: { Logo Pill } for Designers & */}
        <div className="sm:hidden flex items-center justify-center gap-1.5">
          <span className="inline-flex items-center justify-center shrink-0 rounded-full bg-[var(--bg-btn)] py-2 px-4 leading-none hover:bg-[var(--bg-btn-hover)] border border-[var(--border-subtle)]">
            <WordmarkLogo
              color={color || "var(--accent-color, currentColor)"}
              className="h-[17px] w-auto inline-block select-none pointer-events-none"
            />
          </span>
          <span>for Designers &amp;</span>
        </div>
        {/* Line 3: Developers */}
        <span className="sm:hidden">Developers</span>
      </h1>
    </div>
  );
}
