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

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY < 50);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!settings?.coverUrl || !settings?.showCoverAboveNavbar) return null;

  return (
    <div
      className="bg-primary"
      style={{
        width: "100%",
        display: "grid",
        gridTemplateRows: visible ? "1fr" : "0fr",
        transition: "grid-template-rows 0.4s ease-in-out",
        position: "relative",
      }}
    >
      <div style={{ overflow: "hidden" }}>
        <img
          src={settings.coverUrl}
          alt="Board Cover"
          style={{
            width: "100%",
            height: "auto",
            display: "block",
            objectFit: "contain",
            marginTop: "-2%", // Slight negative margin to hide top white border if present in image
            marginBottom: "-2%", // Slight negative margin to hide bottom white border if present
          }}
        />
      </div>
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
