import { memo } from "react";
import { FrameworkDocCard } from "./FrameworkDocCard";
import type { PlatformDoc } from "../../docs/platforms";

export interface FrameworkGridWallProps {
  displayedDocs: PlatformDoc[];
  size: number;
  onSelectDoc: (doc: PlatformDoc) => void;
  onCopyNotice: (msg: string) => void;
}

export const FrameworkGridWall = memo(function FrameworkGridWall({
  displayedDocs,
  size,
  onSelectDoc,
  onCopyNotice,
}: FrameworkGridWallProps) {
  if (displayedDocs.length === 0) {
    return (
      <div className="w-full py-16 text-center text-[var(--text-muted)] text-sm">
        No framework documentation found matching your search.
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Framework Cards Grid Wall */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 w-full">
        {displayedDocs.map((doc) => (
          <FrameworkDocCard
            key={doc.id}
            doc={doc}
            size={size}
            onSelectDoc={onSelectDoc}
            onCopyNotice={onCopyNotice}
          />
        ))}
      </div>
    </div>
  );
});
