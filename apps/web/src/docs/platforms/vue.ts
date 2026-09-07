import type { PlatformDoc } from "./types";

export const vueDoc: PlatformDoc = {
  id: "vue",
  name: "Vue 3",
  badge: "Vue 3",
  tagline: "Official Vue 3 package. Import icons as Vue components with TypeScript autocompletion, Vite, and Nuxt 3 support.",
  pkg: "reicon-vue",
  install: "npm install reicon-vue",
  basicUsage: `<script setup>
import { Home, ShieldCheck, AltArrowDown } from 'reicon-vue';
</script>

<template>
  <div class="flex items-center gap-4">
    <Home :size="24" />
    <ShieldCheck :size="32" color="#9B8AFB" />
    <AltArrowDown weight="Filled" />
  </div>
</template>`,
  customization: `<!-- Props & Vue Bindings -->
<Home :size="16" />
<Heart color="#ef4444" />
<Star weight="Filled" />
<Home class="w-6 h-6 text-indigo-500" />`,
  directImport: `// Direct module imports
import Home from 'reicon-vue/icons/Home';`,
  extraTitle: "Dynamic Icons with Vue shallowRef",
  extraCode: `<script setup>
import { Home, Settings, User } from 'reicon-vue';
import { shallowRef } from 'vue';

const currentIcon = shallowRef(Home);
</script>

<template>
  <component :is="currentIcon" :size="32" />
</template>`,
  notes: [
    "Works out of the box with Nuxt 3 — zero plugin configuration required.",
    "Tree-shakeable ESM build ensures minimal bundle overhead."
  ]
};
