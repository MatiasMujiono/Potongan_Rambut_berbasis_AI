"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  UploadCloud,
  ScanLine,
  Sun,
  ScanFace,
  Shield,
  Clock3,
  Sparkles,
  User,
  ArrowRight,
  Zap,
  Camera,
  Image,
  CheckCircle2,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const hiddenRoutes = ["/superadmin", "/admin", "/auth", "/404", "/analisis"];

  if (hiddenRoutes.some((route) => pathname?.startsWith(route))) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative z-10 border-b border-white/5 bg-black/30 backdrop-blur-xl px-4 sm:px-8 py-4"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.02 }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/30 rounded-lg blur-md"></div>
            <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-yellow-400 to-yellow-500 font-bold text-black shadow-lg shadow-yellow-400/20">
              H
            </div>
          </div>
          <span className="text-2xl font-bold bg-linear-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
            HairAI
          </span>
        </motion.div>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-sm">
          {["Beranda", "Analisis", "Riwayat"].map((item, index) => (
            <motion.button
              key={item}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className={`${
                item === "Analisis"
                  ? "text-yellow-400 border-b-2 border-yellow-400 pb-1"
                  : "text-gray-400 hover:text-white transition-colors"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item}
            </motion.button>
          ))}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 text-black shadow-lg shadow-yellow-400/20 cursor-pointer hover:scale-110 transition-transform"
          >
            <User size={20} />
          </motion.div>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-gray-400 hover:text-white transition-colors"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pt-4 border-t border-white/5"
          >
            {["Beranda", "Analisis", "Riwayat"].map((item) => (
              <button
                key={item}
                className={`w-full text-left py-3 px-2 ${
                  item === "Analisis"
                    ? "text-yellow-400 bg-yellow-400/10 rounded-lg"
                    : "text-gray-400 hover:text-white transition-colors"
                }`}
              >
                {item}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
