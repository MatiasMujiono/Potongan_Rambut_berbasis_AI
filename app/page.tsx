"use client";

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
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#1A0A0A] text-white">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Navbar */}

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center gap-2 bg-yellow-400/10 text-yellow-400 px-4 py-2 rounded-full border border-yellow-400/20 mb-6"
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Analysis</span>
          </motion.div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold">
            <span className="bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Analisis Wajah
            </span>
            <br />
            <span className="bg-linear-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Dengan AI Canggih
            </span>
          </h1>

          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            Pilih metode untuk memulai analisis wajah Anda dan dapatkan
            rekomendasi potongan rambut terbaik
          </p>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="mt-12 sm:mt-14 grid gap-6 md:grid-cols-2"
        >
          {/* Upload Card */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative rounded-3xl border border-white/10 bg-linear-to-b from-[#141414] to-[#111111] p-8 sm:p-10 transition-all duration-300 hover:border-yellow-400/50 hover:shadow-2xl hover:shadow-yellow-400/10"
          >
            <div className="absolute inset-0 bg-linear-to-br from-yellow-400/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              <motion.div
                className="flex justify-center"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl blur-2xl"></div>
                  <div className="relative bg-yellow-400/10 p-6 rounded-2xl border border-yellow-400/20">
                    <Image
                      className="w-16 h-16 text-yellow-400"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </motion.div>

              <h2 className="mt-6 text-center text-2xl sm:text-3xl font-semibold">
                Upload Foto
              </h2>

              <p className="mt-3 text-center leading-7 text-gray-400">
                Upload foto wajah Anda untuk analisis mendetail
                <br />
                <span className="text-yellow-400/60 text-sm">
                  Format: JPG, PNG, WEBP
                </span>
              </p>

              <motion.button
                onClick={() => router.push("/analisis/upload")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 w-full group/btn relative overflow-hidden rounded-xl bg-linear-to-r from-yellow-400 to-yellow-500 py-4 font-semibold text-black transition-all hover:shadow-lg hover:shadow-yellow-400/30"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Pilih Foto
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
              </motion.button>
            </div>
          </motion.div>

          {/* Scan Card */}
          <motion.div
            variants={fadeInUp}
            whileHover={{ y: -8, transition: { duration: 0.2 } }}
            className="group relative rounded-3xl border-2 border-yellow-400/30 bg-linear-to-b from-[#141414] to-[#111111] p-8 sm:p-10 transition-all duration-300 hover:border-yellow-400 hover:shadow-2xl hover:shadow-yellow-400/20"
          >
            <div className="absolute inset-0 bg-linear-to-br from-yellow-400/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <div className="relative">
              <motion.div
                className="flex justify-center"
                whileHover={{ scale: 1.1, rotate: -5 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/30 rounded-2xl blur-2xl animate-pulse"></div>
                  <div className="relative bg-yellow-400/20 p-6 rounded-2xl border-2 border-yellow-400/40">
                    <Camera
                      className="w-16 h-16 text-yellow-400"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </motion.div>

              <h2 className="mt-6 text-center text-2xl sm:text-3xl font-semibold">
                Scan Wajah
              </h2>

              <p className="mt-3 text-center leading-7 text-gray-400">
                Gunakan kamera untuk scan wajah secara real-time
                <br />
                <span className="text-yellow-400/60 text-sm">
                  Deteksi langsung
                </span>
              </p>

              <motion.button
                onClick={() => router.push("/analisis/scan")}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 w-full group/btn relative overflow-hidden rounded-xl bg-linear-to-r from-yellow-400 to-yellow-500 py-4 font-semibold text-black transition-all hover:shadow-lg hover:shadow-yellow-400/30"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Mulai Scan
                  <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>

        {/* Tips Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-1 bg-yellow-400 rounded-full"></div>
            <h3 className="text-lg font-semibold">Tips Foto Terbaik</h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Sun, text: "Gunakan cahaya yang cukup" },
              { icon: ScanFace, text: "Posisi wajah menghadap depan" },
              { icon: Shield, text: "Hindari aksesori (topi, masker)" },
              { icon: "😊", text: "Ekspresi netral" },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3 border border-white/5 hover:border-yellow-400/30 transition-colors"
              >
                {typeof item.icon === "string" ? (
                  <span className="text-2xl">{item.icon}</span>
                ) : (
                  <item.icon className="w-5 h-5 text-yellow-400" />
                )}
                <span className="text-sm text-gray-300">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-16 rounded-3xl border border-white/5 bg-linear-to-b from-[#141414] to-[#111111] p-8 sm:p-10 backdrop-blur-xl"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-1 bg-yellow-400 rounded-full"></div>
            <h2 className="text-2xl font-semibold">Tentang Analisis</h2>
          </div>

          <p className="max-w-4xl leading-8 text-gray-400">
            AI kami akan menganalisis bentuk wajah, tekstur rambut, dan
            karakteristik unik Anda untuk memberikan rekomendasi potongan rambut
            terbaik yang sesuai dengan kepribadian dan gaya Anda.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Sparkles, title: "Akurasi Tinggi", desc: "AI Advanced" },
              { icon: Shield, title: "Privasi Terjamin", desc: "Data Aman" },
              { icon: Clock3, title: "Hasil Instan", desc: "< 30 Detik" },
              {
                icon: User,
                title: "Rekomendasi Personal",
                desc: "Sesuai Karakter",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-4 rounded-xl bg-white/5 p-4 border border-white/5 hover:border-yellow-400/30 transition-all"
              >
                <div className="rounded-xl bg-yellow-400/10 p-3 border border-yellow-400/20">
                  <item.icon className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-gray-400">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 flex items-center justify-center gap-2 text-xs text-gray-500"
          >
            <CheckCircle2 className="w-4 h-4 text-green-400" />
            <span>100% Private & Secure</span>
            <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
            <span>Powered by Advanced AI</span>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
