import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconRenderer } from "../explorer/IconRenderer";
import { playClickSound } from "../../utils/sound";
import { WordmarkLogo } from "../common/BrandLogo";

export type NavTab = "explorer" | "docs" | "changelog";

function formatStars(n: number): string {
  if (n < 1000) return String(n);
  const k = n / 1000;
  return `${k < 10 ? k.toFixed(1).replace(/\.0$/, "") : Math.round(k)}k`;
}

export function SiteHeader({
  activeTab,
  onTabChange,
  color,
}: {
  activeTab: NavTab;
  onTabChange: (tab: NavTab, href: string) => void;
  color?: string;
}) {
  const [stars, setStars] = useState<number | null>(1240);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`https://api.github.com/repos/dqev/reicon`, {
      headers: { Accept: "application/vnd.github+json" },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const count = data?.stargazers_count;
        if (cancelled || typeof count !== "number") return;
        setStars(count);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  // Close menu on Esc key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const NAV: { id: NavTab; href: string; label: string }[] = [
    { id: "explorer", href: "/", label: "Home" },
    { id: "docs", href: "/docs", label: "Docs" },
    { id: "changelog", href: "/changelog", label: "Changelog" },
  ];

  const handleNavClick = (id: NavTab, href: string) => {
    playClickSound();
    onTabChange(id, href);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-4 z-[100] relative w-full">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between w-full rounded-[10px] py-0">
        {/* Brand Logo, left */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick("explorer", "/");
          }}
          className="inline-flex items-center rounded-full bg-[var(--bg-btn)] py-2 px-3.5 leading-none text-[var(--text-primary)] hover:bg-[var(--bg-btn-hover)] motion-safe:active:scale-[0.97] cursor-pointer border border-[var(--border-subtle)]"
          title="reicon home"
        >
          <WordmarkLogo
            color={color || "var(--accent-color, currentColor)"}
            className="h-[16px] w-auto inline-block select-none pointer-events-none"
          />
        </a>

        {/* Desktop Nav links, centered */}
        <nav className="hidden sm:flex absolute left-1/2 -translate-x-1/2 items-center gap-4 md:gap-5">
          {NAV.map((item) => {
            const active = activeTab === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.id, item.href);
                }}
                className={`text-sm font-[550] leading-5 cursor-pointer ${
                  active ? "text-[var(--text-primary)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Right Actions: GitHub button + Circular Menu button */}
        <div className="flex items-center gap-2">

          {/* GitHub Action Button */}
          <a
            href="https://github.com/dqev/reicon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="sm:inline-flex hidden items-center gap-1.5 rounded-full bg-[var(--bg-btn)] py-2 pl-3 pr-3.5 text-sm font-[550] leading-none text-[var(--text-primary)] hover:bg-[var(--bg-btn-hover)] motion-safe:active:scale-[0.97]"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
            <span>GitHub</span>
            {stars !== null && (
              <span className="text-[var(--text-muted)] font-mono text-xs">
                {formatStars(stars)}
              </span>
            )}
          </a>

          {/* Mobile GitHub Circle Button */}
          <a
            href="https://github.com/dqev/reicon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub repository"
            className="sm:hidden flex items-center justify-center size-9 rounded-full bg-[var(--bg-btn)] text-[var(--text-primary)] hover:bg-[var(--bg-btn-hover)] cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>

          {/* Mobile Menu Circle Button */}
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Toggle Menu"
            className="sm:hidden flex items-center justify-center size-9 rounded-full bg-[var(--bg-btn)] text-[var(--text-primary)] hover:bg-[var(--bg-btn-hover)] cursor-pointer"
          >
            {menuOpen ? (
              <IconRenderer name="X" size={18} strokeWidth={2} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Borderless Compact Mobile Dropdown Panel directly attached underneath */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="sm:hidden absolute top-[calc(100%+8px)] left-0 right-0 z-50 rounded-[14px] bg-[#171717] p-2 border-none shadow-2xl"
          >
            <nav className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = activeTab === item.id;
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavClick(item.id, item.href);
                    }}
                    className={`flex items-center justify-between rounded-[8px] px-3.5 py-2.5 text-sm font-[550] transition-colors ${
                      active
                        ? "bg-[var(--bg-btn-hover)] text-[var(--text-primary)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--bg-btn)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span>{item.label}</span>
                    {active && <span className="size-1.5 rounded-full" style={{ backgroundColor: "var(--accent-color, #9B8AFB)" }} />}
                  </a>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
