import React, { useState, useEffect } from "react";
import { PLATFORM_DOCS, type PlatformDoc } from "../../docs/platforms";
import { FrameworkIcon } from "./FrameworkIcon";
import { CopyMorphIcon } from "../common/CopyIconTransition";
import { ScrambleWord } from "../common/ScrambleText";
import { useSmoothCorners } from "../../hooks/useSmoothCorners";
import { playClickSound } from "../../utils/sound";
import { copyToClipboard } from "../../utils/clipboard";

const INK = "var(--text-primary)";
const BODY = "var(--text-secondary)";
const MUTED = "var(--text-muted)";
const MONO = "var(--font-mono), ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

function Col({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ maxWidth: 820, margin: "0 auto" }}>
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
    void copyToClipboard(code).then((ok) => {
      if (ok) {
        setCopied(true);
        if (onCopy) onCopy();
        setTimeout(() => setCopied(false), 1400);
      }
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
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Top Strip (Empty on left, Copy button on right) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          padding: "10px 14px 4px 14px",
          minHeight: 34,
        }}
      >
        <button
          type="button"
          onClick={handleCopy}
          style={{
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

      {/* Code Content with ScrambleWord */}
      <pre className="scrollbar-none" style={{ margin: 0, padding: "0 18px 16px 18px", fontFamily: MONO, fontSize: 13, color: INK, overflowX: "auto", lineHeight: 1.65 }}>
        <code>
          <ScrambleWord word={code} />
        </code>
      </pre>
    </div>
  );
}

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
    const match = PLATFORM_DOCS.find((d) => d.id === id && d.id !== "docs");
    if (match) return match;
  }
  return PLATFORM_DOCS.find((d) => d.id !== "docs") || PLATFORM_DOCS[0];
}

export function PlatformDocViewer({ onCopyNotice }: { color?: string; onCopyNotice: (msg: string) => void }) {
  const [activeDoc, setActiveDoc] = useState<PlatformDoc>(() =>
    getDocFromPath(window.location.pathname)
  );
  const propsTableRef = useSmoothCorners<HTMLDivElement>(16);

  // Sync framework doc on URL popstate (browser back/forward or navigation)
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith("/docs")) {
        setActiveDoc(getDocFromPath(window.location.pathname));
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Scroll to top whenever active doc changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeDoc]);

  const handleSelectFramework = (doc: PlatformDoc) => {
    playClickSound();
    setActiveDoc(doc);
    window.scrollTo(0, 0);
    const targetUrl = doc.id === "docs" ? "/docs" : `/docs/${doc.id}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, "", targetUrl);
    }
  };

  return (
    <div
      className="pt-6 sm:pt-10"
      style={{
        position: "relative",
        maxWidth: 1280,
        margin: "0 auto",
        width: "100%",
      }}
    >
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
              <div className="pt-2 pb-4 select-none flex flex-col items-center text-center gap-2.5">
                <h1 className="text-lg sm:text-2xl font-[550] leading-[1.4] tracking-[-0.3px] text-[var(--text-primary)] text-center flex items-center justify-center gap-2.5">
                  <FrameworkIcon id={activeDoc.id} size={28} />
                  <span>Reicon {activeDoc.name} Integration</span>
                </h1>
                <p className="text-xs sm:text-sm leading-relaxed text-[var(--text-secondary)] font-normal max-w-xl text-center">
                  <C>{activeDoc.pkg}</C> — {activeDoc.tagline}
                </p>
              </div>
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
