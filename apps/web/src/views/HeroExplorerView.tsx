import { useState, useMemo, useRef, useEffect, useCallback, useDeferredValue } from "react";
import { HeroHeaderBanner } from "../components/layout/HeroBanner";
import { CategoryControlBar } from "../components/explorer/CategoryBar";
import { IconGridWall } from "../components/explorer/IconGrid";
import { getAllIcons, type IconMetaItem } from "../utils/iconDataLoader";

const INITIAL_ICONS: IconMetaItem[] = getAllIcons();
const PAGE_SIZE = 60;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j] as T, copy[i] as T];
  }
  return copy;
}

export interface HeroExplorerViewProps {
  color?: string;
  onColorChange?: (c: string) => void;
  onInspect: (iconName: string, category: string) => void;
  onCopyNotice: (msg: string) => void;
  toastActive?: boolean;
  onOpenCmdk?: () => void;
}

export function HeroExplorerView({
  color = "#9B8AFB",
  onColorChange = () => {},
  onInspect,
  onCopyNotice,
  onOpenCmdk,
}: HeroExplorerViewProps) {
  // Random order each page load instead of alphabetical — shuffled once, stable for session
  const [icons] = useState<IconMetaItem[]>(() => shuffleArray(INITIAL_ICONS));
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const [size, setSize] = useState<number>(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 38 : 48
  );
  const [strokeWidth] = useState<number | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Keep parent callbacks stable so IconGrid memo isn't busted every render
  const inspectRef = useRef(onInspect);
  inspectRef.current = onInspect;
  const copyNoticeRef = useRef(onCopyNotice);
  copyNoticeRef.current = onCopyNotice;
  const stableInspect = useCallback((name: string, category: string) => {
    inspectRef.current(name, category);
  }, []);
  const stableCopyNotice = useCallback((msg: string) => {
    copyNoticeRef.current(msg);
  }, []);

  // Deferred search keeps typing smooth — input stays instant, filtering yields
  const deferredSearch = useDeferredValue(search);

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
    return ["All", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [icons]);

  // Filter icons (uses deferred value to avoid blocking keystrokes)
  const filteredIcons = useMemo(() => {
    const q = deferredSearch.trim().toLowerCase();
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
  }, [icons, deferredSearch, selectedCategory]);

  const displayedIcons = useMemo(() => {
    return filteredIcons.slice(0, visibleCount);
  }, [filteredIcons, visibleCount]);

  const hasMoreToLoad = visibleCount < filteredIcons.length;

  // Reset visible count on search or category filter change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [search, selectedCategory]);

  // Infinite Scroll Observer — throttled via rAF, re-attaches when sentinel remounts
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    let ticking = false;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !ticking) {
          ticking = true;
          requestAnimationFrame(() => {
            setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredIcons.length));
            window.setTimeout(() => {
              ticking = false;
            }, 120);
          });
        }
      },
      { rootMargin: "800px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [filteredIcons.length, displayedIcons.length, hasMoreToLoad]);

  const handleSelectCategory = useCallback((cat: string) => {
    setSelectedCategory(cat);
    setVisibleCount(PAGE_SIZE);
  }, []);

  const handleToggleShowAllCategories = useCallback(() => {
    setShowAllCategories((prev) => !prev);
  }, []);

  return (
    <div className="w-full flex flex-col items-center">
      {/* HERO Banner Header */}
      <HeroHeaderBanner
        color={color}
        search={search}
        onSearchChange={setSearch}
        searchInputRef={searchInputRef}
        onCopyNotice={stableCopyNotice}
      />

      {/* Main Grid Wall Section */}
      <div className="w-full flex flex-col gap-3">
        {/* Top Header Row: Category Filter Pills + Control Buttons */}
        <CategoryControlBar
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          showAllCategories={showAllCategories}
          onToggleShowAllCategories={handleToggleShowAllCategories}
          size={size}
          onSizeChange={setSize}
          color={color}
          onColorChange={onColorChange}
          search={search}
          onSearchChange={setSearch}
          searchInputRef={searchInputRef}
          onOpenCmdk={onOpenCmdk}
        />

        {/* Icon Cards Wall — infinite scroll preserved via sentinel */}
        <IconGridWall
          displayedIcons={displayedIcons}
          size={size}
          color={color}
          strokeWidth={strokeWidth}
          onInspect={stableInspect}
          onCopyNotice={stableCopyNotice}
          loadMoreRef={loadMoreRef}
          hasMoreToLoad={hasMoreToLoad}
        />
      </div>
    </div>
  );
}
