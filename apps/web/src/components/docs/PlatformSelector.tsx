import { motion, useReducedMotion } from "framer-motion";
import { PLATFORM_DOCS, type PlatformDoc } from "../../docs/platforms";
import { playClickSound } from "../../utils/sound";

export function PlatformSelector({
  activeId,
  onSelect,
}: {
  activeId: string;
  onSelect: (doc: PlatformDoc) => void;
}) {
  const reduced = useReducedMotion() ?? false;
  const platformOptions = PLATFORM_DOCS.filter((d) => d.id !== "docs");

  return (
    <div className="w-full flex items-center gap-1.5 overflow-x-auto no-scrollbar py-2 border-b border-[var(--border-subtle)]">
      {platformOptions.map((doc) => {
        const isActive = doc.id === activeId;
        return (
          <button
            key={doc.id}
            type="button"
            onClick={() => {
              playClickSound();
              onSelect(doc);
            }}
            className={`relative px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors shrink-0 ${
              isActive
                ? "text-[var(--text-primary)] font-semibold"
                : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
            }`}
          >
            {isActive && (
              <motion.span
                layoutId="platform-tab-active"
                transition={
                  reduced
                    ? { duration: 0 }
                    : { type: "spring", stiffness: 450, damping: 38 }
                }
                className="absolute inset-0 rounded-lg bg-[var(--bg-btn-hover)] z-0"
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {doc.badge}
            </span>
          </button>
        );
      })}
    </div>
  );
}
