import type { UniversalIconInput, SpringPreset, MorphOptions } from './types';
import { SPRING_PRESETS } from './types';
import {
  Spring,
  resampleIcon,
  buildPlan,
  allocOutputs,
  interpPolar,
  serialize,
  canonicalD
} from './core';

const tickers = new Set<(dt: number) => void>();
let rafId = 0;
let lastTime = -1;

function loop(ts: number) {
  const dt = lastTime < 0 ? 0 : Math.min(Math.max((ts - lastTime) / 1000, 0), 0.1);
  lastTime = ts;
  for (const tick of [...tickers]) tick(dt);
  if (tickers.size > 0) rafId = requestAnimationFrame(loop);
  else {
    rafId = 0;
    lastTime = -1;
  }
}

function addTicker(tick: (dt: number) => void) {
  tickers.add(tick);
  if (rafId === 0) {
    lastTime = -1;
    rafId = requestAnimationFrame(loop);
  }
}

function removeTicker(tick: (dt: number) => void) {
  tickers.delete(tick);
  if (tickers.size === 0 && rafId !== 0) {
    cancelAnimationFrame(rafId);
    rafId = 0;
    lastTime = -1;
  }
}

function resolveSpring(s?: SpringPreset | MorphOptions) {
  if (typeof s === 'string') return SPRING_PRESETS[s] || SPRING_PRESETS.snappy;
  return {
    k: s?.stiffness ?? 420,
    c: s?.damping ?? 30
  };
}

export interface MorphInstance {
  morphTo(icon: UniversalIconInput, spring?: SpringPreset | MorphOptions): void;
  set(icon: UniversalIconInput): void;
  seek(icon: UniversalIconInput, progress: number): void;
  destroy(): void;
}

export function createMorph(el: SVGPathElement, initialIcon: UniversalIconInput): MorphInstance {
  const spring = new Spring();
  let target = initialIcon;
  let rest = true;
  let plan: any = null;
  let out: Float64Array[] | null = null;
  let flying = false;
  let dead = false;

  el.setAttribute('d', canonicalD(initialIcon));

  const stop = () => {
    if (!flying) return;
    flying = false;
    removeTicker(tick);
  };

  const settle = () => {
    rest = true;
    plan = null;
    out = null;
    spring.x = 1;
    spring.v = 0;
    el.setAttribute('d', canonicalD(target));
  };

  const tick = (dt: number) => {
    const settled = spring.step(dt);
    if (plan && out) {
      interpPolar(plan, spring.x, out);
      const closed = plan.items.map((it: any) => it.closed);
      el.setAttribute('d', serialize(out, closed));
    }
    if (settled) {
      stop();
      settle();
    }
  };

  const snapshot = () => {
    if (rest || !plan || !out) return resampleIcon(target);
    return out.map((buf, k) => ({
      pts: Float64Array.from(buf),
      closed: plan.items[k].closed
    }));
  };

  const retarget = (icon: UniversalIconInput) => {
    const srcSamples = snapshot();
    const dstSamples = resampleIcon(icon);
    plan = buildPlan(srcSamples, dstSamples);
    out = allocOutputs(plan);
    target = icon;
    rest = false;
  };

  return {
    morphTo(icon: UniversalIconInput, sp?: SpringPreset | MorphOptions) {
      if (dead) return;
      if (icon === target && (rest || flying)) return;
      const { k, c } = resolveSpring(sp);
      spring.config(k, c);
      retarget(icon);
      spring.start();
      if (!flying) {
        flying = true;
        addTicker(tick);
      }
    },

    set(icon: UniversalIconInput) {
      if (dead) return;
      stop();
      target = icon;
      settle();
    },

    seek(icon: UniversalIconInput, progress: number) {
      if (dead) return;
      stop();
      retarget(icon);
      if (plan && out) {
        interpPolar(plan, progress, out);
        const closed = plan.items.map((it: any) => it.closed);
        el.setAttribute('d', serialize(out, closed));
      }
    },

    destroy() {
      stop();
      dead = true;
      plan = null;
      out = null;
    }
  };
}
