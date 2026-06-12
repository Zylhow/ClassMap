"use client";

import { useEffect, useRef, useState } from "react";
import { ELEMENT_DETAILS, ELEMENT_COLORS, MINES } from "@/lib/data";
import { MineIconGroup } from "./MineIcon";

interface ElementModalProps {
  elementName: string | null;
  onClose: () => void;
  onExpandMap: () => void;
}

// Minimal world map SVG drawn via D3 — loaded lazily client-side
function MiniMap({ elementName }: { elementName: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !elementName) return;
    let cancelled = false;

    async function draw() {
      const [d3, topojson] = await Promise.all([
        import("d3"),
        // @ts-ignore
        import("topojson-client"),
      ]);
      if (cancelled || !ref.current) return;

      const container = ref.current;
      container.innerHTML = "";
      const w = container.clientWidth || 400;
      const h = container.clientHeight || 300;
      const color = ELEMENT_COLORS[elementName] || "#000";
      const mines = MINES[elementName] || [];

      const world = await d3.json<any>("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      if (cancelled || !ref.current) return;

      const countries = topojson.feature(world, world.objects.countries).features;
      const proj = d3.geoMercator().scale(w / 6.2).translate([w / 2, h / 1.5]);
      const path = d3.geoPath().projection(proj);

      const svg = d3.select(container).append("svg")
        .attr("width", w).attr("height", h)
        .style("display", "block").style("width", "100%").style("height", "100%");

      svg.append("rect").attr("width", w).attr("height", h).attr("fill", "#ffffff");

      // grid
      const gs = 40;
      for (let x = 0; x < w; x += gs) svg.append("line").attr("x1", x).attr("y1", 0).attr("x2", x).attr("y2", h).attr("stroke", "#e8e6e2").attr("stroke-width", 0.5);
      for (let y = 0; y < h; y += gs) svg.append("line").attr("x1", 0).attr("y1", y).attr("x2", w).attr("y2", y).attr("stroke", "#e8e6e2").attr("stroke-width", 0.5);

      svg.selectAll("path.country").data(countries).enter().append("path")
        .attr("class", "country")
        .attr("d", path as any)
        .attr("fill", "#E0E0E0").attr("stroke", "#000").attr("stroke-width", 0.5);

      mines.forEach(mine => {
        const pt = proj([mine.lng, mine.lat]);
        if (!pt) return;
        const g = svg.append("g").attr("transform", `translate(${pt[0]},${pt[1]})`);
        const s = 6;
        const sw = 1.5;
        const t = s * 0.55;
        switch (elementName) {
          case "Aluminium": g.append("rect").attr("x",-s).attr("y",-s).attr("width",s*2).attr("height",s*2).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("x1",-s).attr("y1",-s).attr("x2",s).attr("y2",s).attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("x1",s).attr("y1",-s).attr("x2",-s).attr("y2",s).attr("stroke",color).attr("stroke-width",sw); break;
          case "Lithium":   g.append("polygon").attr("points",`0,${-s} ${s},${s} ${-s},${s}`).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); break;
          case "Nickel":    g.append("polygon").attr("points",`0,${-s} ${s},0 0,${s} ${-s},0`).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("x1",0).attr("y1",-s*0.45).attr("x2",0).attr("y2",s*0.45).attr("stroke",color).attr("stroke-width",sw); break;
          case "Argent":    g.append("circle").attr("r",s).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); break;
          case "Cuivre":    g.append("circle").attr("r",s).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("polygon").attr("points",`0,${-t} ${t},${t} ${-t},${t}`).attr("fill","none").attr("stroke",color).attr("stroke-width",1.2); break;
          case "Cobalt":    g.append("circle").attr("r",s).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("circle").attr("r",s*0.45).attr("fill","none").attr("stroke",color).attr("stroke-width",1.2); break;
        }
      });
    }

    draw();
    return () => { cancelled = true; };
  }, [elementName]);

  return <div ref={ref} style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }} />;
}

