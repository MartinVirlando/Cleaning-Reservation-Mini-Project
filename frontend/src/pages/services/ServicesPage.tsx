import { Alert, Empty } from "antd";
import { useServicesQuery } from "../../services/queries/useServicesQuery";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";


function getServiceIcon(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("premium") || n.includes("deep")) return "✦";
  if (n.includes("basic") || n.includes("regular")) return "◈";
  if (n.includes("kandang") || n.includes("animal")) return "⬡";
  if (n.includes("office") || n.includes("kantor")) return "▣";
  if (n.includes("window") || n.includes("kaca")) return "◇";
  if (n.includes("carpet") || n.includes("karpet")) return "⬟";
  return "◉";
}


const CARD_SHADES = [
  { bg: "#0f172a", accent: "#3b82f6", tag: "#1e3a5f" },
  { bg: "#0c1a3a", accent: "#60a5fa", tag: "#1e3a6e" },
  { bg: "#0a1628", accent: "#93c5fd", tag: "#162d55" },
  { bg: "#111827", accent: "#38bdf8", tag: "#1a3050" },
  { bg: "#0d1b2e", accent: "#7dd3fc", tag: "#1a3060" },
  { bg: "#0f1f3d", accent: "#bfdbfe", tag: "#1e3a70" },
];

