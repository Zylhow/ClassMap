// app/country/[id]/CountryClient.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCountryById, ELEMENT_COLORS } from "@/lib/data";
import Navbar from "@/components/Navbar";

interface Mine {
  name: string;
  coords: [number, number];
  img: string;
  desc: string;
}

interface PopupData {
  mine: Mine;
  x: number;
  y: number;
}

interface GalleryState {
  mines: Mine[];
  index: number;
}

const SYMBOL_TO_ELEMENT: Record<string, string> = {
  Li: "Lithium", Ni: "Nickel", Co: "Cobalt", Cu: "Copper", Ag: "Silver", Al: "Aluminium",
};

function getElementFromMineName(name: string): string {
  const match = name.match(/\(([^)]+)\)/);
  if (!match) return "Copper";
  const codes = match[1].split("/");
  for (const code of codes) {
    if (SYMBOL_TO_ELEMENT[code.trim()]) return SYMBOL_TO_ELEMENT[code.trim()];
  }
  return "Copper";
}

const backBtnStyle: React.CSSProperties = {
  display: "block",
  marginTop: 28,
  color: "#111",
  textDecoration: "none",
  border: "0.5px solid #ddd",
  padding: 12,
  textAlign: "center",
  textTransform: "uppercase",
  letterSpacing: "0.1em",
  fontSize: 11,
  background: "#fff",
  cursor: "pointer",
  width: "100%",
  boxSizing: "border-box",
  transition: "background 0.15s, color 0.15s",
};

