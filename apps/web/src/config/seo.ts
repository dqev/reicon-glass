import type { PageSEOConfig } from "../hooks/usePageSEO";

const BASE_URL = "https://glass.reicon.dev";
const OG_IMAGE = `${BASE_URL}/assets/og-image.png`;

export const PAGE_SEO: Record<string, PageSEOConfig> = {
  /** / — Icon Explorer */
  explorer: {
    title: "Free Glass SVG Icons for Designers & Developers",
    description:
      "Browse free glass SVG icons rendered in stunning 3D glass. Copy SVG, JSX, or CSS for React, Vue, Svelte, Flutter & Web Components — open source, zero setup.",
    canonical: BASE_URL + "/",
    ogImage: OG_IMAGE,
    ogImageAlt: "Reicon — Free Glass SVG Icons for Designers & Developers",
    keywords:
      "glass icons, 3D glass icons, glassmorphism icons, SVG icons, free icons, open source icons, React icons, Reicon, icon library, UI icons, vector icons, web components, UI design, Tailwind icons",
  },
};
