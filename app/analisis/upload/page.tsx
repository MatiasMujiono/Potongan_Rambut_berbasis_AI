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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploaded, setIsUploaded] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const handleFileSelect = (file: File) => {
    // Validasi tipe file
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      alert("Format file tidak didukung. Gunakan JPG, PNG, atau WEBP.");
      return;
    }

    // Validasi ukuran file (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Ukuran file terlalu besar. Maksimal 10MB.");
      return;
    }

    setSelectedFile(file);
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
    // Simulasi upload
    await new Promise((resolve) => setTimeout(resolve, 3000));
    setIsUploading(false);
    setIsUploaded(true);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsUploaded(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReset = () => {
    handleRemoveFile();
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#1A0A0A] text-white">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-yellow-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        {/* Back Button & Header */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.button
            onClick={() => router.push("/")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </motion.button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">
              <span className="bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Upload Foto
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Upload foto wajah Anda untuk analisis AI
            </p>
          </div>
        </motion.div>

        {/* Upload Area */}
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          className="relative"
        >
          {!previewUrl ? (
            // Drop Zone
            <div
              onDragEnter={() => setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`
                relative rounded-3xl border-2 border-dashed p-12 sm:p-16 text-center
                transition-all duration-300 cursor-pointer
                ${
                  dragActive
                    ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/20"
                    : "border-white/10 bg-white/5 hover:border-yellow-400/50 hover:bg-white/10"
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
                className="flex justify-center mb-6"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-yellow-400/20 rounded-2xl blur-2xl"></div>
                  <div className="relative bg-yellow-400/10 p-6 rounded-2xl border border-yellow-400/20">
                    <Upload
                      className="w-16 h-16 text-yellow-400"
                      strokeWidth={1.5}
                    />
                  </div>
                </div>
              </motion.div>

              <h3 className="text-xl font-semibold mb-2">
                {dragActive ? "Lepaskan untuk upload" : "Upload Foto Wajah"}
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                {dragActive
                  ? "File siap diupload"
                  : "Drag & drop foto Anda di sini atau klik untuk memilih"}
              </p>
              <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  JPG, PNG, WEBP
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  Maks. 10MB
                </span>
                <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
                  Resolusi minimal 500x500px
                </span>
              </div>
            </div>
          ) : (
            // Preview Area
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-3xl border border-white/10 bg-linear-to-b from-[#141414] to-[#111111] p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  <span className="text-sm font-medium text-white">
                    {selectedFile?.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {(selectedFile!.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemoveFile}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 transition-colors"
                  >
                    <X className="w-4 h-4 text-gray-400 hover:text-red-400" />
                  </motion.button>
                </div>
              </div>

              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden bg-black/30 border border-white/5">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-100 object-contain"
                />
                {isUploaded && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center"
                  >
                    <div className="text-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-3" />
                      </motion.div>
                      <h3 className="text-xl font-semibold text-white">
                        Upload Berhasil!
                      </h3>
                      <p className="text-gray-400 text-sm mt-1">
                        Foto Anda siap untuk dianalisis
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                {!isUploaded ? (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="flex-1 relative overflow-hidden rounded-xl bg-linear-to-r from-yellow-400 to-yellow-500 py-4 font-semibold text-black transition-all hover:shadow-lg hover:shadow-yellow-400/30 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Upload & Analisis
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleRemoveFile}
                      className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      Ganti Foto
                    </motion.button>
                  </>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 relative overflow-hidden rounded-xl bg-linear-to-r from-yellow-400 to-yellow-500 py-4 font-semibold text-black transition-all hover:shadow-lg hover:shadow-yellow-400/30"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Mulai Analisis
                      </span>
                      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700"></div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleReset}
                      className="px-6 py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                      Upload Lagi
                    </motion.button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Tips & Information */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 grid gap-4 sm:grid-cols-2"
        >
          {/* Tips Card */}
          <div className="rounded-2xl border border-white/5 bg-linear-to-b from-[#141414] to-[#111111] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold">Tips Foto Terbaik</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-400">
              {[
                "Pastikan wajah terlihat jelas dan tidak terhalang",
                "Gunakan pencahayaan yang cukup dan merata",
                "Posisi wajah menghadap langsung ke kamera",
                "Hindari penggunaan topi, kacamata, atau masker",
                "Ekspresi wajah netral untuk hasil terbaik",
              ].map((tip, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-yellow-400 text-xs mt-1">•</span>
                  <span>{tip}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Info Card */}
          <div className="rounded-2xl border border-white/5 bg-linear-to-b from-[#141414] to-[#111111] p-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-yellow-400" />
              <h3 className="font-semibold">Informasi Penting</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Shield className="w-4 h-4 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Privasi Terjamin
                  </p>
                  <p className="text-xs text-gray-500">
                    Foto Anda aman dan tidak akan disimpan
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Clock className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">Proses Cepat</p>
                  <p className="text-xs text-gray-500">
                    Analisis selesai dalam &lt; 30 detik
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <Zap className="w-4 h-4 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    Akurasi Tinggi
                  </p>
                  <p className="text-xs text-gray-500">
                    Didukung oleh AI canggih
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Requirements */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-gray-500"
        >
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span>Format: JPG, PNG, WEBP</span>
          </div>
          <div className="w-px h-3 bg-gray-700"></div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span>Maksimal: 10MB</span>
          </div>
          <div className="w-px h-3 bg-gray-700"></div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span>Resolusi: Minimal 500x500px</span>
          </div>
          <div className="w-px h-3 bg-gray-700"></div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span>100% Private & Secure</span>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
