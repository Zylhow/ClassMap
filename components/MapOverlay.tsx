"use client";

import { useEffect, useRef } from "react";
import { ELEMENT_COLORS, MINES } from "@/lib/data";

interface MapOverlayProps {
  elementName: string | null;
  onClose: () => void;
}

export default function MapOverlay({ elementName, onClose }: MapOverlayProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!elementName || !containerRef.current || !canvasRef.current) return;
    let cancelled = false;

    async function init() {
      const [d3, topojson] = await Promise.all([
        import("d3"),
        // @ts-ignore
        import("topojson-client"),
      ]);
      if (cancelled) return;

      const container = containerRef.current!;
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;

      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      const color = ELEMENT_COLORS[elementName!] || "#000";
      const mines = MINES[elementName!] || [];

      const world = await d3.json<any>("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      if (cancelled) return;

      const countries = topojson.feature(world, world.objects.countries).features;

      // ── Même projection / état de zoom-pan que WorldMap (mode flat) ──
      const projection = d3.geoMercator().scale(w / 6.2).translate([w / 2, h / 1.5]);
      const path = d3.geoPath().projection(projection).context(ctx);

      let flatScale = 1, flatPosX = 0, flatPosY = 0, flatVelX = 0, flatVelY = 0;
      let isDragging = false, lastMouseX = 0, lastMouseY = 0;
      let startX = 0, startY = 0;
      let hovered: any = null;

      // SVG overlay pour les icônes des mines (au-dessus du canvas)
      const existing = container.querySelector("#overlay-icons-svg");
      if (existing) existing.remove();
      const iconsSvg = d3.select(container).append("svg")
        .attr("id", "overlay-icons-svg")
        .style("position", "absolute").style("inset", "0").style("pointer-events", "none")
        .attr("width", w).attr("height", h);

      // Tooltip
      const tooltip = document.createElement("div");
      tooltip.style.cssText = "position:fixed;background:#fff;border:0.5px solid #ddd;font-size:0.78rem;padding:0;border-radius:4px;pointer-events:none;display:none;z-index:99999;max-width:220px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.12);";
      document.body.appendChild(tooltip);

      function buildIcons() {
        iconsSvg.selectAll("*").remove();
        const s = 9;
        mines.forEach(mine => {
          const g = iconsSvg.append("g")
            .style("pointer-events", "all").style("cursor", "pointer")
            .attr("data-lng", mine.lng).attr("data-lat", mine.lat);

          const sw = 1.5;
          const t = s * 0.55;
          switch (elementName) {
            case "Aluminium": g.append("rect").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","diag1"); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","diag2"); break;
            case "Lithium":   g.append("polygon").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","lith-line"); break;
            case "Nickel":    g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","cross1"); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","cross2"); break;
            case "Silver":    g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); break;
            case "Copper":    g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("polygon").attr("fill","none").attr("stroke",color).attr("stroke-width",1.2); break;
            case "Cobalt":    g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",1.2); break;
          }

          const label = iconsSvg.append("text")
            .attr("fill", "#111").attr("font-size", "11px")
            .style("pointer-events", "none")
            .attr("data-label-for", mine.name)
            .text(mine.name);

          g.append("circle").attr("r", s + 4).attr("fill", "transparent");
          g.datum({ lng: mine.lng, lat: mine.lat, s });

          g.on("mouseover", function() {
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
        updateIconsTransform();
      }

      function updateIconsTransform() {
        const s = 9;
        iconsSvg.selectAll<SVGGElement, { lng: number; lat: number; s: number }>("g[data-lng]").each(function(d) {
          if (!d) return;
          const rawPt = projection([d.lng, d.lat]);
          const g = d3.select(this);
          if (!rawPt) { g.style("display", "none"); return; }
          g.style("display", null);

          const x = rawPt[0] * flatScale + flatPosX;
          const y = rawPt[1] * flatScale + flatPosY;

          g.attr("transform", `translate(${x},${y})`);

          switch (elementName) {
            case "Aluminium": g.select("rect").attr("x",-s).attr("y",-s).attr("width",s*2).attr("height",s*2); g.select(".diag1").attr("x1",-s).attr("y1",-s).attr("x2",s).attr("y2",s); g.select(".diag2").attr("x1",s).attr("y1",-s).attr("x2",-s).attr("y2",s); break;
            case "Lithium":   g.select("polygon").attr("points",`0,${-s} ${s},0 0,${s} ${-s},0`); g.select(".lith-line").attr("x1",0).attr("y1",-s).attr("x2",0).attr("y2",s); break;
            case "Nickel":    g.select("circle").attr("r",s); g.select(".cross1").attr("x1",-s).attr("y1",0).attr("x2",s).attr("y2",0); g.select(".cross2").attr("x1",0).attr("y1",-s).attr("x2",0).attr("y2",s); break;
            case "Silver":    g.select("circle").attr("r",s); break;
            case "Copper":    { const circles=g.selectAll("circle"); circles.attr("r",s); const t=s*0.55; g.select("polygon").attr("points",`0,${-t} ${t},${t} ${-t},${t}`); break; }
            case "Cobalt":    { const cs=g.selectAll("circle"); cs.filter((_d,i)=>i===0).attr("r",s); cs.filter((_d,i)=>i===1).attr("r",s*0.45); break; }
          }

          iconsSvg.select(`text[data-label-for="${CSS.escape(mineNameOf(d))}"]`)
            .attr("x", x + s + 6).attr("y", y + 4);
        });
      }

      function mineNameOf(d: { lng: number; lat: number }) {
        const m = mines.find(m => m.lng === d.lng && m.lat === d.lat);
        return m ? m.name : "";
      }

      buildIcons();

      function drawFlat() {
        flatPosX += flatVelX; flatPosY += flatVelY;
        flatVelX *= 0.92; flatVelY *= 0.92;
        flatPosX = Math.max(-w * (flatScale - 1), Math.min(0, flatPosX));
        flatPosY = Math.max(-h * (flatScale - 1), Math.min(0, flatPosY));

        ctx.save(); ctx.translate(flatPosX, flatPosY); ctx.scale(flatScale, flatScale);
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "#e8e6e2"; ctx.lineWidth = 0.5 / flatScale;
        for (let x = 0; x < w; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

        countries.forEach((d: any) => {
          ctx.beginPath(); path(d);
          ctx.fillStyle = (hovered && d.id === hovered.id) ? "#C8C8C8" : "#E0E0E0";
          ctx.fill(); ctx.strokeStyle = "#000000"; ctx.lineWidth = 0.5 / flatScale; ctx.stroke();
        });
        ctx.restore();
      }

      function draw() {
        if (cancelled) return;
        ctx.clearRect(0, 0, w, h);
        drawFlat();
        updateIconsTransform();
        requestAnimationFrame(draw);
      }

      // ── Mêmes interactions que WorldMap (drag + inertie + wheel zoom centré sur le curseur) ──
      canvas.onmousedown = (e) => {
        isDragging = true; startX = e.clientX; startY = e.clientY;
        lastMouseX = e.clientX; lastMouseY = e.clientY;
        canvas.style.cursor = "grabbing";
      };

      const onMouseUp = () => {
        isDragging = false;
        canvas.style.cursor = "grab";
      };
      window.addEventListener("mouseup", onMouseUp);

      const onMouseMove = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        if (isDragging) {
          flatVelX = (e.clientX - lastMouseX) * 0.8;
          flatVelY = (e.clientY - lastMouseY) * 0.8;
          lastMouseX = e.clientX; lastMouseY = e.clientY;
        }
        const p = projection.invert!([(e.clientX - rect.left - flatPosX) / flatScale, (e.clientY - rect.top - flatPosY) / flatScale]);
        if (p) hovered = countries.find((c: any) => d3.geoContains(c, p)) || null;
        if (!isDragging) canvas.style.cursor = hovered ? "pointer" : "grab";
      };
      window.addEventListener("mousemove", onMouseMove);

      canvas.onwheel = (e) => {
        e.preventDefault();
        e.stopPropagation();
        flatVelX = 0; flatVelY = 0;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
        const pointX = (mouseX - flatPosX) / flatScale, pointY = (mouseY - flatPosY) / flatScale;
        const factor = e.deltaY > 0 ? 0.92 : 1.08;
        const newScale = Math.max(1, Math.min(flatScale * factor, 8));
        flatPosX = mouseX - pointX * newScale; flatPosY = mouseY - pointY * newScale; flatScale = newScale;
      };

      draw();

      return () => {
        window.removeEventListener("mouseup", onMouseUp);
        window.removeEventListener("mousemove", onMouseMove);
        tooltip.remove();
        iconsSvg.remove();
      };
    }

    const cleanupPromise = init();
    return () => {
      cancelled = true;
      cleanupPromise.then(fn => fn && fn());
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
      <div ref={containerRef} style={{ flex: 1, position: "relative", overflow: "hidden" }}>
        <canvas ref={canvasRef} style={{ cursor: "grab", display: "block" }} />
      </div>
    </div>
  );
}