export default function ServicesPage() {
  const { data, isLoading, isError } = useServicesQuery();
  const navigate = useNavigate();
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

      .svc-page { font-family: 'DM Sans', sans-serif; }
      .svc-title-font { font-family: 'Syne', sans-serif; }

      .svc-card {
        opacity: 0;
        transform: translateY(28px);
        transition: opacity 0.55s cubic-bezier(.22,1,.36,1),
                    transform 0.55s cubic-bezier(.22,1,.36,1),
                    box-shadow 0.3s ease;
        position: relative;
        overflow: hidden;
      }
      .svc-card.visible { opacity: 1; transform: translateY(0); }

      .svc-card::before {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 60%);
        z-index: 1;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.3s ease;
      }
      .svc-card:hover::before { opacity: 1; }
      .svc-card:hover {
        transform: translateY(-6px) !important;
        box-shadow: 0 32px 64px -12px rgba(0,0,0,0.35) !important;
      }
      .svc-card:hover .svc-cta { letter-spacing: 0.08em; }
      .svc-cta { transition: letter-spacing 0.25s ease; }

      .svc-card:hover .svc-icon-wrap { transform: rotate(-8deg) scale(1.08); }
      .svc-icon-wrap { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); }

      .svc-card:hover .svc-arrow { transform: translateX(6px); opacity: 1; }
      .svc-arrow { transform: translateX(0); opacity: 0.4; transition: all 0.25s ease; }

      .stats-item { border-right: 1px solid rgba(255,255,255,0.08); }
      .stats-item:last-child { border-right: none; }

      /* Decorative bg grid */
      .svc-page-bg {
        background-color: #f0f4ff;
        background-image:
          linear-gradient(rgba(59,130,246,0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(59,130,246,0.06) 1px, transparent 1px);
        background-size: 40px 40px;
      }
    `;
    document.head.appendChild(style);

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      setTimeout(() => card.classList.add("visible"), 80 + i * 70);
    });

    return () => { document.head.removeChild(style); };
  }, [data]);

  if (isLoading) {
    return (
      <div className="svc-page svc-page-bg flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-blue-400 text-sm font-medium">Loading services...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) return <Alert type="error" message="Failed to load services." />;
  if (data.length === 0) return <Empty description="No services available" className="mt-20" />;

  const minPrice = Math.min(...data.map(s => s.price));
  const maxDuration = Math.max(...data.map(s => s.durationMinutes));

  return (
    <div className="svc-page svc-page-bg min-h-screen">
      {/* ── HERO HEADER ── */}
      <div className="max-w-7xl mx-auto px-6 pt-14 pb-6">

        {/* Top label */}
        <div className="flex items-center gap-2 mb-5">
          <div className="w-6 h-px bg-blue-500" />
          <span className="text-xs font-semibold tracking-widest text-blue-500 uppercase">
            Professional Cleaning
          </span>
        </div>

        {/* Title row */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <h1 className="svc-title-font text-4xl font-bold text-gray-900 leading-tight">
            Our <span style={{ color: "#3b82f6" }}>Services</span>
          </h1>
          <p className="text-gray-500 max-w-sm text-sm leading-relaxed lg:text-right">
            From quick tidy-ups to deep cleans — find the right service and book in minutes. 
            All services come with trained professionals.
          </p>
        </div>

        {/* Stats bar */}
        <div
          className="flex rounded-2xl overflow-hidden mb-12"
          style={{ background: "#152944" }}
        >
          {[
            { label: "Services", value: `${data.length}`, sub: "available now" },
            { label: "Starting From", value: `Rp ${minPrice.toLocaleString("id-ID")}`, sub: "best price" },
            { label: "Up To", value: `${maxDuration} min`, sub: "longest service" },
            { label: "Booking", value: "Instant", sub: "confirmed fast" },
          ].map((stat, i) => (
            <div
              key={i}
              className="stats-item flex-1 px-6 py-5"
            >
              <div className="text-xs text-gray-500 font-medium mb-1">{stat.label}</div>
              <div className="svc-title-font text-xl font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* Section label */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="svc-title-font text-lg font-bold text-gray-800">
            All Services
            <span className="ml-2 text-sm font-normal text-gray-400">({data.length})</span>
          </h2>
          <span className="text-xs text-gray-400">Click any card to book</span>
        </div>

        {/* ── CARDS GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-16">
          {data.map((service, index) => {
            const shade = CARD_SHADES[index % CARD_SHADES.length];
            const icon = getServiceIcon(service.name);

            return (
              <div
                key={service.id}
                ref={el => { cardsRef.current[index] = el; }}
                className="svc-card rounded-2xl cursor-pointer"
                style={{
                  background: shade.bg,
                  boxShadow: "0 8px 32px -8px rgba(0,0,0,0.25)",
                }}
                onClick={() => navigate(`/services/${service.id}`)}
              >
                {/* Card top */}
                <div className="relative p-6 pb-0">
                  
                  <div
                    className="svc-title-font absolute right-5 top-3 text-8xl font-black select-none pointer-events-none"
                    style={{ color: "rgba(255,255,255,0.04)", lineHeight: 1 }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  
                  <div className="relative flex items-start justify-between mb-6">
                    <div
                      className="svc-icon-wrap w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-black select-none"
                      style={{
                        background: `linear-gradient(135deg, ${shade.accent}22, ${shade.accent}44)`,
                        border: `1px solid ${shade.accent}33`,
                        color: shade.accent,
                        fontFamily: "monospace",
                      }}
                    >
                      {icon}
                    </div>
                    <div className="svc-arrow" style={{ color: shade.accent, fontSize: 16 }}>
                      →
                    </div>
                  </div>

                  {/* Service name */}
                  <h3
                    className="svc-title-font text-xl font-bold text-white leading-snug mb-2"
                  >
                    {service.name}
                  </h3>

                  {/* Description */}
                  <p
                    className="text-sm leading-relaxed line-clamp-2"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {service.description || "Professional cleaning service by trained experts."}
                  </p>
                </div>

                {/* Divider */}
                <div
                  className="mx-6 my-5"
                  style={{ height: 1, background: `linear-gradient(90deg, ${shade.accent}33, transparent)` }}
                />

                {/* Card bottom */}
                <div className="px-6 pb-6">
                  <div className="flex items-center justify-between">
                    {/* Duration */}
                    <div className="flex items-center gap-2">
                      <div
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: shade.accent }}
                      />
                      <span
                        className="text-xs font-medium"
                        style={{ color: "rgba(255,255,255,0.45)" }}
                      >
                        {service.durationMinutes} min
                      </span>
                    </div>

                    {/* Price*/}
                    <div className="flex items-center gap-3">
                      <span
                        className="svc-title-font text-base font-bold"
                        style={{ color: shade.accent }}
                      >
                        Rp {service.price.toLocaleString("id-ID")}
                      </span>
                      <div
                        className="svc-cta text-xs font-semibold px-3 py-1.5 rounded-lg"
                        style={{
                          background: `${shade.accent}20`,
                          color: shade.accent,
                          border: `1px solid ${shade.accent}40`,
                        }}
                      >
                        Book
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}