"use client";
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
import { useRouter } from "next/navigation";
export default function Sidebar() {
  const router = useRouter();
  function SidebarItem({
    icon,
    label,
    active = false,
    href,
  }: {
    icon: React.ReactNode;
    label: string;
    active?: boolean;
    href: string;
  }) {
    function cn(...classes: Array<string | false | null | undefined>) {
      return classes.filter(Boolean).join(" ");
    }

    return (
      <button
        onClick={() => router.push(href)}
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
  return (
    <aside className="hidden border-r border-white/5 bg-[#0a0e14]/80 backdrop-blur-xl xl:flex xl:flex-col">
      <div className="flex items-center gap-3 border-b border-white/5 px-6 pb-6 pt-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-yellow-400 to-yellow-500 text-lg font-bold text-slate-900 shadow-lg shadow-yellow-400/20">
          ✦
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          <span className="text-white">Hair</span>
          <span className="text-yellow-400">AI</span>
        </h1>
      </div>

      <div className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          href="/admin"
          active
        />
        <SidebarItem
          href="/admin"
          icon={<Users size={18} />}
          label="Pengguna"
        />
        <SidebarItem
          href="/admin"
          icon={<BarChart3 size={18} />}
          label="Analisis"
        />
        <SidebarItem
          href="/admin/hairmodel/"
          icon={<Scissors size={18} />}
          label="Model Rambut"
        />
        <SidebarItem
          href="/admin"
          icon={<Shapes size={18} />}
          label="Kategori"
        />
        <SidebarItem
          href="/admin"
          icon={<History size={18} />}
          label="Riwayat Analisis"
        />
        <SidebarItem
          href="/admin"
          icon={<MessageSquare size={18} />}
          label="Komentar"
        />
        <SidebarItem
          href="/admin"
          icon={<Settings size={18} />}
          label="Pengaturan"
        />
        <SidebarItem
          href="/admin"
          icon={<FileText size={18} />}
          label="Laporan"
        />
      </div>

      <div className="mx-4 mb-6 overflow-hidden rounded-2xl border border-yellow-400/20 bg-linear-to-br from-yellow-400/10 to-yellow-500/5 p-5 shadow-lg shadow-yellow-400/5">
        <div className="mb-3 flex items-center gap-2 text-yellow-400">
          <Crown size={20} />
          <span className="font-bold">Premium Plan</span>
        </div>
        <p className="mb-4 text-sm leading-relaxed text-slate-400">
          Kelola sistem dengan fitur premium
        </p>
        <button className="group w-full rounded-xl bg-linear-to-r from-yellow-400 to-yellow-500 px-4 py-3 text-sm font-bold text-slate-900 transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-400/25">
          Upgrade Sekarang
        </button>
      </div>

      <button className="mx-4 mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-white">
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </aside>
  );
}
