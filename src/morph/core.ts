import type {
  CubicPath,
  Sampled,
  PlanItem,
  MorphPlan,
  UniversalIconInput
} from './types';
import { resolveIconToPathD } from './utils';

// ============================================================================
// 1. MASS-SPRING ODE SIMULATOR
// ============================================================================

export class Spring {
  x = 0;
  v = 0;
  k = 420;
  c = 30;

  config(k: number, c: number) {
    this.k = k;
    this.c = c;
  }

  start() {
    this.x = 0;
    this.v = 0;
  }

  step(dt: number): boolean {
    const steps = Math.max(1, Math.ceil(dt / 0.002));
    const h = dt / steps;
    const k = this.k;
    const c = this.c;

    for (let i = 0; i < steps; i++) {
      const a = -k * (this.x - 1) - c * this.v;
      this.v += a * h;
      this.x += this.v * h;
    }

    if (Math.abs(1 - this.x) < 0.001 && Math.abs(this.v) < 0.02) {
      this.x = 1;
      this.v = 0;
      return true;
    }
    return false;
  }
}

// ============================================================================
// 2. CUBIC BEZIER PATH NORMALIZER & CANONICAL SERIALIZER
// ============================================================================

const TAU = 2 * Math.PI;

function builder(x0: number, y0: number) {
  const pts: number[] = [x0, y0];
  let cx = x0;
  let cy = y0;

  const cubic = (x1: number, y1: number, x2: number, y2: number, x: number, y: number) => {
    pts.push(x1, y1, x2, y2, x, y);
    cx = x;
    cy = y;
  };

  const line = (x: number, y: number) => {
    if (Math.abs(x - cx) < 1e-12 && Math.abs(y - cy) < 1e-12) return;
    cubic(cx + (x - cx) / 3, cy + (y - cy) / 3, cx + 2 * (x - cx) / 3, cy + 2 * (y - cy) / 3, x, y);
  };

  const quad = (x1: number, y1: number, x: number, y: number) => {
    cubic(cx + (2 / 3) * (x1 - cx), cy + (2 / 3) * (y1 - cy), x + (2 / 3) * (x1 - x), y + (2 / 3) * (y1 - y), x, y);
  };

  const arc = (rx0: number, ry0: number, rotDeg: number, large: number, sweep: number, x: number, y: number) => {
    const x1 = cx;
    const y1 = cy;
    if (Math.abs(x - x1) < 1e-12 && Math.abs(y - y1) < 1e-12) return;
    let rx = Math.abs(rx0);
    let ry = Math.abs(ry0);
    if (rx < 1e-12 || ry < 1e-12) {
      line(x, y);
      return;
    }
    const phi = (rotDeg * Math.PI) / 180;
    const cosP = Math.cos(phi);
    const sinP = Math.sin(phi);
    const hx = (x1 - x) / 2;
    const hy = (y1 - y) / 2;
    const x1p = cosP * hx + sinP * hy;
    const y1p = -sinP * hx + cosP * hy;
    const lam = (x1p * x1p) / (rx * rx) + (y1p * y1p) / (ry * ry);
    if (lam > 1) {
      const s = Math.sqrt(lam);
      rx *= s;
      ry *= s;
    }
    const rx2 = rx * rx;
    const ry2 = ry * ry;
    const xp2 = x1p * x1p;
    const yp2 = y1p * y1p;
    let rad = (rx2 * ry2 - rx2 * yp2 - ry2 * xp2) / (rx2 * yp2 + ry2 * xp2);
    if (rad < 0) rad = 0;
    const co = (large === sweep ? -1 : 1) * Math.sqrt(rad);
    const cxp = (co * rx * y1p) / ry;
    const cyp = (-co * ry * x1p) / rx;
    const ccx = cosP * cxp - sinP * cyp + (x1 + x) / 2;
    const ccy = sinP * cxp + cosP * cyp + (y1 + y) / 2;
    const th1 = Math.atan2((y1p - cyp) / ry, (x1p - cxp) / rx);
    let dth = Math.atan2((-y1p - cyp) / ry, (-x1p - cxp) / rx) - th1;
    if (sweep === 0 && dth > 0) dth -= TAU;
    else if (sweep === 1 && dth < 0) dth += TAU;
    const slices = Math.max(1, Math.ceil(Math.abs(dth) / (Math.PI / 2) - 1e-9));
    const delta = dth / slices;
    const alpha = (4 / 3) * Math.tan(delta / 4);
    const ex = (t: number) => ccx + rx * Math.cos(t) * cosP - ry * Math.sin(t) * sinP;
    const ey = (t: number) => ccy + rx * Math.cos(t) * sinP + ry * Math.sin(t) * cosP;
    const dx = (t: number) => -rx * Math.sin(t) * cosP - ry * Math.cos(t) * sinP;
    const dy = (t: number) => -rx * Math.sin(t) * sinP + ry * Math.cos(t) * cosP;
    let t0 = th1;
    let p0x = x1;
    let p0y = y1;
    for (let s = 1; s <= slices; s++) {
      const t1 = th1 + delta * s;
      const p1x = s === slices ? x : ex(t1);
      const p1y = s === slices ? y : ey(t1);
      cubic(p0x + alpha * dx(t0), p0y + alpha * dy(t0), p1x - alpha * dx(t1), p1y - alpha * dy(t1), p1x, p1y);
      t0 = t1;
      p0x = p1x;
      p0y = p1y;
    }
  };

  const finish = (closed: boolean): CubicPath | null => {
    if (closed) line(pts[0], pts[1]);
    if (pts.length < 8) return null;
    return { pts: Float64Array.from(pts), closed };
  };

  return [cubic, line, quad, arc, finish] as const;
}

