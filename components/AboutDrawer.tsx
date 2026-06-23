"use client";

import { useRouter } from "next/navigation";

interface AboutDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutDrawer({ open, onClose }: AboutDrawerProps) {
  const router = useRouter();

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.18)", zIndex: 9000 }}
        />
      )}
      <div
        style={{
          position: "fixed", top: 0, bottom: 0, left: 0, width: 320,
          background: "#ffffff", zIndex: 9001,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
          borderRight: "0.5px solid #e0e0e0", display: "flex", flexDirection: "column",
        }}
      >
        <div style={{ padding: "20px 24px 14px", borderBottom: "0.5px solid #eee", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "#555", fontWeight: 700 }}>About</span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 11, color: "#aaa", letterSpacing: "0.06em", fontFamily: "inherit" }}>
            [close]
          </button>
        </div>
        <div style={{ padding: "28px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column" }}>
          <p style={{ fontSize: 12, lineHeight: 1.85, color: "#555", letterSpacing: "0.02em", margin: "0 0 18px" }}>
            This application explores the hidden side of renewable energy — the critical minerals that make it possible, the mines that extract them, and the countries that depend on them.
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.85, color: "#555", letterSpacing: "0.02em", margin: "0 0 18px" }}>
            Click on an element (Lithium, Nickel, Cobalt, Copper, Silver, Aluminium) to discover its properties, where it is mined around the world, and why it matters for the energy transition.
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.85, color: "#555", letterSpacing: "0.02em", margin: "0 0 28px" }}>
            Click on a country on the map to see its production rankings, key reserves, and the strategic mining sites located within its borders.
          </p>
          <button
            onClick={() => { onClose(); router.push("/about"); }}
            style={{
              marginTop: "auto",
              padding: "10px 0",
              background: "none",
              border: "0.5px solid #ccc",
              cursor: "pointer",
              fontSize: 11,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#333",
              fontFamily: "inherit",
              fontWeight: 600,
              width: "100%",
              transition: "background 0.18s, color 0.18s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#111"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "#333"; }}
          >
            Learn more →
          </button>
        </div>
      </div>
    </>
  );
}