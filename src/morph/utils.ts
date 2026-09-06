import type { UniversalIconInput, IconLayer } from './types';

/**
 * Detects if SVG input contains `evenodd` fill rule
 */
export function detectFillRule(input: UniversalIconInput): "evenodd" | "nonzero" {
  if (typeof input === 'string') {
    if (input.includes('fill-rule="evenodd"') || input.includes('clip-rule="evenodd"')) {
      return 'evenodd';
    }
  } else if (typeof input === 'object' && input !== null) {
    const str = JSON.stringify(input);
    if (str.includes('evenodd')) return 'evenodd';
  }
  return 'nonzero';
}

/**
 * Universal Icon Resolver - Single combined path string
 */
export function resolveIconToPathD(input: UniversalIconInput): string {
  if (!input) return '';

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('<')) {
      const matches = [...trimmed.matchAll(/d="([^"]+)"/g)];
      if (matches.length > 0) {
        return matches.map(m => m[1]).join(' ');
      }
    }
    return trimmed;
  }

  if (Array.isArray(input)) {
    const paths: string[] = [];
    for (const item of input) {
      if (Array.isArray(item) && item[1] && item[1].d) {
        paths.push(String(item[1].d));
      }
    }
    if (paths.length > 0) return paths.join(' ');
  }

  if (typeof input === 'object' && input !== null) {
    const obj = input as any;
    if (obj.d && typeof obj.d === 'string') return obj.d;
    if (obj.code && typeof obj.code === 'string') return resolveIconToPathD(obj.code);
    if (obj.svg && typeof obj.svg === 'string') return resolveIconToPathD(obj.svg);
    if (obj.path && typeof obj.path === 'string') return resolveIconToPathD(obj.path);
  }

  return '';
}

/**
 * Extracts independent layers for Duotone, Filled, & Multi-Path icons
 */
export function resolveIconLayers(input: UniversalIconInput): IconLayer[] {
  if (!input) return [];

  const layers: IconLayer[] = [];

  // 1. SVG XML string
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('<')) {
      // Find all <path ... /> elements
      const pathTagMatches = [...trimmed.matchAll(/<path([^>]+)\/?>/g)];
      if (pathTagMatches.length > 0) {
        for (const match of pathTagMatches) {
          const attrs = match[1];
          const dMatch = attrs.match(/d="([^"]+)"/);
          if (dMatch) {
            const opacityMatch = attrs.match(/opacity="([^"]+)"/);
            const fillMatch = attrs.match(/fill="([^"]+)"/);
            const fillRuleMatch = attrs.match(/(?:fill-rule|clip-rule)="([^"]+)"/);

            layers.push({
              d: dMatch[1],
              fill: fillMatch ? fillMatch[1] : undefined,
              opacity: opacityMatch ? parseFloat(opacityMatch[1]) : 1,
              fillRule: fillRuleMatch ? (fillRuleMatch[1] as any) : undefined
            });
          }
        }
        return layers;
      }
    }
    return [{ d: trimmed, opacity: 1 }];
  }

  // 2. Lucide / Tabler / Feather tuple array
  if (Array.isArray(input)) {
    for (const item of input) {
      if (Array.isArray(item) && item[1] && item[1].d) {
        const attrs = item[1];
        layers.push({
          d: String(attrs.d),
          fill: attrs.fill ? String(attrs.fill) : undefined,
          opacity: attrs.opacity !== undefined ? Number(attrs.opacity) : 1,
          fillRule: attrs.fillRule || attrs['fill-rule'] ? String(attrs.fillRule || attrs['fill-rule']) as any : undefined
        });
      }
    }
    if (layers.length > 0) return layers;
  }

  // 3. Objects (Hugeicons, Heroicons, custom JSON)
  if (typeof input === 'object' && input !== null) {
    const obj = input as any;
    if (obj.code && typeof obj.code === 'string') return resolveIconLayers(obj.code);
    if (obj.layers && Array.isArray(obj.layers)) return obj.layers;
    const pathD = resolveIconToPathD(input);
    if (pathD) return [{ d: pathD, opacity: 1 }];
  }

  return [];
}
