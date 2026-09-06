export type IconNodeAttrs = Record<string, string | number | undefined>;
export type IconNode = ReadonlyArray<readonly [string, IconNodeAttrs]>;

/**
 * Universal Icon Input accepted by morphing engine:
 * 1. Raw SVG path `d` string: "M12 2L2 22h20L12 2z"
 * 2. SVG XML String: "<path d='...' />" or "<svg><path d='...'/></svg>"
 * 3. Lucide / Tabler / Feather tuple array: [['path', { d: '...' }]]
 * 4. Hugeicons / Heroicons / Material / Custom JSON object: { code: "<path d='...'/>" } or { d: "..." }
 */
export type UniversalIconInput = 
  | string 
  | IconNode 
  | { code?: string; d?: string; path?: string; svg?: string; [key: string]: any };

export type IconVariant = 'outline' | 'filled' | 'duotone';

export interface IconLayer {
  d: string;
  fill?: string;
  opacity?: number;
  fillRule?: 'nonzero' | 'evenodd';
}

export interface CubicPath {
  pts: Float64Array;
  closed: boolean;
}

export interface Sampled {
  pts: Float64Array;
  closed: boolean;
}

export interface PlanItem {
  a: Float64Array;
  aC: Float64Array;
  bT: Float64Array;
  bO: Float64Array;
  ca: readonly [number, number];
  cb: readonly [number, number];
  theta: number;
  lnSigma: number;
  res: number;
  closed: boolean;
  block: {
    off: readonly [number, number];
    drift: readonly [number, number];
  } | null;
}

export interface MorphPlan {
  items: PlanItem[];
  n: number;
}

export const SPRING_PRESETS = {
  smooth: { k: 170, c: 26 },
  snappy: { k: 420, c: 30 },
  bouncy: { k: 300, c: 14 }
} as const;

export type SpringPreset = keyof typeof SPRING_PRESETS;

export interface MorphOptions {
  stiffness?: number;
  damping?: number;
}

export interface MorphHandle {
  morphTo(icon: UniversalIconInput, spring?: SpringPreset | MorphOptions): void;
  set(icon: UniversalIconInput): void;
  seek(icon: UniversalIconInput, progress: number): void;
}