export default function ElementModal({ elementName, onClose, onExpandMap }: ElementModalProps) {
  const [imgSize, setImgSize] = useState(100);

  useEffect(() => {
    setImgSize(100);
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [elementName, onClose]);

  if (!elementName) return null;
  const detail = ELEMENT_DETAILS[elementName];
  if (!detail) return null;

  return (
    <div style={{ display: "block", position: "fixed", inset: 0, background: "#ffffff", zIndex: 10000, overflow: "hidden" }}>
      {/* Close */}
      <button
        onClick={onClose}
        style={{ position: "fixed", top: 24, right: 32, cursor: "pointer", fontSize: 12, letterSpacing: "0.1em", color: "#000", background: "none", border: "none", zIndex: 20001, fontFamily: "inherit" }}
      >
        [CLOSE]
      </button>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100vh" }}>
        {/* LEFT */}
        <div style={{ padding: "60px 64px", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", background: "#ffffff", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: -40, left: -20, fontSize: 380, fontWeight: 900, color: "rgba(0,0,0,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>
            {detail.symbol}
          </div>
          <div style={{ fontSize: 13, color: "#999", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 16, position: "relative", zIndex: 1 }}>
            Element No. {detail.number}
          </div>
          <h1 style={{ fontSize: "clamp(3rem,6vw,5.5rem)", fontWeight: 700, color: "#111", margin: "0 0 8px", lineHeight: 1, position: "relative", zIndex: 1 }}>
            {elementName}
          </h1>
          <div style={{ fontSize: "1.2rem", fontWeight: 600, color: "#000", marginBottom: 32, position: "relative", zIndex: 1 }}>
            {detail.symbol}
          </div>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.75, color: "#333", maxWidth: 520, position: "relative", zIndex: 1, margin: 0 }}>
            {detail.info}
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 36, position: "relative", zIndex: 1 }}>
            {Object.entries(detail.stats).map(([k, v]) => (
              <div key={k} style={{ borderTop: "1px solid #eee", paddingTop: 12 }}>
                <div style={{ fontSize: 11, letterSpacing: "0.1em", color: "#aaa", textTransform: "uppercase", marginBottom: 4 }}>{k}</div>
                <div style={{ fontSize: "1rem", fontWeight: 600, color: "#111" }}>{v}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 28, padding: "16px 20px", borderLeft: "3px solid #000", background: "#fafafa", position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#000", textTransform: "uppercase", marginBottom: 6, fontWeight: 700 }}>Fun fact</div>
            <div style={{ fontSize: "0.95rem", color: "#555", lineHeight: 1.6 }}>{detail.fun}</div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ position: "relative", overflow: "hidden", background: "#f0efed" }}>
          <img
            src={detail.photo}
            alt={elementName}
            style={{
              display: "block",
              ...(imgSize === 100
                ? { width: "100%", height: "100%", objectFit: "cover" }
                : { position: "absolute", inset: 0, margin: "auto", width: `${imgSize}%`, height: `${imgSize}%`, objectFit: "contain" }),
            }}
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />

          {/* Mini map */}
          <div
            onClick={onExpandMap}
            style={{
              position: "absolute", bottom: 20, right: 20, width: 280, height: 175,
              border: "1px solid rgba(255,255,255,0.5)", borderRadius: 4, overflow: "hidden",
              cursor: "pointer", zIndex: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.35)",
              background: "#f0efed",
            }}
          >
            <MiniMap elementName={elementName} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 10, letterSpacing: "0.1em", textAlign: "center", padding: "5px 0", pointerEvents: "none", textTransform: "uppercase" }}>
              Mines — Click to enlarge
            </div>
          </div>

          {/* Size slider */}
          <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 10, display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.88)", padding: "6px 12px", borderRadius: 4, boxShadow: "0 2px 10px rgba(0,0,0,0.15)" }}>
            <label style={{ fontSize: 10, letterSpacing: "0.1em", color: "#555", textTransform: "uppercase", whiteSpace: "nowrap" }}>Size</label>
            <input type="range" min={30} max={100} value={imgSize} onChange={e => setImgSize(Number(e.target.value))} style={{ width: 80, accentColor: "#000", cursor: "pointer" }} />
            <span style={{ fontSize: 10, color: "#999", minWidth: 28 }}>{imgSize}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
