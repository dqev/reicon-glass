import React, { useState, useEffect } from "react";
import { useSmoothCorners } from "../hooks/useSmoothCorners";
import { IconRenderer } from "../components/explorer/IconRenderer";
import { CopyMorphIcon } from "../components/common/CopyIconTransition";
import { PackageSwitcher } from "../components/common/PackageSwitcher";

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
        margin: "80px 0 0",
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

const TOC = [
  { id: "overview", label: "Overview" },
  { id: "installation", label: "Installation" },
  { id: "usage", label: "Quick Start" },
  { id: "props", label: "Props API" },
  { id: "tree-shaking", label: "Tree Shaking" },
  { id: "license", label: "License" },
];

const TOC_ITEM_H = 28;

function TableOfContents({ activeId }: { activeId: string }) {
  const [wide, setWide] = useState(false);

  useEffect(() => {
    const setW = () => setWide(window.innerWidth >= 1080);
    setW();
    window.addEventListener("resize", setW);
    return () => window.removeEventListener("resize", setW);
  }, []);

  if (!wide) return null;

  return (
    <aside
      aria-label="Contents"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        height: "100%",
        width: 196,
      }}
    >
      <nav
        style={{
          position: "sticky",
          top: 80,
          marginTop: 94,
          paddingLeft: 13,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <style>{`.toc-link:hover{color:rgba(255,255,255,0.74) !important}`}</style>
        {TOC.map((it) => {
          const isActive = activeId === it.id;
          return (
            <a
              key={it.id}
              href={`#${it.id}`}
              className="toc-link"
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
    </aside>
  );
}

export function DocsView({ onCopyNotice }: { onCopyNotice: (msg: string) => void }) {
  const [activeId, setActiveId] = useState("overview");
  const propsTableRef = useSmoothCorners<HTMLDivElement>(16);

  useEffect(() => {
    const handleScroll = () => {
      const pos = window.scrollY + 120;
      for (const item of TOC) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (pos >= top && pos < top + height) {
            setActiveId(item.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const PROPS = [
    { name: "size", type: "number | string", def: "24", desc: "Pixel dimension of the icon." },
    { name: "color", type: "string", def: "'currentColor'", desc: "SVG stroke and fill color hex/CSS value." },
    { name: "strokeWidth", type: "number | string", def: "2", desc: "Stroke line width thickness." },
    { name: "className", type: "string", def: "''", desc: "Custom Tailwind or CSS classes." },
    { name: "style", type: "CSSProperties", def: "{}", desc: "Inline CSS properties object." },
  ];

  return (
    <div
      className="pt-14 sm:pt-20"
      style={{
        position: "relative",
        maxWidth: 1080,
        margin: "0 auto",
        width: "100%",
      }}
    >
      <TableOfContents activeId={activeId} />

      <main>
        {/* Overview */}
        <section id="overview" style={{ scrollMarginTop: 96 }}>
          <Col>
            <h1 className="sr-only">Reicon Documentation</h1>
            <P>
              <C>reicon-agent</C> is an agentic icon ecosystem with 2,676+ pixel-perfect vector icons. Include the 1-line CDN script or package manager export and render icons instantly with <C>&lt;re-icon&gt;</C> Web Component across AI agents, React, Vue, or static Web Apps.
            </P>
          </Col>
        </section>

        {/* Installation */}
        <section id="installation" style={{ scrollMarginTop: 96 }}>
          <Col>
            <H2>Installation &amp; CDN Setup</H2>
            <P>
              Add the 1-line CDN script tag to your <C>&lt;head&gt;</C> or install via package manager.
            </P>
            <PackageSwitcher onCopyNotice={onCopyNotice} />
          </Col>
        </section>

        {/* Usage */}
        <section id="usage" style={{ scrollMarginTop: 96 }}>
          <Col>
            <H2>Quick Start</H2>
            <P>
              Render icons using the <C>&lt;re-icon&gt;</C> Web Component. Pass <C>icon</C>, <C>size</C>, <C>color</C>, and <C>stroke-width</C> attributes.
            </P>
            <div
              style={{
                margin: "22px 0 0",
                borderRadius: 16,
                background: "var(--bg-card)",
                padding: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-around",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <IconRenderer name="Activity" size={32} color="var(--accent-color, #9B8AFB)" />
                <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>icon="activity"</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <IconRenderer name="Add" size={32} color="var(--accent-color, #9B8AFB)" />
                <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>icon="add"</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <IconRenderer name="Alarm" size={32} strokeWidth={1.5} color="var(--accent-color, #9B8AFB)" />
                <span style={{ fontFamily: MONO, fontSize: 11, color: MUTED }}>icon="alarm"</span>
              </div>
            </div>
            <CodeBlock
              code={`<!-- Include CDN script in <head> -->
<script src="https://cdn.jsdelivr.net/npm/reicon-agent/cdn/reicon.js"></script>

<!-- Render anywhere in your HTML/JSX -->
<re-icon icon="activity" size="24" color="#9B8AFB"></re-icon>
<re-icon icon="add" size="20" color="currentColor"></re-icon>
<re-icon icon="alarm" size="28" stroke-width="1.5"></re-icon>`}
              onCopy={() => onCopyNotice("Copied snippet!")}
            />
          </Col>
        </section>

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
              <C>reicon-agent</C> is lightweight with zero external dependencies. Icons are rendered dynamically from the 1-line CDN script or imported on-demand via Web Components.
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
      </main>
    </div>
  );
}
