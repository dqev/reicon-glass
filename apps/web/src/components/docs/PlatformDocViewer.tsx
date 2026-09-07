import React, { useState, useEffect, useMemo } from "react";
import { PLATFORM_DOCS, type PlatformDoc } from "../../docs/platforms";
import { FrameworkDropdown } from "./FrameworkDropdown";
import { FrameworkIcon } from "./FrameworkIcon";
import { CopyMorphIcon } from "../common/CopyIconTransition";
import { useSmoothCorners } from "../../hooks/useSmoothCorners";
import { playClickSound } from "../../utils/sound";

const INK = "var(--text-primary)";
const BODY = "var(--text-secondary)";
const MUTED = "var(--text-muted)";
const MONO = "var(--font-mono), ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

function Col({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      {children}
    </div>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: 15,
        fontWeight: 450,
        color: INK,
        letterSpacing: "-0.1px",
        margin: "48px 0 0",
        textWrap: "balance",
      }}
    >
      {children}
    </h2>
  );
}

function P({ children, muted }: { children: React.ReactNode; muted?: boolean }) {
  return (
    <p
      style={{
        fontSize: 14,
        lineHeight: 1.72,
        letterSpacing: "0.1px",
        color: muted ? MUTED : BODY,
        margin: "16px 0 0",
        textWrap: "pretty",
      }}
    >
      {children}
    </p>
  );
}

function C({ children }: { children: React.ReactNode }) {
  return (
    <code
      style={{
        fontFamily: MONO,
        fontSize: "0.84em",
        background: "var(--code-bg)",
        borderRadius: 6,
        padding: "3px 5px",
        color: INK,
      }}
    >
      {children}
    </code>
  );
}

function CodeBlock({ code, onCopy }: { code: string; onCopy?: () => void }) {
  const smoothRef = useSmoothCorners<HTMLDivElement>(16);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    playClickSound();
    void navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 1400);
    });
  };

  return (
    <div
      ref={smoothRef}
      style={{
        margin: "22px 0 0",
        borderRadius: 16,
        overflow: "hidden",
        background: "var(--code-bg)",
        padding: "16px 18px",
        position: "relative",
      }}
    >
      <pre style={{ margin: 0, fontFamily: MONO, fontSize: 13, color: INK, overflowX: "auto", lineHeight: 1.65 }}>
        <code>{code}</code>
      </pre>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          position: "absolute",
          top: 12,
          right: 12,
          padding: "4px 8px",
          borderRadius: 7,
          background: "transparent",
          color: MUTED,
          border: "none",
          cursor: "pointer",
          display: "grid",
          placeItems: "center",
        }}
        title="Copy to clipboard"
      >
        <CopyMorphIcon copied={copied} />
      </button>
    </div>
  );
}

const TOC_ITEM_H = 28;

const PROPS = [
  { name: "size", type: "number | string", def: "24", desc: "Pixel dimension of the icon." },
  { name: "color", type: "string", def: "'currentColor'", desc: "SVG stroke and fill color hex/CSS value." },
  { name: "weight", type: "'Outline' | 'Filled'", def: "'Outline'", desc: "Icon weight variant style." },
  { name: "strokeWidth", type: "number | string", def: "2", desc: "Stroke line width thickness." },
  { name: "className", type: "string", def: "''", desc: "Custom Tailwind or CSS classes." },
  { name: "style", type: "CSSProperties", def: "{}", desc: "Inline CSS properties object." },
];

function getDocFromPath(path: string): PlatformDoc {
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[0] === "docs") {
    const id = parts[1];
    const match = PLATFORM_DOCS.find((d) => d.id === id);
    if (match) return match;
  }
  return PLATFORM_DOCS[0];
}

