import type { PlatformDoc } from "../../docs/platforms";
import { FrameworkIcon } from "./FrameworkIcon";

export function HeroDocsHeaderBanner({
  docName,
  activeDoc,
}: {
  color?: string;
  docName?: string;
  activeDoc?: PlatformDoc;
  onCopyNotice?: (msg: string) => void;
}) {
  const line1 = docName ? `Reicon ${docName} Integration` : "Framework Documentation";
  const line2 = activeDoc ? `${activeDoc.pkg} — ${activeDoc.tagline}` : "for React, Vue, Svelte, Flutter & Web";

  return (
    <div className="flex flex-col items-center text-center gap-6 sm:gap-7 py-10 sm:py-16 select-none max-w-4xl mx-auto px-4">
      <h1 className="text-lg sm:text-2xl font-[550] leading-[1.4] tracking-[-0.3px] text-[var(--text-primary)] flex flex-col items-center gap-1.5 sm:gap-2 text-center">
        <span className="inline-flex items-center justify-center gap-2.5">
          {activeDoc?.id && activeDoc.id !== "docs" && (
            <FrameworkIcon id={activeDoc.id} size={28} />
          )}
          <span>{line1}</span>
        </span>
        <span>{line2}</span>
      </h1>
    </div>
  );
}
