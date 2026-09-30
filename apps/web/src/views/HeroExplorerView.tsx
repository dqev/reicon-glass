import { useState, useMemo, useRef, useEffect, useCallback, useDeferredValue } from "react";
import { HeroHeaderBanner } from "../components/layout/HeroBanner";
import { CategoryControlBar } from "../components/explorer/CategoryBar";
import { IconGridWall } from "../components/explorer/IconGrid";
import { getAllIcons, initIcons, iconsLoaded, type IconMetaItem } from "../utils/iconDataLoader";
import { warmGlassCache } from "../utils/glassCache";

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
  // Random order each page load instead of alphabetical — shuffled once data arrives
  const [dataReady, setDataReady] = useState(() => iconsLoaded());
  useEffect(() => {
    if (dataReady) return;
    let alive = true;
    void initIcons().then(() => {
      if (alive) setDataReady(true);
    });
    return () => {
      alive = false;
    };
  }, [dataReady]);
  const icons = useMemo<IconMetaItem[]>(
    () => (dataReady ? shuffleArray(getAllIcons()) : []),
    [dataReady],
  );
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const [size, setSize] = useState<number>(() =>
    typeof window !== "undefined" && window.innerWidth < 640 ? 38 : 64
  );
  const [strokeWidth] = useState<number | undefined>(undefined);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // Keep parent callbacks stable so IconGrid memo isn't busted every render
  const inspectRef = useRef(onInspect);
  const copyNoticeRef = useRef(onCopyNotice);
  useEffect(() => {
    inspectRef.current = onInspect;
    copyNoticeRef.current = onCopyNotice;
  });
  const stableInspect = useCallback((name: string, category: string) => {
    inspectRef.current(name, category);
  }, []);
  const stableCopyNotice = useCallback((msg: string) => {
    copyNoticeRef.current(msg);
  }, []);

  // Deferred search keeps typing smooth — input stays instant, filtering yields
  const deferredSearch = useDeferredValue(search);

  // Reset visible count on search or category filter change during render
  const [prevFilter, setPrevFilter] = useState({ search, selectedCategory });
  if (prevFilter.search !== search || prevFilter.selectedCategory !== selectedCategory) {
    setPrevFilter({ search, selectedCategory });
    setVisibleCount(PAGE_SIZE);
  }

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

  // Pre-convert the first page during idle so glass is ready before scroll
  useEffect(() => {
    warmGlassCache(icons, color, size);
  }, [icons, color, size]);

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
        {dataReady ? (
          <IconGridWall
            displayedIcons={displayedIcons}
            size={size}
            color={color}
            strokeWidth={strokeWidth}
            onInspect={stableInspect}
            loadMoreRef={loadMoreRef}
            hasMoreToLoad={hasMoreToLoad}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 w-full" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-[18px] bg-[var(--bg-card)] flex items-center justify-center"
              >
                <span className="animate-pulse rounded-full bg-[var(--bg-card-hover)] size-10" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
