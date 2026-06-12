"use client";

interface AboutDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutDrawer({ open, onClose }: AboutDrawerProps) {
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
        <div style={{ padding: "28px 24px", overflowY: "auto", flex: 1 }}>
          <p style={{ fontSize: 12, lineHeight: 1.85, color: "#555", letterSpacing: "0.02em", margin: 0 }}>
            Cette application explore le côté caché des énergies renouvelables — les minéraux critiques qui les rendent possibles, les mines qui les extraient, et les pays qui en dépendent.
          </p>
        </div>
      </div>
    </>
  );
}
