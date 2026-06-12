"use client";

interface NavbarProps {
  onToggleMetals: () => void;
  onShowMap: () => void;
  onOpenAbout: () => void;
}

export default function Navbar({ onToggleMetals, onShowMap, onOpenAbout }: NavbarProps) {
  return (
    <nav
      style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 52,
        background: "#ffffff", borderBottom: "0.5px solid #ddd",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", zIndex: 1000, fontSize: 14, letterSpacing: "0.06em",
      }}
    >
      <span style={{ color: "#111", fontWeight: 500 }}>O LADO OCULTO DAS ENERGIAS RENOVÁVEIS</span>
      <div style={{ display: "flex", gap: 32 }}>
        {[
          { label: "Metals", fn: onToggleMetals },
          { label: "Map",    fn: onShowMap },
          { label: "About",  fn: onOpenAbout },
        ].map(({ label, fn }) => (
          <button
            key={label}
            onClick={fn}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#444", letterSpacing: "0.04em", fontSize: 14,
              fontFamily: "inherit", padding: 0,
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#000")}
            onMouseLeave={e => (e.currentTarget.style.color = "#444")}
          >
            {label}
          </button>
        ))}
      </div>
    </nav>
  );
}