export default function CountryPage() {
  const params = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [gallery, setGallery] = useState<GalleryState | null>(null);

  const id = Number(params.id);
  const country = getCountryById(id);

  useEffect(() => {
    if (!canvasRef.current || !country) return;
    let cancelled = false;

    async function draw() {
      const [d3, topojson] = await Promise.all([
        import("d3"),
        // @ts-ignore
        import("topojson-client"),
      ]);
      if (cancelled || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d")!;
      const container = canvas.parentElement!;

      const w = container.clientWidth;
      const h = container.clientHeight;
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";

      const world = await d3.json<any>("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      if (cancelled || !canvasRef.current) return;

    // Force 'any' on the topojson.feature result to bypass the strict type checker
    const feature = (topojson.feature(world, world.objects.countries) as any).features.find(
    (d: any) => Number(d.id) === id
    );
      if (!feature) return;

      const projection = d3.geoMercator().fitExtent([[60, 60], [w - 60, h - 60]], feature);
      const path = d3.geoPath().projection(projection).context(ctx);

      let interactivePoints: { x: number; y: number; mine: Mine }[] = [];
      let currentTransform = d3.zoomIdentity;

      function render(transform: any) {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, w, h);
        ctx.save();
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        const gs = 50;
        ctx.strokeStyle = "#e8e6e2";
        ctx.lineWidth = 0.5 / transform.k;
        const startX = Math.floor((-transform.x) / (gs * transform.k)) * gs - gs;
        const endX = startX + (w / transform.k) + gs * 2;
        const startY = Math.floor((-transform.y) / (gs * transform.k)) * gs - gs;
        const endY = startY + (h / transform.k) + gs * 2;
        for (let x = startX; x < endX; x += gs) { ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke(); }
        for (let y = startY; y < endY; y += gs) { ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke(); }

        ctx.fillStyle = "#E0E0E0"; ctx.beginPath(); path(feature); ctx.fill();
        ctx.strokeStyle = "#000000"; ctx.lineWidth = 1.2 / transform.k; ctx.beginPath(); path(feature); ctx.stroke();

        interactivePoints = [];
        country!.mines.forEach(m => {
          const p = projection(m.coords as [number, number]);
          if (!p) return;
          const s = 7 / transform.k;
          const elementName = getElementFromMineName(m.name);
          const color = ELEMENT_COLORS[elementName] || "#000000";
          const t = s * 0.55;
          ctx.lineCap = "round";
          ctx.strokeStyle = color;
          ctx.lineWidth = 2 / transform.k;

          switch (elementName) {
            case "Aluminium":
              ctx.strokeRect(p[0] - s, p[1] - s, s * 2, s * 2);
              ctx.beginPath(); ctx.moveTo(p[0]-s, p[1]-s); ctx.lineTo(p[0]+s, p[1]+s); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(p[0]+s, p[1]-s); ctx.lineTo(p[0]-s, p[1]+s); ctx.stroke();
              break;
            case "Lithium":
              ctx.beginPath(); ctx.moveTo(p[0], p[1]-s); ctx.lineTo(p[0]+s, p[1]); ctx.lineTo(p[0], p[1]+s); ctx.lineTo(p[0]-s, p[1]); ctx.closePath(); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(p[0], p[1]-s); ctx.lineTo(p[0], p[1]+s); ctx.stroke();
              break;
            case "Nickel":
              ctx.beginPath(); ctx.arc(p[0], p[1], s, 0, Math.PI*2); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(p[0]-s, p[1]); ctx.lineTo(p[0]+s, p[1]); ctx.stroke();
              ctx.beginPath(); ctx.moveTo(p[0], p[1]-s); ctx.lineTo(p[0], p[1]+s); ctx.stroke();
              break;
            case "Silver":
              ctx.beginPath(); ctx.arc(p[0], p[1], s, 0, Math.PI*2); ctx.stroke();
              break;
            case "Copper":
              ctx.beginPath(); ctx.arc(p[0], p[1], s, 0, Math.PI*2); ctx.stroke();
              ctx.lineWidth = 1.2 / transform.k;
              ctx.beginPath(); ctx.moveTo(p[0], p[1]-t); ctx.lineTo(p[0]+t, p[1]+t); ctx.lineTo(p[0]-t, p[1]+t); ctx.closePath(); ctx.stroke();
              break;
            case "Cobalt":
              ctx.beginPath(); ctx.arc(p[0], p[1], s, 0, Math.PI*2); ctx.stroke();
              ctx.lineWidth = 1.2 / transform.k;
              ctx.beginPath(); ctx.arc(p[0], p[1], s*0.45, 0, Math.PI*2); ctx.stroke();
              break;
          }

          ctx.fillStyle = "#111111";
          ctx.font = `${11 / transform.k}px system-ui, -apple-system, sans-serif`;
          ctx.fillText(m.name, p[0] + s + (6 / transform.k), p[1] + (4 / transform.k));

          const localX = p[0] * transform.k + transform.x;
          const localY = p[1] * transform.k + transform.y;
          interactivePoints.push({ x: localX, y: localY, mine: m });
        });

        ctx.restore();
      }

      const zoomBehavior = d3.zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([0.5, 12])
        .on("zoom", (event) => {
          currentTransform = event.transform;
          render(currentTransform);
          setPopup(null);
        });

      const d3Canvas = d3.select(canvas);
      d3Canvas.call(zoomBehavior);
      render(d3.zoomIdentity);

      const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;
        const point = interactivePoints.find(p =>
          Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2) < 20
        );
        if (point) {
          const pw = 400, ph = 160;
          const screenX = point.x + rect.left;
          const screenY = point.y + rect.top;
          const left = screenX + 20 + pw > window.innerWidth ? screenX - pw - 20 : screenX + 20;
          const top = screenY - ph / 2;
          setPopup({ mine: point.mine, x: left, y: Math.max(52, top) });
        } else {
          setPopup(null);
        }
      };

      canvas.addEventListener("click", handleClick);
      return () => {
        canvas.removeEventListener("click", handleClick);
        d3Canvas.on(".zoom", null);
      };
    }

    const cleanupExecution = draw();
    return () => {
      cancelled = true;
      cleanupExecution.then(cleanup => cleanup && cleanup());
    };
  }, [id, country]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setPopup(null); setGallery(null); }
      if (e.key === "ArrowRight") setGallery(g => g ? { ...g, index: (g.index + 1) % g.mines.length } : g);
      if (e.key === "ArrowLeft")  setGallery(g => g ? { ...g, index: (g.index - 1 + g.mines.length) % g.mines.length } : g);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!country) {
    return (
      <div style={{ background: "#ffffff", color: "#111111", height: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 24, fontFamily: "system-ui, sans-serif" }}>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "0.02em" }}>Country not found</h1>
        <p style={{ color: "#999999", fontSize: "0.85rem" }}>No data available for country ID {id}.</p>
        <button onClick={() => router.push("/")} style={backBtnStyle}>Return to System</button>
      </div>
    );
  }

  const heroImage = country.image || country.mines.find(m => m.img)?.img || "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=600&q=80";

  return (
    <div style={{ margin: 0, background: "#ffffff", color: "#111111", display: "flex", overflow: "hidden", height: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>

      <Navbar
        onToggleMetals={() => router.push("/")}
        onShowMap={() => router.push("/#map")}
        onOpenAbout={() => router.push("/about")}
        forcedActive="map"
      />

      {/* Side panel */}
      <div style={{
        width: 420, minWidth: 420, background: "#ffffff",
        borderRight: "0.5px solid #ddd", padding: "80px 36px 36px",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        zIndex: 10, overflowY: "auto", boxSizing: "border-box",
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", color: "#999", textTransform: "uppercase", marginBottom: 6 }}>Country Analysis</div>
          <h1 style={{ fontSize: "2.2rem", fontWeight: 700, color: "#111", margin: "0 0 32px", letterSpacing: "0.02em", lineHeight: 1 }}>
            {country.name}
          </h1>

          {country.stats.map((stat, i) => (
            <div key={i} style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.12em", display: "flex", alignItems: "center" }}>
                {stat.label}
                <span style={{ display: "inline-block", background: "#111", color: "#fff", fontSize: 10, fontWeight: 600, padding: "2px 8px", letterSpacing: "0.08em", textTransform: "uppercase", marginLeft: 10, verticalAlign: "middle" }}>
                  {stat.rank}
                </span>
              </div>
              <div style={{ fontSize: "2.4rem", fontWeight: 200, marginTop: 6, color: "#111", letterSpacing: "-0.01em" }}>
                {stat.value}
                <span style={{ fontSize: "1rem", color: "#999", marginLeft: 6 }}>{stat.unit}</span>
              </div>
              <div style={{ width: "100%", height: 2, background: "#eee", marginTop: 14 }}>
                <div style={{ height: "100%", width: `${stat.barWidth}%`, background: "#111", transition: "width 1.5s ease-out" }} />
              </div>
            </div>
          ))}

          <div style={{ marginTop: 24, padding: 16, border: "0.5px solid #ddd", background: "#fafafa" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#aaa", textTransform: "uppercase", marginBottom: 10 }}>Asset Overview</div>
            <div style={{ width: "100%", height: 180, backgroundImage: `url('${heroImage}')`, backgroundSize: "cover", backgroundPosition: "center", marginBottom: 10 }} />
            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.65 }}>{country.description}</div>
          </div>
        </div>

        <button onClick={() => router.push("/")} className="back-btn-el" style={backBtnStyle}>
          ← Return to System
        </button>
      </div>

      {/* Map */}
      <div style={{ flexGrow: 1, height: "100%", zIndex: 1, background: "#f5f4f2", position: "relative", paddingTop: 52, boxSizing: "border-box" }}>
        <canvas ref={canvasRef} style={{ display: "block", cursor: "crosshair" }} />

        {/* Popup */}
        {popup && (
          <div style={{
            position: "fixed", zIndex: 1000, background: "white", border: "0.5px solid #ddd",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)", overflow: "hidden",
            width: 400, height: 160, display: "flex", alignItems: "center",
            left: popup.x, top: popup.y,
            animation: "popIn 0.18s ease-out",
          }}>
            {popup.mine.img && (
              <img
                src={popup.mine.img}
                alt={popup.mine.name}
                onClick={() => {
                  const minesWithImg = country.mines.filter(m => m.img);
                  const idx = minesWithImg.findIndex(m => m.name === popup.mine.name);
                  setGallery({ mines: minesWithImg, index: idx >= 0 ? idx : 0 });
                }}
                style={{ width: 160, height: "100%", objectFit: "cover", background: "#eee", flexShrink: 0, cursor: "zoom-in" }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div style={{ flex: 1, padding: "16px 18px", color: "#111111", position: "relative" }}>
              <button
                onClick={() => setPopup(null)}
                style={{ position: "absolute", top: 2, right: 10, border: "none", background: "none", cursor: "pointer", fontSize: "1.2rem", color: "#aaa" }}
              >✕</button>
              <div style={{ margin: "0 0 6px", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#111" }}>
                {popup.mine.name}
              </div>
              <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: 1.5, color: "#666" }}>
                {popup.mine.desc}
              </p>
            </div>
          </div>
        )}

        {/* Gallery */}
        {gallery && (() => {
          const mine = gallery.mines[gallery.index];
          const total = gallery.mines.length;
          return (
            <div
              onClick={() => setGallery(null)}
              style={{
                position: "fixed", inset: 0, zIndex: 2000,
                background: "rgba(0,0,0,0.75)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <div
                onClick={e => e.stopPropagation()}
                style={{
                  background: "#fff", width: 600, maxWidth: "90vw",
                  boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
                  position: "relative", overflow: "hidden",
                }}
              >
                <div style={{
                  padding: "14px 20px", borderBottom: "0.5px solid #ddd",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "0.9rem", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                      {mine.name}
                    </div>
                    {total > 1 && (
                      <div style={{ fontSize: "0.72rem", color: "#999", marginTop: 2 }}>
                        {gallery.index + 1} / {total}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setGallery(null)}
                    style={{ border: "none", background: "none", cursor: "pointer", fontSize: "1.3rem", color: "#aaa", lineHeight: 1 }}
                  >✕</button>
                </div>

                <div style={{ position: "relative", background: "#111" }}>
                  <img
                    src={mine.img}
                    alt={mine.name}
                    style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                  {total > 1 && (
                    <>
                      <button
                        onClick={() => setGallery(g => g ? { ...g, index: (g.index - 1 + total) % total } : g)}
                        style={{
                          position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)",
                          background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer",
                          width: 36, height: 36, fontSize: "1.1rem", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                      >‹</button>
                      <button
                        onClick={() => setGallery(g => g ? { ...g, index: (g.index + 1) % total } : g)}
                        style={{
                          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                          background: "rgba(255,255,255,0.9)", border: "none", cursor: "pointer",
                          width: 36, height: 36, fontSize: "1.1rem", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                      >›</button>
                    </>
                  )}
                </div>

                <div style={{ padding: "14px 20px", fontSize: "0.8rem", color: "#555", lineHeight: 1.6 }}>
                  {mine.desc}
                </div>

                {total > 1 && (
                  <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingBottom: 14 }}>
                    {gallery.mines.map((_, i) => (
                      <div
                        key={i}
                        onClick={() => setGallery(g => g ? { ...g, index: i } : g)}
                        style={{
                          width: 6, height: 6, borderRadius: "50%", cursor: "pointer",
                          background: i === gallery.index ? "#111" : "#ddd",
                          transition: "background 0.2s",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </div>

      <style>{`
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.97) translateY(6px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .back-btn-el:hover {
          background: #111 !important;
          color: #fff !important;
        }
      `}</style>
    </div>
  );
}