import { useState, useEffect, useMemo, useRef } from "react";
import { HexColorPicker } from "react-colorful";
import { IconRenderer } from "../explorer/IconRenderer";
import { CopyMorphIcon, DownloadMorphIcon } from "../common/CopyIconTransition";
import { playClickSound } from "../../utils/sound";
import { copyToClipboard } from "../../utils/clipboard";

import { getIconCodeForCategory } from "../../utils/iconDataLoader";
import { getGlassSvg } from "../../utils/glassCache";

export interface IconDetailModalProps {
  iconName: string | null;
  category: string;
  color?: string;
  onClose: () => void;
}

export function IconDetailModal({
  iconName,
  category,
  color,
  onClose,
}: IconDetailModalProps) {
  const open = Boolean(iconName);
  const [selectedColor, setSelectedColor] = useState<string>(color || "currentColor");
  const [size, setSize] = useState<number>(64);
  const [format, setFormat] = useState<"jsx" | "vue" | "svg">("jsx");
  const [copied, setCopied] = useState<boolean>(false);
  const [downloaded, setDownloaded] = useState<boolean>(false);
  const [colorOpen, setColorOpen] = useState<boolean>(false);

  const colorPickerRef = useRef<HTMLDivElement>(null);

  const [prevIcon, setPrevIcon] = useState(iconName);
  const [prevColor, setPrevColor] = useState(color);

  if (prevIcon !== iconName || prevColor !== color) {
    setPrevIcon(iconName);
    setPrevColor(color);
    if (color) setSelectedColor(color);
    setColorOpen(false);
    setCopied(false);
    setDownloaded(false);
    setSize(64);
  }

  // Close color picker on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setColorOpen(false);
      }
    }
    if (colorOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [colorOpen]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const kebabName = useMemo(
    () =>
      iconName
        ? iconName
            .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
            .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
            .toLowerCase()
        : "",
    [iconName],
  );

  const hexForPicker = /^#[0-9a-fA-F]{6}$/.test(selectedColor) ? selectedColor : "#ffffff";

  const snippet = useMemo(() => {
    if (!kebabName) return "";
    const colorVal = selectedColor || "currentColor";
    if (format === "svg") {
      const rawCode = getIconCodeForCategory(kebabName, category);
      return rawCode
        ? getGlassSvg(rawCode, kebabName, colorVal, size)
        : `<re-icon icon="${kebabName}" size="${size}" color="${colorVal}"></re-icon>`;
    }
    return `<re-icon icon="${kebabName}" size="${size}" color="${colorVal}"></re-icon>`;
  }, [kebabName, category, selectedColor, size, format]);

  const handleCopyCode = () => {
    playClickSound();
    void copyToClipboard(snippet).then((ok) => {
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }
    });
  };

  const handleDownloadSvg = () => {
    playClickSound();
    const rawCode = getIconCodeForCategory(kebabName, category);
    const svgContent = rawCode
      ? getGlassSvg(rawCode, kebabName, selectedColor || "currentColor", size)
      : `<re-icon icon="${kebabName}" size="${size}" color="${selectedColor || "currentColor"}"></re-icon>`;
    const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${iconName ? iconName.toLowerCase() : "icon"}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1400);
  };

  return (
    <>
      {open && iconName && (
        <>
          {/* Backdrop (invisible but captures clicks to close) */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />

          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[620px] px-4 pointer-events-none">
            <div
              role="dialog"
              className="bg-[var(--modal-bg)] border border-[var(--border-medium)] rounded-2xl shadow-2xl backdrop-blur-2xl p-4 flex flex-col gap-4 pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-[var(--text-secondary)] font-medium pl-1">{kebabName}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playClickSound();
                      setSize(64);
                      setSelectedColor(color || "currentColor");
                    }}
                    className="size-7 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border-none motion-safe:active:scale-95"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      onClose();
                    }}
                    className="size-7 rounded-full bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer border-none motion-safe:active:scale-95"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Preview Stage */}
                <div
                  className="w-full sm:w-[160px] h-[160px] rounded-[18px] flex items-center justify-center shrink-0 overflow-hidden relative bg-[var(--bg-card)]"
                  style={{ background: 'repeating-conic-gradient(var(--bg-btn-hover) 0% 25%, var(--bg-card) 0% 50%) 50% / 16px 16px' }}
                >
                  <div style={{ transform: `scale(${Math.min(1, 140 / size)})` }} className="flex items-center justify-center transition-transform">
                    <IconRenderer
                      name={iconName}
                      code={getIconCodeForCategory(kebabName, category)}
                      size={size}
                      color={selectedColor}
                      strokeWidth={2}
                      lazy={false}
                    />
                  </div>
                </div>

                {/* Controls */}
                <div className="flex-1 flex flex-col justify-between gap-4">

                  {/* Top row controls */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Size — same pill control as the category bar, gooey sliding active */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold pl-1">Size</span>
                      <div className="h-10 bg-[var(--bg-card)] rounded-full border-none flex p-1">
                        {[48, 64, 84].map((s) => {
                          const active = size === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              aria-pressed={active}
                              onClick={() => {
                                playClickSound();
                                setSize(s);
                              }}
                              className={`relative flex-1 flex cursor-pointer items-center justify-center rounded-full px-2 text-[11px] font-mono font-[550] leading-none motion-safe:active:scale-[0.97] ${
                                active ? "text-[var(--pill-active-text)] font-semibold" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                              }`}
                            >
                              {active && (
                                <span
                                  aria-hidden="true"
                                  className="absolute inset-[2px] rounded-full bg-[var(--pill-active-bg)]"
                                />
                              )}
                              <span className="relative z-[1]">{s}px</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Color */}
                    <div className="flex flex-col gap-1.5 relative">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold pl-1">Color</span>
                      <button
                        onClick={() => setColorOpen(!colorOpen)}
                        className="h-10 bg-[var(--bg-card)] rounded-full border-none flex items-center px-4 gap-2 hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                      >
                        <span
                          className="size-4 rounded-full shadow-inner"
                          style={{ backgroundColor: selectedColor === 'currentColor' ? '#ffffff' : selectedColor }}
                        />
                        <span className="text-[var(--text-primary)] text-sm truncate flex-1 text-left">
                          {selectedColor}
                        </span>
                      </button>

                      {colorOpen && (
                          <div
                            ref={colorPickerRef}
                            className="absolute bottom-full right-0 mb-2 z-50 w-[184px] bg-[var(--dropdown-bg)] border-none backdrop-blur-2xl p-3 rounded-2xl shadow-2xl"
                          >
                            <HexColorPicker
                              color={hexForPicker}
                              onChange={setSelectedColor}
                              style={{ width: 160, height: 160 }}
                            />
                            <button
                              className="mt-3 w-full py-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] rounded-full text-xs text-[var(--text-secondary)] transition-colors cursor-pointer border-none"
                              onClick={() => setSelectedColor("currentColor")}
                            >
                              Reset to currentColor
                            </button>
                          </div>
                        )}
                    </div>
                  </div>

                  {/* Export Formats Row */}
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold pl-1">Export</span>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="h-10 bg-[var(--bg-card)] rounded-full border-none flex p-1 shrink-0">
                        {(["jsx", "vue", "svg"] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => {
                              playClickSound();
                              setFormat(fmt);
                            }}
                            className={`px-3 py-1 text-xs font-mono font-medium rounded-full transition-all cursor-pointer border-none motion-safe:active:scale-95 ${
                              format === fmt
                                ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] shadow-sm"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {fmt.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      {/* Copy + download stay on one line as a unit */}
                      <div className="flex flex-1 items-center gap-2 min-w-[190px]">
                      <button
                        onClick={handleCopyCode}
                        className="h-10 flex-1 min-w-[132px] bg-[var(--pill-active-bg)] hover:opacity-90 text-[var(--pill-active-text)] text-sm font-semibold rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer border-none motion-safe:active:scale-[0.98]"
                      >
                        <CopyMorphIcon copied={copied} />
                        <span className="sm:hidden whitespace-nowrap">{copied ? "Copied" : "Copy"}</span>
                        <span className="hidden sm:inline whitespace-nowrap">{copied ? "Copied" : `Copy ${format.toUpperCase()}`}</span>
                      </button>

                      <button
                        onClick={handleDownloadSvg}
                        className="size-10 shrink-0 bg-[var(--bg-card)] hover:bg-[var(--bg-card-hover)] border-none text-[var(--text-primary)] rounded-full flex items-center justify-center transition-colors cursor-pointer motion-safe:active:scale-95"
                        title="Download SVG"
                      >
                        <DownloadMorphIcon done={downloaded} />
                      </button>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
