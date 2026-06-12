"use client";

import { ELEMENT_COLORS } from "@/lib/data";

// Only the 6 strategic elements shown in the app
const DISPLAYED_ELEMENTS = [
  { s: "Li", n: 3,  name: "Lithium" },
  { s: "Ni", n: 28, name: "Nickel" },
  { s: "Co", n: 27, name: "Cobalt" },
  { s: "Cu", n: 29, name: "Cuivre" },
  { s: "Ag", n: 47, name: "Argent" },
  { s: "Al", n: 13, name: "Aluminium" },
];

interface PeriodicTableProps {
  activeElement: string | null;
  onSelect: (name: string) => void;
}

export default function PeriodicTable({ activeElement, onSelect }: PeriodicTableProps) {
  return (
    <div
      style={{
        position: "fixed", inset: "52px 0 0 0", background: "#f8f9fb",
        overflowY: "auto", zIndex: 50,
      }}
    >
      <h2 style={{ fontSize: 11, letterSpacing: "0.14em", color: "#999", textTransform: "uppercase", padding: "28px 28px 8px", margin: 0 }}>
        TABLEAU PÉRIODIQUE DES RESSOURCES CRITIQUES
      </h2>
      <p style={{ fontSize: "0.95rem", color: "#555", maxWidth: 760, lineHeight: 1.6, padding: "0 28px 24px", margin: 0 }}>
        Cliquez sur un métal pour explorer ses mines, ses usages et sa place stratégique dans la transition énergétique.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gridAutoRows: "minmax(160px, auto)",
          gap: 18, padding: "0 28px 28px",
          maxWidth: 1140, margin: "0 auto",
        }}
      >
        {DISPLAYED_ELEMENTS.map(el => {
          const accent = ELEMENT_COLORS[el.name] || "#999";
          const isActive = activeElement === el.name;
          return (
            <div
              key={el.name}
              onClick={() => onSelect(el.name)}
              style={{
                position: "relative",
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                minHeight: 170, padding: "18px 20px",
                color: "#fff", borderRadius: 20,
                border: `1px solid ${isActive ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.12)"}`,
                background: "linear-gradient(135deg, rgba(15,20,30,0.95) 0%, rgba(30,35,50,0.98) 100%)",
                boxShadow: isActive ? "0 28px 70px rgba(5,10,25,0.25)" : "0 20px 45px rgba(5,10,25,0.12)",
                overflow: "hidden", cursor: "pointer",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                ["--accent" as string]: accent,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px) scale(1.02)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = ""; }}
            >
              {/* top accent stripe */}
              <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 4, background: accent, borderRadius: 999, pointerEvents: "none" }} />
              {/* radial highlight */}
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at top right, rgba(255,255,255,0.14), transparent 40%)", opacity: 0.55, pointerEvents: "none" }} />

              <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", gap: 10 }}>
                <span style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.72)", letterSpacing: "0.18em", textTransform: "uppercase" }}>#{el.n}</span>
                <strong style={{ fontSize: "3rem", lineHeight: 0.9, letterSpacing: "-0.06em" }}>{el.s}</strong>
              </div>
              <div style={{ position: "relative", zIndex: 1, marginTop: 16, fontSize: "1rem", fontWeight: 600, letterSpacing: "0.02em", color: "#f8f8ff" }}>
                {el.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
