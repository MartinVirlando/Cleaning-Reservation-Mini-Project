import { useEffect, useRef, useState } from "react";
import { Alert } from "antd";
import { useAuth } from "../../context/AuthContext";
import {
  CalendarOutlined,
  ClockCircleOutlined,
  EnvironmentOutlined,
  UserOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

type ScheduleBooking = {
  ID: number;
  Date: string;
  Time: string;
  Address: string;
  Status: string;
  User: { username: string; email: string };
  Service: { Name: string };
};

type FilterType = "all" | "today" | "upcoming" | "done";

export default function CleanerSchedulePage() {
  const { token } = useAuth();
  const [schedule, setSchedule] = useState<ScheduleBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [filter, setFilter] = useState<FilterType>("all");
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .cs-card {
        opacity: 0;
        transform: translateY(20px);
        transition:
          opacity 0.45s cubic-bezier(.22,1,.36,1),
          transform 0.45s cubic-bezier(.22,1,.36,1),
          box-shadow 0.2s ease;
      }
      .cs-card.visible { opacity: 1; transform: translateY(0); }
      .cs-card:hover {
        transform: translateY(-4px) !important;
        box-shadow: 0 16px 40px -8px rgba(37,99,235,0.15) !important;
      }
      .cs-icon { transition: transform 0.3s cubic-bezier(.34,1.56,.64,1); }
      .cs-card:hover .cs-icon { transform: rotate(-6deg) scale(1.1); }

      .cs-filter-btn {
        font-size: 13px;
        font-weight: 600;
        padding: 7px 18px;
        border-radius: 99px;
        border: 1.5px solid transparent;
        cursor: pointer;
        transition: all 0.2s ease;
        background: transparent;
      }
      .cs-filter-btn.active {
        background: #2563eb;
        color: white;
        border-color: #2563eb;
        box-shadow: 0 4px 12px rgba(37,99,235,0.25);
      }
      .cs-filter-btn:not(.active) {
        color: #2563eb;
        border-color: #bfdbfe;
        background: rgba(37,99,235,0.05);
      }
      .cs-filter-btn:not(.active):hover {
        background: rgba(37,99,235,0.1);
      }

      .cs-today-pulse {
        animation: cs-pulse 2s infinite;
      }
      @keyframes cs-pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(37,99,235,0.3); }
        50% { box-shadow: 0 0 0 8px rgba(37,99,235,0); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  useEffect(() => {
    if (!token) return;
    const fetchSchedule = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:8080/api/cleaner/schedule", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error();
        setSchedule(await res.json());
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [token]);

  useEffect(() => {
    cardsRef.current.forEach((card) => card?.classList.remove("visible"));
    const timeout = setTimeout(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;
        setTimeout(() => card.classList.add("visible"), i * 70);
      });
    }, 50);
    return () => clearTimeout(timeout);
  }, [schedule, filter]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen" style={{ background: "#f8fafc" }}>
        <div className="text-center">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto mb-3"
            style={{ borderColor: "#2563eb", borderTopColor: "transparent" }}
          />
          <p className="text-sm font-medium text-gray-500">Loading schedule...</p>
        </div>
      </div>
    );
  }

  if (error) return <Alert type="error" message="Failed to load schedule" />;

  // Sort: today → upcoming → done
  const sorted = [...schedule].sort((a, b) => {
    const aIsToday = dayjs(a.Date).isSame(dayjs(), "day");
    const bIsToday = dayjs(b.Date).isSame(dayjs(), "day");
    const aIsPast = dayjs(a.Date).isBefore(dayjs(), "day");
    const bIsPast = dayjs(b.Date).isBefore(dayjs(), "day");
    if (aIsToday && !bIsToday) return -1;
    if (!aIsToday && bIsToday) return 1;
    if (!aIsPast && bIsPast) return -1;
    if (aIsPast && !bIsPast) return 1;
    return dayjs(a.Date).diff(dayjs(b.Date));
  });

  const filtered = sorted.filter((b) => {
    const isToday = dayjs(b.Date).isSame(dayjs(), "day");
    const isPast = dayjs(b.Date).isBefore(dayjs(), "day");
    if (filter === "today") return isToday;
    if (filter === "upcoming") return !isToday && !isPast;
    if (filter === "done") return isPast;
    return true;
  });

  const todayCount = schedule.filter((b) => dayjs(b.Date).isSame(dayjs(), "day")).length;
  const upcomingCount = schedule.filter((b) => !dayjs(b.Date).isBefore(dayjs(), "day") && !dayjs(b.Date).isSame(dayjs(), "day")).length;
  const doneCount = schedule.filter((b) => dayjs(b.Date).isBefore(dayjs(), "day")).length;

  return (
    <div className="min-h-screen p-6" style={{ background: "#f8fafc" }}>
      <div className="max-w-5xl mx-auto">

        {/* ── HEADER ── */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Schedule</h1>
          <p className="text-gray-500 text-sm mt-1">
            {schedule.length} total assignment{schedule.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* ── STATS BAR ── */}
        <div
          className="grid grid-cols-3 rounded-2xl overflow-hidden mb-8"
          style={{
            background: "#1e3a5f",
            boxShadow: "0 8px 32px -8px rgba(30,58,95,0.35)",
          }}
        >
          {[
            { label: "Today", value: todayCount, sub: "job hari ini", highlight: true },
            { label: "Upcoming", value: upcomingCount, sub: "akan datang", highlight: false },
            { label: "Done", value: doneCount, sub: "selesai", highlight: false },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="px-6 py-5"
              style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none" }}
            >
              <p className="text-xs font-medium mb-1" style={{ color: "rgba(255,255,255,0.45)" }}>
                {stat.label}
              </p>
              <p
                className="font-bold"
                style={{
                  fontSize: 28,
                  color: stat.highlight ? "#93c5fd" : "white",
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>
                {stat.sub}
              </p>
            </div>
          ))}
        </div>

        {/* ── FILTER TABS ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["all", "today", "upcoming", "done"] as FilterType[]).map((f) => (
            <button
              key={f}
              className={`cs-filter-btn ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all" && `All (${schedule.length})`}
              {f === "today" && `Today (${todayCount})`}
              {f === "upcoming" && `Upcoming (${upcomingCount})`}
              {f === "done" && `Done (${doneCount})`}
            </button>
          ))}
        </div>

        {/* ── CARDS ── */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-medium text-gray-400">Tidak ada jadwal untuk filter ini</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((booking, index) => {
              const isToday = dayjs(booking.Date).isSame(dayjs(), "day");
              const isPast = dayjs(booking.Date).isBefore(dayjs(), "day");
              const dateFormatted = dayjs(booking.Date).format("ddd, D MMM YYYY");

              return (
                <div
                  key={booking.ID}
                  ref={(el) => { cardsRef.current[index] = el; }}
                  className={`cs-card rounded-2xl overflow-hidden ${isToday ? "cs-today-pulse" : ""}`}
                  style={{
                    background: "white",
                    border: isToday
                      ? "2px solid #2563eb"
                      : isPast
                      ? "1px solid #e2e8f0"
                      : "1px solid #e2e8f0",
                    opacity: isPast ? undefined : 1,
                  }}
                >
                  {/* ── Card top bar ── */}
                  <div
                    className="px-5 py-4 flex items-center justify-between"
                    style={{
                      background: isPast
                        ? "#f8fafc"
                        : isToday
                        ? "linear-gradient(135deg, #1e40af, #2563eb)"
                        : "linear-gradient(135deg, #eff6ff, #dbeafe)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="cs-icon w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg select-none"
                        style={{
                          background: isPast
                            ? "#e2e8f0"
                            : isToday
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(37,99,235,0.1)",
                          color: isPast ? "#94a3b8" : isToday ? "white" : "#2563eb",
                          fontFamily: "monospace",
                        }}
                      >
                        ◈
                      </div>
                      <div>
                        <p
                          className="font-bold text-sm leading-tight"
                          style={{
                            color: isPast ? "#64748b" : isToday ? "white" : "#1e3a5f",
                          }}
                        >
                          {booking.Service?.Name || "Unknown Service"}
                        </p>
                      </div>
                    </div>

                    {/* Status badge */}
                    <div
                      className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{
                        background: isPast
                          ? "#e2e8f0"
                          : isToday
                          ? "rgba(255,255,255,0.2)"
                          : "rgba(37,99,235,0.12)",
                        color: isPast ? "#64748b" : isToday ? "white" : "#2563eb",
                      }}
                    >
                      {isToday ? "TODAY" : isPast ? "DONE" : "UPCOMING"}
                    </div>
                  </div>

                  {/* ── Card body ── */}
                  <div className="px-5 py-4 space-y-3">
                    {/* Customer */}
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-blue-50">
                        <UserOutlined style={{ fontSize: 11, color: "#2563eb" }} />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-blue-600">Customer</p>
                        <p className="text-sm font-medium text-gray-800">
                          {booking.User?.username || "—"}
                        </p>
                        <p className="text-xs text-gray-400">
                          {booking.User?.email || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-gray-100" />

                    {/* Date & Time */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <CalendarOutlined style={{ color: "#2563eb", fontSize: 13 }} />
                        <div>
                          <p className="text-xs font-semibold text-blue-600">Date</p>
                          <p className="text-sm font-medium text-gray-800">{dateFormatted}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <ClockCircleOutlined style={{ color: "#2563eb", fontSize: 13 }} />
                        <div>
                          <p className="text-xs font-semibold text-blue-600">Time</p>
                          <p className="text-sm font-medium text-gray-800">{booking.Time}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-2">
                      <EnvironmentOutlined style={{ color: "#2563eb", fontSize: 13, marginTop: 3 }} />
                      <div>
                        <p className="text-xs font-semibold text-blue-600">Address</p>
                        <p className="text-sm text-gray-600">{booking.Address || "—"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}