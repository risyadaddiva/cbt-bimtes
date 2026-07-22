'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Loader2 } from 'lucide-react';

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

export default function MapabaForm({ fakultasList }: { fakultasList: Fakultas[] }) {
  const [formData, setFormData] = useState({
    nama: '',
    fakultasId: '',
    jurusanId: '',
    semester: '',
    jenisKelamin: '',
    alamat: '',
    nomorTelepon: '',
  });
  const [filteredJurusans, setFilteredJurusans] = useState<Jurusan[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (formData.fakultasId) {
      const selectedFakultas = fakultasList.find(f => f.id === formData.fakultasId);
      setFilteredJurusans(selectedFakultas?.jurusans || []);
      setFormData(prev => ({ ...prev, jurusanId: '' }));
    } else {
      setFilteredJurusans([]);
    }
  }, [formData.fakultasId, fakultasList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/site/mapaba', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Terjadi kesalahan');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Terjadi kesalahan jaringan. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Pendaftaran Berhasil!</h2>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Terima kasih telah mendaftar MAPABA PK PMII UIN Sunan Gunung Djati Bandung. 
          Data Anda telah kami terima dan akan segera diproses.
        </p>
        <Button
          onClick={() => { setSuccess(false); setFormData({ nama: '', fakultasId: '', jurusanId: '', semester: '', jenisKelamin: '', alamat: '', nomorTelepon: '' }); }}
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
          onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
          placeholder="Masukkan nama lengkap"
          required
          className="h-11"
        />
      </div>

      {/* Fakultas & Jurusan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fakultas" className="text-sm font-semibold text-gray-700">
            Fakultas <span className="text-red-500">*</span>
          </Label>
          <select
            id="fakultas"
            value={formData.fakultasId}
            onChange={(e) => setFormData(prev => ({ ...prev, fakultasId: e.target.value }))}
            required
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Pilih Fakultas</option>
            {fakultasList.map(f => (
              <option key={f.id} value={f.id}>{f.nama}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jurusan" className="text-sm font-semibold text-gray-700">
            Jurusan <span className="text-red-500">*</span>
          </Label>
          <select
            id="jurusan"
            value={formData.jurusanId}
            onChange={(e) => setFormData(prev => ({ ...prev, jurusanId: e.target.value }))}
            required
            disabled={!formData.fakultasId}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">{formData.fakultasId ? 'Pilih Jurusan' : 'Pilih fakultas terlebih dahulu'}</option>
            {filteredJurusans.map(j => (
              <option key={j.id} value={j.id}>{j.nama}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Semester & Jenis Kelamin */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="semester" className="text-sm font-semibold text-gray-700">
            Semester <span className="text-red-500">*</span>
          </Label>
          <select
            id="semester"
            value={formData.semester}
            onChange={(e) => setFormData(prev => ({ ...prev, semester: e.target.value }))}
            required
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Pilih Semester</option>
            {Array.from({ length: 14 }, (_, i) => i + 1).map(s => (
              <option key={s} value={s}>Semester {s}</option>
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
                checked={formData.jenisKelamin === 'Laki-laki'}
                onChange={(e) => setFormData(prev => ({ ...prev, jenisKelamin: e.target.value }))}
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
                checked={formData.jenisKelamin === 'Perempuan'}
                onChange={(e) => setFormData(prev => ({ ...prev, jenisKelamin: e.target.value }))}
                className="w-4 h-4 accent-pmii-blue"
              />
              <span className="text-sm text-gray-700">Perempuan</span>
            </label>
          </div>
        </div>
      </div>

      {/* Alamat */}
      <div className="space-y-2">
        <Label htmlFor="alamat" className="text-sm font-semibold text-gray-700">
          Alamat <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="alamat"
          value={formData.alamat}
          onChange={(e) => setFormData(prev => ({ ...prev, alamat: e.target.value }))}
          placeholder="Masukkan alamat lengkap"
          required
          rows={3}
        />
      </div>

      {/* Nomor Telepon */}
      <div className="space-y-2">
        <Label htmlFor="nomorTelepon" className="text-sm font-semibold text-gray-700">
          Nomor Telepon / WhatsApp <span className="text-red-500">*</span>
        </Label>
        <Input
          id="nomorTelepon"
          type="tel"
          value={formData.nomorTelepon}
          onChange={(e) => setFormData(prev => ({ ...prev, nomorTelepon: e.target.value }))}
          placeholder="08xxxxxxxxxx"
          required
          className="h-11"
        />
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
          'Daftar MAPABA'
        )}
      </Button>
    </form>
  );
}
