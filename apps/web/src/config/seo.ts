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
};
