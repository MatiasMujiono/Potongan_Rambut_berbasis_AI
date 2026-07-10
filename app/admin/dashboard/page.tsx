"use client";

import React, { useState } from "react";
import {
  Menu,
  Bell,
  LayoutDashboard,
  Users,
  BarChart3,
  Scissors,
  Shapes,
  History,
  MessageSquare,
  Settings,
  FileText,
  LogOut,
  Crown,
  Star,
  MoreVertical,
  CalendarDays,
  TrendingUp,
  Search,
  ChevronDown,
  Sparkles,
  ArrowUpRight,
  Clock,
  User,
  Zap,
  Shield,
} from "lucide-react";

type AnalysisRow = {
  name: string;
  face: string;
  model: string;
  date: string;
  avatar: string;
};

const analysisData: AnalysisRow[] = [
  {
    name: "Rudi Santoso",
    face: "Oval",
    model: "Wolf Cut",
    date: "31 Mei 2024 10:30",
    avatar: "RS",
  },
  {
    name: "Rizky Pratama",
    face: "Bulat",
    model: "Two Block",
    date: "31 Mei 2024 09:15",
    avatar: "RP",
  },
  {
    name: "Alvian Fauzi",
    face: "Persegi",
    model: "Comma Hair",
    date: "30 Mei 2024 21:45",
    avatar: "AF",
  },
  {
    name: "Dimas Arifin",
    face: "Oval",
    model: "Middle Part",
    date: "30 Mei 2024 19:20",
    avatar: "DA",
  },
  {
    name: "Fajar Ramadhan",
    face: "Hati",
    model: "Curtain Hair",
    date: "29 Mei 2024 17:10",
    avatar: "FR",
  },
];

const recentData = [
  {
    name: "Rudi Santoso",
    date: "31 Mei 2024 10:30 WIB",
    face: "Oval",
    avatar: "RS",
  },
  {
    name: "Rizky Pratama",
    date: "31 Mei 2024 09:15 WIB",
    face: "Bulat",
    avatar: "RP",
  },
  {
    name: "Alvian Fauzi",
    date: "30 Mei 2024 21:45 WIB",
    face: "Persegi",
    avatar: "AF",
  },
  {
    name: "Dimas Arifin",
    date: "30 Mei 2024 19:20 WIB",
    face: "Oval",
    avatar: "DA",
  },
  {
    name: "Fajar Ramadhan",
    date: "29 Mei 2024 17:10 WIB",
    face: "Hati",
    avatar: "FR",
  },
];

const chartPoints = [140, 310, 470, 440, 620, 900];

const donutSegments = [
  { label: "Oval", value: 40, color: "#fbbf24" },
  { label: "Bulat", value: 25, color: "#60a5fa" },
  { label: "Persegi", value: 15, color: "#34d399" },
  { label: "Hati", value: 10, color: "#a78bfa" },
  { label: "Diamond", value: 10, color: "#fb7185" },
];

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function SidebarItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium transition-all duration-200",
        active
          ? "bg-linear-to-r from-yellow-500/15 to-yellow-500/5 text-yellow-400"
          : "text-slate-400 hover:bg-white/5 hover:text-white",
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-yellow-400" />
      )}
      <span
        className={cn(
          "transition-transform group-hover:scale-105",
          active && "scale-105",
        )}
      >
        {icon}
      </span>
      <span>{label}</span>
      {active && (
        <span className="ml-auto rounded-full bg-yellow-400/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400">
          Aktif
        </span>
      )}
    </button>
  );
}

function Avatar({
  text,
  size = "md",
}: {
  text: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
  };

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-yellow-400/20 to-yellow-500/20 font-bold text-yellow-400 ring-2 ring-yellow-400/20 transition-all hover:ring-yellow-400/40",
        sizes[size],
      )}
    >
      {text}
    </div>
  );
}

function FaceBadge({ face }: { face: string }) {
  const styles: Record<string, string> = {
    Oval: "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
    Bulat: "bg-blue-400/10 text-blue-400 border-blue-400/20",
    Persegi: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    Hati: "bg-violet-400/10 text-violet-400 border-violet-400/20",
    Diamond: "bg-rose-400/10 text-rose-400 border-rose-400/20",
  };

  return (
    <span
      className={cn(
        "inline-flex min-w-18 items-center justify-center rounded-full border px-3 py-1.5 text-xs font-bold transition-all hover:scale-105",
        styles[face] || styles.Oval,
      )}
    >
      {face}
    </span>
  );
}

