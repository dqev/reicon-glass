import { useState, useRef, useEffect } from "react";
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

  return (
    <div ref={dropdownRef} className="relative inline-block" style={{ zIndex: 30 }}>
      {/* Compact Framework Select Button */}
      <button
        type="button"
        onClick={() => {
          playClickSound();
          setOpen((prev) => !prev);
        }}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          height: 38,
          padding: "0 16px 0 14px",
          borderRadius: 9999,
          background: "#171717",
          color: "var(--text-primary)",
          border: "none",
          fontSize: 13.5,
          fontWeight: 500,
          cursor: "pointer",
          transition: "background 0.15s ease",
          width: "auto",
        }}
        className="hover:bg-[var(--bg-btn-hover)]"
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 9 }}>
          <FrameworkIcon id={activeDoc.id} size={17} />
          <span style={{ whiteSpace: "nowrap" }}>{activeDoc.badge}</span>
        </div>
        {/* Up-down chevron selector icon */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.65, flexShrink: 0 }}>
          <polyline points="7 15 12 20 17 15" />
          <polyline points="7 9 12 4 17 9" />
        </svg>
      </button>

      {/* Popover Dropdown Menu (No Border) */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 6, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              minWidth: 210,
              zIndex: 100,
              padding: 6,
              borderRadius: 16,
              background: "#171717",
              border: "none",
              boxShadow: "0 20px 48px rgba(0, 0, 0, 0.75)",
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            {PLATFORM_DOCS.map((doc) => {
              const isActive = doc.id === activeDoc.id;
              return (
                <button
                  key={doc.id}
                  type="button"
                  onClick={() => handleSelect(doc)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 10,
                    background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                    color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
                    border: "none",
                    fontSize: 13.5,
                    fontWeight: isActive ? 600 : 450,
                    cursor: "pointer",
                    transition: "background 0.12s ease",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                  }}
                  className="hover:bg-[var(--bg-btn-hover)]"
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <FrameworkIcon id={doc.id} size={18} />
                    <span>{doc.badge}</span>
                  </div>
                  {isActive && (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent-color, #9B8AFB)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: 14 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
