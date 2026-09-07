import type { PlatformDoc } from "./types";

export const svelteDoc: PlatformDoc = {
  id: "svelte",
  name: "Svelte",
  badge: "Svelte",
  tagline: "Official Svelte package supporting Svelte 4 and Svelte 5 with SvelteKit SSR support.",
  pkg: "reicon-svelte",
  install: "npm install reicon-svelte",
  basicUsage: `<script>
  import { Home, ShieldCheck, Bell } from 'reicon-svelte';
</script>

<div class="flex items-center gap-4">
  <Home size={24} />
  <ShieldCheck size={24} color="#9B8AFB" />
  <Bell size={24} weight="Filled" />
</div>`,
  customization: `<!-- Size & Styling -->
<Home size={16} />
<Heart color="#ef4444" />
<Star weight="Filled" />
<Home class="text-indigo-500 hover:text-indigo-600" />`,
  directImport: `// Direct Svelte component import
import Home from 'reicon-svelte/icons/Home.svelte';`,
  extraTitle: "SvelteKit Integration",
  extraCode: `<!-- src/routes/+page.svelte -->
<script>
  import { Home, User } from 'reicon-svelte';
</script>

<nav class="flex gap-3">
  <Home size={24} />
  <User size={24} />
</nav>`,
  notes: [
    "Svelte 4 & Svelte 5 Runes compatible.",
    "100% SSR-compatible for SvelteKit."
  ]
};
