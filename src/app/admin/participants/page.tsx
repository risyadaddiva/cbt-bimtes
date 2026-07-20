"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Upload, Search, Edit2, Trash2, KeyRound, CheckCircle, XCircle } from "lucide-react";
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

export default function ParticipantsPage() {
  const [participants, setParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [importModal, setImportModal] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Edit and password check states
  const [editParticipant, setEditParticipant] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: "", school: "", track: "MIPA" });
  const [viewPasswordParticipant, setViewPasswordParticipant] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const fetchParticipants = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), search });
      const res = await fetch("/api/admin/participants?" + params.toString());
      const data = await res.json();
      if (data.success) {
        setParticipants(data.data);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error("Gagal mengambil data peserta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchParticipants(), 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch("/api/admin/participants/" + deleteId, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Peserta dinonaktifkan");
        fetchParticipants();
      } else {
        toast.error("Gagal menghapus peserta");
      }
    } catch {
      toast.error("Gagal menghapus peserta");
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
      const res = await fetch("/api/admin/participants", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        toast.success(
          "Berhasil mengimpor " + data.data.created + " peserta",
          { id: "import" }
        );
        setImportModal(false);
        setFile(null);
        fetchParticipants();
      } else {
        toast.error(data.error || "Gagal mengimpor", { id: "import" });
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan", { id: "import" });
    }
  };

  const handleOpenEdit = (p: any) => {
    setEditParticipant(p);
    setEditForm({
      name: p.name || "",
      school: p.school || "",
      track: p.track || "MIPA",
    });
  };

  const handleUpdateParticipant = async () => {
    if (!editParticipant) return;
    try {
      const res = await fetch(`/api/admin/participants/${editParticipant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Data peserta berhasil diubah");
        setEditParticipant(null);
        fetchParticipants();
      } else {
        toast.error(data.error || "Gagal mengubah data peserta");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  const handleUpdatePassword = async () => {
    if (!viewPasswordParticipant || !newPassword.trim()) return;
    try {
      const res = await fetch(`/api/admin/participants/${viewPasswordParticipant.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Password peserta berhasil diubah");
        setViewPasswordParticipant({
          ...viewPasswordParticipant,
          plainPassword: newPassword,
        });
        setNewPassword("");
        fetchParticipants();
      } else {
        toast.error(data.error || "Gagal mengubah password");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Daftar Peserta</h1>
          <p className="text-muted-foreground mt-1">
            Kelola akun dan data peserta ujian
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setImportModal(true)}
            className="gap-2"
          >
            <Upload className="w-4 h-4" /> Import Excel
          </Button>
          <Link href="/admin/participants/new">
            <Button className="bg-[#0F52BA] hover:bg-blue-800 text-white gap-2">
              <Plus className="w-4 h-4" /> Tambah Peserta
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, username, atau sekolah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium">Nama / Username</th>
                <th className="px-6 py-4 font-medium">Asal Sekolah</th>
                <th className="px-6 py-4 font-medium">Jalur</th>
                <th className="px-6 py-4 font-medium">Status Ujian</th>
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
              ) : participants.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Tidak ada data peserta ditemukan.
                  </td>
                </tr>
              ) : (
                participants.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">
                        {p.name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {p.user?.username}
                      </div>
                    </td>
                    <td className="px-6 py-4">{p.school}</td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          p.track === "MIPA"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }
                      >
                        {p.track}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {p.examSessions?.[0]?.status === "SUBMITTED" ? (
                        <span className="flex items-center text-green-600 text-xs font-medium">
                          <CheckCircle className="w-3 h-3 mr-1" /> Selesai
                        </span>
                      ) : p.examSessions?.[0]?.status === "IN_PROGRESS" ? (
                        <span className="flex items-center text-amber-600 text-xs font-medium">
                          <CheckCircle className="w-3 h-3 mr-1" /> Sedang Ujian
                        </span>
                      ) : !p.user?.isActive ? (
                        <span className="flex items-center text-red-600 text-xs font-medium">
                          <XCircle className="w-3 h-3 mr-1" /> Nonaktif
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Belum Mulai
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600"
                          title="Cek / Reset Password"
                          onClick={() => setViewPasswordParticipant(p)}
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-amber-600"
                          title="Edit"
                          onClick={() => handleOpenEdit(p)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Nonaktifkan"
                          onClick={() => setDeleteId(p.id)}
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
          <div className="p-4 border-t border-border flex items-center justify-between">
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
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nonaktifkan Peserta?</DialogTitle>
            <DialogDescription>
              Tindakan ini akan menonaktifkan akun peserta. Data ujian yang sudah
              selesai tetap akan disimpan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Ya, Nonaktifkan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importModal} onOpenChange={setImportModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Peserta via Excel</DialogTitle>
            <DialogDescription>
              Upload file Excel (.xlsx) dengan kolom: username, password, nama,
              sekolah, jalur, telepon
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportModal(false)}>
              Batal
            </Button>
            <Button
              onClick={handleImport}
              disabled={!file}
              className="bg-[#0F52BA] text-white"
            >
              Import Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Participant Dialog */}
      <Dialog open={!!editParticipant} onOpenChange={(open) => !open && setEditParticipant(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Informasi Peserta</DialogTitle>
            <DialogDescription>
              Ubah nama, asal sekolah, atau kelompok/jalur ujian peserta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nama Lengkap</label>
              <Input
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Nama Lengkap"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Asal Sekolah</label>
              <Input
                value={editForm.school}
                onChange={(e) => setEditForm({ ...editForm, school: e.target.value })}
                placeholder="Asal Sekolah"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kelompok / Jalur</label>
              <select
                value={editForm.track}
                onChange={(e) => setEditForm({ ...editForm, track: e.target.value as any })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="MIPA">MIPA</option>
                <option value="SOSHUM">SOSHUM</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditParticipant(null)}>
              Batal
            </Button>
            <Button onClick={handleUpdateParticipant} className="bg-[#0F52BA] text-white">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Check / Reset Dialog */}
      <Dialog open={!!viewPasswordParticipant} onOpenChange={(open) => {
        if (!open) {
          setViewPasswordParticipant(null);
          setNewPassword("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cek & Reset Password</DialogTitle>
            <DialogDescription>
              Berikut detail akun login peserta atau ubah password baru di bawah ini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-muted/50 p-4 rounded-xl space-y-2.5 text-sm border border-border">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Username:</span>
                <span className="font-semibold text-foreground bg-muted px-2 py-0.5 rounded font-mono">
                  {viewPasswordParticipant?.user?.username || viewPasswordParticipant?.username}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Password Saat Ini:</span>
                <span className="font-bold text-blue-700 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded font-mono text-base">
                  {viewPasswordParticipant?.plainPassword || "— (Silakan ubah password di bawah)"}
                </span>
              </div>
            </div>
            <div className="space-y-2 border-t border-border pt-4">
              <label className="text-sm font-medium text-amber-700 dark:text-amber-400">Ubah Password Baru</label>
              <Input
                type="text"
                placeholder="Ketik password baru minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setViewPasswordParticipant(null);
              setNewPassword("");
            }}>
              Tutup
            </Button>
            {newPassword.trim().length >= 6 && (
              <Button onClick={handleUpdatePassword} className="bg-amber-600 text-white hover:bg-amber-700">
                Simpan Password Baru
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
