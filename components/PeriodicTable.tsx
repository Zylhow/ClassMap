"use client";

import { ELEMENT_COLORS } from "@/lib/data";

// Only the 6 strategic elements shown in the app
const DISPLAYED_ELEMENTS = [
  { s: "Li", n: 3,  name: "Lithium" },
  { s: "Ni", n: 28, name: "Nickel" },
  { s: "Co", n: 27, name: "Cobalt" },
  { s: "Cu", n: 29, name: "Copper" },
  { s: "Ag", n: 47, name: "Silver" },
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
        position: "fixed", inset: "52px 0 0 0",
        background: 
          "linear-gradient(90deg, #e8e6e2 0.5px, transparent 0.5px), linear-gradient(#e8e6e2 0.5px, transparent 0.5px), #ffffff",
        backgroundSize: "120px 120px",
        overflowY: "auto", zIndex: 50, borderTop: "0.5px solid #ddd",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridAutoRows: "auto",
          gap: 16, padding: "40px 28px 28px",
          maxWidth: 560, margin: "0 auto",
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
                display: "flex", flexDirection: "column", justifyContent: "space-between",
                minHeight: 140, padding: "16px 18px",
                color: "#111", borderRadius: 8,
                border: `1px solid ${isActive ? accent : "#ddd"}`,
                background: "#ffffff",
                boxShadow: isActive ? `0 2px 8px rgba(0,0,0,0.08)` : "none",
                overflow: "hidden", cursor: "pointer",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={e => { 
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = accent;
                el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)";
              }}
              onMouseLeave={e => { 
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = isActive ? accent : "#ddd";
                el.style.boxShadow = isActive ? "0 2px 8px rgba(0,0,0,0.08)" : "none";
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: "0.7rem", color: "#999", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 500 }}>#{el.n}</span>
                <strong style={{ fontSize: "2.2rem", lineHeight: 0.9, letterSpacing: "-0.04em", color: accent }}>{el.s}</strong>
              </div>
              <div style={{ fontSize: "0.95rem", fontWeight: 500, letterSpacing: "0.01em", color: "#111" }}>
                {el.name}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
