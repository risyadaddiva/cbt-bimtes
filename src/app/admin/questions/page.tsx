"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Upload, Search, Edit2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { CATEGORY_LABELS } from "@/lib/randomize";

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  MIPA: "bg-blue-50 text-blue-700 border-blue-200",
  SOSHUM: "bg-rose-50 text-rose-700 border-rose-200",
  WAWASAN_KEBANGSAAN: "bg-green-50 text-green-700 border-green-200",
  LITERASI: "bg-yellow-50 text-yellow-700 border-yellow-200",
  TES_SKOLASTIK: "bg-red-50 text-red-700 border-red-200",
  KEAGAMAAN: "bg-purple-50 text-purple-700 border-purple-200",
};

export default function QuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importModal, setImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        search,
        category,
      });
      const res = await fetch("/api/admin/questions?" + params.toString());
      const data = await res.json();
      if (data.success) {
        setQuestions(data.data);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error("Gagal mengambil data soal");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => fetchQuestions(), 500);
    return () => clearTimeout(delayDebounce);
  }, [search, category, page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch("/api/admin/questions/" + deleteId, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Soal berhasil dihapus");
        fetchQuestions();
      } else {
        toast.error("Gagal menghapus soal");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    } finally {
      setDeleteId(null);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      toast.loading("Mengimpor data...", { id: "import" });
      const res = await fetch("/api/admin/questions", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Berhasil mengimpor " + data.data.created + " soal", {
          id: "import",
        });
        setImportModal(false);
        setFile(null);
        fetchQuestions();
      } else {
        toast.error(data.error || "Gagal mengimpor", { id: "import" });
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan", { id: "import" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bank Soal</h1>
          <p className="text-muted-foreground mt-1">Kelola daftar soal ujian</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setImportModal(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" /> Import Excel
          </Button>
          <Link href="/admin/questions/new">
            <Button className="bg-[#0F52BA] hover:bg-blue-800 text-white gap-2">
              <Plus className="w-4 h-4" /> Tambah Soal
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari teks soal..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="flex h-10 w-full sm:w-64 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Semua Kategori</option>
            {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
              <option key={val} value={val}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium w-16">No</th>
                <th className="px-6 py-4 font-medium">Soal</th>
                <th className="px-6 py-4 font-medium">Kategori</th>
                <th className="px-6 py-4 font-medium">Kesulitan</th>
                <th className="px-6 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : questions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Tidak ada soal ditemukan.
                  </td>
                </tr>
              ) : (
                questions.map((q, i) => (
                  <tr key={q.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 text-muted-foreground">
                      {(page - 1) * 20 + i + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div
                        className="line-clamp-2"
                        dangerouslySetInnerHTML={{ __html: q.text }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          CATEGORY_BADGE_COLORS[q.category] ||
                          "bg-gray-50 text-gray-700"
                        }
                      >
                        {CATEGORY_LABELS[
                          q.category as keyof typeof CATEGORY_LABELS
                        ] || q.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">Level {q.difficulty}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={"/admin/questions/" + q.id}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-amber-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600"
                          onClick={() => setDeleteId(q.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <Dialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Soal?</DialogTitle>
            <DialogDescription>
              Soal ini akan disembunyikan dari sistem (soft delete).
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importModal} onOpenChange={setImportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Soal via Excel</DialogTitle>
            <DialogDescription>
              Format kolom: kategori, soal, pilihan_A, pilihan_B, pilihan_C,
              pilihan_D, pilihan_E, jawaban_benar, penjelasan
            </DialogDescription>
          </DialogHeader>
          <Input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportModal(false)}>
              Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file}
              className="bg-[#0F52BA] text-white"
            >
              Import Soal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
