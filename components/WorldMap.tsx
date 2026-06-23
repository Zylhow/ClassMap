"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ELEMENT_COLORS, MINES } from "@/lib/data";

type ViewMode = "flat" | "globe";

export default function WorldMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const svgContainerRef = useRef<SVGSVGElement | null>(null);
  const router = useRouter();

  const [activeElements, setActiveElements] = useState<Set<string>>(
    new Set(Object.keys(ELEMENT_COLORS))
  );
  const activeElementsRef = useRef(activeElements);
  activeElementsRef.current = activeElements;

  const [viewMode, setViewMode] = useState<ViewMode>("flat");
  const viewModeRef = useRef<ViewMode>(viewMode);
  viewModeRef.current = viewMode;

  const buildIconsRef = useRef<() => void>(() => {});
  const buildLegendRef = useRef<() => void>(() => {});
  const onModeChangeRef = useRef<() => void>(() => {});

  const toggleElement = (name: string) => {
    setActiveElements(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleViewMode = () => {
    setViewMode(m => (m === "flat" ? "globe" : "flat"));
  };

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

      // Use container size instead of window size since we're no longer fullscreen fixed
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      const world = await d3.json<any>("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      if (cancelled) return;

      // Force 'any' on the topojson.feature result to bypass the type check
      const countries = (topojson.feature(world, world.objects.countries) as any).features;      const graticule = d3.geoGraticule10();

      // ── Flat-map projection state ──
      const flatProjection = d3.geoMercator().scale(w / 6.2).translate([w / 2, h / 1.5]);
      let flatScale = 1, flatPosX = 0, flatPosY = 0, flatVelX = 0, flatVelY = 0;

      // ── Globe projection state ──
      const globeBaseScale = Math.min(w, h) / 2.3;
      const globeProjection = d3.geoOrthographic()
        .scale(globeBaseScale)
        .translate([w / 2, h / 2])
        .clipAngle(90);
      let globeScale = globeBaseScale;
      let rotation: [number, number, number] = [-10, -20, 0];
      let rotVelLambda = 0, rotVelPhi = 0;

      let projection: any = flatProjection;
      let path = d3.geoPath().projection(projection).context(ctx);

      function rebuildPath() {
        projection = viewModeRef.current === "globe" ? globeProjection : flatProjection;
        path = d3.geoPath().projection(projection).context(ctx);
      }

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

      function isVisible(lngLat: [number, number]): boolean {
        if (viewModeRef.current !== "globe") return true;
        const center: [number, number] = [-rotation[0], -rotation[1]];
        return d3.geoDistance(lngLat, center) < Math.PI / 2;
      }

      function buildIcons() {
        iconsSvg.selectAll("*").remove();
        const s = 7;
        Object.entries(MINES).forEach(([elementName, mines]) => {
          if (!activeElementsRef.current.has(elementName)) return;
          const color = ELEMENT_COLORS[elementName] || "#000";
          mines.forEach(mine => {
            const lngLat: [number, number] = [mine.lng, mine.lat];
            const rawPt = projection(lngLat);
            if (!rawPt) return;

            const g = iconsSvg.append("g")
              .style("pointer-events", "all").style("cursor", "pointer")
              .attr("data-lng", mine.lng).attr("data-lat", mine.lat)
              .attr("transform", `translate(${rawPt[0]},${rawPt[1]})`);

            const sw = 1.5;
            const t = s * 0.55;
            switch (elementName) {
              case "Aluminium": g.append("rect").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","diag1"); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","diag2"); break;
              case "Lithium":   g.append("polygon").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","lith-line"); break;
              case "Nickel":    g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","cross1"); g.append("line").attr("stroke",color).attr("stroke-width",sw).attr("class","cross2"); break;
              case "Silver":    g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); break;
              case "Copper":    g.append("circle").attr("fill","none").attr("stroke",color).attr("stroke-width",sw); g.append("polygon").attr("fill","none").attr("stroke",color).attr("stroke-width",1.2); break;
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
            g.datum({ lng: mine.lng, lat: mine.lat, elementName, s });
          });
        });
        updateIconsTransform();
      }
      function updateIconsTransform() {
  const s = 7;
  iconsSvg.selectAll<SVGGElement, { lng: number; lat: number; elementName: string; s: number }>("g[data-lng]").each(function(d) {
    if (!d) return;
    const rawPt = projection([d.lng, d.lat]);
    const g = d3.select(this);

    if (!rawPt || !isVisible([d.lng, d.lat])) {
      g.style("display", "none");
      return;
    }
    g.style("display", null);

    // Applique la transformation flat (zoom + pan) si on est en mode flat
    let x = rawPt[0];
    let y = rawPt[1];
    if (viewModeRef.current === "flat") {
      x = rawPt[0] * flatScale + flatPosX;
      y = rawPt[1] * flatScale + flatPosY;
    }

    g.attr("transform", `translate(${x},${y})`);

    switch (d.elementName) {
      case "Aluminium": g.select("rect").attr("x",-s).attr("y",-s).attr("width",s*2).attr("height",s*2); g.select(".diag1").attr("x1",-s).attr("y1",-s).attr("x2",s).attr("y2",s); g.select(".diag2").attr("x1",s).attr("y1",-s).attr("x2",-s).attr("y2",s); break;
      case "Lithium":   g.select("polygon").attr("points",`0,${-s} ${s},0 0,${s} ${-s},0`); g.select(".lith-line").attr("x1",0).attr("y1",-s).attr("x2",0).attr("y2",s); break;
      case "Nickel":    g.select("circle").attr("r",s); g.select(".cross1").attr("x1",-s).attr("y1",0).attr("x2",s).attr("y2",0); g.select(".cross2").attr("x1",0).attr("y1",-s).attr("x2",0).attr("y2",s); break;
      case "Silver":    g.select("circle").attr("r",s); break;
      case "Copper":    const circles=g.selectAll("circle"); circles.attr("r",s); const t=s*0.55; g.select("polygon").attr("points",`0,${-t} ${t},${t} ${-t},${t}`); break;
      case "Cobalt":    const cs=g.selectAll("circle"); cs.filter((_d,i)=>i===0).attr("r",s); cs.filter((_d,i)=>i===1).attr("r",s*0.45); break;
    }
  });
}
      buildIconsRef.current = buildIcons;
      buildIcons();
      buildLegend(worldDiv as HTMLElement, activeElementsRef.current, toggleElement);
      buildLegendRef.current = () => buildLegend(worldDiv as HTMLElement, activeElementsRef.current, toggleElement);

      onModeChangeRef.current = () => {
        rebuildPath();
        if (viewModeRef.current === "globe") {
          globeProjection.scale(globeScale).rotate(rotation);
        }
        buildIcons();
      };

      function drawFlat() {
        flatPosX += flatVelX; flatPosY += flatVelY;
        flatVelX *= 0.92; flatVelY *= 0.92;
        flatPosX = Math.max(-w * (flatScale - 1), Math.min(0, flatPosX));
        flatPosY = Math.max(-h * (flatScale - 1), Math.min(0, flatPosY));

        ctx.save(); ctx.translate(flatPosX, flatPosY); ctx.scale(flatScale, flatScale);
        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);

        ctx.strokeStyle = "#e8e6e2"; ctx.lineWidth = 0.5 / flatScale;
        for (let x = 0; x < w; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
        for (let y = 0; y < h; y += 120) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

        countries.forEach((d: any) => {
          ctx.beginPath(); path(d);
          ctx.fillStyle = (hovered && d.id === hovered.id) ? "#C8C8C8" : "#E0E0E0";
          ctx.fill(); ctx.strokeStyle = "#000000"; ctx.lineWidth = 0.5 / flatScale; ctx.stroke();
        });
        ctx.restore();
      }

      function drawGlobe() {
        rotation = [rotation[0] + rotVelLambda, rotation[1] + rotVelPhi, 0];
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]));
        rotVelLambda *= 0.9; rotVelPhi *= 0.9;
        globeProjection.rotate(rotation).scale(globeScale);

        ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, w, h);

        ctx.beginPath();
        path({ type: "Sphere" } as any);
        ctx.fillStyle = "#f5f4f2"; ctx.fill();
        ctx.strokeStyle = "#cfcdc8"; ctx.lineWidth = 1; ctx.stroke();

        ctx.beginPath();
        path(graticule as any);
        ctx.strokeStyle = "#e8e6e2"; ctx.lineWidth = 0.5; ctx.stroke();

        countries.forEach((d: any) => {
          ctx.beginPath(); path(d);
          ctx.fillStyle = (hovered && d.id === hovered.id) ? "#C8C8C8" : "#E0E0E0";
          ctx.fill(); ctx.strokeStyle = "#000000"; ctx.lineWidth = 0.5; ctx.stroke();
        });
      }

      function draw() {
        if (cancelled) return;
        ctx.clearRect(0, 0, w, h);
        if (viewModeRef.current === "globe") {
          drawGlobe();
        } else {
          drawFlat();
        }
        updateIconsTransform();
        requestAnimationFrame(draw);
      }

      // ── Interaction handlers ──
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
        const rect = canvas.getBoundingClientRect();
        const mode = viewModeRef.current;

        if (mode === "globe") {
          if (isDragging) {
            const dx = e.clientX - lastMouseX;
            const dy = e.clientY - lastMouseY;
            const sensitivity = 0.25;
            rotVelLambda = dx * sensitivity;
            rotVelPhi = -dy * sensitivity;
            lastMouseX = e.clientX; lastMouseY = e.clientY;
          }
          const p = globeProjection.invert!([e.clientX - rect.left, e.clientY - rect.top]);
          if (p && !isNaN(p[0]) && !isNaN(p[1])) {
            hovered = countries.find((c: any) => d3.geoContains(c, p)) || null;
          } else {
            hovered = null;
          }
        } else {
          if (isDragging) {
            flatVelX = (e.clientX - lastMouseX) * 0.8;
            flatVelY = (e.clientY - lastMouseY) * 0.8;
            lastMouseX = e.clientX; lastMouseY = e.clientY;
          }
          const p = flatProjection.invert!([(e.clientX - rect.left - flatPosX) / flatScale, (e.clientY - rect.top - flatPosY) / flatScale]);
          if (p) hovered = countries.find((c: any) => d3.geoContains(c, p)) || null;
        }

        if (!isDragging) canvas.style.cursor = hovered ? "pointer" : "grab";
      });

      // ── Wheel : block page scroll only when pointer is over the canvas ──
      canvas.onwheel = (e) => {
        e.preventDefault();
        e.stopPropagation(); // empêche le scroll de remonter à la page
        const mode = viewModeRef.current;
        if (mode === "globe") {
          const factor = e.deltaY > 0 ? 0.92 : 1.08;
          globeScale = Math.max(globeBaseScale * 0.6, Math.min(globeScale * factor, globeBaseScale * 5));
        } else {
          flatVelX = 0; flatVelY = 0;
          const rect = canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left, mouseY = e.clientY - rect.top;
          const pointX = (mouseX - flatPosX) / flatScale, pointY = (mouseY - flatPosY) / flatScale;
          const factor = e.deltaY > 0 ? 0.92 : 1.08;
          const newScale = Math.max(1, Math.min(flatScale * factor, 8));
          flatPosX = mouseX - pointX * newScale; flatPosY = mouseY - pointY * newScale; flatScale = newScale;
        }
      };

      rebuildPath();
      draw();

      return () => {
        tooltip.remove();
        iconsSvg.remove();
        const legendEl = worldDiv.querySelector("#map-legend");
        if (legendEl) legendEl.remove();
      };
    }

    const cleanupPromise = init();
    return () => {
      cancelled = true;
      cleanupPromise.then(fn => fn && fn());
    };
  }, [router]);

  useEffect(() => {
    activeElementsRef.current = activeElements;
    buildIconsRef.current();
    buildLegendRef.current();
  }, [activeElements]);

  useEffect(() => {
    viewModeRef.current = viewMode;
    onModeChangeRef.current();
  }, [viewMode]);

  return (
    // ── position: absolute (plus fixed) pour s'intégrer dans le conteneur sticky ──
    <div
      id="view-world"
      style={{ position: "absolute", inset: 0, background: "#ffffff", zIndex: 1 }}
    >
      <canvas ref={canvasRef} style={{ cursor: "grab", display: "block" }} />

      {/* Flat / Globe toggle */}
      <div style={{ position: "absolute", top: 16, right: 20, zIndex: 100, display: "flex", alignItems: "center", gap: 8 }}>
        <div onClick={() => setViewMode("flat")} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 2 }} title="Flat map">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={viewMode === "flat" ? "#111" : "#bbb"} strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="18" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="16" y1="3" x2="16" y2="21" /><line x1="2" y1="9" x2="22" y2="9" /><line x1="2" y1="15" x2="22" y2="15" />
          </svg>
        </div>
        <div onClick={toggleViewMode} role="switch" aria-checked={viewMode === "globe"} style={{ position: "relative", width: 38, height: 18, borderRadius: 9, background: "#111", cursor: "pointer", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: 2, left: viewMode === "globe" ? 21 : 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "left 0.22s ease" }} />
        </div>
        <div onClick={() => setViewMode("globe")} style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 2 }} title="Globe view">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={viewMode === "globe" ? "#111" : "#bbb"} strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" /><ellipse cx="12" cy="12" rx="4.2" ry="10" /><line x1="2" y1="12" x2="22" y2="12" />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Légende bas gauche
