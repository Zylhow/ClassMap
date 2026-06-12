"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCountryById } from "@/lib/data";

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

export default function CountryPage() {
  const params = useParams();
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [popup, setPopup] = useState<PopupData | null>(null);

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
      
      const w = container.offsetWidth;
      const h = container.offsetHeight;
      canvas.width = w;
      canvas.height = h;

      const world = await d3.json<any>("https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json");
      if (cancelled || !canvasRef.current) return;

      const feature = topojson.feature(world, world.objects.countries).features.find(
        (d: any) => Number(d.id) === id
      );
      if (!feature) return;

      // Base projection framed beautifully inside the viewport
      const projection = d3.geoMercator().fitExtent(
        [[60, 60], [w - 60, h - 60]],
        feature
      );
      const path = d3.geoPath().projection(projection).context(ctx);

      // Track active interactions globally within the effect context
      let interactivePoints: { x: number; y: number; mine: Mine }[] = [];
      let currentTransform = d3.zoomIdentity;

      // Main Render loop called on every zoom/pan event
      function render(transform: any) {
        if (!canvas || !ctx) return;
        ctx.clearRect(0, 0, w, h);

        ctx.save();
        // Move and scale the entire canvas landscape
        ctx.translate(transform.x, transform.y);
        ctx.scale(transform.k, transform.k);

        // 1. Minimalist Grid Lines (Transforms with map view space)
        const gs = 50;
        ctx.strokeStyle = "#e8e6e2";
        ctx.lineWidth = 0.5 / transform.k; // Keep line weight constant across scales
        
        // Dynamic broad bound calculations for grid generation
        const startX = Math.floor((-transform.x) / (gs * transform.k)) * gs - gs;
        const endX = startX + (w / transform.k) + gs * 2;
        const startY = Math.floor((-transform.y) / (gs * transform.k)) * gs - gs;
        const endY = startY + (h / transform.k) + gs * 2;

        for (let x = startX; x < endX; x += gs) { ctx.beginPath(); ctx.moveTo(x, startY); ctx.lineTo(x, endY); ctx.stroke(); }
        for (let y = startY; y < endY; y += gs) { ctx.beginPath(); ctx.moveTo(startX, y); ctx.lineTo(endX, y); ctx.stroke(); }

        // 2. Render Country Polygon Geometry
        ctx.fillStyle = "#E0E0E0"; ctx.beginPath(); path(feature); ctx.fill();
        ctx.strokeStyle = "#000000"; ctx.lineWidth = 1.2 / transform.k; ctx.beginPath(); path(feature); ctx.stroke();

        // 3. Render Strategic Asset Markers
        interactivePoints = [];
        country!.mines.forEach(m => {
          const p = projection(m.coords as [number, number]);
          if (!p) return;

          // Scaled operational sizing matrix
          const s = 7 / transform.k;
          ctx.strokeStyle = "#000000";
          ctx.lineWidth = 2 / transform.k;
          ctx.lineCap = "round";
          
          // Draw minimal asset cross symbol
          ctx.beginPath(); ctx.moveTo(p[0] - s, p[1] - s); ctx.lineTo(p[0] + s, p[1] + s); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(p[0] + s, p[1] - s); ctx.lineTo(p[0] - s, p[1] + s); ctx.stroke();

          // Typography Labels
          ctx.fillStyle = "#111111"; 
          ctx.font = `${11 / transform.k}px system-ui, -apple-system, sans-serif`;
          ctx.fillText(m.name, p[0] + s + (6 / transform.k), p[1] + (4 / transform.k));

          // Save coordinates transformed into screenspace matrix for click detection
          const screenX = p[0] * transform.k + transform.x;
          const screenY = p[1] * transform.k + transform.y;
          interactivePoints.push({ x: screenX, y: screenY, mine: m });
        });

        ctx.restore();
      }

      // Initialize the D3 Zoom behavior listener interface
      const zoomBehavior = d3.zoom<HTMLCanvasElement, unknown>()
        .scaleExtent([0.5, 12]) // Zoom configuration context limits
        .on("zoom", (event) => {
          currentTransform = event.transform;
          render(currentTransform);
          // Auto clear operational popup interface state on canvas shifts
          setPopup(null);
        });

      const d3Canvas = d3.select(canvas);
      d3Canvas.call(zoomBehavior);

      // Trigger standard initial system render pathing
      render(d3.zoomIdentity);

      const handleClick = (e: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left;
        const my = e.clientY - rect.top;

        // Trace hits against actual raw computed interface target elements
        const point = interactivePoints.find(p =>
          Math.sqrt((mx - p.x) ** 2 + (my - p.y) ** 2) < 20
        );

        if (point) {
          const pw = 400;
          const ph = 160;
          const left = e.clientX + 20 + pw > window.innerWidth ? e.clientX - pw - 20 : e.clientX + 20;
          const top = e.clientY - ph / 2;
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

  // Escape key architecture window context integration
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPopup(null);
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

  return (
    <div style={{ margin: 0, background: "#ffffff", color: "#111111", display: "flex", overflow: "hidden", height: "100vh", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      
      {/* 450.html Navbar Component */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, height: 52, background: "#ffffff", borderBottom: "0.5px solid #ddd", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", zIndex: 1000, fontSize: 16, letterSpacing: "0.06em" }}>
        <span style={{ color: "#111", fontWeight: 500 }}>Website</span>
        <div style={{ display: "flex", gap: 32 }}>
          <a onClick={() => router.push("/")} style={{ color: "#444", textDecoration: "none", cursor: "pointer", letterSpacing: "0.04em" }}>Metals</a>
          <a onClick={() => router.push("/")} style={{ color: "#444", textDecoration: "none", cursor: "pointer", letterSpacing: "0.04em" }}>Map</a>
          <a style={{ color: "#444", textDecoration: "none", cursor: "pointer", letterSpacing: "0.04em" }}>About</a>
        </div>
      </nav>

      {/* 450.html Structured Data Panel */}
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

          {/* Asset Overview Container */}
          <div style={{ marginTop: 24, padding: 16, border: "0.5px solid #ddd", background: "#fafafa" }}>
            <div style={{ fontSize: 10, letterSpacing: "0.14em", color: "#aaa", textTransform: "uppercase", marginBottom: 10 }}>Asset Overview — Overview</div>
            <div style={{ width: "100%", height: 140, backgroundImage: "url('https://images.unsplash.com/photo-1596496660144-8d9600a00908?auto=format&fit=crop&w=600&q=80')", backgroundSize: "cover", backgroundPosition: "center", marginBottom: 10 }} />
            <div style={{ fontSize: 11, color: "#888", lineHeight: 1.65 }}>{country.description}</div>
          </div>
        </div>

        <button onClick={() => router.push("/")} className="back-btn-el" style={backBtnStyle}>
          ← Return to System
        </button>
      </div>

      {/* Map View Frame */}
      <div style={{ flexGrow: 1, height: "100%", zIndex: 1, background: "#f5f4f2", position: "relative", paddingTop: 52, boxSizing: "border-box" }}>
        <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block", cursor: "crosshair" }} />

        {/* 450.html Light Popup Modal */}
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
                style={{ width: 160, height: "100%", objectFit: "cover", background: "#eee", flexShrink: 0 }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            )}
            <div style={{ flex: 1, padding: "16px 18px", color: "#111111", position: "relative" }}>
              <button
                onClick={() => setPopup(null)}
                style={{ position: "absolute", top: 2, right: 10, border: "none", background: "none", cursor: "pointer", fontSize: "1.2rem", color: "#aaa" }}
              >
                ✕
              </button>
              <div style={{ margin: "0 0 6px", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "#111" }}>
                {popup.mine.name}
              </div>
              <p style={{ margin: 0, fontSize: "0.78rem", lineHeight: 1.5, color: "#666" }}>
                {popup.mine.desc}
              </p>
            </div>
          </div>
        )}
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