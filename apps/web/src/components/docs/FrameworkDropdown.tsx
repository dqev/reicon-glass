import { useState, useRef, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLATFORM_DOCS, type PlatformDoc } from "../../docs/platforms";
import { FrameworkIcon } from "./FrameworkIcon";
import { playClickSound } from "../../utils/sound";

export function FrameworkDropdown({
  activeDoc,
  onSelect,
}: {
  activeDoc: PlatformDoc;
  onSelect: (doc: PlatformDoc) => void;
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (doc: PlatformDoc) => {
    playClickSound();
    onSelect(doc);
    setOpen(false);
  };

  const frameworkOptions = useMemo(
    () => PLATFORM_DOCS.filter((d) => d.id !== "docs"),
    []
  );

  const displayFrameworkName =
    activeDoc.id === "docs" ? "Select Framework" : activeDoc.name;

  return (
    <div ref={dropdownRef} className="relative inline-block z-30 select-none">
      {/* Modern Framework Select Pill Button */}
      <button
        type="button"
        onClick={() => {
          playClickSound();
          setOpen((prev) => !prev);
        }}
        className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-full text-xs sm:text-sm font-[550] leading-none whitespace-nowrap transition cursor-pointer flex items-center gap-2 bg-[var(--bg-btn)] text-[var(--text-primary)] hover:bg-[var(--bg-btn-hover)] border-none select-none shadow-sm"
      >
        <span className="text-[var(--text-muted)] font-normal">Framework:</span>
        <FrameworkIcon id={activeDoc.id === "docs" ? "react" : activeDoc.id} size={18} />
        <span className="font-semibold text-[var(--text-primary)]">{displayFrameworkName}</span>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform duration-200 shrink-0 opacity-70 ${open ? "rotate-180" : ""}`}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {/* Popover Dropdown Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 8, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 w-52 sm:w-60 max-h-72 overflow-y-auto rounded-2xl bg-[var(--dropdown-bg)] border border-[var(--border-medium)] backdrop-blur-2xl p-1.5 z-50 shadow-2xl scrollbar-thin flex flex-col gap-0.5"
          >
            {frameworkOptions.map((doc) => {
              const isActive = doc.id === activeDoc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelect(doc)}
                  className={`w-full text-left px-3 py-2.5 sm:px-3.5 sm:py-2.5 rounded-xl text-xs font-[550] transition cursor-pointer flex items-center justify-between border-none ${
                    isActive
                      ? "bg-[var(--pill-active-bg)] text-[var(--pill-active-text)] font-semibold"
                      : "text-[var(--text-secondary)] hover:bg-[var(--bg-btn-hover)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <FrameworkIcon id={doc.id} size={18} />
                    <span>{doc.name}</span>
                  </div>
                  {isActive && <span className="text-xs font-bold">✓</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
