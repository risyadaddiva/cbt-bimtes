'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, Loader2 } from 'lucide-react';

const KATEGORI_OPTIONS = ['Akademik', 'Non-Akademik', 'Organisasi', 'Lainnya'];

export default function AdvokasiForm() {
  const [formData, setFormData] = useState({
    nama: '',
    email: '',
    nomorTelepon: '',
    kategori: '',
    judul: '',
    deskripsi: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/site/advokasi', {
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
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-3">Pengaduan Terkirim!</h3>
        <p className="text-gray-600 max-w-md mx-auto mb-8">
          Terima kasih. Pengaduan Anda telah kami terima dan akan segera ditindaklanjuti oleh tim advokasi kami.
        </p>
        <Button
          onClick={() => { setSuccess(false); setFormData({ nama: '', email: '', nomorTelepon: '', kategori: '', judul: '', deskripsi: '' }); }}
          variant="outline"
          className="border-pmii-blue text-pmii-blue hover:bg-blue-50"
        >
          Kirim Pengaduan Lain
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adv-nama" className="text-sm font-semibold text-gray-700">
            Nama Lengkap <span className="text-red-500">*</span>
          </Label>
          <Input
            id="adv-nama"
            value={formData.nama}
            onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
            placeholder="Masukkan nama lengkap"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adv-email" className="text-sm font-semibold text-gray-700">
            Email <span className="text-gray-400 font-normal">(opsional)</span>
          </Label>
          <Input
            id="adv-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            placeholder="email@contoh.com"
            className="h-11"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="adv-telepon" className="text-sm font-semibold text-gray-700">
            Nomor Telepon <span className="text-red-500">*</span>
          </Label>
          <Input
            id="adv-telepon"
            type="tel"
            value={formData.nomorTelepon}
            onChange={(e) => setFormData(prev => ({ ...prev, nomorTelepon: e.target.value }))}
            placeholder="08xxxxxxxxxx"
            required
            className="h-11"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="adv-kategori" className="text-sm font-semibold text-gray-700">
            Kategori <span className="text-red-500">*</span>
          </Label>
          <select
            id="adv-kategori"
            value={formData.kategori}
            onChange={(e) => setFormData(prev => ({ ...prev, kategori: e.target.value }))}
            required
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">Pilih Kategori</option>
            {KATEGORI_OPTIONS.map(k => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="adv-judul" className="text-sm font-semibold text-gray-700">
          Judul Pengaduan <span className="text-red-500">*</span>
        </Label>
        <Input
          id="adv-judul"
          value={formData.judul}
          onChange={(e) => setFormData(prev => ({ ...prev, judul: e.target.value }))}
          placeholder="Ringkasan singkat pengaduan"
          required
          className="h-11"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="adv-deskripsi" className="text-sm font-semibold text-gray-700">
          Deskripsi Lengkap <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="adv-deskripsi"
          value={formData.deskripsi}
          onChange={(e) => setFormData(prev => ({ ...prev, deskripsi: e.target.value }))}
          placeholder="Jelaskan kronologi dan detail pengaduan Anda secara lengkap..."
          required
          rows={5}
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
          'Kirim Pengaduan'
        )}
      </Button>
    </form>
  );
}