const COMMANDS = "MmLlHhVvCcSsQqTtAaZz";

function parsePath(d: string) {
  const subs: any[] = [];
  const n = d.length;
  let i = 0;
  let cx = 0, cy = 0, sx = 0, sy = 0;
  let cur: any = null;
  let cmd = "", px = 0, py = 0, prev = "";

  const isDigit = (c: number) => c >= 48 && c <= 57;
  const skip = () => {
    while (i < n) {
      const c = d.charCodeAt(i);
      if (c === 32 || c === 9 || c === 10 || c === 13 || c === 12 || c === 44) i++;
      else break;
    }
  };
  const num = () => {
    skip();
    const start = i;
    if (i < n && (d[i] === "+" || d[i] === "-")) i++;
    while (i < n && isDigit(d.charCodeAt(i))) i++;
    if (i < n && d[i] === ".") { i++; while (i < n && isDigit(d.charCodeAt(i))) i++; }
    return Number(d.slice(start, i));
  };
  const flag = () => {
    skip();
    const c = d[i++];
    return c === "1" ? 1 : 0;
  };
  const open = () => {
    if (!cur) {
      cur = { x0: cx, y0: cy, segs: [], closed: false };
      subs.push(cur);
    }
    return cur;
  };

  let rel = false;
  const nx = () => num() + (rel ? cx : 0);
  const ny = () => num() + (rel ? cy : 0);

  while (true) {
    skip();
    if (i >= n) break;
    const ch = d[i];
    if (COMMANDS.includes(ch)) { cmd = ch; i++; }
    else if (cmd === "M") cmd = "L";
    else if (cmd === "m") cmd = "l";
    rel = cmd >= "a";
    switch (rel ? cmd.toUpperCase() : cmd) {
      case "M": {
        const x = nx(), y = ny();
        cx = x; cy = y; sx = x; sy = y;
        cur = { x0: x, y0: y, segs: [], closed: false };
        subs.push(cur);
        prev = "";
        break;
      }
      case "L": {
        const x = nx(), y = ny();
        open().segs.push(["L", x, y]);
        cx = x; cy = y; prev = "";
        break;
      }
      case "H": {
        const x = nx();
        open().segs.push(["L", x, cy]);
        cx = x; prev = "";
        break;
      }
      case "V": {
        const y = ny();
        open().segs.push(["L", cx, y]);
        cy = y; prev = "";
        break;
      }
      case "C": case "S": {
        let x1: number, y1: number;
        if (cmd === "C" || cmd === "c") { x1 = nx(); y1 = ny(); }
        else { x1 = prev === "C" ? 2 * cx - px : cx; y1 = prev === "C" ? 2 * cy - py : cy; }
        const x2 = nx(), y2 = ny(), x = nx(), y = ny();
        open().segs.push(["C", x1, y1, x2, y2, x, y]);
        px = x2; py = y2; cx = x; cy = y; prev = "C";
        break;
      }
      case "Q": case "T": {
        let x1: number, y1: number;
        if (cmd === "Q" || cmd === "q") { x1 = nx(); y1 = ny(); }
        else { x1 = prev === "Q" ? 2 * cx - px : cx; y1 = prev === "Q" ? 2 * cy - py : cy; }
        const x = nx(), y = ny();
        open().segs.push(["Q", x1, y1, x, y]);
        px = x1; py = y1; cx = x; cy = y; prev = "Q";
        break;
      }
      case "A": {
        const rx = num(), ry = num(), rot = num(), large = flag(), sweep = flag(), x = nx(), y = ny();
        open().segs.push(["A", rx, ry, rot, large, sweep, x, y]);
        cx = x; cy = y; prev = "";
        break;
      }
      case "Z":
        if (cur) { cur.closed = true; cur = null; }
        cx = sx; cy = sy; prev = "";
        break;
    }
  }
  return subs.filter(s => s.segs.length > 0);
}

