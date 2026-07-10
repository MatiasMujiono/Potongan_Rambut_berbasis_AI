// app/admin/hairmodel/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Scissors,
  Plus,
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";

type Hairstyle = {
  id: string;
  modelrambut: string;
  images: string;
  spesifikasi: any;
  createdAt: string;
  updatedAt: string;
};

export default function HairModelAdminPage() {
  const router = useRouter();
  const [hairstyles, setHairstyles] = useState<Hairstyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    fetchHairstyles();
  }, [currentPage, searchQuery]);

  const fetchHairstyles = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/admin/hairstyle?page=${currentPage}&limit=10&search=${searchQuery}`,
      );
      const result = await response.json();

      if (result.success) {
        setHairstyles(result.data);
        setTotalPages(result.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching hairstyles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/hairstyle/${id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (result.success) {
        setHairstyles(hairstyles.filter((item) => item.id !== id));
        setShowDeleteModal(false);
        alert("Model rambut berhasil dihapus!");
      }
    } catch (error) {
      console.error("Error deleting hairstyle:", error);
      alert("Gagal menghapus model rambut");
    }
  };

  const getMatchScore = (spesifikasi: any) => {
    if (spesifikasi && spesifikasi.match) {
      return spesifikasi.match;
    }
    return Math.floor(Math.random() * 30) + 70;
  };

  const getCategory = (spesifikasi: any) => {
    if (spesifikasi && spesifikasi.category) {
      return spesifikasi.category;
    }
    return "Uncategorized";
  };

  const getTagColor = (category: string) => {
    const colors: Record<string, string> = {
      Layer: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
      Classic: "bg-blue-500/10 text-blue-400 border-blue-500/30",
      "Korean Style": "bg-purple-500/10 text-purple-400 border-purple-500/30",
      Short: "bg-green-500/10 text-green-400 border-green-500/30",
      Uncategorized: "bg-gray-500/10 text-gray-400 border-gray-500/30",
    };
    return colors[category] || colors.Uncategorized;
  };

  return (
    <div className="flex min-w-0 flex-1">
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex-1 px-6 py-6 lg:px-8 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight bg-linear-to-r from-white to-white/70 bg-clip-text text-transparent">
              Model Rambut
            </h2>
            <div className="mt-2 flex items-center gap-2 text-sm text-white/45">
              <span>Dashboard</span>
              <span>›</span>
              <span className="text-yellow-400/70">Model Rambut</span>
            </div>
          </div>

          <div className="rounded-3xl border border-white/5 bg-linear-to-br from-[#11161F] to-[#0D121A] p-5 shadow-2xl backdrop-blur-sm">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  Daftar Model Rambut
                  <span className="text-sm font-normal text-white/40">
                    ({hairstyles.length} model)
                  </span>
                </h3>
                <p className="mt-1 text-sm text-white/50">
                  Kelola semua model rambut yang tersedia di sistem.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0D121A]/50 px-4 py-3 text-white/50 transition-all focus-within:border-yellow-500/30 focus-within:shadow-lg focus-within:shadow-yellow-500/5">
                  <Search className="h-4 w-4" />
                  <input
                    placeholder="Cari model rambut..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-55 bg-transparent text-sm outline-none placeholder:text-white/35"
                  />
                </div>

                <button
                  onClick={() => router.push("/admin/hairmodel/create")}
                  className="flex items-center gap-2 rounded-xl bg-linear-to-r from-yellow-500 to-yellow-400 px-5 py-3 text-sm font-semibold text-black transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-yellow-500/25"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Model
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0D121A]/50">
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b border-white/5 bg-white/2 text-left text-white/55">
                    <tr>
                      <th className="px-4 py-4 font-medium">No</th>
                      <th className="px-4 py-4 font-medium">Gambar</th>
                      <th className="px-4 py-4 font-medium">Nama Model</th>
                      <th className="px-4 py-4 font-medium">Kategori</th>
                      <th className="px-4 py-4 font-medium">
                        Kecocokan Rata-rata
                      </th>
                      <th className="px-4 py-4 font-medium">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8">
                          <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                          </div>
                        </td>
                      </tr>
                    ) : hairstyles.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center py-8 text-white/50"
                        >
                          Belum ada data model rambut
                        </td>
                      </tr>
                    ) : (
                      hairstyles.map((item, index) => {
                        const category = getCategory(item.spesifikasi);
                        const match = getMatchScore(item.spesifikasi);
                        return (
                          <tr
                            key={item.id}
                            className="border-b border-white/5 text-white/85 transition-all duration-200 hover:bg-white/3"
                          >
                            <td className="px-4 py-4 text-white/40">
                              {index + 1 + (currentPage - 1) * 10}
                            </td>
                            <td className="px-4 py-4">
                              <div className="relative group">
                                {item.images ? (
                                  <img
                                    src={item.images}
                                    alt={item.modelrambut}
                                    className="h-14 w-14 rounded-xl object-cover transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                                  />
                                ) : (
                                  <div className="h-14 w-14 rounded-xl bg-white/5 flex items-center justify-center">
                                    <Scissors className="h-6 w-6 text-white/30" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-4 font-medium">
                              {item.modelrambut}
                            </td>
                            <td className="px-4 py-4">
                              <span
                                className={`inline-flex rounded-lg border px-3 py-1 text-xs font-medium ${getTagColor(category)}`}
                              >
                                {category}
                              </span>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-20 rounded-full bg-white/10 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-linear-to-r from-green-400 to-green-500 transition-all duration-1000"
                                    style={{ width: `${match}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-green-400 min-w-10">
                                  {match}%
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/admin/hairmodel/update/${item.id}`,
                                    )
                                  }
                                  className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-2 text-yellow-400 transition-all hover:bg-yellow-500/20 hover:scale-110"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedId(item.id);
                                    setShowDeleteModal(true);
                                  }}
                                  className="rounded-lg border border-red-500/30 bg-red-500/10 p-2 text-red-400 transition-all hover:bg-red-500/20 hover:scale-110"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col gap-4 border-t border-white/5 px-4 py-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
                <p>
                  Menampilkan 1 - {hairstyles.length} dari {hairstyles.length}{" "}
                  data
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`grid h-9 w-9 place-items-center rounded-lg transition-all hover:scale-105 ${
                          currentPage === page
                            ? "bg-yellow-500 font-semibold text-black"
                            : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10"
                        }`}
                      >
                        {page}
                      </button>
                    ),
                  )}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-all hover:bg-white/10 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#11161F] p-6 shadow-2xl">
            <h3 className="text-xl font-semibold text-white">
              Hapus Model Rambut
            </h3>
            <p className="mt-2 text-sm text-white/60">
              Apakah Anda yakin ingin menghapus model rambut ini? Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-3 font-medium text-white/80 transition-all hover:bg-white/5"
              >
                Batal
              </button>
              <button
                onClick={() => selectedId && handleDelete(selectedId)}
                className="flex-1 rounded-xl bg-red-500 px-4 py-3 font-semibold text-white transition-all hover:bg-red-600"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
