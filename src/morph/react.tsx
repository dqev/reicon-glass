import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { UniversalIconInput, SpringPreset, MorphOptions, MorphHandle } from './types';
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

export interface MorphIconProps extends Omit<React.SVGProps<SVGSVGElement>, 'from' | 'to' | 'ref'> {
  /**
   * Icon input (accepts SVG XML, raw `d` path strings, tuple arrays, etc.)
   */
  icon?: UniversalIconInput;
  /** From icon endpoint for controlled scrubbing */
  from?: UniversalIconInput;
  /** To icon endpoint for controlled scrubbing */
  to?: UniversalIconInput;
  /** Controlled progress slider (0 to 1) */
  progress?: number;
  /** Spring preset ("snappy" | "smooth" | "bouncy") or custom { stiffness, damping } */
  spring?: SpringPreset | MorphOptions;
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
}

export const MorphIcon = forwardRef<MorphHandle, MorphIconProps>(({
  icon,
  from,
  to,
  progress,
  spring = "snappy",
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  style,
  ...restProps
}, ref) => {
  const pathRef = useRef<SVGPathElement>(null);
  const activeIconRef = useRef<UniversalIconInput | undefined>(icon);
  const animRef = useRef({
    spring: new Spring(),
    plan: null as any,
    out: null as Float64Array[] | null,
    flying: false,
    rest: true
  });

  const resolveConfig = (sp: SpringPreset | MorphOptions) => {
    if (typeof sp === 'string') return SPRING_PRESETS[sp] || SPRING_PRESETS.snappy;
    return { k: sp.stiffness ?? 420, c: sp.damping ?? 30 };
  };

  const setD = (dStr: string) => {
    if (pathRef.current && dStr) {
      pathRef.current.setAttribute("d", dStr);
    }
  };

  const settle = () => {
    animRef.current.rest = true;
    animRef.current.plan = null;
    animRef.current.out = null;
    animRef.current.spring.x = 1;
    animRef.current.spring.v = 0;
    if (activeIconRef.current !== undefined) {
      setD(canonicalD(activeIconRef.current));
    }
  };

  const snapshot = () => {
    const { rest, plan, out } = animRef.current;
    if (rest || !plan || !out || activeIconRef.current === undefined) {
      return resampleIcon(activeIconRef.current ?? "");
    }
    return out.map((buf, k) => ({
      pts: Float64Array.from(buf),
      closed: plan.items[k].closed
    }));
  };

  useImperativeHandle(ref, () => ({
    morphTo(newIcon, customSpring) {
      if (!pathRef.current) return;
      const conf = resolveConfig(customSpring ?? spring);
      animRef.current.spring.config(conf.k, conf.c);

      const srcSamples = snapshot();
      const dstSamples = resampleIcon(newIcon);
      const plan = buildPlan(srcSamples, dstSamples);
      const out = allocOutputs(plan);

      animRef.current.plan = plan;
      animRef.current.out = out;
      animRef.current.rest = false;
      activeIconRef.current = newIcon;
      animRef.current.spring.start();

      if (!animRef.current.flying) {
        animRef.current.flying = true;
        let lastTime = performance.now();

        const tick = (now: number) => {
          const dt = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;

          const settled = animRef.current.spring.step(dt);
          const t = animRef.current.spring.x;

          if (animRef.current.plan && animRef.current.out) {
            interpPolar(animRef.current.plan, t, animRef.current.out);
            const closed = animRef.current.plan.items.map((it: any) => it.closed);
            setD(serialize(animRef.current.out, closed));
          }

          if (settled) {
            animRef.current.flying = false;
            settle();
          } else {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
      }
    },

    set(newIcon) {
      activeIconRef.current = newIcon;
      settle();
    },

    seek(newIcon, prog) {
      const srcSamples = snapshot();
      const dstSamples = resampleIcon(newIcon);
      const plan = buildPlan(srcSamples, dstSamples);
      const out = allocOutputs(plan);
      interpPolar(plan, prog, out);
      const closed = plan.items.map((it: any) => it.closed);
      setD(serialize(out, closed));
    }
  }));

  // Frame Scrubbing Effect
  useEffect(() => {
    if (from !== undefined && to !== undefined && progress !== undefined) {
      const srcSamples = resampleIcon(from);
      const dstSamples = resampleIcon(to);
      const plan = buildPlan(srcSamples, dstSamples);
      const out = allocOutputs(plan);
      interpPolar(plan, progress, out);
      const closed = plan.items.map((it: any) => it.closed);
      setD(serialize(out, closed));
    }
  }, [from, to, progress]);

  // Icon change / spring morph effect
  useEffect(() => {
    if (icon !== undefined) {
      if (!activeIconRef.current) {
        activeIconRef.current = icon;
        setD(canonicalD(icon));
        return;
      }

      if (icon === activeIconRef.current && animRef.current.rest) {
        setD(canonicalD(icon));
        return;
      }

      const conf = resolveConfig(spring);
      animRef.current.spring.config(conf.k, conf.c);

      const srcSamples = snapshot();
      const dstSamples = resampleIcon(icon);
      const plan = buildPlan(srcSamples, dstSamples);
      const out = allocOutputs(plan);

      animRef.current.plan = plan;
      animRef.current.out = out;
      animRef.current.rest = false;
      activeIconRef.current = icon;
      animRef.current.spring.start();

      if (!animRef.current.flying) {
        animRef.current.flying = true;
        let lastTime = performance.now();

        const tick = (now: number) => {
          const dt = Math.min((now - lastTime) / 1000, 0.1);
          lastTime = now;

          const settled = animRef.current.spring.step(dt);
          const t = animRef.current.spring.x;

          if (animRef.current.plan && animRef.current.out) {
            interpPolar(animRef.current.plan, t, animRef.current.out);
            const closed = animRef.current.plan.items.map((it: any) => it.closed);
            setD(serialize(animRef.current.out, closed));
          }

          if (settled) {
            animRef.current.flying = false;
            settle();
          } else {
            requestAnimationFrame(tick);
          }
        };

        requestAnimationFrame(tick);
      }
    }
  }, [icon, spring]);

  // Initial path set on mount
  useEffect(() => {
    if (icon !== undefined) {
      setD(canonicalD(icon));
    } else if (from !== undefined) {
      setD(canonicalD(from));
    }
  }, []);

  return (
    <svg
      width={size}
      height={size}
      viewBox={restProps.viewBox || "0 0 16 16"}
      fill={restProps.fill || color || "currentColor"}
      stroke={restProps.stroke || "none"}
      strokeWidth={strokeWidth ?? "0.6667"}
      style={{ display: 'inline-block', verticalAlign: 'middle', overflow: 'visible', ...style }}
      {...restProps}
    >
      <path ref={pathRef} />
    </svg>
  );
});

MorphIcon.displayName = 'MorphIcon';
