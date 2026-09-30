import { useState, useEffect, useMemo } from "react";
import { Command } from "cmdk";
import { IconRenderer } from "./IconRenderer";
import { playClickSound } from "../../utils/sound";

export interface IconItem {
  name: string;
  kebab: string;
  category: string;
  keywords: string[];
}

export interface CmdkSearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icons: IconItem[];
  onSelectIcon: (name: string, category: string) => void;
  /** Current accent color — palette previews render glass in the same shade as the grids */
  color?: string;
}

export function CmdkSearchModal({
  open,
  onOpenChange,
  icons,
  onSelectIcon,
  color,
}: CmdkSearchModalProps) {
  const [search, setSearch] = useState("");
  const [prevOpen, setPrevOpen] = useState(open);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setSearch("");
  }

  // Global ⌘K / Ctrl+K / '/' Keyboard Shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === "k" && (e.metaKey || e.ctrlKey)) || (e.key === "/" && document.activeElement?.tagName !== "INPUT")) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  // Escape to close (mirrors IconDetailModal)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return icons.slice(0, 60);
    return icons.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.kebab.includes(q) ||
        i.category.toLowerCase().includes(q) ||
        i.keywords.some((k) => k.toLowerCase().includes(q))
    ).slice(0, 100);
  }, [icons, search]);

  if (!open) return null;

  const handleSurprise = () => {
    if (icons.length === 0) return;
    playClickSound();
    const pick = icons[Math.floor(Math.random() * icons.length)];
    if (pick) {
      onSelectIcon(pick.name, pick.category);
      onOpenChange(false);
    }
  };

  return (
    <>
      {/* Backdrop (invisible but captures clicks to close) — same as IconDetailModal */}
      <div
        className="fixed inset-0 z-40"
        onClick={() => onOpenChange(false)}
      />

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[620px] px-4 pointer-events-none">
        <div
          role="dialog"
          aria-label="Global Icon Command Palette"
          className="bg-[var(--modal-bg)] border border-[var(--border-medium)] rounded-2xl shadow-2xl backdrop-blur-2xl p-4 flex flex-col gap-4 pointer-events-auto"
        >
          <Command
            shouldFilter={false}
            label="Global Icon Command Palette"
            className="flex flex-col gap-4"
          >
            {/* Header: search pill + close */}
            <div className="flex items-center gap-2">
              <div className="h-10 flex-1 bg-[var(--bg-card)] rounded-full flex items-center gap-2.5 pl-3 pr-2">
                <span className="text-[var(--text-muted)] text-sm leading-none select-none shrink-0">
                  ⌘
                </span>
                <Command.Input
                  autoFocus
                  value={search}
                  onValueChange={setSearch}
                  placeholder={`Search ${icons.length.toLocaleString()} icons... (⌘K)`}
                  className="w-full bg-transparent border-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none font-sans"
                />
                <kbd className="hidden sm:inline-flex h-5 items-center rounded-full bg-[var(--bg-btn-hover)] px-2 font-mono text-[10px] text-[var(--text-muted)] select-none shrink-0">
                  ESC
                </kbd>
              </div>
              <button
                onClick={() => {
                  playClickSound();
                  onOpenChange(false);
                }}
                aria-label="Close search"
                className="size-10 shrink-0 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border-none motion-safe:active:scale-95"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>

            {/* Results */}
            <Command.List className="max-h-[320px] overflow-y-auto flex flex-col gap-3">
              <Command.Empty className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
                No matching icons found.
              </Command.Empty>

              {/* Quick Actions (visible when search is empty) */}
              {!search.trim() && (
                <Command.Group heading="Quick Actions" className="px-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                  <Command.Item
                    onSelect={handleSurprise}
                    className="flex items-center justify-between mt-1 p-2 rounded-xl text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer aria-selected:bg-[var(--bg-card)] transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <IconRenderer
                        name="shuffle"
                        size={26}
                        color={color}
                        className="shrink-0"
                      />
                      <span>Surprise me — open a random icon</span>
                    </div>
                    <span className="font-mono text-[10px] font-semibold text-[var(--accent-color,#9B8AFB)]">RANDOM</span>
                  </Command.Item>
                </Command.Group>
              )}

              {/* Icons Collection */}
              <Command.Group heading={`Icons (${search.trim() ? filteredIcons.length : icons.length})`} className="px-1 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                <div className="flex flex-col gap-1 mt-1">
                  {filteredIcons.map((icon) => (
                    <Command.Item
                      key={icon.kebab}
                      value={`${icon.name} ${icon.kebab} ${icon.category} ${icon.keywords?.join(" ") || ""}`}
                      onSelect={() => {
                        playClickSound();
                        onSelectIcon(icon.name, icon.category);
                        onOpenChange(false);
                      }}
                      className="flex items-center justify-between p-2 rounded-xl text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-card)] cursor-pointer aria-selected:bg-[var(--bg-card)] transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <IconRenderer
                          name={icon.kebab}
                          size={26}
                          color={color}
                          className="shrink-0 transition-transform group-hover:scale-105"
                        />
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-[var(--text-primary)] truncate">{icon.name}</span>
                          <span className="font-mono text-[10px] text-[var(--text-muted)] truncate">{icon.kebab}</span>
                        </div>
                      </div>
                      <span className="font-mono text-[10px] px-2.5 py-1 rounded-full bg-[var(--bg-card)] text-[var(--text-muted)] shrink-0">
                        {icon.category}
                      </span>
                    </Command.Item>
                  ))}
                </div>
              </Command.Group>
            </Command.List>

            {/* Footer hints */}
            <div className="flex items-center justify-between px-1 text-[10px] font-mono text-[var(--text-muted)] select-none">
              <span>Use ↑ ↓ to navigate</span>
              <span>Press ↵ to select</span>
            </div>
          </Command>
        </div>
      </div>
    </>
  );
}
