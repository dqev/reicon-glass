import type { PageSEOConfig } from "../hooks/usePageSEO";

const BASE_URL = "https://agent.reicon.dev";
const OG_IMAGE = `${BASE_URL}/assets/og-image.png`;

export const PAGE_SEO: Record<string, PageSEOConfig> = {
  /** / — Icon Explorer */
  explorer: {
    title: "Open-Source Icon Library for Designers & Developers",
    description:
      "Browse 2,400+ beautiful open-source SVG icons built for React, Vue, Svelte, Flutter, and Web Components. Search, copy JSX, SVG, or CSS — zero setup required.",
    canonical: BASE_URL + "/",
    ogImage: OG_IMAGE,
    keywords:
      "SVG icons, open source icons, React icons, Reicon, icon library, web components icons, UI icons, free icons",
  },

  /** /docs — Framework Documentation */
  docs: {
    title: "Framework Documentation — React, Vue, Svelte, Flutter & Web",
    description:
      "Integrate Reicon icons in any framework. Step-by-step guides for React, Vue 3, Svelte, Flutter, and vanilla Web Components with full npm package support.",
    canonical: BASE_URL + "/docs",
    ogImage: OG_IMAGE,
    keywords:
      "Reicon docs, React icon install, Vue icon library, Svelte icons, Flutter icons, web component icons, npm icon package",
  },

  /** /changelog — Releases & Updates */
  changelog: {
    title: "Changelog — Releases & Updates",
    description:
      "Stay up to date with the latest Reicon releases, new icon additions, performance improvements, and bug fixes across all supported frameworks.",
    canonical: BASE_URL + "/changelog",
    ogImage: OG_IMAGE,
    keywords:
      "Reicon changelog, icon library updates, new icons, release notes, SVG icon updates",
  },

  /** /contributors — Contributors & Stargazers */
  contributors: {
    title: "Contributors & Stargazers",
    description:
      "Special thanks to the open-source developers, contributors, and stargazers who build and support Reicon — the agentic SVG icon library.",
    canonical: BASE_URL + "/contributors",
    ogImage: OG_IMAGE,
    keywords:
      "Reicon contributors, open source contributors, icon library contributors, GitHub stargazers",
  },
};
