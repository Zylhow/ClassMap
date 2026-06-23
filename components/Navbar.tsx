"use client";

interface NavbarProps {
  onToggleMetals: () => void;
  onShowMap: () => void;
  onOpenAbout: () => void;
  activeSection?: string | null;
  // Pour les pages autres que la home (ex: /country/[id], /about)
  // on peut forcer un item actif depuis l'extérieur
  forcedActive?: "map" | "about" | "metals" | null;
}

export default function Navbar({
  onToggleMetals,
  onShowMap,
  onOpenAbout,
  activeSection,
  forcedActive,
}: NavbarProps) {

  function isActive(label: string): boolean {
    // forcedActive a la priorité (utilisé sur les pages hors-home)
    if (forcedActive) {
      return forcedActive === label.toLowerCase();
    }
    // Sur la home, on se base sur la section visible
    switch (label) {
      case "Map":    return activeSection === "map";
      case "About":  return activeSection === "about";
      case "Metals": return activeSection === "metals";
      default:       return false;
    }
  }

  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 52,
        background: "#ffffff", borderBottom: "0.5px solid #ddd",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", zIndex: 1000, fontSize: 14, letterSpacing: "0.06em",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
        <span style={{ color: "#111", fontWeight: 500 }}>Atlas of the hidden side of renewable energy</span>
        <span style={{ color: "#999", fontWeight: 300, fontSize: 11, letterSpacing: "0.04em" }}>
          Mapping the points of extraction and the Socio-Environmental Costs of the technology
        </span>
      </div>
      <div style={{ display: "flex", gap: 32 }}>
        {[
          { label: "Metals", fn: onToggleMetals },
          { label: "Map",    fn: onShowMap },
          { label: "About",  fn: onOpenAbout },
        ].map(({ label, fn }) => {
          const active = isActive(label);
          return (
            <button
              key={label}
              onClick={fn}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: active ? "#000" : "#444",
                letterSpacing: active ? "0.02em" : "0.04em",
                fontSize: 14,
                fontWeight: active ? 700 : 400,
                fontFamily: "inherit",
                padding: 0,
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#000")}
              onMouseLeave={e => (e.currentTarget.style.color = active ? "#000" : "#444")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}