type ChangeKind = "new" | "improved" | "fixed";

const KIND_LABEL: Record<ChangeKind, string> = {
  new: "New",
  improved: "Improved",
  fixed: "Fixed",
};

function KindTag({ kind }: { kind: ChangeKind }) {
  return (
    <span className="w-[68px] shrink-0 font-mono text-[10px] leading-4 tracking-[0.06em] uppercase text-[var(--text-muted)] whitespace-nowrap mt-0.5">
      {KIND_LABEL[kind]}
    </span>
  );
}

export function ChangelogView() {
  const releases = [
    {
      version: "v1.2.5",
      date: "September 2026",
      changes: [
        { kind: "new" as const, desc: "Added 250+ new interface, navigation, and developer icons." },
        { kind: "improved" as const, desc: "Enhanced ESM tree-shaking metadata and zero side-effects configuration." },
        { kind: "fixed" as const, desc: "Resolved SVG stroke alignment rendering in sub-pixel viewports." },
      ],
    },
    {
      version: "v1.2.0",
      date: "August 2026",
      changes: [
        { kind: "new" as const, desc: "Introduced dual weight support (Outline & Filled) across all 2,400+ icons." },
        { kind: "improved" as const, desc: "Reduced total package bundle footprint by 40%." },
      ],
    },
    {
      version: "v1.0.0",
      date: "June 2026",
      changes: [
        { kind: "new" as const, desc: "Initial public release of Reicon React icon system with 1,800+ icons." },
      ],
    },
  ];

  return (
    <div className="w-full pt-8 pb-24">
      <div className="max-w-[640px] mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-3 border-b border-[var(--border-subtle)] pb-8">
          <span className="text-[10px] font-mono uppercase tracking-[0.04em] text-[var(--text-muted)]">
            Changelog
          </span>
          <h1 className="text-3xl font-[550] leading-[1.2] tracking-[-0.4px] text-[var(--text-primary)]">
            Releases & Updates
          </h1>
          <p className="text-[14px] leading-[1.72] text-[var(--text-secondary)]">
            Latest additions, optimizations, and bug fixes to the Reicon icon library.
          </p>
        </div>

        {/* Release History */}
        <div className="space-y-10">
          {releases.map((rel) => (
            <div key={rel.version} className="space-y-3 scroll-mt-24">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm font-semibold text-[var(--text-primary)]">
                  {rel.version}
                </span>
                <span className="font-mono text-xs text-[var(--text-muted)]">{rel.date}</span>
              </div>

              <div className="rounded-[16px] bg-[var(--bg-card)] border border-[var(--border-subtle)] overflow-hidden divide-y divide-[var(--border-subtle)] shadow-[var(--card-shadow)]">
                {rel.changes.map((ch, idx) => (
                  <div key={idx} className="p-4 flex items-start gap-4 text-[13px]">
                    <KindTag kind={ch.kind} />
                    <span className="text-[var(--text-secondary)] leading-[1.6]">
                      {ch.desc}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
