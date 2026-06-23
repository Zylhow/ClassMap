"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import AboutDrawer from "@/components/AboutDrawer";
import ElementModal from "@/components/ElementModal";
import MapOverlay from "@/components/MapOverlay";
import PeriodicTable from "@/components/PeriodicTable";

const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });

const ELEMENTS = [
  { sym: "Li", color: "#4A90D9" },
  { sym: "Ni", color: "#2EAF7D" },
  { sym: "Co", color: "#E05C8A" },
  { sym: "Cu", color: "#E8813A" },
  { sym: "Ag", color: "#9B6DD6" },
  { sym: "Al", color: "#C9A227" },
];

export default function HomePage() {
  const [metalsVisible, setMetalsVisible]         = useState(false);
  const [aboutOpen, setAboutOpen]                 = useState(false);
  const [activeElement, setActiveElement]         = useState<string | null>(null);
  const [mapOverlayElement, setMapOverlayElement] = useState<string | null>(null);
  const [activeSection, setActiveSection]         = useState<string | null>(null);

  const sectionRefs  = useRef<Record<string, HTMLElement | null>>({});
  const scrollRef    = useRef<HTMLDivElement>(null);

  // ── IntersectionObserver pour détecter la section visible ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target.getAttribute("data-section");
            if (section) setActiveSection(section);
          }
        });
      },
      { threshold: 0.1 }
    );
    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const setRef = (key: string) => (el: HTMLElement | null) => {
    sectionRefs.current[key] = el;
  };

  // ── Scroll jusqu'à la section map ──
  const showMap = useCallback(() => {
    setMetalsVisible(false);
    const mapEl = sectionRefs.current["map"];
    if (mapEl && scrollRef.current) {
      scrollRef.current.scrollTo({ top: mapEl.offsetTop, behavior: "smooth" });
    }
  }, []);

  const toggleMetals    = useCallback(() => setMetalsVisible(v => !v), []);
  const openAbout       = useCallback(() => setAboutOpen(true), []);
  const closeAbout      = useCallback(() => setAboutOpen(false), []);
  const selectElement   = useCallback((name: string) => { setActiveElement(name); setMetalsVisible(false); }, []);
  const closeModal      = useCallback(() => setActiveElement(null), []);
  const openMapOverlay  = useCallback(() => setMapOverlayElement(activeElement), [activeElement]);
  const closeMapOverlay = useCallback(() => setMapOverlayElement(null), []);

  return (
    <>
      <Navbar
        onToggleMetals={toggleMetals}
        onShowMap={showMap}
        onOpenAbout={openAbout}
        activeSection={metalsVisible ? "metals" : activeSection}
      />

      <div
        ref={scrollRef}
        style={{
          height: "100vh",
          overflowY: "scroll",
          overflowX: "hidden",
          paddingTop: 52,
          boxSizing: "border-box",
          background: "#ffffff",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >

        {/* ════════════════════════════════════════
            SECTION 1 — Landing KYRT (fond quadrillé conservé)
        ════════════════════════════════════════ */}
        <section
          data-section="landing"
          ref={setRef("landing")}
          style={{
            height: "calc(100vh - 52px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "40px 48px",
            boxSizing: "border-box",
            background: 
              "linear-gradient(90deg, #e8e6e2 0.5px, transparent 0.5px), linear-gradient(#e8e6e2 0.5px, transparent 0.5px), #ffffff",
            backgroundSize: "240px 240px",
          }}
        >
          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <h1 style={{
              fontSize: "clamp(8rem, 28vw, 22rem)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 0.85,
              color: "#000000",
              margin: "0 0 24px",
              userSelect: "none",
            }}>
              KYRT
            </h1>
            <p style={{
              fontSize: 11,
              color: "#000000",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              margin: 0,
              fontStyle: "italic",
            }}>
              The hidden side of renewable energy
            </p>
          </div>

          <div style={{
            borderTop: "0.5px solid #ddd",
            paddingTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#ffffff",
            marginLeft: "-48px",
            marginRight: "-48px",
            paddingLeft: "48px",
            paddingRight: "48px",
            marginBottom: "-40px",
            paddingBottom: "40px",
          }}>
            <div style={{ display: "flex", gap: 24 }}>
              {ELEMENTS.map(({ sym, color }) => (
                <div key={sym} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: color }} />
                  <span style={{ fontSize: 10, letterSpacing: "0.1em", color: "#000000", textTransform: "uppercase" }}>
                    {sym}
                  </span>
                </div>
              ))}
            </div>
            <span style={{ fontSize: 10, letterSpacing: "0.08em", color: "#000000" }}>
              Scroll to explore ↓
            </span>
          </div>
        </section>

        {/* ════════════════════════════════════════
            SECTION 2 — Map sticky (fond uni, sans quadrillage)
        ════════════════════════════════════════ */}
        <div
          data-section="map"
          ref={setRef("map")}
          style={{
            height: "220vh",
            position: "relative",
            background: "#ffffff",
          }}
        >
          <div style={{
            position: "sticky",
            top: 0,
            height: "92vh",
            margin: "4vh 48px",
            overflow: "hidden",
            border: "0.5px solid #eee",
          }}>
            <div style={{
              position: "absolute",
              top: 16, left: 0, right: 0,
              zIndex: 10,
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#000000",
              pointerEvents: "none",
              textAlign: "center",
            }}>
              Critical Minerals Atlas — Interactive Map
            </div>
            <div style={{ width: "100%", height: "100%", position: "relative" }}>
              <WorldMap />
            </div>
          </div>
        </div>

      </div>

      {/* ── Overlays ── */}
      {metalsVisible && (
        <PeriodicTable activeElement={activeElement} onSelect={selectElement} />
      )}
      {activeElement && (
        <ElementModal elementName={activeElement} onClose={closeModal} onExpandMap={openMapOverlay} />
      )}
      {mapOverlayElement && (
        <MapOverlay elementName={mapOverlayElement} onClose={closeMapOverlay} />
      )}
      <AboutDrawer open={aboutOpen} onClose={closeAbout} />
    </>
  );
}