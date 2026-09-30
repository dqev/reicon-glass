import { useState, useEffect } from "react";
import { SiteHeader } from "./components/layout/Header";
import { HeroExplorerView } from "./views/HeroExplorerView";
import { IconDetailModal } from "./components/modal/IconDetailModal";
import { CmdkSearchModal } from "./components/explorer/SearchModal";
import { Toast } from "./components/common/Toast";
import { SiteFooter } from "./components/layout/Footer";
import { usePageSEO } from "./hooks/usePageSEO";
import { PAGE_SEO } from "./config/seo";

import { getAllIcons, initIcons, type IconMetaItem } from "./utils/iconDataLoader";
import { getDefaultColor } from "./utils/themeColors";

export default function App() {
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [color, setColor] = useState<string>(() => getDefaultColor());
  const [inspectedIcon, setInspectedIcon] = useState<{ name: string; category: string } | null>(null);

  const [cmdkIcons, setCmdkIcons] = useState<IconMetaItem[]>(() => getAllIcons());
  useEffect(() => {
    let alive = true;
    void initIcons().then(() => {
      if (alive) setCmdkIcons(getAllIcons());
    });
    return () => {
      alive = false;
    };
  }, []);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastActive, setToastActive] = useState<boolean>(false);
  const [showTopBlur, setShowTopBlur] = useState<boolean>(false);

  // SEO: update head meta tags for home page
  usePageSEO(PAGE_SEO["explorer"]);

  // Sync accent color variable to root
  useEffect(() => {
    document.documentElement.style.setProperty("--accent-color", color);
  }, [color]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
  };

  useEffect(() => {
    const handleScroll = () => setShowTopBlur(window.scrollY > 50);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCopyNotice = (msg: string) => {
    setToastMessage(msg);
  };

  return (
    <div className="relative flex flex-col items-center min-h-screen pb-24 overflow-x-clip">
      {/* Top scroll fade */}
      <div
        className={`fixed top-0 left-0 right-0 h-[80px] z-[5] pointer-events-none transition-opacity duration-300 ${
          showTopBlur ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "var(--top-blur-gradient)",
        }}
      />

      {/* Content — bottom toolbar overlays, so no padding shift when open */}
      <div className="flex flex-col items-center w-full pt-3 gap-6">
        <section className="w-full px-6 flex flex-col gap-3">
          {/* Header */}
          <SiteHeader />

          {/* Main Content: Home Icons Grid */}
          <main className="w-full">
            <HeroExplorerView
              color={color}
              onColorChange={handleColorChange}
              onInspect={(name, category) => setInspectedIcon({ name, category })}
              onCopyNotice={handleCopyNotice}
              toastActive={toastActive}
              onOpenCmdk={() => setCmdkOpen(true)}
            />
          </main>

          {/* Site Footer */}
          <SiteFooter />
        </section>
      </div>

      {/* Detail Toolbar Inspector */}
      <IconDetailModal
        iconName={inspectedIcon?.name || null}
        category={inspectedIcon?.category || "General UI"}
        color={color}
        onClose={() => setInspectedIcon(null)}
      />

      {/* Global CMDK Command Palette Search Modal */}
      <CmdkSearchModal
        open={cmdkOpen}
        onOpenChange={setCmdkOpen}
        icons={cmdkIcons}
        onSelectIcon={(name, category) => setInspectedIcon({ name, category })}
        color={color}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        bottomClassName="bottom-16 sm:bottom-6"
        onActiveChange={setToastActive}
      />
    </div>
  );
}
