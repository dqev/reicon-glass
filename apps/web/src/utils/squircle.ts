const EPS = 1e-3;

const fmt = (n: number) => {
  const r = +n.toFixed(4);
  return Object.is(r, -0) ? 0 : r;
};

interface Vec {
  x: number;
  y: number;
}

interface CornerGeometry {
  p: number;
  b1x: number;
  b2x: number;
  arc: Vec;
  radius: number;
  plain: boolean;
}

function cornerGeometry(
  radius: number,
  s: number,
  budget: number,
): CornerGeometry {
  const r = Math.min(radius, budget);
  const sEff = Math.max(0, Math.min(s, budget / r - 1, 1));

  if (sEff <= EPS) {
    return {
      p: r,
      b1x: r,
      b2x: r,
      arc: { x: r, y: 0 },
      radius: r,
      plain: true,
    };
  }

  const sweep = (Math.PI / 2) * (1 - sEff);
  const phi = (-3 * Math.PI) / 4 + sweep / 2;
  const arc: Vec = { x: r + r * Math.cos(phi), y: r + r * Math.sin(phi) };
  const t: Vec = { x: Math.sin(phi), y: -Math.cos(phi) };

  const l2 = arc.y / t.y;
  const b2x = arc.x - l2 * t.x;
  const b1x = b2x + (3 * l2 * l2) / (2 * r * t.y);
  const p = (1 + sEff) * r;

  return { p, b1x, b2x, arc, radius: r, plain: false };
}

export function squirclePath({
  width,
  height,
  radius,
  smoothing = 0.6,
}: {
  width: number;
  height: number;
  radius: number;
  smoothing?: number;
}): string {
  const w = Math.max(0, width);
  const h = Math.max(0, height);
  if (!w || !h) return "";

  const budget = Math.min(w, h) / 2;
  const r = Math.min(Math.max(0, radius), budget);
  if (!r) return `M 0 0 L ${fmt(w)} 0 L ${fmt(w)} ${fmt(h)} L 0 ${fmt(h)} Z`;

  const s = Math.min(Math.max(0, smoothing), 1);
  const g = cornerGeometry(r, s, budget);

  const corner = (K: Vec, e1: Vec, e2: Vec): string => {
    const at = (u: number, v: number): string =>
      `${fmt(K.x + u * e1.x + v * e2.x)} ${fmt(K.y + u * e1.y + v * e2.y)}`;

    if (g.plain) {
      return `A ${fmt(g.radius)} ${fmt(g.radius)} 0 0 1 ${at(0, g.p)}`;
    }
    return [
      `C ${at(g.b1x, 0)} ${at(g.b2x, 0)} ${at(g.arc.x, g.arc.y)}`,
      `A ${fmt(g.radius)} ${fmt(g.radius)} 0 0 1 ${at(g.arc.y, g.arc.x)}`,
      `C ${at(0, g.b2x)} ${at(0, g.b1x)} ${at(0, g.p)}`,
    ].join(" ");
  };

  return [
    `M ${fmt(g.p)} 0`,
    `L ${fmt(w - g.p)} 0`,
    corner({ x: w, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }),
    `L ${fmt(w)} ${fmt(h - g.p)}`,
    corner({ x: w, y: h }, { x: 0, y: -1 }, { x: -1, y: 0 }),
    `L ${fmt(g.p)} ${fmt(h)}`,
    corner({ x: 0, y: h }, { x: 1, y: 0 }, { x: 0, y: -1 }),
    `L 0 ${fmt(g.p)}`,
    corner({ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }),
    "Z",
  ].join(" ");
}