function lowerSubpath(raw: any): CubicPath | null {
  const [cubic, line, quad, arc, finish] = builder(raw.x0, raw.y0);
  for (const s of raw.segs) {
    switch (s[0]) {
      case "L": line(s[1], s[2]); break;
      case "C": cubic(s[1], s[2], s[3], s[4], s[5], s[6]); break;
      case "Q": quad(s[1], s[2], s[3], s[4]); break;
      case "A": arc(s[1], s[2], s[3], s[4], s[5], s[6], s[7]); break;
    }
  }
  return finish(raw.closed);
}

export function iconToCubics(input: UniversalIconInput): CubicPath[] {
  const pathD = resolveIconToPathD(input);
  const out: CubicPath[] = [];
  if (!pathD) return out;

  for (const s of parsePath(pathD)) {
    const c = lowerSubpath(s);
    if (c) out.push(c);
  }
  return out;
}

function fmtCanon(v: number) {
  return String(Math.round(v * 10000) / 10000);
}

export function cubicsToPathD(paths: readonly CubicPath[]): string {
  let d = "";
  for (const { pts, closed } of paths) {
    d += `M${fmtCanon(pts[0])} ${fmtCanon(pts[1])}`;
    for (let i = 2; i < pts.length; i += 6) {
      d += `C${fmtCanon(pts[i])} ${fmtCanon(pts[i + 1])} ${fmtCanon(pts[i + 2])} ${fmtCanon(pts[i + 3])} ${fmtCanon(pts[i + 4])} ${fmtCanon(pts[i + 5])}`;
    }
    if (closed) d += "Z";
  }
  return d;
}

export function canonicalD(input: UniversalIconInput): string {
  if (typeof input === "string") return input;
  return cubicsToPathD(iconToCubics(input));
}

// ============================================================================
// 3. GAUSS-LEGENDRE ARC-LENGTH QUADRATURE RESAMPLER
// ============================================================================

const GX = [.18343464249564978, .525532409916329, .7966664774136267, .9602898564975363];
const GW = [.362683783378362, .31370664587788727, .22238103445337448, .10122853629037626];

function speed(p: Float64Array, k: number, t: number): number {
  const i = 6 * k;
  const u = 1 - t;
  const c0 = 3 * u * u, c1 = 6 * u * t, c2 = 3 * t * t;
  const dx = c0 * (p[i + 2] - p[i]) + c1 * (p[i + 4] - p[i + 2]) + c2 * (p[i + 6] - p[i + 4]);
  const dy = c0 * (p[i + 3] - p[i + 1]) + c1 * (p[i + 5] - p[i + 3]) + c2 * (p[i + 7] - p[i + 5]);
  return Math.hypot(dx, dy);
}

function segLen(p: Float64Array, k: number, t1 = 1): number {
  const half = t1 / 2;
  let s = 0;
  for (let j = 0; j < 4; j++) s += GW[j] * (speed(p, k, half + half * GX[j]) + speed(p, k, half - half * GX[j]));
  return s * half;
}

function point(p: Float64Array, k: number, t: number, out: Float64Array, o: number) {
  const i = 6 * k;
  const u = 1 - t;
  const b0 = u * u * u, b1 = 3 * u * u * t, b2 = 3 * u * t * t, b3 = t * t * t;
  out[o] = b0 * p[i] + b1 * p[i + 2] + b2 * p[i + 4] + b3 * p[i + 6];
  out[o + 1] = b0 * p[i + 1] + b1 * p[i + 3] + b2 * p[i + 5] + b3 * p[i + 7];
}

