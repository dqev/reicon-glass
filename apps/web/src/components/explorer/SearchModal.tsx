import { useState, useEffect, useMemo } from "react";
import { Command } from "cmdk";
import { IconRenderer } from "./IconRenderer";
import { playClickSound } from "../../utils/sound";
import { copyToClipboard } from "../../utils/clipboard";

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
  onSelectNav?: (tab: any, href: string) => void;
  onCopyNotice?: (msg: string) => void;
}

export function CmdkSearchModal({
  open,
  onOpenChange,
  icons,
  onSelectIcon,
  onCopyNotice,
}: CmdkSearchModalProps) {
  const [search, setSearch] = useState("");

  // Reset search when modal opens/closes
  useEffect(() => {
    if (open) setSearch("");
  }, [open]);

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

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      shouldFilter={false}
      label="Global Icon Command Palette"
      className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[51] w-[92vw] max-w-[600px] p-0 rounded-[24px] bg-[var(--modal-bg)] border-none shadow-2xl overflow-hidden font-sans backdrop-blur-2xl"
    >
      {/* Top Input Bar with Command Icon */}
      <div className="flex items-center gap-3 px-4 py-3.5 bg-[var(--bg-card)]">
        <div className="flex items-center justify-center size-7 rounded-xl bg-[var(--bg-btn-hover)] text-[var(--text-primary)] text-xs font-mono font-bold select-none shrink-0 border-none">
          ⌘
        </div>
        <Command.Input
          value={search}
          onValueChange={setSearch}
          placeholder="Search 2,676+ icons or commands... (⌘K)"
          className="w-full bg-transparent border-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none font-sans"
        />
        <kbd className="hidden sm:inline-flex h-5 items-center gap-0.5 rounded-md bg-[var(--bg-btn-hover)] px-2 font-mono text-[10px] text-[var(--text-muted)] select-none shrink-0 border-none">
          ESC
        </kbd>
      </div>

      {/* Command List Body */}
      <Command.List className="max-h-[380px] overflow-y-auto p-2.5 space-y-2">
        <Command.Empty className="py-8 text-center text-xs font-mono text-[var(--text-muted)]">
          No matching icons or commands found.
        </Command.Empty>

        {/* Quick Actions (visible when search is empty) */}
        {!search.trim() && onCopyNotice && (
          <Command.Group heading="Quick Actions" className="px-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] pt-2 pb-1">
            <Command.Item
              onSelect={() => {
                playClickSound();
                void copyToClipboard('<script src="https://cdn.jsdelivr.net/npm/reicon-agent/cdn/reicon.js"></script>').then((ok) => {
                  if (ok) onCopyNotice("Copied Reicon CDN Script!");
                });
                onOpenChange(false);
              }}
              className="flex items-center justify-between p-2.5 rounded-[14px] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-btn-hover)] cursor-pointer aria-selected:bg-[var(--bg-btn-hover)] transition-colors border-none"
            >
              <div className="flex items-center gap-2.5">
                <IconRenderer name="code" size={16} />
                <span>Copy CDN Setup Script</span>
              </div>
              <span className="font-mono text-[10px] font-semibold text-[var(--accent-color,#9B8AFB)]">CDN</span>
            </Command.Item>
          </Command.Group>
        )}

        {/* Icons Collection */}
        <Command.Group heading={`Icons Collection (${search.trim() ? filteredIcons.length : icons.length})`} className="px-2 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] pt-2 pb-1">
          <div className="grid grid-cols-1 gap-1">
            {filteredIcons.map((icon) => (
              <Command.Item
                key={icon.kebab}
                value={`${icon.name} ${icon.kebab} ${icon.category} ${icon.keywords?.join(" ") || ""}`}
                onSelect={() => {
                  playClickSound();
                  onSelectIcon(icon.name, icon.category);
                  onOpenChange(false);
                }}
                className="flex items-center justify-between p-2.5 rounded-[14px] text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-btn-hover)] cursor-pointer aria-selected:bg-[var(--bg-btn-hover)] transition-colors border-none group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="size-8 rounded-xl bg-[var(--bg-btn)] flex items-center justify-center text-[var(--text-primary)] group-hover:scale-105 transition-transform shrink-0 border-none">
                    <IconRenderer name={icon.kebab} size={18} />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-medium text-[var(--text-primary)] truncate">{icon.name}</span>
                    <span className="font-mono text-[10px] text-[var(--text-muted)] truncate">{icon.kebab}</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] px-2.5 py-1 rounded-lg bg-[var(--bg-btn)] text-[var(--text-muted)] shrink-0 border-none">
                  {icon.category}
                </span>
              </Command.Item>
            ))}
          </div>
        </Command.Group>
      </Command.List>

      {/* Footer Instructions */}
      <div className="flex items-center justify-between px-4 py-3 bg-[var(--bg-card)] text-[10px] font-mono text-[var(--text-muted)] select-none border-none">
        <div className="flex items-center gap-2">
          <span>Use <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--bg-btn-hover)] text-[var(--text-primary)] border-none">↑</kbd> <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--bg-btn-hover)] text-[var(--text-primary)] border-none">↓</kbd> to navigate</span>
        </div>
        <span>Press <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--bg-btn-hover)] text-[var(--text-primary)] border-none">↵</kbd> to select</span>
      </div>
    </Command.Dialog>
  );
}
