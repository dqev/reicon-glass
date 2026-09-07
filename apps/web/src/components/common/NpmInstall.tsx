import { useState } from "react";
import { CopyMorphIcon } from "./CopyIconTransition";
import { playClickSound } from "../../utils/sound";
import { copyToClipboard } from "../../utils/clipboard";

export function NpmInstall({
  command = "npm i reicon-agent",
  onCopy,
}: {
  command?: string;
  onCopy?: (msg: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      title="Copy install command"
      onClick={() => {
        playClickSound();
        void copyToClipboard(command).then((ok) => {
          if (ok) {
            setCopied(true);
            if (onCopy) onCopy(`Copied "${command}" to clipboard!`);
            setTimeout(() => setCopied(false), 1400);
          }
        });
      }}
      className="group/npm flex h-11 items-center gap-3 rounded-full bg-[var(--bg-btn)] pl-5 pr-2 hover:bg-[var(--bg-btn-hover)] border-none motion-safe:active:scale-[0.97] cursor-pointer"
    >
      <span className="font-mono text-[13px] leading-5 font-semibold select-none" style={{ color: "var(--accent-color, #9B8AFB)" }}>$</span>
      <span className="font-mono text-[13px] leading-5 text-[var(--text-primary)]">{command}</span>
      <span className="grid size-7 shrink-0 place-items-center rounded-full text-[var(--text-muted)] group-hover/npm:text-[var(--text-primary)]">
        <CopyMorphIcon copied={copied} />
      </span>
    </button>
  );
}
