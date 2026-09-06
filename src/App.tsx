import { useState, useEffect } from "react";
import { SiteHeader, type NavTab } from "./components/SiteHeader";
import { HeroExplorerView } from "./views/HeroExplorerView";
import { DocsView } from "./views/DocsView";
import { ChangelogView } from "./views/ChangelogView";
import { IconDetailModal } from "./components/IconDetailModal";
import { Toast } from "./components/Toast";
import { SiteFooter } from "./components/SiteFooter";

import { isValidColorForTheme, getDefaultColorForTheme } from "./utils/themeColors";

function getTabFromPath(path: string): NavTab {
  if (path.startsWith("/docs")) return "docs";
  if (path.startsWith("/changelog")) return "changelog";
  return "explorer";
}

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>(() =>
    getTabFromPath(window.location.pathname)
  );
  const [theme, setTheme] = useState<"dark" | "light">(
    () => (localStorage.getItem("reicon-theme") as "dark" | "light") || "dark"
  );
  const [color, setColor] = useState<string>(() =>
    getDefaultColorForTheme(
      (localStorage.getItem("reicon-theme") as "dark" | "light") || "dark"
    )
  );
  const [inspectedIcon, setInspectedIcon] = useState<{ name: string; category: string } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastActive, setToastActive] = useState<boolean>(false);
  const [showTopBlur, setShowTopBlur] = useState<boolean>(false);

  // Sync html element theme class and accent color on mount or theme change
  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    const nextColor = isValidColorForTheme(color, nextTheme)
      ? color
      : getDefaultColorForTheme(nextTheme);

    // Synchronously update DOM before React re-renders for 0ms frame-perfect sync
    const root = document.documentElement;
    if (nextTheme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    root.style.setProperty("--accent-color", nextColor);
    localStorage.setItem("reicon-theme", nextTheme);

    // Batch React state updates synchronously
    setTheme(nextTheme);
    setColor(nextColor);
  };

  // Initial mount sync for root theme class and accent color variable
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("light");
      root.classList.remove("dark");
    } else {
      root.classList.add("dark");
      root.classList.remove("light");
    }
    root.style.setProperty("--accent-color", color);
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
            theme={theme}
            color={color}
            onToggleTheme={toggleTheme}
          />

          {/* Main Content Router */}
          <main className="w-full">
            {activeTab === "explorer" && (
              <HeroExplorerView
                theme={theme}
                color={color}
                onColorChange={handleColorChange}
                onInspect={(name, category) => setInspectedIcon({ name, category })}
                onCopyNotice={handleCopyNotice}
                toastActive={toastActive}
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