export function resamplePath(path: CubicPath, N = 48): Float64Array {
  const p = path.pts;
  const m = (p.length / 2 - 1) / 3;
  const out = new Float64Array(2 * N);
  if (m === 0) return out;

  const lens = new Float64Array(m);
  let totalLen = 0;
  for (let k = 0; k < m; k++) {
    const l = segLen(p, k);
    lens[k] = l;
    totalLen += l;
  }

  if (totalLen < 1e-9) {
    for (let i = 0; i < N; i++) {
      out[2 * i] = p[0];
      out[2 * i + 1] = p[1];
    }
    return out;
  }

  const step = totalLen / (path.closed ? N : N - 1);
  let curK = 0;
  let curAcc = 0;

  for (let i = 0; i < N; i++) {
    const targetDist = i * step;
    while (curK < m - 1 && curAcc + lens[curK] < targetDist) {
      curAcc += lens[curK];
      curK++;
    }
    const rem = targetDist - curAcc;
    const l = lens[curK];
    const t = l > 1e-9 ? Math.min(1, Math.max(0, rem / l)) : 0;
    point(p, curK, t, out, 2 * i);
  }

  return out;
}

export function resampleIcon(input: UniversalIconInput, N = 48): Sampled[] {
  return iconToCubics(input).map(c => ({
    pts: resamplePath(c, N),
    closed: c.closed
  }));
}

// ============================================================================
// 4. 2D PROCRUSTES RIGID ALIGNMENT & GLOBAL BLOCK TRANSPORT
// ============================================================================

const LEN_WEIGHT = 0.35;
const LAMBDA = 0.05;
const GLOBAL_EPS = 0.005;
const PERM_MAX = 8;

function centroid(p: Float64Array): [number, number] {
  const n = p.length / 2;
  let cx = 0, cy = 0;
  for (let i = 0; i < n; i++) {
    cx += p[2 * i];
    cy += p[2 * i + 1];
  }
  return [cx / n, cy / n];
}

function polyLen(p: Float64Array): number {
  const n = p.length / 2;
  let L = 0;
  for (let i = 1; i < n; i++) L += Math.hypot(p[2 * i] - p[2 * i - 2], p[2 * i + 1] - p[2 * i - 1]);
  return L;
}

function reversePts(p: Float64Array): Float64Array {
  const n = p.length / 2;
  const out = new Float64Array(2 * n);
  for (let i = 0; i < n; i++) {
    out[2 * i] = p[2 * (n - 1 - i)];
    out[2 * i + 1] = p[2 * (n - 1 - i) + 1];
  }
  return out;
}

function rotatePts(p: Float64Array, off: number): Float64Array {
  const n = p.length / 2;
  const out = new Float64Array(2 * n);
  for (let i = 0; i < n; i++) {
    const j = (i + off) % n;
    out[2 * i] = p[2 * j];
    out[2 * i + 1] = p[2 * j + 1];
  }
  return out;
}

function procrustes(a: Float64Array, b: Float64Array, ca: [number, number], cb: [number, number]) {
  const n = a.length / 2;
  let sxx = 0, sxy = 0, syx = 0, syy = 0, na = 0, nb = 0;
  for (let i = 0; i < n; i++) {
    const ax = a[2 * i] - ca[0], ay = a[2 * i + 1] - ca[1];
    const bx = b[2 * i] - cb[0], by = b[2 * i + 1] - cb[1];
    sxx += ax * bx; syy += ay * by; sxy += ax * by; syx += ay * bx;
    na += ax * ax + ay * ay; nb += bx * bx + by * by;
  }
  const theta = Math.atan2(sxy - syx, sxx + syy);
  const num = Math.cos(theta) * (sxx + syy) + Math.sin(theta) * (sxy - syx);
  let sigma = na > 1e-12 ? num / na : 1;
  if (sigma < 1e-6) sigma = 1e-6;
  const res2 = Math.max(0, sigma * sigma * na - 2 * sigma * num + nb);
  return { theta, sigma, res: nb > 1e-12 ? Math.sqrt(res2 / nb) : 0 };
}

