import { useState, useEffect, useMemo, useRef } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import { IconRenderer } from "../explorer/IconRenderer";
import { CopyMorphIcon } from "../common/CopyIconTransition";
import { playClickSound } from "../../utils/sound";
import { copyToClipboard } from "../../utils/clipboard";

import { getIconCodeForCategory } from "../../utils/iconDataLoader";
import { getGlassSvg } from "../../utils/glassCache";

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
  const open = Boolean(iconName);
  const [selectedColor, setSelectedColor] = useState<string>(color || "currentColor");
  const [size, setSize] = useState<number>(64);
  const [format, setFormat] = useState<"jsx" | "vue" | "svg">("jsx");
  const [copied, setCopied] = useState<boolean>(false);
  const [colorOpen, setColorOpen] = useState<boolean>(false);

  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (color) {
      setSelectedColor(color);
    }
  }, [color, iconName]);

  useEffect(() => {
    setColorOpen(false);
    setCopied(false);
    // Reset to defaults on new icon open
    setSize(64);
  }, [iconName]);

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
        onCopyNotice(`Copied <${iconName} /> ${format.toUpperCase()}`);
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
    onCopyNotice(`Downloaded ${iconName}.svg`);
  };

  return (
    <AnimatePresence>
      {open && iconName && (
        <>
          {/* Backdrop (invisible but captures clicks to close) */}
          <div
            className="fixed inset-0 z-40"
            onClick={onClose}
          />
          
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-[620px] px-4 pointer-events-none">
            <motion.div
              key="detail-panel"
              role="dialog"
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 40, opacity: 0, scale: 0.95 }}
              transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 30 }}
              className="bg-[#212121] border border-white/10 rounded-2xl shadow-2xl p-4 flex flex-col gap-4 pointer-events-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span className="text-[13px] text-white/80 font-medium pl-1">{kebabName}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      playClickSound();
                      setSize(64);
                      setSelectedColor(color || "currentColor");
                    }}
                    className="size-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                  </button>
                  <button
                    onClick={() => {
                      playClickSound();
                      onClose();
                    }}
                    className="size-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 transition-colors"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Preview Stage */}
                <div 
                  className="w-full sm:w-[160px] h-[160px] rounded-xl flex items-center justify-center shrink-0 overflow-hidden relative"
                  style={{ background: 'repeating-conic-gradient(#2a2a2a 0% 25%, #242424 0% 50%) 50% / 16px 16px' }}
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
                    {/* Size */}
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] uppercase tracking-wide text-white/40 font-semibold pl-1">Size</span>
                      <div className="h-10 bg-[#2a2a2a] rounded-lg border border-white/5 flex items-center px-3">
                        <input
                          type="number"
                          min="16"
                          max="512"
                          value={size}
                          onChange={(e) => setSize(Number(e.target.value))}
                          className="bg-transparent text-white text-sm w-full outline-none"
                        />
                        <span className="text-white/40 text-xs select-none">px</span>
                      </div>
                    </div>

                    {/* Color */}
                    <div className="flex flex-col gap-1.5 relative">
                      <span className="text-[10px] uppercase tracking-wide text-white/40 font-semibold pl-1">Color</span>
                      <button
                        onClick={() => setColorOpen(!colorOpen)}
                        className="h-10 bg-[#2a2a2a] rounded-lg border border-white/5 flex items-center px-3 gap-2 hover:bg-[#333] transition-colors"
                      >
                        <span 
                          className="size-4 rounded-full shadow-inner border border-white/10"
                          style={{ backgroundColor: selectedColor === 'currentColor' ? '#ffffff' : selectedColor }}
                        />
                        <span className="text-white text-sm truncate flex-1 text-left">
                          {selectedColor}
                        </span>
                      </button>
                      
                      <AnimatePresence>
                        {colorOpen && (
                          <motion.div
                            ref={colorPickerRef}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute bottom-full left-0 mb-2 z-50 bg-[#212121] border border-white/10 p-3 rounded-xl shadow-2xl"
                          >
                            <HexColorPicker
                              color={hexForPicker}
                              onChange={setSelectedColor}
                            />
                            <button 
                              className="mt-3 w-full py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs text-white/70"
                              onClick={() => setSelectedColor("currentColor")}
                            >
                              Reset to currentColor
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Export Formats Row */}
                  <div className="flex flex-col gap-1.5 mt-auto">
                    <span className="text-[10px] uppercase tracking-wide text-white/40 font-semibold pl-1">Export</span>
                    <div className="flex items-center gap-2">
                      <div className="h-10 bg-[#2a2a2a] rounded-lg border border-white/5 flex p-1 shrink-0">
                        {(["jsx", "vue", "svg"] as const).map((fmt) => (
                          <button
                            key={fmt}
                            onClick={() => {
                              playClickSound();
                              setFormat(fmt);
                            }}
                            className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                              format === fmt 
                                ? "bg-[#444] text-white shadow-sm" 
                                : "text-white/50 hover:text-white"
                            }`}
                          >
                            {fmt.toUpperCase()}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={handleCopyCode}
                        className="h-10 flex-1 bg-white hover:bg-gray-100 text-black text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        <CopyMorphIcon copied={copied} />
                        <span>Copy Code</span>
                      </button>

                      <button
                        onClick={handleDownloadSvg}
                        className="size-10 shrink-0 bg-[#2a2a2a] hover:bg-[#333] border border-white/5 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer"
                        title="Download SVG"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      </button>
                    </div>
                  </div>
                  
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
