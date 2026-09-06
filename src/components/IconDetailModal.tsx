import { useState, useEffect } from "react";
import { Drawer } from "vaul";
import { motion, useReducedMotion } from "framer-motion";
import { IconRenderer } from "./IconRenderer";
import { CopyMorphIcon } from "./CopyMorphIcon";
import { useSmoothCorners } from "../utils/useSmoothCorners";
import { playClickSound } from "../utils/sound";
import { DARK_COLOR_SHADES } from "../utils/themeColors";

export interface IconDetailModalProps {
  iconName: string | null;
  category: string;
  color?: string;
  onClose: () => void;
  onCopyNotice: (msg: string) => void;
}

export function IconDetailModal({
  iconName,
  category,
  color,
  onClose,
  onCopyNotice,
}: IconDetailModalProps) {
  const reduced = useReducedMotion();
  const stageRef = useSmoothCorners<HTMLDivElement>(16, 60);
  const codeBoxRef = useSmoothCorners<HTMLDivElement>(16, 60);

  const [selectedColor, setSelectedColor] = useState<string>(color || "var(--accent-color, #9B8AFB)");
  const [size, setSize] = useState<number>(48);
  const [format, setFormat] = useState<"jsx" | "vue" | "svg">("jsx");
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (color) {
      setSelectedColor(color);
    }
  }, [color, iconName]);

  const kebabName = iconName
    ? iconName
        .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
        .replace(/([A-Z])([A-Z][a-z])/g, "$1-$2")
        .toLowerCase()
    : "";

  const getCodeSnippet = () => {
    const rawCode = window.ReiconAgent?.getIconCode ? window.ReiconAgent.getIconCode(kebabName) : null;
    const colorVal = selectedColor || "currentColor";
    switch (format) {
      case "jsx":
        return `<re-icon icon="${kebabName}" size="${size}" color="${colorVal}"></re-icon>`;
      case "vue":
        return `<re-icon icon="${kebabName}" size="${size}" color="${colorVal}"></re-icon>`;
      case "svg":
        return rawCode
          ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">\n  ${rawCode}\n</svg>`
          : `<re-icon icon="${kebabName}" size="${size}" color="${colorVal}"></re-icon>`;
      default:
        return "";
    }
  };

  const handleCopyCode = () => {
    playClickSound();
    const code = getCodeSnippet();
    void navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      onCopyNotice(`Copied <${iconName} /> ${format.toUpperCase()}`);
      setTimeout(() => setCopied(false), 1400);
    });
  };

  const handleDownloadSvg = () => {
    playClickSound();
    const rawCode = window.ReiconAgent?.getIconCode ? window.ReiconAgent.getIconCode(kebabName) : null;
    const svgContent = rawCode
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">${rawCode}</svg>`
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
    onCopyNotice(`Downloaded ${iconName}.svg`);
  };

  return (
    <Drawer.Root
      open={Boolean(iconName)}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40 dark:bg-black/65 backdrop-blur-md z-50 transition-opacity" />
        <Drawer.Content className="bg-[var(--modal-bg)] h-fit fixed bottom-0 left-0 right-0 z-50 outline-none max-w-3xl lg:max-w-4xl mx-auto rounded-t-[28px] border-t border-[var(--border-medium)] px-6 pt-4 pb-8 sm:px-8 sm:pt-5 sm:pb-9 shadow-2xl overflow-hidden backdrop-blur-2xl">
          {/* Top Drag Handle */}
          <div className="w-12 h-1 bg-neutral-300 dark:bg-neutral-700 rounded-full mx-auto mb-4 shrink-0 cursor-grab active:cursor-grabbing" />

          {iconName && (
            <div className="flex flex-col gap-4">
              {/* Full Width Top Header */}
              <div className="flex items-start justify-between w-full">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                    {category}
                  </span>
                  <h2 className="text-xl font-[550] text-[var(--text-primary)] tracking-tight">
                    {iconName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    playClickSound();
                    onClose();
                  }}
                  aria-label="Close detail modal"
                  className="size-8 rounded-full bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] flex items-center justify-center text-[var(--text-primary)] transition cursor-pointer motion-safe:active:scale-[0.97] border-none shrink-0"
                >
                  <IconRenderer name="X" size={14} strokeWidth={2} />
                </button>
              </div>

              {/* 2 Column Content Layout */}
              <div className="flex flex-col md:flex-row gap-5 items-stretch">
                {/* Left Column: Preview Box + Liquid Controls */}
                <div className="md:w-1/2 flex flex-col justify-between space-y-3">
                  {/* Icon Stage Box */}
                  <div
                    ref={stageRef}
                    className="flex-1 py-8 flex items-center justify-center rounded-[16px] bg-[var(--bg-card)] border-none relative min-h-[150px]"
                  >
                    <IconRenderer
                      name={iconName}
                      size={size}
                      color={selectedColor}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Controls Row: Color Swatches + Size Selectors */}
                  <div className="flex items-center justify-between gap-2">
                    {/* Single Lavender Swatch & Color Picker Pill */}
                    <label
                      title={`Click to choose color (Current: ${selectedColor})`}
                      className="relative h-9 px-3.5 flex items-center gap-2 bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] rounded-full border-none cursor-pointer select-none transition motion-safe:active:scale-[0.97]"
                    >
                      <span className="text-[11px] font-mono text-[var(--text-muted)]">Color:</span>
                      <span
                        className="size-4.5 rounded-full border border-[var(--border-medium)] shadow-sm shrink-0 transition-transform"
                        style={{ backgroundColor: selectedColor || "#9B8AFB" }}
                      />
                      <input
                        type="color"
                        value={selectedColor.startsWith("#") ? selectedColor : "#9B8AFB"}
                        onChange={(e) => {
                          playClickSound();
                          setSelectedColor(e.target.value);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full p-0 border-0"
                      />
                    </label>

                    {/* Size Selectors (48 / 64 / 84) */}
                    <div className="h-9 flex items-center gap-0.5 bg-[var(--bg-btn)] p-1 rounded-full border-none select-none">
                      {[48, 64, 84].map((s) => {
                        const active = size === s;
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setSize(s);
                            }}
                            className={`relative h-7 flex cursor-pointer items-center justify-center rounded-full px-2.5 text-xs font-mono font-[550] leading-none motion-safe:active:scale-[0.97] ${
                              active
                                ? "text-[var(--text-primary)] font-semibold"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="modal-size-active"
                                aria-hidden="true"
                                className="absolute inset-[2px] rounded-full bg-[var(--bg-btn-hover)] z-0"
                                transition={
                                  reduced
                                    ? { duration: 0 }
                                    : { type: "spring", stiffness: 480, damping: 40 }
                                }
                              />
                            )}
                            <span className="relative z-10">{s}px</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Export Format + Code Box + Action Buttons */}
                <div className="md:w-1/2 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] block">
                      Export Format
                    </span>
                    {/* Format Selectors */}
                    <div className="h-9 flex items-center gap-0.5 bg-[var(--bg-btn)] p-1 rounded-full border-none select-none w-full">
                      {(["jsx", "vue", "svg"] as const).map((fmt) => {
                        const active = format === fmt;
                        return (
                          <button
                            key={fmt}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              setFormat(fmt);
                            }}
                            className={`relative h-7 flex-1 flex cursor-pointer items-center justify-center rounded-full px-3 text-xs font-mono uppercase font-[550] leading-none motion-safe:active:scale-[0.97] ${
                              active
                                ? "text-[var(--text-primary)] font-semibold"
                                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="modal-format-active"
                                aria-hidden="true"
                                className="absolute inset-[2px] rounded-full bg-[var(--bg-btn-hover)] z-0"
                                transition={
                                  reduced
                                    ? { duration: 0 }
                                    : { type: "spring", stiffness: 480, damping: 40 }
                                }
                              />
                            )}
                            <span className="relative z-10">{fmt}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Code Box */}
                  <div
                    ref={codeBoxRef}
                    className="flex-1 rounded-[16px] bg-[var(--code-bg)] p-4 border-none min-h-[110px] flex items-center relative"
                  >
                    <pre className="font-mono text-xs text-[var(--text-primary)] overflow-x-auto w-full leading-relaxed scrollbar-none pr-12">
                      <code>{getCodeSnippet()}</code>
                    </pre>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="absolute top-3 right-3 py-1.5 px-2.5 rounded-full bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] text-[var(--text-primary)] text-xs font-[550] flex items-center gap-1 transition cursor-pointer motion-safe:active:scale-[0.97] border-none"
                    >
                      <CopyMorphIcon copied={copied} />
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2.5">
                    <button
                      type="button"
                      onClick={handleDownloadSvg}
                      className="flex-1 h-9.5 px-3.5 rounded-full bg-[var(--bg-btn)] hover:bg-[var(--bg-btn-hover)] text-[var(--text-primary)] text-xs font-[550] flex items-center justify-center gap-2 transition-all motion-safe:active:scale-[0.97] cursor-pointer border-none"
                    >
                      <svg
                        width="14"
                        height="14"
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
                      <span>Download SVG</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex-1 h-9.5 px-3.5 rounded-full bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] text-xs font-[550] flex items-center justify-center gap-2 hover:opacity-90 transition-all motion-safe:active:scale-[0.97] cursor-pointer border-none"
                    >
                      <CopyMorphIcon copied={copied} />
                      <span>Copy {format.toUpperCase()}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
