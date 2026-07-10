"use client";

import {
  Image,
  ArrowLeft,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Shield,
  Clock,
  User,
  Zap,
  Maximize2,
  Minimize2,
  Scan,
  Camera,
  RotateCcw,
  FileImage,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface AnalisisResult {
  rekomendasi: string;
  deskripsi: string;
  gayaRambut: string[];
  confidence: number;
  tipsPerawatan?: string;
  uploadedImage?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analisisResult, setAnalisisResult] = useState<AnalisisResult | null>(
    null
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const handleFileSelect = (file: File) => {
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Ukuran file terlalu besar. Maksimal 10MB.");
      return;
    }

    setSelectedFile(file);
    setErrorMessage(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setIsAnalyzing(true);
    setScanProgress(0);
    setErrorMessage(null);

    // Simulasi progress
    const progressInterval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 85) {
          clearInterval(progressInterval);
          return 85;
        }
        return prev + Math.floor(Math.random() * 5) + 1;
      });
    }, 100);

    try {
      // Simulasi upload & analisis
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Simulasi hasil analisis
      setAnalisisResult({
        rekomendasi: "Texture Crop dengan Fade",
        deskripsi:
          "Potongan rambut modern dengan tekstur di atas dan fade di samping. Cocok untuk bentuk wajah oval dan memberikan kesan muda serta stylish.",
        gayaRambut: ["Texture Crop", "Fade", "Pompadour"],
        confidence: 0.92,
        tipsPerawatan: "Gunakan clay atau wax untuk tekstur, perawatan rutin setiap 3-4 minggu.",
        uploadedImage: previewUrl || undefined,
      });

      setScanProgress(100);
      setIsUploaded(true);
    } catch (error) {
      setErrorMessage("Terjadi kesalahan saat menganalisis. Coba lagi.");
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploaded(false);
    setAnalisisResult(null);
    setErrorMessage(null);
    setScanProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    handleRemoveFile();
  };

  const closeResult = () => {
    setAnalisisResult(null);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#1A0A0A] text-white overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-4 sm:py-8 min-h-screen flex flex-col">
        {/* Back Button & Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-4 sm:mb-8 shrink-0"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.button
              onClick={() => router.push("/")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">
                <span className="bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Upload Foto
                </span>
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">
                Upload foto wajah Anda untuk analisis AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-gray-400" />
              ) : (
                <Maximize2 className="w-4 h-4 text-gray-400" />
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="relative flex-1 flex items-center justify-center"
        >
          <div
            className={`
            relative w-full rounded-3xl overflow-hidden bg-linear-to-b from-[#1A1F2B] to-[#11161F] border border-white/5
            ${isFullscreen ? "fixed inset-4 z-50 rounded-3xl" : ""}
            aspect-3/4 sm:aspect-video max-h-[70vh] sm:max-h-[60vh]
          `}
          >
            {/* Content Area */}
            <div className="relative w-full h-full">
              {!previewUrl ? (
                // Drop Zone - styled like camera placeholder
                <div
                  onDragEnter={() => setDragActive(true)}
                  onDragLeave={() => setDragActive(false)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className={`
                    absolute inset-0 flex flex-col items-center justify-center
                    transition-all duration-300 cursor-pointer
                    ${
                      dragActive
                        ? "bg-yellow-400/10"
                        : "bg-[#1A1F2B]"
                    }
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />

                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="flex justify-center mb-4"
                  >
                    <div className="relative">
                      <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl blur-2xl"></div>
                      <div className="relative bg-yellow-400/10 p-5 rounded-2xl border border-yellow-400/20">
                        <Upload
                          className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400"
                          strokeWidth={1.5}
                        />
                      </div>
                    </div>
                  </motion.div>

                  <h3 className="text-lg sm:text-xl font-semibold mb-1 text-center">
                    {dragActive ? "Lepaskan untuk upload" : "Upload Foto Wajah"}
                  </h3>
                  <p className="text-gray-400 text-xs sm:text-sm mb-3 text-center px-4">
                    {dragActive
                      ? "File siap diupload"
                      : "Drag & drop foto Anda di sini atau klik untuk memilih"}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 text-[10px] sm:text-xs text-gray-500">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      JPG, PNG, WEBP
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      Maks. 10MB
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                      Min. 500x500px
                    </span>
                  </div>
                </div>
              ) : (
                // Preview Area - styled like camera view
                <>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="absolute inset-0 w-full h-full object-contain"
                  />

                  {/* Grid Lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute left-1/2 top-0 bottom-0 border border-white/10"></div>
                    <div className="absolute top-1/2 left-0 right-0 border border-white/10"></div>
                  </div>

                  {/* Scanner Frame Corners */}
                  <div className="absolute inset-4 sm:inset-6 pointer-events-none">
                    {[
                      { pos: "top-left", rotate: 0 },
                      { pos: "top-right", rotate: 90 },
                      { pos: "bottom-left", rotate: -90 },
                      { pos: "bottom-right", rotate: 180 },
                    ].map((corner) => (
                      <motion.div
                        key={corner.pos}
                        className={`absolute ${
                          corner.pos.includes("top") ? "top-0" : "bottom-0"
                        } ${
                          corner.pos.includes("left") ? "left-0" : "right-0"
                        } w-6 h-6 sm:w-8 sm:h-8`}
                        style={{ transform: `rotate(${corner.rotate}deg)` }}
                      >
                        <div className="w-full h-full border-l-4 border-t-4 border-yellow-400 rounded-tl-xl" />
                      </motion.div>
                    ))}

                    {/* Scanning Line */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-yellow-400 to-transparent"
                      animate={{
                        top: isUploading || isAnalyzing
                          ? ["0%", "100%", "0%"]
                          : "50%",
                      }}
                      transition={{
                        duration: 3,
                        repeat: isUploading || isAnalyzing ? Infinity : 0,
                        ease: "linear",
                      }}
                    />
                  </div>

                  {/* File Info Badge */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="absolute top-3 sm:top-4 left-3 sm:left-4 bg-black/80 backdrop-blur-xl rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 flex items-center gap-2 shadow-xl border border-white/10 pointer-events-none"
                  >
                    <FileImage className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    <span className="text-[10px] sm:text-xs text-gray-300 truncate max-w-[100px] sm:max-w-[150px]">
                      {selectedFile?.name}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {(selectedFile!.size / 1024 / 1024).toFixed(1)} MB
                    </span>
                  </motion.div>

                  {/* Remove Button */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveFile}
                    className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-xl bg-black/80 hover:bg-red-500/30 border border-white/10 hover:border-red-500/50 transition-colors backdrop-blur-xl z-10"
                  >
                    <X className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 hover:text-red-400" />
                  </motion.button>
                </>
              )}

              {/* Result Overlay - MENAMPILKAN HASIL ANALISIS */}
              <AnimatePresence>
                {analisisResult && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto"
                  >
                    <div className="w-full max-w-4xl">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Kolom Kiri: GAMBAR UPLOAD */}
                        <div className="relative rounded-xl overflow-hidden bg-linear-to-b from-[#1A1F2B] to-[#11161F] border border-yellow-400/30 shadow-xl shadow-yellow-400/10">
                          {analisisResult.uploadedImage ? (
                            <img
                              src={analisisResult.uploadedImage}
                              alt="Foto yang diupload"
                              className="w-full h-full object-cover aspect-square"
                            />
                          ) : (
                            <div className="w-full aspect-square flex flex-col items-center justify-center text-gray-500 bg-[#1A1F2B]">
                              <Image className="w-12 h-12 opacity-30 mb-2" />
                              <span className="text-xs">Foto tidak tersedia</span>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-3">
                            <p className="text-[10px] text-yellow-400/80 text-center flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Foto yang diupload
                            </p>
                          </div>
                          <div className="absolute top-2 right-2 bg-green-400/20 backdrop-blur-sm text-green-400 text-[10px] px-2 py-0.5 rounded-full border border-green-400/30">
                            Uploaded
                          </div>
                        </div>

                        {/* Kolom Kanan: Detail Analisis */}
                        <div className="flex flex-col justify-center space-y-3">
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 200 }}
                            className="flex justify-center md:justify-start"
                          >
                            <CheckCircle2 className="w-10 h-10 text-green-400" />
                          </motion.div>

                          <div>
                            <h3 className="text-xl font-bold text-white mb-1 text-center md:text-left">
                              {analisisResult.rekomendasi}
                            </h3>
                            <p className="text-sm text-gray-300 leading-relaxed text-center md:text-left">
                              {analisisResult.deskripsi}
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                            {analisisResult.gayaRambut.map((gaya, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-yellow-400/20 text-yellow-400 rounded-full text-xs border border-yellow-400/30"
                              >
                                {gaya}
                              </span>
                            ))}
                          </div>

                          {analisisResult.tipsPerawatan && (
                            <p className="text-xs text-gray-400 text-center md:text-left bg-white/5 p-2 rounded-lg border border-white/5">
                              💡 {analisisResult.tipsPerawatan}
                            </p>
                          )}

                          <div className="flex items-center justify-center md:justify-start gap-2 text-xs text-gray-400">
                            <span>Confidence:</span>
                            <span className="text-yellow-400 font-medium">
                              {(analisisResult.confidence * 100).toFixed(0)}%
                            </span>
                          </div>

                          {/* Tombol Tutup Hasil */}
                          <button
                            onClick={closeResult}
                            className="mt-2 w-full py-2 px-4 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white transition-colors border border-white/10"
                          >
                            Tutup Hasil
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Uploading / Analyzing Overlay */}
              <AnimatePresence>
                {(isUploading || isAnalyzing) && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="text-center px-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="inline-block"
                      >
                        <Scan className="w-12 h-12 sm:w-16 sm:h-16 text-yellow-400" />
                      </motion.div>
                      <p className="mt-3 sm:mt-4 text-white font-medium text-sm sm:text-base">
                        {isAnalyzing ? "Menganalisis..." : "Mengupload..."}
                      </p>
                      <div className="mt-3 w-48 sm:w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full"
                          animate={{ width: `${scanProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        {scanProgress}%
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Message */}
              <AnimatePresence>
                {errorMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="absolute top-4 left-4 right-4 bg-red-500/20 backdrop-blur-sm border border-red-500/50 rounded-xl p-3 z-20"
                  >
                    <div className="flex flex-col items-start gap-2 text-red-400">
                      <div className="flex items-start gap-2 w-full">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Error</p>
                          <p className="text-xs text-red-400/80">{errorMessage}</p>
                        </div>
                        <button
                          onClick={() => {
                            setErrorMessage(null);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setErrorMessage(null);
                          handleUpload();
                        }}
                        className="ml-6 text-xs text-red-300 underline hover:text-red-200 transition-colors"
                      >
                        Coba lagi
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Status Badge */}
              {previewUrl && !analisisResult && !errorMessage && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl rounded-xl px-3 sm:px-5 py-2 sm:py-3 flex gap-2 sm:gap-3 items-center shadow-xl border border-white/10 pointer-events-none"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    <CheckCircle2 className="text-green-400" size={16} />
                  </motion.div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white">
                      {isUploading || isAnalyzing
                        ? "Sedang memproses..."
                        : "Foto siap diupload"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {isUploading || isAnalyzing
                        ? "Mohon tunggu sebentar"
                        : "Klik tombol upload untuk mulai analisis"}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 sm:p-6">
              <div className="flex justify-center items-center gap-4 sm:gap-6">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleRemoveFile}
                  disabled={isUploading || isAnalyzing || !previewUrl}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={!previewUrl ? () => fileInputRef.current?.click() : handleUpload}
                  disabled={isUploading || isAnalyzing}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border-4 border-yellow-400/30 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading || isAnalyzing ? (
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-black animate-spin" />
                  ) : !previewUrl ? (
                    <Upload size={28} className="text-black" />
                  ) : (
                    <Camera size={28} className="text-black" />
                  )}
                  {!isUploading && !isAnalyzing && previewUrl && !analisisResult && (
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isAnalyzing}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <Image className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </motion.button>
              </div>

              <div className="flex justify-center gap-6 sm:gap-10 mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400">
                <span>Reset</span>
                <span className="text-yellow-400 font-medium">
                  {isUploading || isAnalyzing
                    ? "Memproses..."
                    : analisisResult
                    ? "Hasil Siap ✅"
                    : previewUrl
                    ? "Upload & Analisis"
                    : "Pilih Foto"}
                </span>
                <span>Ganti</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tips & Information */}
        <div className="mt-4 sm:mt-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="grid gap-4 md:grid-cols-2"
          >
            <div className="rounded-2xl border border-white/5 bg-linear-to-b from-[#141414] to-[#111111] p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <h3 className="font-semibold text-sm sm:text-base">Tips Foto Terbaik</h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-xs mt-0.5">•</span>
                  <span>Pastikan wajah terlihat jelas dan tidak terhalang</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-xs mt-0.5">•</span>
                  <span>Gunakan pencahayaan yang cukup dan merata</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-xs mt-0.5">•</span>
                  <span>Posisi wajah menghadap langsung ke kamera</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-xs mt-0.5">•</span>
                  <span>Hindari topi, kacamata, atau masker</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-xs mt-0.5">•</span>
                  <span>Ekspresi wajah netral untuk hasil terbaik</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/5 bg-linear-to-b from-[#141414] to-[#111111] p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <h3 className="font-semibold text-sm sm:text-base">Informasi Penting</h3>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-3 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/5">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white">
                      Privasi Terjamin
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Foto Anda aman dan tidak akan disimpan
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/5">
                  <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white">
                      Proses Cepat
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Analisis selesai dalam &lt; 30 detik
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 sm:p-3 rounded-xl bg-white/5 border border-white/5">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white">
                      Akurasi Tinggi
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Didukung oleh AI canggih
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Status Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-gray-500"
          >
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  previewUrl ? "bg-green-400" : "bg-gray-600"
                }`}
              ></div>
              <span>Foto: {previewUrl ? "Terupload" : "Kosong"}</span>
            </div>
            <div className="w-px h-3 bg-gray-700"></div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-green-400" />
              <span>100% Private</span>
            </div>
            {analisisResult && (
              <>
                <div className="w-px h-3 bg-gray-700"></div>
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <Sparkles className="w-3 h-3" />
                  <span>Analisis Selesai</span>
                </div>
              </>
            )}
            <div className="w-px h-3 bg-gray-700"></div>
            <div className="flex items-center gap-1.5">
              <span>Format: JPG, PNG, WEBP</span>
            </div>
            <div className="w-px h-3 bg-gray-700"></div>
            <div className="flex items-center gap-1.5">
              <span>Maks. 10MB</span>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}