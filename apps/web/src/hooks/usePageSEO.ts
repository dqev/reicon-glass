import { useEffect } from "react";

export interface PageSEOConfig {
  /** Browser tab title */
  title: string;
  /** Meta description */
  description: string;
  /** Canonical URL */
  canonical?: string;
  /** Open Graph / Twitter image URL */
  ogImage?: string;
  /** Open Graph type (default: "website") */
  ogType?: string;
  /** Extra keywords for meta keywords tag */
  keywords?: string;
}

const BASE_URL = "https://agent.reicon.dev";
const DEFAULT_OG_IMAGE = `${BASE_URL}/assets/og-image.png`;

function setMeta(selector: string, attribute: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    const parts = selector.match(/\[(\w+[:\w]*)="([^"]+)"\]/);
    if (parts) {
      el.setAttribute(parts[1], parts[2]);
    }
    document.head.appendChild(el);
  }
  el.setAttribute(attribute, value);
}

function setLink(rel: string, value: string) {
  let el = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = value;
}

/**
 * usePageSEO
 *
 * Imperatively sets all SEO-relevant head tags on mount/update.
 * Works in any SPA without react-helmet.
 */
export function usePageSEO(config: PageSEOConfig) {
  const {
    title,
    description,
    canonical,
    ogImage = DEFAULT_OG_IMAGE,
    ogType = "website",
    keywords,
  } = config;

  useEffect(() => {
    const fullTitle = `${title} — Reicon Agent`;

    // Title tag
    document.title = fullTitle;

    // Meta description
    setMeta('meta[name="description"]', "content", description);

    // Meta keywords (optional)
    if (keywords) {
      setMeta('meta[name="keywords"]', "content", keywords);
    }

    // Canonical URL
    if (canonical) {
      setLink("canonical", canonical);
    }

    // --- Open Graph ---
    setMeta('meta[property="og:title"]', "content", fullTitle);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:type"]', "content", ogType);
    setMeta('meta[property="og:image"]', "content", ogImage);
    if (canonical) {
      setMeta('meta[property="og:url"]', "content", canonical);
    }

    // --- Twitter Card ---
    setMeta('meta[name="twitter:title"]', "content", fullTitle);
    setMeta('meta[name="twitter:description"]', "content", description);
    setMeta('meta[name="twitter:image"]', "content", ogImage);
    if (canonical) {
      setMeta('meta[name="twitter:url"]', "content", canonical);
    }
  }, [title, description, canonical, ogImage, ogType, keywords]);
}
