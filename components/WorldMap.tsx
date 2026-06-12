"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ELEMENT_COLORS, MINES } from "@/lib/data";

// Legend built from element colors
function Legend({ containerId }: { containerId: string }) {
  return null; // rendered imperatively by D3 below
}

export default function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgContainerRef = useRef<SVGSVGElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!canvasRef.current) return;
    let cancelled = false;

    async function init() {
      const [d3, topojson] = await Promise.all([
        import("d3"),
        // @ts-ignore
        import("topojson-client"),
      ]);
      if (cancelled) return;

      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      const container = canvas.parentElement!;
      const w = window.innerWidth;
      const h = window.innerHeight - 52;
      canvas.width = w; canvas.height = h;

      const world = await d3.json<any>("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      if (cancelled) return;

      const countries = topojson.feature(world, world.objects.countries).features;
      const projection = d3.geoMercator().scale(w / 6.2).translate([w / 2, h / 1.5]);
      const path = d3.geoPath().projection(projection).context(ctx);

      let scale = 1, posX = 0, posY = 0, velX = 0, velY = 0;
      let isDragging = false, lastMouseX = 0, lastMouseY = 0;
      let startX = 0, startY = 0, mouseDownCountry: any = null;
      let hovered: any = null;

      // SVG icons overlay
      const worldDiv = container;
      const existing = worldDiv.querySelector("#icons-svg");
      if (existing) existing.remove();
      const iconsSvg = d3.select(worldDiv as HTMLElement).append("svg")
        .attr("id", "icons-svg")
        .style("position", "absolute").style("inset", "0").style("pointer-events", "none")
        .attr("width", w).attr("height", h);
      svgContainerRef.current = iconsSvg.node();

      // Tooltip
      const tooltip = document.createElement("div");
      tooltip.style.cssText = "position:fixed;background:#fff;border:0.5px solid #ddd;font-size:0.78rem;padding:0;border-radius:4px;pointer-events:none;display:none;z-index:99999;max-width:220px;overflow:hidden;box-shadow:0 6px 24px rgba(0,0,0,0.12);";
      document.body.appendChild(tooltip);

      function buildIcons() {
        iconsSvg.selectAll("*").remove();
        const s = 7;
        Object.entries(MINES).forEach(([elementName, mines]) => {
          const color = ELEMENT_COLORS[elementName] || "#000";
          mines.forEach(mine => {
            const rawPt = projection([mine.lng, mine.lat]);
            if (!rawPt) return;
            const g = iconsSvg.append("g")
              .style("pointer-events", "all").style("cursor", "pointer")
              .attr("data-raw-x", rawPt[0]).attr("data-raw-y", rawPt[1]);

            const sw = 1.5;
            const t = s * 0.55;
            switch (elementName) {
              case "Aluminium": g.append("rect").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","diag1"); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","diag2"); break;
              case "Lithium":   g.append("polygon").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); break;
              case "Nickel":    g.append("polygon").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("stroke",color).attr("stroke-width",sw); break;
              case "Argent":    g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); break;
              case "Cuivre":    g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("polygon").attr("fill","none").attr("stroke",color).attr("stroke-width",1.2); break;
              case "Cobalt":    g.append("circle").attr("r",s).attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("circle").attr("r",s*0.45).attr("fill","none").attr("stroke",color).attr("stroke-width",1.2); break;
            }
            g.append("circle").attr("r", s + 6).attr("fill", "transparent");
            g.on("mouseover", function(event: MouseEvent) {
              tooltip.style.display = "block";
              tooltip.innerHTML = mine.img
                ? `<img style="width:220px;height:120px;object-fit:cover;display:block;" src="${mine.img}" onerror="this.style.display='none'" alt="${mine.name}"><div style="padding:8px 12px 10px"><b>${mine.name}</b><br><span style="color:#999">${elementName}</span><br>${mine.country}${mine.output ? "<br>Production : " + mine.output : ""}</div>`
                : `<div style="padding:8px 12px 10px"><b>${mine.name}</b><br><span style="color:#999">${elementName}</span><br>${mine.country}${mine.output ? "<br>Production : " + mine.output : ""}</div>`;
            }).on("mousemove", function(event: MouseEvent) {
              const tw = 220, th = mine.img ? 180 : 70;
              const left = event.clientX + 16 + tw > window.innerWidth ? event.clientX - tw - 10 : event.clientX + 16;
              const top = event.clientY - 10 + th > window.innerHeight ? event.clientY - th - 10 : event.clientY - 10;
              tooltip.style.left = left + "px"; tooltip.style.top = top + "px";
            }).on("mouseout", function() { tooltip.style.display = "none"; });
            g.datum({ rawX: rawPt[0], rawY: rawPt[1], elementName, s });
          });
        });
        updateIconsTransform();
      }

      function updateIconsTransform() {
        const s = 7;
        iconsSvg.selectAll<SVGGElement, { rawX: number; rawY: number; elementName: string; s: number }>("g[data-raw-x]").each(function(d) {
          if (!d) return;
          const x = d.rawX * scale + posX;
          const y = d.rawY * scale + posY;
          const g = d3.select(this);
          const sw = 1.5;
          g.attr("transform", `translate(${x},${y})`);
          switch (d.elementName) {
            case "Aluminium": g.select("rect").attr("x",-s).attr("y",-s).attr("width",s*2).attr("height",s*2); g.select(".diag1").attr("x1",-s).attr("y1",-s).attr("x2",s).attr("y2",s); g.select(".diag2").attr("x1",s).attr("y1",-s).attr("x2",-s).attr("y2",s); break;
            case "Lithium":   g.select("polygon").attr("points",`0,${-s} ${s},${s} ${-s},${s}`); break;
            case "Nickel":    g.select("polygon").attr("points",`0,${-s} ${s},0 0,${s} ${-s},0`); g.select("line").attr("x1",0).attr("y1",-s*0.45).attr("x2",0).attr("y2",s*0.45); break;
            case "Argent":    g.select("circle").attr("r",s); break;
            case "Cuivre":    const circles=g.selectAll("circle"); circles.attr("r",s); const t=s*0.55; g.select("polygon").attr("points",`0,${-t} ${t},${t} ${-t},${t}`); break;
            case "Cobalt":    const cs=g.selectAll("circle"); cs.filter((_d,i)=>i===0).attr("r",s); cs.filter((_d,i)=>i===1).attr("r",s*0.45); break;
          }
        });
      }

      buildIcons();
      buildLegend(worldDiv as HTMLElement);

      function draw() {
        if (cancelled) return;
        posX += velX; posY += velY; velX *= 0.92; velY *= 0.92;
        posX = Math.max(-w * (scale - 1), Math.min(0, posX));
        posY = Math.max(-h * (scale - 1), Math.min(0, posY));
        ctx.clearRect(0, 0, w, h);
        ctx.save(); ctx.translate(posX, posY); ctx.scale(scale, scale);
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);

        // grid
        ctx.strokeStyle = "#e8e6e2"; ctx.lineWidth = 0.5 / scale;
        for (let x = 0; x < w; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

        countries.forEach((d: any) => {
          ctx.beginPath(); path(d);
          ctx.fillStyle = (hovered && d.id === hovered.id) ? "#C8C8C8" : "#E0E0E0";
          ctx.fill(); ctx.strokeStyle = "#000000"; ctx.lineWidth = 0.5 / scale; ctx.stroke();
        });
        ctx.restore();
        updateIconsTransform();
        requestAnimationFrame(draw);
      }

      canvas.onmousedown = (e) => {
        isDragging = true; startX = e.clientX; startY = e.clientY;
        lastMouseX = e.clientX; lastMouseY = e.clientY; mouseDownCountry = hovered;
        canvas.style.cursor = "grabbing";
      };
      window.addEventListener("mouseup", (e) => {
        isDragging = false; canvas.style.cursor = "grab";
        const moved = Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5;
        if (!moved && hovered && hovered === mouseDownCountry) {
          router.push(`/country/${String(hovered.id).padStart(3, "0")}`);
        }
        mouseDownCountry = null;
      });
      window.addEventListener("mousemove", (e) => {
        if (isDragging) { velX = (e.clientX - lastMouseX) * 0.8; velY = (e.clientY - lastMouseY) * 0.8; lastMouseX = e.clientX; lastMouseY = e.clientY; }
        const rect = canvas.getBoundingClientRect();
        const p = projection.invert!([(e.clientX - rect.left - posX) / scale, (e.clientY - rect.top - posY) / scale]);
        if (p) hovered = countries.find((c: any) => d3.geoContains(c, p)) || null;
      });
      canvas.onwheel = (e) => {
        e.preventDefault(); velX = 0; velY = 0;
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
        const pointX = (mouseX - posX) / scale, pointY = (mouseY - posY) / scale;
        const factor = e.deltaY > 0 ? 0.92 : 1.08;
        const newScale = Math.max(1, Math.min(scale * factor, 8));
        posX = mouseX - pointX * newScale; posY = mouseY - pointY * newScale; scale = newScale;
      };

      draw();

      return () => {
        tooltip.remove();
        iconsSvg.remove();
      };
    }

    const cleanupPromise = init();
    return () => {
      cancelled = true;
      cleanupPromise.then(fn => fn && fn());
    };
  }, [router]);

  return (
    <div id="view-world" style={{ position: "fixed", inset: "52px 0 0 0", background: "#ffffff", zIndex: 1 }}>
      <canvas ref={canvasRef} style={{ cursor: "grab", display: "block" }} />
    </div>
  );
}

