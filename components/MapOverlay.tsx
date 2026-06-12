"use client";

import { useEffect, useRef } from "react";
import { ELEMENT_COLORS, MINES } from "@/lib/data";

interface MapOverlayProps {
  elementName: string | null;
  onClose: () => void;
}

export default function MapOverlay({ elementName, onClose }: MapOverlayProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementName || !ref.current) return;
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
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight - 40;
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

      const gs = 80;
      for (let x = 0; x < w; x += gs) svg.append("line").attr("x1", x).attr("y1", 0).attr("x2", x).attr("y2", h).attr("stroke", "#e8e6e2").attr("stroke-width", 0.5);
      for (let y = 0; y < h; y += gs) svg.append("line").attr("x1", 0).attr("y1", y).attr("x2", w).attr("y2", y).attr("stroke", "#e8e6e2").attr("stroke-width", 0.5);

      svg.selectAll("path.country").data(countries).enter().append("path")
        .attr("class", "country").attr("d", path as any)
        .attr("fill", "#E0E0E0").attr("stroke", "#000").attr("stroke-width", 0.5);

      // Tooltip element
      const tooltip = document.createElement("div");
      tooltip.style.cssText = "position:fixed;background:#fff;border:0.5px solid #ddd;font-size:0.78rem;padding:0;border-radius:4px;pointer-events:none;display:none;z-index:99999;max-width:220px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.12);";
      document.body.appendChild(tooltip);

      mines.forEach(mine => {
        const pt = proj([mine.lng, mine.lat]);
        if (!pt) return;
        const [px, py] = pt;
        const s = 9;
        const sw = 1.5;
        const t = s * 0.55;
        const g = svg.append("g").attr("transform", `translate(${px},${py})`).style("cursor", "pointer");

        switch (elementName) {
          case "Aluminium": g.append("rect").attr("x",-s).attr("y",-s).attr("width",s*2).attr("height",s*2).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("x1",-s).attr("y1",-s).attr("x2",s).attr("y2",s).attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("x1",s).attr("y1",-s).attr("x2",-s).attr("y2",s).attr("stroke",color).attr("stroke-width",sw); break;
          case "Lithium":   g.append("polygon").attr("points",`0,${-s} ${s},${s} ${-s},${s}`).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); break;
          case "Nickel":    g.append("polygon").attr("points",`0,${-s} ${s},0 0,${s} ${-s},0`).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("x1",0).attr("y1",-s*0.45).attr("x2",0).attr("y2",s*0.45).attr("stroke",color).attr("stroke-width",sw); break;
          case "Argent":    g.append("circle").attr("r",s).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); break;
          case "Cuivre":    g.append("circle").attr("r",s).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("polygon").attr("points",`0,${-t} ${t},${t} ${-t},${t}`).attr("fill","none").attr("stroke",color).attr("stroke-width",1.2); break;
          case "Cobalt":    g.append("circle").attr("r",s).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("circle").attr("r",s*0.45).attr("fill","none").attr("stroke",color).attr("stroke-width",1.2); break;
        }

        // invisible hit area
        g.append("circle").attr("r", s + 4).attr("fill", "transparent");

        // label
        svg.append("text").attr("x", px + s + 6).attr("y", py + 4).attr("fill", "#111").attr("font-size", "11px").style("pointer-events", "none").text(mine.name);

        g.on("mouseover", function(event: MouseEvent) {
          tooltip.style.display = "block";
          tooltip.innerHTML = mine.img
            ? `<img style="width:220px;height:120px;object-fit:cover;display:block;" src="${mine.img}" onerror="this.style.display='none'" alt="${mine.name}"><div style="padding:8px 12px 10px"><b>${mine.name}</b><br>${mine.country}${mine.output ? "<br>Production : " + mine.output : ""}</div>`
            : `<div style="width:220px;height:120px;background:#f5f5f5;display:flex;align-items:center;justify-content:center;font-size:11px;color:#999;text-transform:uppercase;letter-spacing:.08em">${mine.name}</div><div style="padding:8px 12px 10px"><b>${mine.name}</b><br>${mine.country}${mine.output ? "<br>Production : " + mine.output : ""}</div>`;
        }).on("mousemove", function(event: MouseEvent) {
          const tw = 220, th = mine.img ? 180 : 155;
          const left = event.clientX + 16 + tw > window.innerWidth ? event.clientX - tw - 10 : event.clientX + 16;
          const top = event.clientY - 10 + th > window.innerHeight ? event.clientY - th - 10 : event.clientY - 10;
          tooltip.style.left = left + "px"; tooltip.style.top = top + "px";
        }).on("mouseout", function() { tooltip.style.display = "none"; });
      });

      // Cleanup tooltip on unmount
      return () => { tooltip.remove(); };
    }

    const cleanup = draw();
    return () => {
      cancelled = true;
      cleanup?.then(fn => fn && fn());
    };
  }, [elementName]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  if (!elementName) return null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "#ffffff", zIndex: 20000, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 24px", background: "#ffffff", borderBottom: "1px solid #ddd", flexShrink: 0 }}>
        <h2 style={{ margin: 0, color: "#000", fontSize: "0.9rem", letterSpacing: "0.08em" }}>
          MINES — {elementName.toUpperCase()}
        </h2>
        <button onClick={onClose} style={{ cursor: "pointer", color: "#000", background: "none", border: "none", fontSize: "0.8rem", letterSpacing: "0.05em", fontFamily: "inherit" }}>
          [CLOSE]
        </button>
      </div>
      <div style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <div ref={ref} style={{ position: "absolute", inset: 0 }} />
      </div>
    </div>
  );
}
