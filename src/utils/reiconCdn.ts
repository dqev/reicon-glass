export interface IconData {
  key: string;
  category: string;
  description: string[];
  code?: string;
  name?: string;
}

declare global {
  interface Window {
    ReiconAgent?: {
      icons: string[];
      getIconCode?: (key: string) => string;
      getIconSvg?: (key: string, size?: number, color?: string, strokeWidth?: number) => string;
    };
  }
}

export function loadReiconCdn(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.ReiconAgent && window.ReiconAgent.icons && window.ReiconAgent.icons.length > 0) {
      return resolve(true);
    }

    const existingScript = document.querySelector('script[src*="reicon.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      // In case already loaded before listener added
      if (window.ReiconAgent && window.ReiconAgent.icons) {
        return resolve(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/reicon-agent/cdn/reicon.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
}

export function getParsedIconsList(): IconData[] {
  if (!window.ReiconAgent || !window.ReiconAgent.icons) {
    return [];
  }

  const iconKeys = window.ReiconAgent.icons;
  return iconKeys.map((key) => {
    const code = window.ReiconAgent?.getIconCode ? window.ReiconAgent.getIconCode(key) : '';
    const parts = key.split('-');
    const rawCat = parts.length > 1 ? parts[0] : 'general';
    const category = rawCat.charAt(0).toUpperCase() + rawCat.slice(1);
    
    // Format name to PascalCase for UI display
    const name = key
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');

    return {
      key,
      name,
      category,
      description: [key.replace(/-/g, ' ')],
      code,
    };
  });
}