function StatCard({
  icon,
  title,
  value,
  subtitle,
  growth,
  trend = "up",
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle?: string;
  growth?: string;
  trend?: "up" | "down";
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-[#11161f] to-[#0d121c] p-6 shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-yellow-400/20 hover:shadow-yellow-400/5">
      <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-yellow-400/5 blur-2xl transition-all duration-500 group-hover:bg-yellow-400/10" />

      <div className="relative flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-yellow-400/10 to-yellow-500/10 text-yellow-400 ring-1 ring-yellow-400/10 transition-all duration-300 group-hover:ring-yellow-400/30">
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <p className="mb-1 text-sm font-medium text-slate-400">{title}</p>
          <h3 className="mb-2 text-3xl font-extrabold tracking-tight text-white md:text-[32px]">
            {value}
          </h3>

          {growth ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-sm font-semibold text-emerald-400">
              <TrendingUp size={14} />
              <span>{growth}</span>
            </div>
          ) : (
            <p className="text-sm text-slate-500">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LineChartCard() {
  const width = 680;
  const height = 250;
  const paddingX = 30;
  const paddingTop = 20;
  const paddingBottom = 35;
  const maxValue = 1000;
  const labels = ["Des", "Jan", "Feb", "Mar", "Apr", "Mei"];

  const innerWidth = width - paddingX * 2;
  const innerHeight = height - paddingTop - paddingBottom;

  const points = chartPoints.map((v, i) => {
    const x = paddingX + (i * innerWidth) / (chartPoints.length - 1);
    const y = paddingTop + innerHeight - (v / maxValue) * innerHeight;
    return { x, y };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");
  const gridValues = [0, 200, 400, 600, 800, 1000];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-[#11161f] to-[#0d121c] shadow-lg transition-all duration-300 hover:border-yellow-400/20">
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-yellow-400/10 p-2 text-yellow-400">
            <TrendingUp size={18} />
          </div>
          <h3 className="text-lg font-bold text-white md:text-xl">
            Grafik Analisis
          </h3>
        </div>
        <button className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400">
          <span>6 Bulan Terakhir</span>
          <ChevronDown
            size={16}
            className="transition-transform group-hover:rotate-180"
          />
        </button>
      </div>

      <div className="p-6">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </linearGradient>
          </defs>

          {gridValues.map((g) => {
            const y = paddingTop + innerHeight - (g / maxValue) * innerHeight;
            return (
              <g key={g}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="rgba(255,255,255,0.05)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={8}
                  y={y + 4}
                  fill="#475569"
                  fontSize="12"
                  fontFamily="system-ui"
                >
                  {g}
                </text>
              </g>
            );
          })}

          {labels.map((label, i) => {
            const x = paddingX + (i * innerWidth) / (labels.length - 1);
            return (
              <text
                key={label}
                x={x}
                y={height - 8}
                textAnchor="middle"
                fill="#475569"
                fontSize="12"
                fontFamily="system-ui"
              >
                {label}
              </text>
            );
          })}

          <polygon
            points={`${paddingX},${paddingTop + innerHeight} ${polyline} ${width - paddingX},${paddingTop + innerHeight}`}
            fill="url(#areaGradient)"
          />

          <polyline
            fill="none"
            stroke="#fbbf24"
            strokeWidth="3"
            points={polyline}
          />

          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r="6" fill="#fbbf24" />
              <circle cx={p.x} cy={p.y} r="12" fill="rgba(251,191,36,0.15)" />
              <circle cx={p.x} cy={p.y} r="20" fill="rgba(251,191,36,0.05)" />
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

function DonutChartCard() {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offsetAcc = 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-[#11161f] to-[#0d121c] shadow-lg transition-all duration-300 hover:border-yellow-400/20">
      <div className="border-b border-white/5 px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-violet-400/10 p-2 text-violet-400">
            <Shapes size={18} />
          </div>
          <h3 className="text-lg font-bold text-white md:text-xl">
            Distribusi Bentuk Wajah
          </h3>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 px-6 pb-6 pt-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative flex flex-1 items-center justify-center">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <g transform="translate(110,110) rotate(-90)">
              {donutSegments.map((segment, idx) => {
                const dash = (segment.value / 100) * circumference;
                const dashArray = `${dash} ${circumference - dash}`;
                const dashOffset = -offsetAcc;
                offsetAcc += dash;

                return (
                  <circle
                    key={idx}
                    r={radius}
                    cx="0"
                    cy="0"
                    fill="transparent"
                    stroke={segment.color}
                    strokeWidth="28"
                    strokeDasharray={dashArray}
                    strokeDashoffset={dashOffset}
                    className="transition-all duration-500 hover:opacity-80"
                  />
                );
              })}
            </g>
            <circle cx="110" cy="110" r="44" fill="#0d121c" />
            <text
              x="110"
              y="105"
              textAnchor="middle"
              fill="#fff"
              fontSize="20"
              fontWeight="bold"
            >
              100%
            </text>
            <text
              x="110"
              y="125"
              textAnchor="middle"
              fill="#64748b"
              fontSize="12"
            >
              Total
            </text>
          </svg>
        </div>

        <div className="w-full max-w-55 space-y-3">
          {donutSegments.map((item) => (
            <div
              key={item.label}
              className="group flex items-center justify-between gap-3 rounded-lg p-2 transition-all hover:bg-white/5"
            >
              <div className="flex items-center gap-2.5 text-sm text-slate-200">
                <span
                  className="h-3 w-3 rounded-full transition-transform group-hover:scale-110"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium">{item.label}</span>
              </div>
              <span className="text-sm font-bold text-slate-400">
                {item.value}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Page() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <section className="flex-1 p-4 md:p-6">
        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/5 bg-linear-to-br from-[#11161f] to-[#0d121c] p-6 shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Dashboard
              </h2>
              <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                Live
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Ringkasan sistem dan aktivitas analisis
            </p>
          </div>

          <button className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-slate-200 transition-all hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400">
            <CalendarDays size={16} />
            <span>31 Mei 2024</span>
            <ChevronDown size={16} />
          </button>
        </div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={<Users size={22} />}
            title="Total Pengguna"
            value="1.250"
            growth="+12.5% dari bulan lalu"
          />
          <StatCard
            icon={<BarChart3 size={22} />}
            title="Total Analisis"
            value="1.200"
            growth="+15.8% dari bulan lalu"
          />
          <StatCard
            icon={<Scissors size={22} />}
            title="Model Rambut"
            value="45"
            subtitle="Total tersedia"
          />
          <StatCard
            icon={<Star size={22} />}
            title="Rating Rata-rata"
            value="4.8"
            subtitle="Total kategori"
          />
        </div>

        {/* CHART SECTION */}
        <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
          <LineChartCard />
          <DonutChartCard />
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.8fr_1fr]">
          {/* TABLE */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-[#11161f] to-[#0d121c] shadow-lg transition-all duration-300 hover:border-yellow-400/20">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-400/10 p-2 text-blue-400">
                  <Clock size={18} />
                </div>
                <h3 className="text-lg font-bold text-white md:text-xl">
                  Analisis Terbaru
                </h3>
              </div>
              <button className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400">
                <span>Lihat Semua</span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>

            <div className="overflow-x-auto px-6 pb-6 pt-2">
              <table className="min-w-180 w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Pengguna
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Bentuk Wajah
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Model Rekomendasi
                    </th>
                    <th className="px-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analysisData.map((item, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-white/5 transition-all hover:bg-white/5 last:border-0"
                    >
                      <td className="px-3 py-4 text-sm text-slate-200">
                        <div className="flex min-w-45 items-center gap-3">
                          <Avatar text={item.avatar} size="sm" />
                          <span className="font-medium">{item.name}</span>
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-200">
                        <FaceBadge face={item.face} />
                      </td>
                      <td className="px-3 py-4 text-sm font-medium text-slate-200">
                        {item.model}
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-400">
                        {item.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* RECENT LIST */}
          <div className="overflow-hidden rounded-2xl border border-white/5 bg-linear-to-br from-[#11161f] to-[#0d121c] shadow-lg transition-all duration-300 hover:border-yellow-400/20">
            <div className="flex items-center justify-between gap-3 border-b border-white/5 px-6 py-4">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-purple-400/10 p-2 text-purple-400">
                  <Zap size={18} />
                </div>
                <h3 className="text-lg font-bold text-white md:text-xl">
                  Aktivitas Terbaru
                </h3>
              </div>
              <button className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-yellow-400/30 hover:bg-yellow-400/10 hover:text-yellow-400">
                <span>Lihat Semua</span>
                <ArrowUpRight
                  size={16}
                  className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </button>
            </div>

            <div className="p-4">
              {recentData.map((item, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between gap-3 rounded-xl border-b border-white/5 px-3 py-4 transition-all hover:bg-white/5 last:border-0"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar text={item.avatar} size="sm" />
                    <div className="min-w-0">
                      <h4 className="truncate text-sm font-bold text-white group-hover:text-yellow-400">
                        {item.name}
                      </h4>
                      <p className="truncate text-xs text-slate-400">
                        {item.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <FaceBadge face={item.face} />
                    <button className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-all hover:bg-white/10 hover:text-white">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
