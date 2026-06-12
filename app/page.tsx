"use client";

import dynamic from "next/dynamic";
import { useState, useCallback } from "react";
import Navbar from "@/components/Navbar";
import AboutDrawer from "@/components/AboutDrawer";
import ElementModal from "@/components/ElementModal";
import MapOverlay from "@/components/MapOverlay";
import PeriodicTable from "@/components/PeriodicTable";

// WorldMap uses canvas + D3 — must be client-only, no SSR
const WorldMap = dynamic(() => import("@/components/WorldMap"), { ssr: false });

export default function HomePage() {
  const [metalsVisible, setMetalsVisible] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [activeElement, setActiveElement] = useState<string | null>(null);
  const [mapOverlayElement, setMapOverlayElement] = useState<string | null>(null);

  const toggleMetals = useCallback(() => setMetalsVisible(v => !v), []);
  const showMap = useCallback(() => setMetalsVisible(false), []);
  const openAbout = useCallback(() => setAboutOpen(true), []);
  const closeAbout = useCallback(() => setAboutOpen(false), []);

  const selectElement = useCallback((name: string) => {
    setActiveElement(name);
    setMetalsVisible(false); // show map behind modal
  }, []);

  const closeModal = useCallback(() => setActiveElement(null), []);
  const openMapOverlay = useCallback(() => setMapOverlayElement(activeElement), [activeElement]);
  const closeMapOverlay = useCallback(() => setMapOverlayElement(null), []);

  return (
    <>
      <Navbar onToggleMetals={toggleMetals} onShowMap={showMap} onOpenAbout={openAbout} />

      {/* World map is always mounted underneath */}
      <WorldMap />

      {/* Periodic table overlay */}
      {metalsVisible && (
        <PeriodicTable activeElement={activeElement} onSelect={selectElement} />
      )}

      {/* Element detail modal */}
      {activeElement && (
        <ElementModal
          elementName={activeElement}
          onClose={closeModal}
          onExpandMap={openMapOverlay}
        />
      )}

      {/* Fullscreen mine map */}
      {mapOverlayElement && (
        <MapOverlay elementName={mapOverlayElement} onClose={closeMapOverlay} />
      )}

      {/* About drawer */}
      <AboutDrawer open={aboutOpen} onClose={closeAbout} />
    </>
  );
}
