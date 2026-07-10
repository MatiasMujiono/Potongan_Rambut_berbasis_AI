"use client";

import {
  Camera,
  RotateCcw,
  Zap,
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";

export default function ScanPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isModelReady, setIsModelReady] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationRef = useRef<number | null>(null);
  const isDetectingRef = useRef(false);

  // Ref untuk memastikan timestamp yang dikirim ke MediaPipe selalu naik (monotonic).
  // MediaPipe akan throw error kalau timestamp yang dikirim <= timestamp sebelumnya.
  const lastTimestampRef = useRef<number>(-1);

  // Flag untuk menandai proses ganti kamera (facingMode) sedang berlangsung,
  // supaya loop deteksi berhenti sejenak dan tidak memproses frame video yang belum siap.
  const isSwitchingCameraRef = useRef(false);

  // Load MediaPipe Face Landmarker
  useEffect(() => {
    // Guard supaya React StrictMode (dev mode, effect dijalankan 2x) tidak membuat
    // dua instance landmarker / dua promise yang saling menimpa ref.
    let cancelled = false;

    const initializeFaceLandmarker = async () => {
      try {
        console.log("Loading Face Landmarker model...");
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm",
        );

        if (cancelled) return;

        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        if (cancelled) {
          // Effect ini sudah di-cleanup sebelum promise selesai (StrictMode dev double-invoke).
          // Tutup instance yang baru dibuat supaya tidak leak dan tidak dipakai bareng dua loop.
          try {
            landmarker.close();
          } catch (e) {}
          return;
        }

        faceLandmarkerRef.current = landmarker;
        setIsModelReady(true);
        setModelError(null);
        console.log("Face Landmarker loaded!");
      } catch (error) {
        if (cancelled) return;
        console.error("Load error:", error);
        setModelError("Gagal memuat model AI. Refresh halaman.");
        setIsModelReady(false);
      }
    };

    initializeFaceLandmarker();

    return () => {
      cancelled = true;
      if (faceLandmarkerRef.current) {
        try {
          faceLandmarkerRef.current.close();
        } catch (e) {}
        faceLandmarkerRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      isDetectingRef.current = false;
    };
  }, []);

  // Saat facingMode berubah (ganti kamera), pause deteksi sejenak dan reset
  // timestamp acuan supaya tidak terjadi mismatch saat stream video baru mulai.
  useEffect(() => {
    isSwitchingCameraRef.current = true;
    lastTimestampRef.current = -1;
    const timeout = setTimeout(() => {
      isSwitchingCameraRef.current = false;
    }, 400);
    return () => clearTimeout(timeout);
  }, [facingMode]);

  // Face detection loop
  useEffect(() => {
    if (!isCameraReady || !isModelReady || !faceLandmarkerRef.current) {
      return;
    }
    isDetectingRef.current = true;
    lastTimestampRef.current = -1;

    const detectFace = () => {
      try {
        if (!isDetectingRef.current) return;

        const video = webcamRef.current?.video;
        const canvas = canvasRef.current;
        if (!video || !canvas) {
          animationRef.current = requestAnimationFrame(detectFace);
          return;
        }

        const hasValidDimensions =
          video.videoWidth > 0 && video.videoHeight > 0;

        if (
          video.readyState === 4 &&
          hasValidDimensions &&
          !isSwitchingCameraRef.current
        ) {
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            animationRef.current = requestAnimationFrame(detectFace);
            return;
          }
          const w = video.videoWidth;
          const h = video.videoHeight;
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
          // Draw video
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const landmarker = faceLandmarkerRef.current;
          if (!landmarker) {
            animationRef.current = requestAnimationFrame(detectFace);
            return;
          }

          // Pastikan timestamp yang dikirim strictly increasing, syarat wajib MediaPipe VIDEO mode.
          const now = performance.now();
          if (now > lastTimestampRef.current) {
            lastTimestampRef.current = now;
            try {
              const result = landmarker.detectForVideo(video, now);
              if (result.faceLandmarks && result.faceLandmarks.length > 0) {
                setIsFaceDetected(true);
                drawLandmarks(
                  ctx,
                  result.faceLandmarks[0],
                  canvas.width,
                  canvas.height,
                );
              } else {
                setIsFaceDetected(false);
              }
            } catch (err) {
              // Error per frame dari MediaPipe (mis. frame tidak valid) - jangan crash, cukup log & skip.
              console.warn("detectForVideo skipped a frame:", err);
              setIsFaceDetected(false);
            }
          }
        } else if (canvas && video && hasValidDimensions) {
          // Tetap gambar video walau belum deteksi (mis. saat ganti kamera), biar preview tidak freeze.
          const ctx = canvas.getContext("2d");
          if (ctx) {
            const w = video.videoWidth;
            const h = video.videoHeight;
            if (canvas.width !== w || canvas.height !== h) {
              canvas.width = w;
              canvas.height = h;
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          }
        }

        if (isDetectingRef.current) {
          animationRef.current = requestAnimationFrame(detectFace);
        }
      } catch (err) {
        console.error("Loop error:", err);
        if (isDetectingRef.current) {
          animationRef.current = requestAnimationFrame(detectFace);
        }
      }
    };

    detectFace();

    return () => {
      isDetectingRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isCameraReady, isModelReady, facingMode]);

  // Fungsi draw landmarks
  const drawLandmarks = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    width: number,
    height: number,
  ) => {
    if (!landmarks || landmarks.length === 0) return;
    landmarks.forEach((point) => {
      const x = point.x * width;
      const y = point.y * height;
      ctx.beginPath();
      ctx.arc(x, y, 2.5, 0, 2 * Math.PI);
      ctx.fillStyle = "#00FF00";
      ctx.fill();
    });
    drawFaceMesh(ctx, landmarks, width, height);
  };

  const drawFaceMesh = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    width: number,
    height: number,
  ) => {
    if (!landmarks || landmarks.length === 0) return;
    const connections = [
      [33, 133],
      [133, 157],
      [157, 158],
      [158, 159],
      [159, 160],
      [160, 161],
      [161, 246],
      [246, 33],
      [362, 263],
      [263, 387],
      [387, 386],
      [386, 385],
      [385, 384],
      [384, 398],
      [398, 466],
      [466, 362],
      [61, 185],
      [185, 40],
      [40, 39],
      [39, 37],
      [37, 0],
      [0, 267],
      [267, 269],
      [269, 270],
      [270, 409],
      [409, 291],
      [78, 95],
      [95, 88],
      [88, 178],
      [178, 87],
      [87, 14],
      [14, 317],
      [317, 402],
      [402, 318],
      [318, 324],
      [324, 308],
      [1, 2],
      [2, 3],
      [3, 4],
      [4, 5],
      [5, 6],
      [6, 197],
      [197, 195],
      [195, 4],
      [46, 53],
      [53, 52],
      [52, 65],
      [65, 55],
      [55, 70],
      [276, 283],
      [283, 282],
      [282, 295],
      [295, 285],
      [285, 300],
      [10, 338],
      [338, 297],
      [297, 332],
      [332, 284],
      [284, 251],
      [251, 389],
      [389, 356],
      [356, 454],
      [454, 323],
      [323, 361],
      [361, 288],
      [288, 397],
      [397, 365],
      [365, 379],
      [379, 378],
      [378, 400],
      [400, 377],
      [377, 152],
      [152, 148],
      [148, 176],
      [176, 149],
      [149, 150],
      [150, 136],
      [136, 172],
      [172, 58],
      [58, 132],
      [132, 93],
      [93, 234],
      [234, 127],
      [127, 162],
      [162, 21],
      [21, 54],
      [54, 103],
      [103, 67],
      [67, 109],
      [109, 10],
    ];
    ctx.strokeStyle = "#00FF00";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.6;
    connections.forEach(([i1, i2]) => {
      if (i1 < landmarks.length && i2 < landmarks.length) {
        const p1 = landmarks[i1];
        const p2 = landmarks[i2];
        ctx.beginPath();
        ctx.moveTo(p1.x * width, p1.y * height);
        ctx.lineTo(p2.x * width, p2.y * height);
        ctx.stroke();
      }
    });
    ctx.globalAlpha = 1.0;
  };

  // Handle scan
  const handleScan = () => {
    if (!isCameraReady) {
      setIsCameraReady(true);
      return;
    }
    if (!isFaceDetected) return;
    setIsScanning(true);
    setScanProgress(0);
    if (canvasRef.current) {
      const imageSrc = canvasRef.current.toDataURL("image/jpeg");
      setCapturedImage(imageSrc);
      console.log("Foto diambil!");
    }
    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
    setTimeout(() => {
      setIsScanning(false);
      setScanProgress(0);
    }, 3000);
  };

  const toggleCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#1A0A0A] text-white overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-4 sm:py-8 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-8 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
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
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4 text-gray-400" />
            ) : (
              <Maximize2 className="w-4 h-4 text-gray-400" />
            )}
          </button>
        </div>

        {/* Scanner */}
        <div className="relative flex-1 flex items-center justify-center">
          <div
            className={`relative w-full rounded-3xl overflow-hidden bg-linear-to-b from-[#1A1F2B] to-[#11161F] border border-white/5 ${isFullscreen ? "fixed inset-4 z-50 rounded-3xl" : ""} aspect-3/4 sm:aspect-video max-h-[70vh] sm:max-h-[60vh]`}
          >
            <div className="relative w-full h-full">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode,
                  width: { ideal: 720 },
                  height: { ideal: 1280 },
                  aspectRatio: 0.75,
                }}
                className="hidden"
                style={{
                  transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
                }}
              />
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full object-cover"
                style={{
                  transform: facingMode === "user" ? "scaleX(-1)" : "scaleX(1)",
                }}
              />

              {!isModelReady && !modelError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-b from-[#1A1F2B] to-[#11161F]">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent mb-4"></div>
                  <p className="text-gray-400 text-sm">Memuat model AI...</p>
                </div>
              )}
              {modelError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                  <p className="text-red-400 text-sm text-center">
                    {modelError}
                  </p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-4 px-6 py-2 bg-yellow-400 text-black rounded-xl"
                  >
                    Refresh
                  </button>
                </div>
              )}
              {isModelReady && !isCameraReady && !modelError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-linear-to-b from-[#1A1F2B] to-[#11161F]">
                  <Camera className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400 text-sm">Kamera belum aktif</p>
                  <p className="text-gray-500 text-xs mt-1">Klik tombol Scan</p>
                </div>
              )}

              <AnimatePresence>
                {isScanning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center"
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
                      <p className="mt-3 text-white font-medium">
                        Menganalisis wajah...
                      </p>
                      <div className="mt-3 w-48 sm:w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-linear-to-r from-yellow-400 to-yellow-500 rounded-full"
                          animate={{ width: `${scanProgress}%` }}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-400">
                        {scanProgress}%
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Grid & Frame */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute left-1/2 top-0 bottom-0 border border-white/10"></div>
                <div className="absolute top-1/2 left-0 right-0 border border-white/10"></div>
              </div>
              <div className="absolute inset-4 sm:inset-6 pointer-events-none">
                {[
                  { pos: "top-left", rotate: 0 },
                  { pos: "top-right", rotate: 90 },
                  { pos: "bottom-left", rotate: -90 },
                  { pos: "bottom-right", rotate: 180 },
                ].map((corner) => (
                  <div
                    key={corner.pos}
                    className={`absolute ${corner.pos.includes("top") ? "top-0" : "bottom-0"} ${corner.pos.includes("left") ? "left-0" : "right-0"} w-6 h-6 sm:w-8 sm:h-8`}
                    style={{ transform: `rotate(${corner.rotate}deg)` }}
                  >
                    <div className="w-full h-full border-l-4 border-t-4 border-yellow-400 rounded-tl-xl" />
                  </div>
                ))}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-linear-to-r from-transparent via-yellow-400 to-transparent"
                  animate={{
                    top: isScanning
                      ? ["0%", "100%", "0%"]
                      : isCameraReady
                        ? "50%"
                        : "50%",
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: isScanning ? Infinity : 0,
                    ease: "linear",
                  }}
                />
              </div>

              {isCameraReady && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-xl rounded-xl px-3 sm:px-5 py-2 sm:py-3 flex gap-2 sm:gap-3 items-center shadow-xl border border-white/10 pointer-events-none"
                >
                  <motion.div
                    animate={{ scale: isFaceDetected ? [1, 1.2, 1] : 1 }}
                    transition={{
                      duration: 2,
                      repeat: isFaceDetected ? Infinity : 0,
                    }}
                  >
                    {isFaceDetected ? (
                      <CheckCircle2 className="text-green-400" size={16} />
                    ) : (
                      <AlertCircle className="text-yellow-400" size={16} />
                    )}
                  </motion.div>
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-white">
                      {isScanning
                        ? "Sedang scan..."
                        : isFaceDetected
                          ? "Posisi wajah tepat"
                          : "Wajah tidak terdeteksi"}
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {isScanning
                        ? "Tunggu sebentar"
                        : isFaceDetected
                          ? "Siap scan"
                          : "Posisikan wajah di frame"}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-4 sm:p-6">
              <div className="flex justify-center items-center gap-4 sm:gap-6">
                <button
                  onClick={toggleCamera}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center"
                >
                  <FlipHorizontal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                </button>
                <button
                  onClick={handleScan}
                  disabled={isScanning || !isModelReady || !!modelError}
                  className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-br from-yellow-400 to-yellow-500 flex items-center justify-center border-4 border-yellow-400/30 shadow-lg shadow-yellow-400/20 hover:shadow-yellow-400/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isScanning ? (
                    <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-black animate-spin" />
                  ) : (
                    <Camera size={28} className="text-black" />
                  )}
                  {!isScanning && isCameraReady && isFaceDetected && (
                    <div className="absolute inset-0 rounded-full border-2 border-white/20 animate-ping"></div>
                  )}
                </button>
                <button
                  onClick={() => setIsCameraReady(!isCameraReady)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center"
                >
                  {isCameraReady ? (
                    <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-gray-300" />
                  ) : (
                    <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                  )}
                </button>
              </div>
              <div className="flex justify-center gap-8 sm:gap-12 mt-2 sm:mt-3 text-[10px] sm:text-xs text-gray-400">
                <span>Ganti Kamera</span>
                <span className="text-yellow-400 font-medium">
                  {isCameraReady ? "Ambil Foto" : "Mulai Kamera"}
                </span>
                <span>{isCameraReady ? "Matikan" : "Nyalakan"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips - desktop only */}
        <div className="hidden sm:block mt-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-linear-to-b from-[#141414] to-[#111111] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold">Tips Scan</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Pastikan wajah jelas dalam frame</li>
                <li>Gunakan pencahayaan cukup</li>
                <li>Posisi wajah menghadap kamera</li>
                <li>Hindari topi, kacamata, masker</li>
                <li>Ekspresi netral</li>
              </ul>
            </div>
            <div className="rounded-2xl border border-white/5 bg-linear-to-b from-[#141414] to-[#111111] p-6">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-yellow-400" />
                <h3 className="font-semibold">Informasi</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Shield className="w-4 h-4 text-green-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Privasi Terjamin
                    </p>
                    <p className="text-xs text-gray-500">Data aman</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                  <Clock className="w-4 h-4 text-yellow-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-white">
                      Proses Cepat
                    </p>
                    <p className="text-xs text-gray-500">&lt; 30 detik</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${isCameraReady ? "bg-green-400" : "bg-gray-600"}`}
              ></div>
              <span>Kamera: {isCameraReady ? "Aktif" : "Nonaktif"}</span>
            </div>
            <div className="w-px h-3 bg-gray-700"></div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${isFaceDetected ? "bg-green-400" : "bg-yellow-400"}`}
              ></div>
              <span>Wajah: {isFaceDetected ? "Terdeteksi" : "Tidak"}</span>
            </div>
            <div className="w-px h-3 bg-gray-700"></div>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${isModelReady ? "bg-green-400" : "bg-gray-600"}`}
              ></div>
              <span>AI: {isModelReady ? "Siap" : "Memuat"}</span>
            </div>
            <div className="w-px h-3 bg-gray-700"></div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
              <span>100% Private</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Loader2({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
