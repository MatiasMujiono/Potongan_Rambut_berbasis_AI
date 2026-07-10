"use client";

import {
  Camera,
  RotateCcw,
  CheckCircle2,
  ArrowLeft,
  Scan,
  Sparkles,
  Shield,
  Clock,
  AlertCircle,
  FlipHorizontal,
  Maximize2,
  Minimize2,
  Loader2,
  XCircle,
  Image as ImageIcon,
  RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";

interface AnalisisResult {
  rekomendasi: string;
  deskripsi: string;
  gayaRambut: string[];
  confidence: number;
  tipsPerawatan?: string;
  capturedImage?: string;   // Foto asli dari webcam
  generatedImage?: string;  // Gambar hasil generate dari AI
}

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [analisisResult, setAnalisisResult] = useState<AnalisisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null); // Untuk preview sementara

  const webcamRef = useRef<Webcam>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  // Fungsi untuk mengambil foto dan mengirim ke API
  const captureAndAnalyze = useCallback(async () => {
    if (!webcamRef.current || !isCameraReady) {
      setErrorMessage("Kamera belum siap");
      return;
    }

    setIsLoading(true);
    
    // Ambil foto
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      setErrorMessage("Gagal mengambil foto");
      setIsLoading(false);
      return;
    }

    // Simpan gambar capture untuk preview
    setCapturedImage(imageSrc);

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
      const instruction = `
        Analisis foto wajah ini dan berikan rekomendasi potongan rambut yang cocok.
        Pertimbangkan bentuk wajah, jenis rambut, dan gaya yang sedang tren.
        Berikan 3 rekomendasi dengan deskripsi yang jelas.
        HASILKAN GAMBAR dari rekomendasi terbaik.
      `;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // Timeout 45 detik (lebih lama untuk generate gambar)

      const response = await fetch('/api/analisis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc, instruction }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const result = await response.json();

      if (!response.ok) {
        if (result.code === 'QUOTA_EXCEEDED') {
          throw new Error('Kuota API sedang habis. Coba lagi dalam beberapa menit.');
        }
        if (result.code === 'SERVER_BUSY' || response.status === 502 || response.status === 503) {
          throw new Error('Server AI sedang sibuk. Silakan coba scan ulang.');
        }
        if (response.status === 429) {
          throw new Error('Terlalu banyak permintaan. Tunggu sebentar lalu coba lagi.');
        }
        throw new Error(result.error || 'Gagal menganalisis');
      }

      if (result.success && result.data) {
        // Simpan hasil dengan gambar generate
        setAnalisisResult({
          ...result.data,
          capturedImage: imageSrc,      // foto asli
          generatedImage: result.data.generatedImage || null,
        });
        setScanProgress(100);
      } else {
        throw new Error(result.error || 'Analisis gagal');
      }

    } catch (error) {
      console.error('Error analyzing:', error);
      let errorMsg = 'Terjadi kesalahan';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMsg = 'Waktu tunggu habis, server AI terlalu lama merespons. Coba lagi.';
        } else {
          errorMsg = error.message;
        }
      }
      setErrorMessage(errorMsg);
      setScanProgress(0);
      setCapturedImage(null);
    } finally {
      clearInterval(progressInterval);
      setIsAnalyzing(false);
      setIsLoading(false);
      setIsScanning(false);
    }
  }, [isCameraReady]);

  const handleScan = () => {
    if (!isCameraReady) {
      setIsCameraReady(true);
      return;
    }
    if (isAnalyzing || isLoading) return;

    setIsScanning(true);
    setAnalisisResult(null);
    setErrorMessage(null);
    setCapturedImage(null);
    captureAndAnalyze();
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
    setAnalisisResult(null);
    setErrorMessage(null);
    setCapturedImage(null);
  };

  const resetCamera = () => {
    setIsCameraReady(false);
    setAnalisisResult(null);
    setErrorMessage(null);
    setScanProgress(0);
    setIsScanning(false);
    setIsAnalyzing(false);
    setCapturedImage(null);
  };

  const handleUserMedia = () => {
    setIsCameraReady(true);
  };

  // Fungsi untuk menutup hasil
  const closeResult = () => {
    setAnalisisResult(null);
    setCapturedImage(null);
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
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </motion.button>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold">
                <span className="bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Scan Wajah
                </span>
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1 hidden sm:block">
                Posisikan wajah Anda di dalam frame
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

        {/* Scanner Area */}
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
            {/* Camera Preview */}
            <div className="relative w-full h-full">
              {isCameraReady ? (
                <Webcam
                  ref={webcamRef}
                  audio={false}
                  screenshotFormat="image/jpeg"
                  onUserMedia={handleUserMedia}
                  videoConstraints={{
                    facingMode: facingMode,
                    width: { ideal: 720 },
                    height: { ideal: 1280 },
                    aspectRatio: 0.75,
                  }}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform:
                      facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
                  }}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-b from-[#1A1F2B] to-[#11161F]">
                  <Camera className="w-16 h-16 sm:w-20 sm:h-20 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-sm sm:text-base">
                    Kamera belum aktif
                  </p>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1">
                    Klik tombol Scan untuk memulai
                  </p>
                </div>
              )}

              {/* Result Overlay - MENAMPILKAN GAMBAR GENERATE */}
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
                        {/* Kolom Kiri: GAMBAR HASIL GENERATE DARI AI */}
                        <div className="relative rounded-xl overflow-hidden bg-linear-to-b from-[#1A1F2B] to-[#11161F] border border-yellow-400/30 shadow-xl shadow-yellow-400/10">
                          {analisisResult.generatedImage ? (
                            <img
                              src={analisisResult.generatedImage}
                              alt="Hasil generate AI"
                              className="w-full h-full object-cover aspect-square"
                            />
                          ) : (
                            <div className="w-full aspect-square flex flex-col items-center justify-center text-gray-500 bg-[#1A1F2B]">
                              <Sparkles className="w-12 h-12 opacity-30 mb-2" />
                              <span className="text-xs">Gambar AI tidak tersedia</span>
                              <span className="text-[10px] text-gray-600 mt-1">(gunakan model yang mendukung image generation)</span>
                            </div>
                          )}
                          <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/90 to-transparent p-3">
                            <p className="text-[10px] text-yellow-400/80 text-center flex items-center justify-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Hasil Generate AI (potongan rambut baru)
                            </p>
                          </div>
                          {/* Badge "AI Generated" */}
                          {analisisResult.generatedImage && (
                            <div className="absolute top-2 right-2 bg-yellow-400/20 backdrop-blur-sm text-yellow-400 text-[10px] px-2 py-0.5 rounded-full border border-yellow-400/30">
                              AI
                            </div>
                          )}
                        </div>

                        {/* Kolom Kanan: Detail Analisis + Foto Asli (thumbnail) */}
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

                          {/* Thumbnail foto asli (capture) sebagai perbandingan */}
                          {analisisResult.capturedImage && (
                            <div className="flex items-center gap-2 mt-1 justify-center md:justify-start">
                              <span className="text-[10px] text-gray-500">Foto asli:</span>
                              <img
                                src={analisisResult.capturedImage}
                                alt="Foto asli"
                                className="w-10 h-10 rounded-lg object-cover border border-white/10"
                              />
                            </div>
                          )}

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

              {/* Scanning Overlay */}
              <AnimatePresence>
                {(isScanning || isAnalyzing) && (
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
                        {isAnalyzing ? 'Menganalisis & Menghasilkan Gambar...' : 'Mempersiapkan...'}
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
                        <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Error</p>
                          <p className="text-xs text-red-400/80">{errorMessage}</p>
                        </div>
                        <button
                          onClick={() => {
                            setErrorMessage(null);
                            setCapturedImage(null);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          setErrorMessage(null);
                          handleScan();
                        }}
                        className="ml-6 text-xs text-red-300 underline hover:text-red-200 transition-colors"
                      >
                        Coba lagi
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                    top: isScanning || isAnalyzing
                      ? ["0%", "100%", "0%"]
                      : isCameraReady
                        ? "50%"
                        : "50%",
                  }}
                  transition={{
                    duration: 3,
                    repeat: isScanning || isAnalyzing ? Infinity : 0,
                    ease: "linear",
                  }}
                />
              </div>

              {/* Status Badge */}
              {isCameraReady && !analisisResult && !errorMessage && (
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
                      {isScanning || isAnalyzing
                        ? "Sedang memproses..."
                        : "Siap untuk scan"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {isScanning || isAnalyzing
                        ? "Mohon tunggu sebentar"
                        : "Posisikan wajah di dalam frame"}
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
                  onClick={toggleCamera}
                  disabled={isAnalyzing || isLoading}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <FlipHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleScan}
                  disabled={isAnalyzing || isLoading}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border-4 border-yellow-400/30 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAnalyzing || isLoading ? (
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-black animate-spin" />
                  ) : (
                    <Camera size={28} className="text-black" />
                  )}
                  {!isAnalyzing && !isLoading && isCameraReady && !analisisResult && (
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                  )}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={resetCamera}
                  disabled={isAnalyzing || isLoading}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </motion.button>
              </div>

              <div className="flex justify-center gap-6 sm:gap-10 mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400">
                <span>Ganti</span>
                <span className="text-yellow-400 font-medium">
                  {isAnalyzing ? "Menganalisis..." : isLoading ? "Memuat..." : analisisResult ? "Hasil Siap ✅" : "Ambil Foto"}
                </span>
                <span>Reset</span>
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
                <h3 className="font-semibold text-sm sm:text-base">Hasil Analisis AI + Generate Gambar</h3>
              </div>
              <ul className="space-y-2 text-xs sm:text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-xs mt-0.5">•</span>
                  <span>AI menganalisis foto wajah Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-xs mt-0.5">•</span>
                  <span>Menghasilkan gambar potongan rambut baru pada diri Anda</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-400 text-xs mt-0.5">•</span>
                  <span>3 rekomendasi + deskripsi & tips perawatan</span>
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
                      Data tidak disimpan di server
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
                      Analisis & generate dalam &lt; 45 detik
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
                className={`w-2 h-2 rounded-full ${isCameraReady ? "bg-green-400" : "bg-gray-600"}`}
              ></div>
              <span>Kamera: {isCameraReady ? "Aktif" : "Nonaktif"}</span>
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
                  <span>Gambar AI Siap</span>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}