function alignPair(aPts: Float64Array, bPts: Float64Array, aClosed: boolean, bClosed: boolean) {
  const ca = centroid(aPts);
  const cb = centroid(bPts);
  const varyA = aClosed && !bClosed;
  const base = varyA ? aPts : bPts;
  const offs = aClosed || bClosed ? base.length / 2 : 1;

  let bestScore = Infinity;
  let best = base;
  let sim = { theta: 0, sigma: 1, res: 0 };

  for (let dir = 0; dir < 2; dir++) {
    const walk = dir ? reversePts(base) : base;
    for (let off = 0; off < offs; off++) {
      const cand = off ? rotatePts(walk, off) : walk;
      const s = varyA ? procrustes(cand, bPts, ca, cb) : procrustes(aPts, cand, ca, cb);
      const score = s.res + LAMBDA * (Math.abs(s.theta) / Math.PI);
      if (score < bestScore) {
        bestScore = score;
        best = cand;
        sim = s;
      }
    }
  }

  return varyA ? { ca, cb, a: best, b: bPts, ...sim } : { ca, cb, a: aPts, b: best, ...sim };
}

function costMatrix(A: Float64Array[], B: Float64Array[]): number[][] {
  const cbs = B.map(centroid);
  const lbs = B.map(polyLen);
  return A.map(a => {
    const ca = centroid(a);
    const la = polyLen(a);
    return cbs.map((cb, j) => Math.hypot(ca[0] - cb[0], ca[1] - cb[1]) + LEN_WEIGHT * Math.abs(la - lbs[j]));
  });
}

function bestPermutation(C: number[][]): number[] {
  const n = C.length;
  if (n > PERM_MAX) {
    const pairs: [number, number, number][] = [];
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) pairs.push([C[i][j], i, j]);
    pairs.sort((x, y) => x[0] - y[0]);
    const out = new Array(n).fill(-1);
    const used = new Array(n).fill(false);
    for (const [, i, j] of pairs) if (out[i] < 0 && !used[j]) { out[i] = j; used[j] = true; }
    return out;
  }
  const idx = Array.from({ length: n }, (_, i) => i);
  let best = idx.slice();
  let bc = Infinity;
  const perm = (arr: number[], k: number, acc: number) => {
    if (acc >= bc) return;
    if (k === n) { bc = acc; best = arr.slice(); return; }
    for (let i = k; i < n; i++) {
      [arr[k], arr[i]] = [arr[i], arr[k]];
      perm(arr, k + 1, acc + C[k][arr[k]]);
      [arr[k], arr[i]] = [arr[i], arr[k]];
    }
  };
  perm(idx, 0, 0);
  return best;
}

function bestSurjection(C: number[][]): number[] {
  const f = C.map(row => {
    let m = 0;
    for (let j = 1; j < row.length; j++) if (row[j] < row[m]) m = j;
    return m;
  });
  return f;
}

function applyGlobal(items: PlanItem[], n: number) {
  const T = items.length * n;
  const ga = new Float64Array(2 * T);
  const gb = new Float64Array(2 * T);
  items.forEach((it, k) => {
    ga.set(it.a, 2 * n * k);
    gb.set(it.bO, 2 * n * k);
  });
  const gca = centroid(ga);
  const g = procrustes(ga, gb, gca, centroid(gb));
  if (g.res >= GLOBAL_EPS) return;
  const cos = Math.cos(-g.theta);
  const sin = Math.sin(-g.theta);
  const rc = Math.cos(g.theta);
  const rs = Math.sin(g.theta);
  for (const it of items) {
    let e2 = 0, nb = 0;
    for (let i = 0; i < n; i++) {
      const bx = it.bO[2 * i] - it.cb[0];
      const by = it.bO[2 * i + 1] - it.cb[1];
      it.bT[2 * i] = (bx * cos - by * sin) / g.sigma;
      it.bT[2 * i + 1] = (bx * sin + by * cos) / g.sigma;
      const ex = g.sigma * (rc * it.aC[2 * i] - rs * it.aC[2 * i + 1]) - bx;
      const ey = g.sigma * (rs * it.aC[2 * i] + rc * it.aC[2 * i + 1]) - by;
      e2 += ex * ex + ey * ey;
      nb += bx * bx + by * by;
    }
    it.theta = g.theta;
    it.lnSigma = Math.log(g.sigma);
    it.res = nb > 1e-12 ? Math.sqrt(e2 / nb) : 0;
    const s1 = Math.exp(it.lnSigma);
    const c1 = Math.cos(it.theta) * s1;
    const n1 = Math.sin(it.theta) * s1;
    const ox = it.ca[0] - gca[0];
    const oy = it.ca[1] - gca[1];
    const rx = ox * c1 - oy * n1 - ox;
    const ry = ox * n1 + oy * c1 - oy;
    it.block = {
      off: [ox, oy],
      drift: [it.cb[0] - it.ca[0] - rx, it.cb[1] - it.ca[1] - ry]
    };
  }
}

