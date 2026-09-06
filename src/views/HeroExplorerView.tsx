import { useState, useMemo, useRef, useEffect } from "react";
import agentData from "../data/agent.json";
import { HeroHeaderBanner } from "../components/HeroHeaderBanner";
import { CategoryControlBar } from "../components/CategoryControlBar";
import { IconGridWall } from "../components/IconGridWall";
import { loadReiconCdn, getParsedIconsList } from "../utils/reiconCdn";

export interface IconMetaItem {
  name: string;
  kebab: string;
  category: string;
  keywords: string[];
}

export function parseAgentJson(data: any): IconMetaItem[] {
  if (!data || !data.icons) return [];
  return Object.entries(data.icons).map(([key, val]: [string, any]) => {
    const pascal =
      val.pascal ||
      key
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("");
    const category = !val.category
      ? "General UI"
      : val.category === "ui" || val.category === "newicons"
      ? "General UI"
      : val.category.charAt(0).toUpperCase() + val.category.slice(1);
    const keywords = Array.isArray(val.description) ? val.description : [key];
    return { name: pascal, kebab: key, category, keywords };
  });
}

const INITIAL_ICONS: IconMetaItem[] = parseAgentJson(agentData);

export interface HeroExplorerViewProps {
  theme?: "dark" | "light";
  color?: string;
  onColorChange?: (c: string) => void;
  onInspect: (iconName: string, category: string) => void;
  onCopyNotice: (msg: string) => void;
  toastActive?: boolean;
  onOpenCmdk?: () => void;
}

export function HeroExplorerView({
  theme = "dark",
  color = "#9B8AFB",
  onColorChange = () => {},
  onInspect,
  onCopyNotice,
  onOpenCmdk,
}: HeroExplorerViewProps) {
  const [icons, setIcons] = useState<IconMetaItem[]>(INITIAL_ICONS);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const [size, setSize] = useState<number>(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 38 : 48
  );
  const [strokeWidth] = useState<number | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState<number>(100);

  // Auto-adjust size state when resizing between mobile and desktop viewports
  useEffect(() => {
    const handleResize = () => {
      const isMobile = window.innerWidth < 640;
      if (isMobile && size > 58) {
        setSize(38);
      } else if (!isMobile && size < 48) {
        setSize(48);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [size]);

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Dynamically load icons from window.ReiconAgent CDN script or agent.json fallback
  useEffect(() => {
    let cancelled = false;

    loadReiconCdn().then(() => {
      if (cancelled) return;
      const cdnIcons = getParsedIconsList();
      if (cdnIcons.length > 0) {
        const formatted: IconMetaItem[] = cdnIcons.map((i) => ({
          name: i.name || i.key,
          kebab: i.key,
          category: i.category,
          keywords: i.description,
        }));
        setIcons(formatted);
      }
    });

    fetch("/agent.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        const parsed = parseAgentJson(data);
        if (parsed.length > 0) {
          setIcons((current) => (current.length === 0 ? parsed : current));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

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

  const categories = useMemo(() => {
    const set = new Set<string>();
    icons.forEach((i) => set.add(i.category));
    return ["All", ...Array.from(set)];
  }, [icons]);

  // Filter icons
  const filteredIcons = useMemo(() => {
    const q = search.trim().toLowerCase();
    return icons.filter((icon) => {
      const matchesCategory = selectedCategory === "All" || icon.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        icon.name.toLowerCase().includes(q) ||
        icon.kebab.includes(q) ||
        icon.keywords.some((k) => k.toLowerCase().includes(q))
      );
    });
  }, [icons, search, selectedCategory]);

  const displayedIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);

  // Reset visible count on search or category filter change
  useEffect(() => {
    setVisibleCount(100);
  }, [search, selectedCategory]);

  // Infinite Scroll Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + 120, filteredIcons.length));
        }
      },
      { rootMargin: "600px" }
    );

    const el = loadMoreRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [filteredIcons.length]);

  return (
    <div className="w-full flex flex-col items-center">
      {/* HERO Banner Header */}
      <HeroHeaderBanner
        color={color}
        search={search}
        onSearchChange={setSearch}
        searchInputRef={searchInputRef}
        onCopyNotice={onCopyNotice}
      />

      {/* Main Grid Wall Section */}
      <div className="w-full flex flex-col gap-3">
        {/* Top Header Row: Category Filter Pills + Control Buttons */}
        <CategoryControlBar
          theme={theme}
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setVisibleCount(100);
          }}
          showAllCategories={showAllCategories}
          onToggleShowAllCategories={() => setShowAllCategories((prev) => !prev)}
          size={size}
          onSizeChange={setSize}
          color={color}
          onColorChange={onColorChange}
          search={search}
          onSearchChange={setSearch}
          searchInputRef={searchInputRef}
          onOpenCmdk={onOpenCmdk}
        />

        {/* Icon Cards Wall */}
        <IconGridWall
          displayedIcons={displayedIcons}
          size={size}
          color={color}
          strokeWidth={strokeWidth}
          onInspect={onInspect}
          onCopyNotice={onCopyNotice}
          loadMoreRef={loadMoreRef}
          hasMoreToLoad={visibleCount < filteredIcons.length}
        />
      </div>
    </div>
  );
}
