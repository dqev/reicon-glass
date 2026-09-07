export interface PlatformDoc {
  id: string;
  name: string;
  badge: string;
  tagline: string;
  pkg: string;
  install: string;
  basicUsage: string;
  customization?: string;
  directImport?: string;
  extraTitle?: string;
  extraCode?: string;
  notes?: string[];
}
