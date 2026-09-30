import Glass from "../vendor/glass/glass.js";

const cache = new Map<string, string>();
const MAX_CACHE = 800;

function normalizeColor(color: string | undefined): string {
  if (color && /^#[0-9a-fA-F]{3,8}$/.test(color)) return color;
  return "#9B8AFB";
}

function hashStr(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(36);
}

function stableId(rawCode: string, color: string, size: number): string {
  const c = color.replace("#", "");
  return `g${hashStr(rawCode)}_${c}_${size}`;
}

export function getGlassSvg(
  rawCode: string,
  _kebab: string,
  color: string | undefined,
  size: number,
): string {
  if (!rawCode) return "";
  const safeColor = normalizeColor(color);
  // Key includes a hash of the actual SVG code (not just kebab) so duplicate
  // kebab names across categories never collide in cache or gradient IDs.
  const codeHash = hashStr(rawCode);
  const key = `${codeHash}|${safeColor}|${size}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const svg = Glass.convert(rawCode, {
    color: safeColor,
    size,
    id: stableId(rawCode, safeColor, size),
  });
  if (cache.size >= MAX_CACHE) {
    const first = cache.keys().next().value;
    if (first) cache.delete(first);
  }
  cache.set(key, svg);
  return svg;
}

export function clearGlassCache(): void {
  cache.clear();
}

let warmGen = 0;

// Pre-convert the first icons during idle time so scrolling shows glass
// immediately instead of converting on intersection. Stale schedules
// (e.g. rapid color drags) cancel themselves via the generation guard.
export function warmGlassCache(
  items: Array<{ code: string; kebab: string }>,
  color: string | undefined,
  size: number,
  limit = 120,
): void {
  if (typeof window === "undefined") return;
  const gen = ++warmGen;
  const queue = items.slice(0, limit);
  const schedule = (fn: () => void) => {
    if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(() => fn());
    else setTimeout(fn, 0);
  };
  const step = () => {
    if (gen !== warmGen) return;
    const start = performance.now();
    while (queue.length > 0 && performance.now() - start < 8) {
      const item = queue.shift();
      if (item && item.code) getGlassSvg(item.code, item.kebab, color, size);
    }
    if (queue.length > 0) schedule(step);
  };
  schedule(step);
}
