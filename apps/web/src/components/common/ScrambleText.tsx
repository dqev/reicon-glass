import { useState, useEffect, useRef } from "react";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@/._-";

export function ScrambleWord({ word }: { word: string }) {
  const [scramble, setScramble] = useState<string | null>(null);
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    const chars = [...word];
    const PER = 4;
    const DUR = 120;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const elapsed = now - start;
      let settled = true;
      const frame = chars.map((ch, i) => {
        if (ch === " " || ch === "\n" || elapsed >= i * PER + DUR) return ch;
        settled = false;
        return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      });
      setScramble(settled ? null : frame.join(""));
      if (!settled) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [word]);

  return <>{scramble ?? word}</>;
}