export function PlatformDocViewer({ onCopyNotice }: { onCopyNotice: (msg: string) => void }) {
  const [activeDoc, setActiveDoc] = useState<PlatformDoc>(() =>
    getDocFromPath(window.location.pathname)
  );
  const [activeSection, setActiveSection] = useState("overview");
  const propsTableRef = useSmoothCorners<HTMLDivElement>(16);

  // Sync framework doc on URL popstate (browser back/forward or navigation)
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith("/docs")) {
        setActiveDoc(getDocFromPath(window.location.pathname));
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const sections = useMemo(() => {
    if (activeDoc.id === "docs") {
      return [{ id: "overview", label: "What is Reicon?" }];
    }
    return [
      { id: "overview", label: "Overview" },
      { id: "installation", label: "Installation" },
      { id: "usage", label: "Quick Start" },
      ...(activeDoc.customization ? [{ id: "customization", label: "Customization" }] : []),
      ...(activeDoc.directImport ? [{ id: "direct-import", label: "Direct Import" }] : []),
      { id: "props", label: "Props API" },
      { id: "tree-shaking", label: "Tree Shaking" },
      { id: "license", label: "License" },
    ];
  }, [activeDoc]);

  useEffect(() => {
    const handleScroll = () => {
      const pos = window.scrollY + 120;
      for (const item of sections) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (pos >= top && pos < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const handleSelectFramework = (doc: PlatformDoc) => {
    playClickSound();
    setActiveDoc(doc);
    const targetUrl = doc.id === "docs" ? "/docs" : `/docs/${doc.id}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, "", targetUrl);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div
      className="pt-2"
      style={{
        position: "relative",
        maxWidth: 1280,
        margin: "0 auto",
        width: "100%",
      }}
    >
      {/* Left Sidebar (Framework Dropdown + TOC Navigation Points) */}
      <aside
        aria-label="Framework & TOC Navigation"
        className="hidden lg:block"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          height: "100%",
          width: 196,
          zIndex: 30,
        }}
      >
        <div
          style={{
            position: "sticky",
            top: 80,
            marginTop: 24,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          {/* 1. Compact Framework Select Dropdown */}
          <FrameworkDropdown activeDoc={activeDoc} onSelect={handleSelectFramework} />

          {/* 2. TOC Section Navigation Links */}
          <nav style={{ display: "flex", flexDirection: "column" }}>
            <style>{`.toc-link-left:hover{color:rgba(255,255,255,0.74) !important}`}</style>
            {sections.map((it) => {
              const isActive = activeSection === it.id;
              return (
                <a
                  key={it.id}
                  href={`#${it.id}`}
                  className="toc-link-left"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(it.id);
                    if (el) {
                      const y = el.getBoundingClientRect().top + window.scrollY - 96;
                      window.scrollTo({ top: y, behavior: "smooth" });
                    }
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: TOC_ITEM_H,
                    paddingLeft: 14,
                    textDecoration: "none",
                    fontSize: 14,
                    letterSpacing: "0.1px",
                    cursor: "pointer",
                    color: isActive ? INK : MUTED,
                    transition: "color 200ms ease",
                  }}
                >
                  {it.label}
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Top Mobile Framework Selector Dropdown (Hidden on default /docs page) */}
      {activeDoc.id !== "docs" && (
        <div className="lg:hidden w-full pb-4 mb-6">
          <FrameworkDropdown activeDoc={activeDoc} onSelect={handleSelectFramework} />
        </div>
      )}

      {/* Main Content Column */}
      <main>
        {/* Overview */}
        <section id="overview" style={{ scrollMarginTop: 96 }}>
          <Col>
            {activeDoc.id === "docs" ? (
              <div style={{ paddingTop: 8 }}>
                <h1 style={{ fontSize: 26, fontWeight: 650, color: INK, letterSpacing: "-0.5px" }}>
                  What is Reicon?
                </h1>
                <p style={{ fontSize: 14.5, lineHeight: 1.72, color: BODY, marginTop: 16 }}>
                  Reicon is a free, open-source SVG icon library featuring <strong style={{ color: INK, fontWeight: 600 }}>2,700+ handcrafted UI icons</strong>. The ecosystem offers native packages for <C>reicon</C> (vanilla JS &amp; CDN), <C>reicon-react</C>, <C>reicon-react-native</C>, <C>reicon-vue</C>, <C>reicon-svelte</C>, and <C>reicon-flutter</C>.
                </p>
                <p style={{ fontSize: 14.5, lineHeight: 1.72, color: BODY, marginTop: 12 }}>
                  Icons come in Outline and Filled weights with zero external dependencies and full tree-shakeability.
                </p>

                {/* Choose an Integration */}
                <h2 style={{ fontSize: 18, fontWeight: 650, color: INK, letterSpacing: "-0.3px", marginTop: 40, marginBottom: 16 }}>
                  Choose an Integration
                </h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
                  {PLATFORM_DOCS.filter((d) => d.id !== "docs").map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => handleSelectFramework(doc)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        padding: "14px 16px",
                        borderRadius: 14,
                        background: "var(--bg-card)",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                      }}
                      className="hover:bg-[var(--bg-btn-hover)] group"
                    >
                      <FrameworkIcon id={doc.id} size={24} />
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14.5, fontWeight: 600, color: INK }}>{doc.name}</div>
                        <div style={{ fontSize: 12, color: MUTED, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          View the {doc.name} integration guide
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                <h1 className="sr-only">Reicon {activeDoc.name} Documentation</h1>
                <P>
                  <C>{activeDoc.pkg}</C> — {activeDoc.tagline}
                </P>
              </>
            )}
          </Col>
        </section>

        {/* Framework specific doc sections */}
        {activeDoc.id !== "docs" && (
          <>
            {/* Installation */}
            <section id="installation" style={{ scrollMarginTop: 96 }}>
              <Col>
                <H2>Installation</H2>
                <P>
                  Install <C>{activeDoc.pkg}</C> via your preferred package manager or CDN script.
                </P>
                <CodeBlock
                  code={activeDoc.install}
                  onCopy={() => onCopyNotice(`Copied installation command for ${activeDoc.name}!`)}
                />
              </Col>
            </section>

            {/* Usage */}
            <section id="usage" style={{ scrollMarginTop: 96 }}>
              <Col>
                <H2>Quick Start</H2>
                <P>
                  Import icons by their PascalCase name and pass standard customization props.
                </P>
                <CodeBlock code={activeDoc.basicUsage} onCopy={() => onCopyNotice("Copied usage snippet!")} />
              </Col>
            </section>

            {/* Customization */}
            {activeDoc.customization && (
              <section id="customization" style={{ scrollMarginTop: 96 }}>
                <Col>
                  <H2>Customization &amp; Styling</H2>
                  <P>
                    Customize size, color, weight, or utility classes.
                  </P>
                  <CodeBlock code={activeDoc.customization} onCopy={() => onCopyNotice("Copied customization snippet!")} />
                </Col>
              </section>
            )}

            {/* Direct Import */}
            {activeDoc.directImport && (
              <section id="direct-import" style={{ scrollMarginTop: 96 }}>
                <Col>
                  <H2>Direct Import (Tree-Shaking)</H2>
                  <P>
                    For the absolute smallest bundle size, import each icon directly from its own module path.
                  </P>
                  <CodeBlock code={activeDoc.directImport} onCopy={() => onCopyNotice("Copied direct import snippet!")} />
                </Col>
              </section>
            )}

            {/* Props API */}
            <section id="props" style={{ scrollMarginTop: 96 }}>
              <Col>
                <H2>Props API Reference</H2>
                <div
                  ref={propsTableRef}
                  style={{
                    margin: "22px 0 0",
                    borderRadius: 16,
                    overflow: "hidden",
                    background: "var(--bg-card)",
                    fontSize: 13,
                  }}
                >
                  {PROPS.map((p, i) => (
                    <div
                      key={p.name}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1.3fr 2fr",
                        gap: 16,
                        padding: "12px 16px",
                        borderTop: i === 0 ? undefined : "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span style={{ fontFamily: MONO, color: INK }}>{p.name}</span>
                      <span style={{ fontFamily: MONO, color: BODY }}>{p.type}</span>
                      <span style={{ color: BODY, lineHeight: 1.5 }}>
                        {p.desc} Default <C>{p.def}</C>.
                      </span>
                    </div>
                  ))}
                </div>
              </Col>
            </section>

            {/* Tree Shaking */}
            <section id="tree-shaking" style={{ scrollMarginTop: 96 }}>
              <Col>
                <H2>Tree Shaking &amp; Zero Dependencies</H2>
                <P>
                  <C>{activeDoc.pkg}</C> is lightweight with zero external dependencies. Icons are rendered dynamically or tree-shaken automatically by modern bundlers like Vite, Rollup, Next.js, and Webpack.
                </P>
              </Col>
            </section>

            {/* License */}
            <section id="license" style={{ scrollMarginTop: 96 }}>
              <Col>
                <H2>License</H2>
                <P>
                  Free to use under the{" "}
                  <a
                    href="https://opensource.org/license/mit"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: INK, textDecoration: "underline", textUnderlineOffset: "2px" }}
                  >
                    MIT license
                  </a>
                  . Use it anywhere in commercial or personal projects without restriction.
                </P>
                <div style={{ height: 56 }} />
              </Col>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
