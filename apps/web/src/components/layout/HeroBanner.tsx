export function HeroHeaderBanner(_props?: {
  color?: string;
  onCopyNotice?: (msg: string) => void;
  search?: string;
  onSearchChange?: (val: string) => void;
  searchInputRef?: React.RefObject<any>;
}) {
  return (
    <div className="flex flex-col items-center text-center gap-6 sm:gap-7 py-10 sm:py-16 select-none">
      <h1 className="text-lg sm:text-2xl font-[550] leading-[1.4] tracking-[-0.3px] text-[var(--text-primary)] flex flex-col items-center gap-1.5 sm:gap-2 text-center">
        <span>Open-Source Icon Library</span>
        <span className="text-[var(--text-secondary)]">for Designers &amp; Developers</span>
      </h1>
    </div>
  );
}