export function buildPlan(srcSubs: readonly Sampled[], dstSubs: readonly Sampled[]): MorphPlan {
  const p = srcSubs.length;
  const q = dstSubs.length;
  if (p === 0 || q === 0) return { items: [], n: 48 };

  const A = srcSubs.map(s => s.pts);
  const B = dstSubs.map(s => s.pts);
  const pairs: [number, number][] = [];

  if (p === q) {
    const perm = bestPermutation(costMatrix(A, B));
    for (let i = 0; i < p; i++) pairs.push([i, perm[i]]);
  } else if (p < q) {
    const f = bestSurjection(costMatrix(B, A));
    for (let j = 0; j < q; j++) pairs.push([f[j], j]);
  } else {
    const f = bestSurjection(costMatrix(A, B));
    for (let i = 0; i < p; i++) pairs.push([i, f[i]]);
  }

  const n = A[0].length / 2;
  const items: PlanItem[] = pairs.map(([si, di]) => {
    const al = alignPair(A[si], B[di], srcSubs[si].closed, dstSubs[di].closed);
    const a = al.a;
    const aC = new Float64Array(2 * n);
    const bT = new Float64Array(2 * n);
    const bO = new Float64Array(2 * n);
    const cos = Math.cos(-al.theta);
    const sin = Math.sin(-al.theta);

    for (let i = 0; i < n; i++) {
      aC[2 * i] = a[2 * i] - al.ca[0];
      aC[2 * i + 1] = a[2 * i + 1] - al.ca[1];
      const bx = al.b[2 * i] - al.cb[0];
      const by = al.b[2 * i + 1] - al.cb[1];
      bT[2 * i] = (bx * cos - by * sin) / al.sigma;
      bT[2 * i + 1] = (bx * sin + by * cos) / al.sigma;
      bO[2 * i] = al.b[2 * i];
      bO[2 * i + 1] = al.b[2 * i + 1];
    }

    return {
      a, aC, bT, bO, ca: al.ca, cb: al.cb,
      theta: al.theta, lnSigma: Math.log(al.sigma), res: al.res,
      closed: srcSubs[si].closed && dstSubs[di].closed,
      block: null
    };
  });

  if (items.length > 1) applyGlobal(items, n);

  return { items, n };
}

export function allocOutputs(plan: MorphPlan): Float64Array[] {
  return plan.items.map(() => new Float64Array(2 * plan.n));
}

export function interpPolar(plan: MorphPlan, t: number, out: Float64Array[]) {
  for (let k = 0; k < plan.items.length; k++) {
    const it = plan.items[k];
    const o = out[k];
    const n = plan.n;
    const s = Math.exp(it.lnSigma * t);
    const ang = it.theta * t;
    const cos = Math.cos(ang) * s;
    const sin = Math.sin(ang) * s;

    let cx: number, cy: number;
    if (it.block) {
      const [ox, oy] = it.block.off;
      const [dx, dy] = it.block.drift;
      cx = it.ca[0] + dx * t + (ox * cos - oy * sin - ox);
      cy = it.ca[1] + dy * t + (ox * sin + oy * cos - oy);
    } else {
      cx = it.ca[0] + (it.cb[0] - it.ca[0]) * t;
      cy = it.ca[1] + (it.cb[1] - it.ca[1]) * t;
    }

    for (let i = 0; i < n; i++) {
      const px = it.aC[2 * i] + (it.bT[2 * i] - it.aC[2 * i]) * t;
      const py = it.aC[2 * i + 1] + (it.bT[2 * i + 1] - it.aC[2 * i + 1]) * t;
      o[2 * i] = cx + px * cos - py * sin;
      o[2 * i + 1] = cy + px * sin + py * cos;
    }
  }
}

export function serialize(subs: readonly Float64Array[], closed?: readonly boolean[]): string {
  let d = "";
  for (let k = 0; k < subs.length; k++) {
    const o = subs[k];
    const n = o.length / 2;
    d += `M${Math.round(o[0] * 100) / 100} ${Math.round(o[1] * 100) / 100}`;
    for (let i = 1; i < n; i++) {
      d += `L${Math.round(o[2 * i] * 100) / 100} ${Math.round(o[2 * i + 1] * 100) / 100}`;
    }
    if (closed?.[k]) d += "Z";
  }
  return d;
}
