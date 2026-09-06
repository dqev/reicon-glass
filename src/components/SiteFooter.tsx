export function SiteFooter() {
  return (
    <>
      {/* Thin divider above the footer */}
      <div
        aria-hidden
        style={{
          width: 40,
          height: 1,
          background: "var(--border-medium)",
          margin: "64px auto 0",
        }}
      />

      <footer style={{ padding: "64px 24px 96px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.3,
                fontWeight: 500,
                letterSpacing: "-0.1px",
                color: "var(--text-primary)",
              }}
            >
              Reicon Icon Ecosystem
            </p>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                lineHeight: 1.45,
                color: "var(--text-secondary)",
              }}
            >
              2,676+ tree-shakeable SVG & React icons built for speed and perfection.
              <br />
              Free to use, licensed under the MIT License.
            </p>
          </div>
          <div style={{ display: "flex", gap: 16, fontSize: 13, fontWeight: 550 }}>
            <a
              href="https://github.com/dqev/reicon"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-primary)] underline underline-offset-2 hover:text-[var(--accent-color,#9B8AFB)] transition"
            >
              GitHub
            </a>
            <a
              href="https://npmjs.com/package/reicon-agent"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--text-primary)] underline underline-offset-2 hover:text-[var(--accent-color,#9B8AFB)] transition"
            >
              npm
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
