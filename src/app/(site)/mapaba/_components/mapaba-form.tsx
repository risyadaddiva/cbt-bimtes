"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, Loader2, Upload, X, ImageIcon } from "lucide-react";

interface Jurusan {
  id: string;
  nama: string;
  fakultasId: string;
}

interface Fakultas {
  id: string;
  nama: string;
  jurusans: Jurusan[];
}

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

export default function MapabaForm({
  fakultasList,
}: {
  fakultasList: Fakultas[];
}) {
  const [formData, setFormData] = useState({
    nama: "",
    fakultasId: "",
    jurusanId: "",
    semester: "",
    jenisKelamin: "",
    asalSekolah: "",
    isPesantren: false,
    namaPesantren: "",
    motivasi: "",
    alamat: "",
    nomorTelepon: "",
  });
  const [filteredJurusans, setFilteredJurusans] = useState<Jurusan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Upload bukti bayar
  const [buktiBayar, setBuktiBayar] = useState<File | null>(null);
  const [buktiBayarPreview, setBuktiBayarPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (formData.fakultasId) {
      const selectedFakultas = fakultasList.find(
        (f) => f.id === formData.fakultasId,
      );
      setFilteredJurusans(selectedFakultas?.jurusans || []);
      setFormData((prev) => ({ ...prev, jurusanId: "" }));
    } else {
      setFilteredJurusans([]);
    }
  }, [formData.fakultasId, fakultasList]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setFileError("");

    if (!file) {
      setBuktiBayar(null);
      setBuktiBayarPreview(null);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError("Ukuran file terlalu besar. Maksimal 1MB.");
      setBuktiBayar(null);
      setBuktiBayarPreview(null);
      e.target.value = "";
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowed.includes(file.type)) {
      setFileError("Format file harus JPG, PNG, atau WebP.");
      setBuktiBayar(null);
      setBuktiBayarPreview(null);
      e.target.value = "";
      return;
    }

    setBuktiBayar(file);
    const reader = new FileReader();
    reader.onload = (ev) => setBuktiBayarPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setBuktiBayar(null);
    setBuktiBayarPreview(null);
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));
      if (buktiBayar) fd.append("buktiBayar", buktiBayar);

      const res = await fetch("/api/site/mapaba", {
        method: "POST",
        body: fd,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Terjadi kesalahan");
        return;
      }

      setSuccess(true);
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(false);
    setFormData({
      nama: "",
      fakultasId: "",
      jurusanId: "",
      semester: "",
      jenisKelamin: "",
      asalSekolah: "",
      isPesantren: false,
      namaPesantren: "",
      motivasi: "",
      alamat: "",
      nomorTelepon: "",
    });
    setBuktiBayar(null);
    setBuktiBayarPreview(null);
    setFileError("");
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Pendaftaran Berhasil!
        </h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Terima kasih telah mendaftar MAPABA PK PMII UIN Sunan Gunung Djati
          Bandung. Data Anda telah kami terima dan akan segera diproses.
        </p>
        <Button
          onClick={resetForm}
          variant="outline"
          className="border-pmii-blue text-pmii-blue hover:bg-blue-50"
        >
          Daftar Lagi
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Nama */}
      <div className="space-y-2">
        <Label htmlFor="nama" className="text-sm font-semibold text-gray-700">
          Nama Lengkap <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nama"
          value={formData.nama}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nama: e.target.value }))
          }
          placeholder="Masukin nama lengkap"
          required
          className="h-11"
        />
      </div>

      {/* Fakultas & Jurusan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="fakultas"
            className="text-sm font-semibold text-gray-700"
          >
            Fakultas <span className="text-red-500">*</span>
          </Label>
          <select
            id="fakultas"
            value={formData.fakultasId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, fakultasId: e.target.value }))
            }
            required
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Pilih Fakultas</option>
            {fakultasList.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nama}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="jurusan"
            className="text-sm font-semibold text-gray-700"
          >
            Jurusan <span className="text-red-500">*</span>
          </Label>
          <select
            id="jurusan"
            value={formData.jurusanId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, jurusanId: e.target.value }))
            }
            required
            disabled={!formData.fakultasId}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">
              {formData.fakultasId
                ? "Pilih Jurusan"
                : "Pilih fakultas terlebih dahulu"}
            </option>
            {filteredJurusans.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nama}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Semester & Jenis Kelamin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label
            htmlFor="semester"
            className="text-sm font-semibold text-gray-700"
          >
            Semester <span className="text-red-500">*</span>
          </Label>
          <select
            id="semester"
            value={formData.semester}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, semester: e.target.value }))
            }
            required
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Pilih Semester</option>
            {Array.from({ length: 5 }, (_, i) => i + 1).map((s) => (
              <option key={s} value={s}>
                Semester {s}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">
            Jenis Kelamin <span className="text-red-500">*</span>
          </Label>
          <div className="flex gap-6 h-11 items-center">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="jenisKelamin"
                value="Laki-laki"
                checked={formData.jenisKelamin === "Laki-laki"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    jenisKelamin: e.target.value,
                  }))
                }
                required
                className="w-4 h-4 accent-pmii-blue"
              />
              <span className="text-sm text-gray-700">Laki-laki</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="jenisKelamin"
                value="Perempuan"
                checked={formData.jenisKelamin === "Perempuan"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    jenisKelamin: e.target.value,
                  }))
                }
                className="w-4 h-4 accent-pmii-blue"
              />
              <span className="text-sm text-gray-700">Perempuan</span>
            </label>
          </div>
        </div>
      </div>

      {/* Asal Sekolah & Pesantren */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200/80">
        <div className="space-y-2">
          <Label
            htmlFor="asalSekolah"
            className="text-sm font-semibold text-gray-700"
          >
            Asal Sekolah (SMA / MA / SMK)
          </Label>
          <Input
            id="asalSekolah"
            value={formData.asalSekolah}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, asalSekolah: e.target.value }))
            }
            placeholder="Contoh: SMAN 1 Bandung / MAN 2 Kota Bandung"
            className="h-11 bg-white"
          />
        </div>

        <div className="space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              id="isPesantren"
              checked={formData.isPesantren}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  isPesantren: e.target.checked,
                  namaPesantren: e.target.checked ? prev.namaPesantren : "",
                }))
              }
              className="w-4 h-4 rounded text-pmii-blue focus:ring-pmii-blue border-gray-300 accent-pmii-blue"
            />
            <span className="text-sm font-medium text-gray-800">
              Pernah / Sedang Menjadi Santri Pondok Pesantren
            </span>
          </label>

          {formData.isPesantren && (
            <div className="space-y-2 pt-1 transition-all">
              <Label
                htmlFor="namaPesantren"
                className="text-sm font-semibold text-gray-700"
              >
                Nama Pondok Pesantren <span className="text-red-500">*</span>
              </Label>
              <Input
                id="namaPesantren"
                value={formData.namaPesantren}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    namaPesantren: e.target.value,
                  }))
                }
                placeholder="Masukin nama pondok pesantren"
                required={formData.isPesantren}
                className="h-11 bg-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Motivasi */}
      <div className="space-y-2">
        <Label
          htmlFor="motivasi"
          className="text-sm font-semibold text-gray-700"
        >
          Motivasi Mengikuti MAPABA
        </Label>
        <Textarea
          id="motivasi"
          value={formData.motivasi}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, motivasi: e.target.value }))
          }
          placeholder="Ceritain motivasi kamu memilih dan mengikuti MAPABA PMII..."
          rows={3}
        />
      </div>

      {/* Alamat */}
      <div className="space-y-2">
        <Label htmlFor="alamat" className="text-sm font-semibold text-gray-700">
          Alamat <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="alamat"
          value={formData.alamat}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, alamat: e.target.value }))
          }
          placeholder="Masukin alamat lengkap"
          required
          rows={3}
        />
      </div>

      {/* Nomor Telepon */}
      <div className="space-y-2">
        <Label
          htmlFor="nomorTelepon"
          className="text-sm font-semibold text-gray-700"
        >
          Nomor Telepon / WhatsApp aktif <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nomorTelepon"
          type="tel"
          value={formData.nomorTelepon}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nomorTelepon: e.target.value }))
          }
          placeholder="08xxxxxxxxxx"
          required
          className="h-11"
        />
      </div>

      {/* Bukti Pembayaran */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold text-gray-700">
          Bukti Pembayaran{" "}
          <span className="text-xs font-normal text-gray-500">
            (Opsional, maks. 1MB — JPG/PNG/WebP)
          </span>
        </Label>

        {buktiBayarPreview ? (
          <div className="relative rounded-xl overflow-hidden border-2 border-dashed border-pmii-blue/40 bg-blue-50/30">
            <img
              src={buktiBayarPreview}
              alt="Preview bukti pembayaran"
              className="w-full max-h-56 object-contain"
            />
            <button
              type="button"
              onClick={handleRemoveFile}
              className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md transition-colors"
              title="Hapus foto"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="px-3 py-2 bg-white/80 border-t border-gray-200 text-xs text-gray-600 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {buktiBayar?.name} — {((buktiBayar?.size || 0) / 1024).toFixed(0)} KB
            </div>
          </div>
        ) : (
          <label
            htmlFor="buktiBayar"
            className="flex flex-col items-center justify-center w-full h-36 rounded-xl border-2 border-dashed border-gray-300 hover:border-pmii-blue/60 bg-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors"
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500">
              Klik untuk unggah foto bukti bayar
            </span>
            <span className="text-xs text-gray-400 mt-1">
              JPG, PNG, WebP · Maks. 1MB
            </span>
            <input
              ref={fileInputRef}
              id="buktiBayar"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        )}

        {fileError && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <X className="w-3.5 h-3.5" />
            {fileError}
          </p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-base font-bold bg-pmii-blue hover:bg-pmii-blue/90 text-white rounded-lg"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Mengirim...
          </>
        ) : (
          "Daftar MAPABA"
        )}
      </Button>
    </form>
  );
}
