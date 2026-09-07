import { useState, useEffect, useMemo } from "react";
import { SiteHeader, type NavTab } from "./components/layout/Header";
import { HeroExplorerView } from "./views/HeroExplorerView";
import { DocsView } from "./views/DocsView";
import { ChangelogView } from "./views/ChangelogView";
import { IconDetailModal } from "./components/modal/IconDetailModal";
import { CmdkSearchModal } from "./components/explorer/SearchModal";
import { Toast } from "./components/common/Toast";
import { SiteFooter } from "./components/layout/Footer";

import agentData from "./data/agent.json";
import { parseAgentJson } from "./views/HeroExplorerView";
import { getDefaultColor } from "./utils/themeColors";

function getTabFromPath(path: string): NavTab {
  if (path.startsWith("/docs")) return "docs";
  if (path.startsWith("/changelog")) return "changelog";
  return "explorer";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(() =>
    getTabFromPath(window.location.pathname)
  );
  const [cmdkOpen, setCmdkOpen] = useState(false);
  const [color, setColor] = useState<string>(() => getDefaultColor());
  const [inspectedIcon, setInspectedIcon] = useState<{ name: string; category: string } | null>(null);

  const cmdkIcons = useMemo(() => parseAgentJson(agentData), []);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastActive, setToastActive] = useState<boolean>(false);
  const [showTopBlur, setShowTopBlur] = useState<boolean>(false);

  // Initial mount sync for accent color variable
  useEffect(() => {
    document.documentElement.style.setProperty("--accent-color", color);
  }, []);

  const handleColorChange = (newColor: string) => {
    document.documentElement.style.setProperty("--accent-color", newColor);
    setColor(newColor);
  };

  // Sync state on popstate (browser back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setActiveTab(getTabFromPath(window.location.pathname));
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleTabChange = (tab: NavTab, href: string) => {
    setActiveTab(tab);
    if (window.location.pathname !== href) {
      window.history.pushState({}, "", href);
      window.dispatchEvent(new Event("popstate"));
    }
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

      <div className="flex flex-col items-center w-full pt-3 gap-6">
        <section className="w-full px-6 flex flex-col gap-3">
          {/* Header */}
          <SiteHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            color={color}
          />

          {/* Main Content Router */}
          <main className="w-full">
            {activeTab === "explorer" && (
              <HeroExplorerView
                color={color}
                onColorChange={handleColorChange}
                onInspect={(name, category) => setInspectedIcon({ name, category })}
                onCopyNotice={handleCopyNotice}
                toastActive={toastActive}
                onOpenCmdk={() => setCmdkOpen(true)}
              />
            )}
            {activeTab === "docs" && (
              <div className="max-w-[1080px] mx-auto w-full pt-4">
                <DocsView onCopyNotice={handleCopyNotice} />
              </div>
            )}
            {activeTab === "changelog" && (
              <div className="max-w-[1080px] mx-auto w-full pt-4">
                <ChangelogView />
              </div>
            )}
          </main>

          {/* Site Footer */}
          <SiteFooter />
        </section>
      </div>

      {/* Detail Modal Inspector */}
      <IconDetailModal
        iconName={inspectedIcon?.name || null}
        category={inspectedIcon?.category || "General UI"}
        color={color}
        onClose={() => setInspectedIcon(null)}
        onCopyNotice={handleCopyNotice}
      />

      {/* Global CMDK Command Palette Search Modal */}
      <CmdkSearchModal
        open={cmdkOpen}
        onOpenChange={setCmdkOpen}
        icons={cmdkIcons}
        onSelectIcon={(name, category) => setInspectedIcon({ name, category })}
        onSelectNav={(tab, href) => handleTabChange(tab, href)}
        onCopyNotice={handleCopyNotice}
      />

      {/* Toast Notification */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
        bottomClassName="bottom-6"
        onActiveChange={setToastActive}
      />
    </div>
  );
}
