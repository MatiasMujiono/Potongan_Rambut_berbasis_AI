// app/admin/hairmodel/create/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Plus, Trash2 } from "lucide-react";

type SpesifikasiItem = {
  key: string;
  value: string;
};

export default function CreateHairModelPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    modelrambut: "",
  });
  const [spesifikasiItems, setSpesifikasiItems] = useState<SpesifikasiItem[]>([
    { key: "category", value: "Layer" },
    { key: "match", value: "95" },
    { key: "gender", value: "universal" },
    { key: "best_for", value: '["formal", "casual"]' },
  ]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  const addSpesifikasiItem = () => {
    setSpesifikasiItems([...spesifikasiItems, { key: "", value: "" }]);
  };

  const removeSpesifikasiItem = (index: number) => {
    setSpesifikasiItems(spesifikasiItems.filter((_, i) => i !== index));
  };

  const updateSpesifikasiItem = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const newItems = [...spesifikasiItems];
    newItems[index][field] = value;
    setSpesifikasiItems(newItems);
  };

  const buildSpesifikasiObject = () => {
    const obj: any = {};
    spesifikasiItems.forEach((item) => {
      if (item.key.trim()) {
        try {
          // Coba parse value sebagai JSON
          obj[item.key] = JSON.parse(item.value);
        } catch {
          // Jika bukan JSON, simpan sebagai string
          obj[item.key] = item.value;
        }
      }
    });
    return obj;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.modelrambut) {
      alert("Nama model rambut wajib diisi!");
      return;
    }

    if (!selectedFile) {
      alert("Silakan upload gambar model rambut!");
      return;
    }

    try {
      setLoading(true);

      // Upload file first
      const uploadFormData = new FormData();
      uploadFormData.append("file", selectedFile);

      const uploadResponse = await fetch("/api/admin/hairstyle/upload", {
        method: "POST",
        body: uploadFormData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResult.success) {
        throw new Error(uploadResult.error || "Gagal upload gambar");
      }

      // Build spesifikasi object
      const spesifikasi = buildSpesifikasiObject();

      // Create hairstyle with image path
      const response = await fetch("/api/admin/hairstyle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelrambut: formData.modelrambut,
          images: uploadResult.filePath,
          spesifikasi,
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert("Model rambut berhasil ditambahkan!");
        router.push("/admin/hairmodel");
      } else {
        throw new Error(result.error || "Gagal menambahkan model rambut");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error instanceof Error ? error.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A0A0A] via-[#0D0D0D] to-[#1A0A0A] text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push("/admin/hairmodel")}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
              Tambah Model Rambut
            </h1>
            <p className="text-sm text-white/50 mt-1">
              Upload gambar dan lengkapi informasi model rambut baru
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-white/5 bg-linear-to-br from-[#11161F] to-[#0D121A] p-6 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nama Model */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Nama Model <span className="text-red-400">*</span>
              </label>
              <input
                required
                value={formData.modelrambut}
                onChange={(e) =>
                  setFormData({ ...formData, modelrambut: e.target.value })
                }
                placeholder="Contoh: Wolf Cut"
                className="w-full rounded-xl border border-white/10 bg-[#0D121A]/50 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition-all focus:border-yellow-500/40 focus:shadow-lg focus:shadow-yellow-500/5"
              />
            </div>

            {/* Upload Gambar */}
            <div>
              <label className="mb-2 block text-sm font-medium text-white/80">
                Gambar Model <span className="text-red-400">*</span>
              </label>
              <div
                className={`relative rounded-2xl border-2 border-dashed transition-all ${
                  dragActive
                    ? "border-yellow-500/70 bg-yellow-500/10"
                    : "border-white/15 bg-[#0D121A]/50"
                } ${previewUrl ? "p-2" : "p-8"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full max-h-96 object-contain rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 rounded-full transition-all"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/5 text-white/70">
                      <Upload className="h-8 w-8" />
                    </div>
                    <p className="text-sm text-white/80">
                      Drag & drop gambar di sini
                    </p>
                    <p className="mt-1 text-sm text-white/50">
                      atau klik untuk memilih file
                    </p>
                    <p className="mt-3 text-xs text-white/30">
                      Format: JPG, PNG, WebP, Maks: 2MB
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Spesifikasi */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/80">
                  Spesifikasi
                </label>
                <button
                  type="button"
                  onClick={addSpesifikasiItem}
                  className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Spesifikasi
                </button>
              </div>

              <div className="space-y-3">
                {spesifikasiItems.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={item.key}
                      onChange={(e) =>
                        updateSpesifikasiItem(index, "key", e.target.value)
                      }
                      placeholder="Key (contoh: category)"
                      className="flex-1 rounded-xl border border-white/10 bg-[#0D121A]/50 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition-all focus:border-yellow-500/40 focus:shadow-lg focus:shadow-yellow-500/5"
                    />
                    <input
                      type="text"
                      value={item.value}
                      onChange={(e) =>
                        updateSpesifikasiItem(index, "value", e.target.value)
                      }
                      placeholder="Value (contoh: Layer atau 95)"
                      className="flex-[2] rounded-xl border border-white/10 bg-[#0D121A]/50 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 transition-all focus:border-yellow-500/40 focus:shadow-lg focus:shadow-yellow-500/5"
                    />
                    {spesifikasiItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpesifikasiItem(index)}
                        className="p-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all hover:scale-110"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <p className="mt-2 text-xs text-white/40">
                Tips: Value bisa berupa string, number, atau JSON array (contoh:
                ["formal", "casual"])
              </p>

              {/* Preview Spesifikasi */}
              {spesifikasiItems.some((item) => item.key.trim()) && (
                <div className="mt-3 p-4 rounded-xl bg-green-500/10 border border-green-500/20">
                  <p className="text-xs text-green-400 font-medium mb-1">
                    ✓ Preview Spesifikasi
                  </p>
                  <div className="text-xs text-white/60 font-mono">
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(buildSpesifikasiObject(), null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-white/5">
              <button
                type="button"
                onClick={() => router.push("/admin/hairmodel")}
                className="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-3 font-medium text-white/80 transition-all hover:bg-white/5 hover:scale-[1.02]"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-xl bg-linear-to-r from-yellow-500 to-yellow-400 px-4 py-3 font-semibold text-black transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