function buildLegend(
  container: HTMLElement,
  activeElements: Set<string>,
  onToggle: (name: string) => void
) {
  const old = container.querySelector("#map-legend");
  if (old) old.remove();

  const legend = document.createElement("div");
  legend.id = "map-legend";
  legend.style.cssText = "position:absolute;bottom:20px;left:20px;background:rgba(255,255,255,0.92);border:0.5px solid #ddd;padding:12px 16px;font-size:11px;z-index:100;letter-spacing:0.04em;";

  const ns = "http://www.w3.org/2000/svg";
  const s = 7, size = s * 2 + 6;
  const mk = (tag: string, attrs: Record<string, string | number>, parent: Element) => {
    const el = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
    parent.appendChild(el); return el;
  };

  Object.entries(ELEMENT_COLORS).forEach(([name, color]) => {
    const isActive = activeElements.has(name);
    const row = document.createElement("div");
    row.style.cssText = `display:flex;align-items:center;gap:10px;margin-bottom:6px;cursor:pointer;opacity:${isActive ? 1 : 0.35};transition:opacity 0.15s;pointer-events:all;user-select:none;`;
    row.addEventListener("mouseenter", () => { row.style.opacity = isActive ? "1" : "0.6"; });
    row.addEventListener("mouseleave", () => { row.style.opacity = isActive ? "1" : "0.35"; });
    row.addEventListener("click", () => onToggle(name));

    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("width", String(size)); svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", `${-s - 3} ${-s - 3} ${size} ${size}`);
    const sw = 1.5, t = s * 0.55;
    switch (name) {
      case "Aluminium": mk("rect",{x:-s,y:-s,width:s*2,height:s*2,fill:"none",stroke:color,"stroke-width":sw},svg); mk("line",{x1:-s,y1:-s,x2:s,y2:s,stroke:color,"stroke-width":sw},svg); mk("line",{x1:s,y1:-s,x2:-s,y2:s,stroke:color,"stroke-width":sw},svg); break;
      case "Lithium":   mk("polygon",{points:`0,${-s} ${s},0 0,${s} ${-s},0`,fill:"none",stroke:color,"stroke-width":sw},svg); mk("line",{x1:0,y1:-s,x2:0,y2:s,stroke:color,"stroke-width":sw},svg); break;
      case "Nickel":    mk("circle",{r:s,fill:"none",stroke:color,"stroke-width":sw},svg); mk("line",{x1:-s,y1:0,x2:s,y2:0,stroke:color,"stroke-width":sw},svg); mk("line",{x1:0,y1:-s,x2:0,y2:s,stroke:color,"stroke-width":sw},svg); break;
      case "Silver":    mk("circle",{r:s,fill:"none",stroke:color,"stroke-width":sw},svg); break;
      case "Copper":    mk("circle",{r:s,fill:"none",stroke:color,"stroke-width":sw},svg); mk("polygon",{points:`0,${-t} ${t},${t} ${-t},${t}`,fill:"none",stroke:color,"stroke-width":1.2},svg); break;
      case "Cobalt":    mk("circle",{r:s,fill:"none",stroke:color,"stroke-width":sw},svg); mk("circle",{r:s*0.45,fill:"none",stroke:color,"stroke-width":1.2},svg); break;
    }
    const label = document.createElement("span");
    label.style.color = "#333"; label.textContent = name;
    row.appendChild(svg); row.appendChild(label); legend.appendChild(row);
  });
  container.appendChild(legend);
}