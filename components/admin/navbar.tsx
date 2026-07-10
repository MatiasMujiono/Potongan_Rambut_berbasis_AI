"use client";
import { useState } from "react";
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
export default function NavbarAdmin() {
  const [searchQuery, setSearchQuery] = useState("");
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

    function cn(...classes: Array<string | false | null | undefined>) {
      return classes.filter(Boolean).join(" ");
    }

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
  return (
    <header className="sticky top-0 z-50 flex h-18.5 items-center justify-between border-b border-white/5 bg-[#0b0f15]/80 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-4">
        <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition-all hover:bg-white/10 xl:hidden">
          <Menu size={20} />
        </button>

        <div className="hidden items-center gap-2 rounded-xl border border-white/5 bg-white/5 px-4 py-2 md:flex">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Cari..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-sm text-white outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-3 py-2">
          <Sparkles size={16} className="text-yellow-400" />
          <span className="hidden text-sm font-medium text-yellow-400 md:inline">
            AI
          </span>
          <span className="hidden text-xs text-slate-400 md:inline">|</span>
          <span className="hidden text-sm text-slate-300 md:inline">
            Ver. 2.0
          </span>
        </div>

        <button className="group relative grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition-all hover:bg-white/10">
          <Bell
            size={18}
            className="transition-transform group-hover:scale-110"
          />
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-linear-to-r from-yellow-400 to-yellow-500 px-1 text-[10px] font-bold text-slate-900 shadow-lg shadow-yellow-400/30">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <Avatar text="A" size="md" />
          <div className="hidden sm:block">
            <h4 className="text-sm font-bold text-white">Admin</h4>
            <p className="text-xs text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
}
