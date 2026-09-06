import { useState, useEffect, useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CopyMorphIcon } from "./CopyMorphIcon";
import { useSmoothCorners } from "../utils/useSmoothCorners";
import { playClickSound } from "../utils/sound";

const INK = "var(--text-primary)";
const MONO = "var(--font-mono), ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

const TOKEN_COLORS = ["var(--accent-color, #9B8AFB)", "var(--code-token-1, #38BDF8)", "var(--code-token-2, #34D399)"];
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@/._-";

type Cell = { ch: string; color: string };

function toCells(command: string): Cell[] {
  const cells: Cell[] = [];
  const parts = command.split(" ");
  parts.forEach((part, pi) => {
    const color = TOKEN_COLORS[Math.min(pi, TOKEN_COLORS.length - 1)];
    for (const ch of part) cells.push({ ch, color });
    if (pi < parts.length - 1) cells.push({ ch: " ", color: INK });
  });
  return cells;
}

function ScrambleCommand({ command }: { command: string }) {
  const reduced = useReducedMotion() ?? false;
  const target = toCells(command);
  const [scramble, setScramble] = useState<Cell[] | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    if (reduced) {
      setScramble(null);
      return;
    }
    const next = toCells(command);
    const PER = 6;
    const DUR = 130;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      let settled = true;
      const frame = next.map((cell, i) => {
        if (cell.ch === " " || elapsed >= i * PER + DUR) return cell;
        settled = false;
        return {
          ch: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
          color: cell.color,
        };
      });
      setScramble(settled ? null : frame);
      if (!settled) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [command, reduced]);

  const cells = scramble ?? target;

  return (
    <pre
      style={{
        margin: 0,
        padding: "16px 18px",
        overflowX: "auto",
        lineHeight: 1.65,
        fontFamily: MONO,
        fontSize: 13,
      }}
    >
      <code>
        {cells.map((cell, i) => (
          <span key={i} style={{ color: cell.color, whiteSpace: "pre" }}>
            {cell.ch}
          </span>
        ))}
      </code>
    </pre>
  );
}

export function PackageSwitcher({
  items = [
    { id: "cdn", command: '<script src="https://cdn.jsdelivr.net/npm/reicon-agent/cdn/reicon.js"></script>' },
    { id: "npm", command: "npm i reicon-agent" },
    { id: "pnpm", command: "pnpm add reicon-agent" },
    { id: "bun", command: "bun add reicon-agent" },
  ],
  onCopyNotice,
}: {
  items?: { id: string; command: string }[];
  onCopyNotice?: (msg: string) => void;
}) {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const reduced = useReducedMotion() ?? false;
  const smoothRef = useSmoothCorners<HTMLDivElement>(16);
  const cur = items[active];

  const copy = () => {
    playClickSound();
    void navigator.clipboard?.writeText(cur.command).then(() => {
      setCopied(true);
      if (onCopyNotice) onCopyNotice(`Copied "${cur.command}" to clipboard!`);
      window.setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div
      ref={smoothRef}
      style={{
        margin: "22px 0 0",
        borderRadius: 16,
        overflow: "hidden",
        background: "var(--code-bg)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          padding: "13px 13px 5px 13px",
        }}
      >
        {items.map((it, i) => {
          const isActive = i === active;
          return (
            <button
              key={it.id}
              type="button"
              onClick={() => {
                playClickSound();
                setActive(i);
              }}
              style={{
                position: "relative",
                fontFamily: MONO,
                fontSize: 11.76,
                lineHeight: 1.28,
                padding: "4px 10px",
                borderRadius: 6,
                border: 0,
                background: "transparent",
                color: isActive ? "var(--text-primary)" : "var(--text-muted)",
                fontWeight: isActive ? 600 : 500,
                cursor: "pointer",
              }}
            >
              {isActive && (
                <motion.span
                  aria-hidden="true"
                  layoutId="pkg-tab-active"
                  transition={
                    reduced
                      ? { duration: 0 }
                      : { type: "spring", stiffness: 480, damping: 40 }
                  }
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 6,
                    background: "var(--bg-btn-hover)",
                    zIndex: 0,
                  }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1 }}>{it.id}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={copy}
          title="Copy command"
          style={{
            marginLeft: "auto",
            display: "grid",
            placeItems: "center",
            padding: "2px 7px",
            borderRadius: 7,
            border: 0,
            background: "transparent",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
        >
          <CopyMorphIcon copied={copied} />
        </button>
      </div>
      <ScrambleCommand command={cur.command} />
    </div>
  );
}
