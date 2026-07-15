"use client";
import { useEffect, useState } from "react";

interface Settings {
  coverUrl?: string;
  showCoverAboveNavbar?: boolean;
  showCoverInPageHeader?: boolean;
}

// ─── Shared hook ─────────────────────────────────────────────────────────────
function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then(setSettings)
      .catch(() => {});

    const handler = (e: Event) => {
      const detail = (e as CustomEvent<Settings>).detail;
      if (detail) setSettings((prev) => ({ ...prev, ...detail }));
    };
    window.addEventListener("settingsUpdated", handler);
    return () => window.removeEventListener("settingsUpdated", handler);
  }, []);

  return settings;
}

// ─── Cover height ─────────────────────────────────────────────────────────────
const COVER_H = 100; // px

// ─── 1. Cover bar — hides on scroll, reappears at top ────────────────────────
export function CoverTopBar() {
  const settings = useSettings();
  const [visible, setVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY === 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!settings?.coverUrl || !settings?.showCoverAboveNavbar) return null;

  const handleBannerClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
      setTimeout(() => {
        setIsExpanded(false);
      }, 5000);
    }
  };

  return (
    <div
      onClick={handleBannerClick}
      style={{
        width: "100%",
        maxHeight: visible ? (isExpanded ? "1200px" : `${COVER_H}px`) : "0px",
        overflow: "hidden",
        transition: `max-height ${isExpanded ? '3s' : '3.5s'} cubic-bezier(0.4, 0, 0.2, 1)`,
        position: "relative",
        cursor: isExpanded ? "default" : "zoom-in",
      }}
    >
      <img
        src={settings.coverUrl}
        alt="Board Cover"
        style={{
          width: "100%",
          height: "auto",
          minHeight: "120px",
          display: "block",
          objectFit: "cover",
          marginTop: isExpanded ? "0" : "-20px",
          transition: `margin-top ${isExpanded ? '3s' : '3.5s'} cubic-bezier(0.4, 0, 0.2, 1)`,
        }}
      />
      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "40px",
        background: "linear-gradient(to bottom, transparent, rgba(0,0,0,0.4))",
        pointerEvents: "none",
        opacity: isExpanded ? 0 : 1,
        transition: "opacity 0.4s ease",
      }} />
    </div>
  );
}

// ─── 2. Horizontally scrolling sliding banner for page headers ───────────────
export function PageCoverHeader() {
  const settings = useSettings();

  if (!settings?.coverUrl || !settings?.showCoverInPageHeader) return null;

  return (
    <div className="w-full overflow-hidden bg-green-900 relative" style={{ height: "80px" }}>
      <div className="flex h-full" style={{ animation: "slideLoop 25s linear infinite" }}>
        <img
          src={settings.coverUrl}
          alt="Board Cover"
          className="h-full object-cover flex-shrink-0"
          style={{ minWidth: "100vw", objectPosition: "50% -20px" }}
        />
        <img
          src={settings.coverUrl}
          alt="Board Cover"
          aria-hidden
          className="h-full object-cover flex-shrink-0"
          style={{ minWidth: "100vw", objectPosition: "50% -20px" }}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30 pointer-events-none" />
      <style>{`
        @keyframes slideLoop {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
