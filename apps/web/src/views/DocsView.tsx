import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { PLATFORM_DOCS, type PlatformDoc } from "../docs/platforms";
import { HeroDocsHeaderBanner } from "../components/docs/HeroDocsBanner";
import { FrameworkControlBar } from "../components/docs/FrameworkControlBar";
import { FrameworkGridWall } from "../components/docs/FrameworkGridWall";
import { PlatformDocViewer } from "../components/docs/PlatformDocViewer";

export interface DocsViewProps {
  color?: string;
  onColorChange?: (c: string) => void;
  onCopyNotice: (msg: string) => void;
  onOpenCmdk?: () => void;
}

function getFrameworkFromPath(path: string): string {
  const parts = path.split("/").filter(Boolean);
  if (parts.length >= 2 && parts[0] === "docs") {
    const id = parts[1];
    const match = PLATFORM_DOCS.find((d) => d.id === id);
    if (match) return match.id;
  }
  return "All";
}

export function DocsView({
  color = "#9B8AFB",
  onColorChange,
  onCopyNotice,
  onOpenCmdk,
}: DocsViewProps) {
  const [selectedFramework, setSelectedFramework] = useState<string>(() =>
    getFrameworkFromPath(window.location.pathname)
  );
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Sync state on browser back/forward (popstate)
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.pathname.startsWith("/docs")) {
        setSelectedFramework(getFrameworkFromPath(window.location.pathname));
        window.scrollTo(0, 0);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Scroll to top whenever selected framework changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedFramework]);

  // Keyboard shortcut '/' focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== searchInputRef.current) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const availableDocs = useMemo(() => {
    return PLATFORM_DOCS.filter((d) => d.id !== "docs");
  }, []);

  const filteredDocs = useMemo(() => {
    const q = search.trim().toLowerCase();
    return availableDocs.filter((doc) => {
      const matchesFramework =
        selectedFramework === "All" || doc.id === selectedFramework;
      if (!matchesFramework && !q) return false;
      if (!q) return true;
      return (
        doc.name.toLowerCase().includes(q) ||
        doc.pkg.toLowerCase().includes(q) ||
        doc.tagline.toLowerCase().includes(q) ||
        doc.badge.toLowerCase().includes(q) ||
        doc.install.toLowerCase().includes(q)
      );
    });
  }, [availableDocs, search, selectedFramework]);

  const handleSelectFramework = useCallback((id: string) => {
    setSelectedFramework(id);
    window.scrollTo(0, 0);
    const targetUrl = id === "All" || id === "docs" ? "/docs" : `/docs/${id}`;
    if (window.location.pathname !== targetUrl) {
      window.history.pushState({}, "", targetUrl);
      window.dispatchEvent(new Event("popstate"));
    }
  }, []);

  const handleSelectDocCard = useCallback(
    (doc: PlatformDoc) => {
      handleSelectFramework(doc.id);
    },
    [handleSelectFramework]
  );

  const isDetailView = selectedFramework !== "All" && !search;

  return (
    <div className="w-full flex flex-col items-center">
      {/* HERO Banner Header (Only on main framework grid wall) */}
      {!isDetailView && (
        <HeroDocsHeaderBanner color={color} />
      )}

      {/* Main Grid & Docs Section */}
      <div className="w-full flex flex-col gap-3">
        {/* VIEW 1: Grid Wall of Framework Cards */}
        {!isDetailView ? (
          <>
            <FrameworkControlBar
              color={color}
              onColorChange={onColorChange}
              search={search}
              onSearchChange={setSearch}
              searchInputRef={searchInputRef}
              onOpenCmdk={onOpenCmdk}
            />
            <FrameworkGridWall
              displayedDocs={filteredDocs}
              size={52}
              onSelectDoc={handleSelectDocCard}
              onCopyNotice={onCopyNotice}
            />
          </>
        ) : (
          /* VIEW 2: Detailed Framework Documentation Reader */
          <div className="w-full pt-4 sm:pt-6">
            <PlatformDocViewer color={color} onCopyNotice={onCopyNotice} />
          </div>
        )}
      </div>
    </div>
  );
}

