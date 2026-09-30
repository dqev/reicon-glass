import { WordmarkLogo } from "../common/BrandLogo";

export function SiteFooter() {
  return (
    <footer className="w-full flex flex-col items-center pt-20 pb-16 px-4 sm:px-6 select-none">
      {/* Centered Brand & Info Container */}
      <div className="flex flex-col items-center text-center gap-6 max-w-xl mx-auto">
        {/* Wordmark Logo */}
        <a
          href="/"
          className="inline-flex items-center hover:opacity-80 transition motion-safe:active:scale-[0.97]"
          title="reicon home"
        >
          <WordmarkLogo
            color="var(--accent-color, #9B8AFB)"
            className="h-[22px] w-auto inline-block"
          />
        </a>

        {/* Tagline & Subtext */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-sm font-[550] text-[var(--text-primary)] tracking-tight">
            Free Glass SVG Icons for Designers &amp; Developers
          </p>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-md">
            Open-source icons rendered in stunning 3D glass — search, preview, and copy SVG, JSX, or CSS with zero setup.
          </p>
        </div>

        {/* Action Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-[550]">
          <a
            href="https://github.com/dqev/reicon-glass"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            GitHub
          </a>
          <a
            href="https://github.com/dqev/reicon-glass/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition"
          >
            MIT License
          </a>
        </div>

        {/* Copyright notice */}
        <p className="text-[11px] font-mono text-[var(--text-dim)] pt-2">
          © {new Date().getFullYear()} Reicon. Open Source Software.
        </p>
      </div>
    </footer>
  );
}