// Builds the bottom-left legend
function buildLegend(container: HTMLElement) {
  const old = container.querySelector("#map-legend");
  if (old) old.remove();

  const legend = document.createElement("div");
  legend.id = "map-legend";
  legend.style.cssText = "position:absolute;bottom:20px;left:20px;background:rgba(255,255,255,0.92);border:0.5px solid #ddd;padding:12px 16px;font-size:11px;z-index:100;pointer-events:none;letter-spacing:0.04em;";

  const ns = "http://www.w3.org/2000/svg";
  const s = 7, size = s * 2 + 6;
  const mk = (tag: string, attrs: Record<string, string | number>, parent: Element) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    parent.appendChild(el); return el;
  };

  Object.entries(ELEMENT_COLORS).forEach(([name, color]) => {
    const row = document.createElement("div");
    row.style.cssText = "display:flex;align-items:center;gap:10px;margin-bottom:6px;";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", String(size)); svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", `${-s - 3} ${-s - 3} ${size} ${size}`);
    const sw = 1.5;
    const t = s * 0.55;
    switch (name) {
      case "Aluminium": mk("rect",{x:-s,y:-s,width:s*2,height:s*2,fill:"none",stroke:color,"stroke-width":sw},svg); mk("line",{x1:-s,y1:-s,x2:s,y2:s,stroke:color,"stroke-width":sw},svg); mk("line",{x1:s,y1:-s,x2:-s,y2:s,stroke:color,"stroke-width":sw},svg); break;
      case "Lithium":   mk("polygon",{points:`0,${-s} ${s},${s} ${-s},${s}`,fill:"none",stroke:color,"stroke-width":sw},svg); break;
      case "Nickel":    mk("polygon",{points:`0,${-s} ${s},0 0,${s} ${-s},0`,fill:"none",stroke:color,"stroke-width":sw},svg); mk("line",{x1:0,y1:-s*0.45,x2:0,y2:s*0.45,stroke:color,"stroke-width":sw},svg); break;
      case "Argent":    mk("circle",{r:s,fill:"none",stroke:color,"stroke-width":sw},svg); break;
      case "Cuivre":    mk("circle",{r:s,fill:"none",stroke:color,"stroke-width":sw},svg); mk("polygon",{points:`0,${-t} ${t},${t} ${-t},${t}`,fill:"none",stroke:color,"stroke-width":1.2},svg); break;
      case "Cobalt":    mk("circle",{r:s,fill:"none",stroke:color,"stroke-width":sw},svg); mk("circle",{r:s*0.45,fill:"none",stroke:color,"stroke-width":1.2},svg); break;
    }
    const label = document.createElement("span");
    label.style.color = "#333"; label.textContent = name;
    row.appendChild(svg); row.appendChild(label); legend.appendChild(row);
  });
  container.appendChild(legend);
}
