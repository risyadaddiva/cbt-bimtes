'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Pencil, Users, X } from 'lucide-react';
import { toast } from 'sonner';

interface Pengurus {
  id: string;
  nama: string;
  jabatan: string;
  fotoUrl: string | null;
  instagramUrl: string | null;
  order: number;
  isActive: boolean;
  createdAt: string;
}

const emptyForm = {
  nama: '',
  jabatan: '',
  fotoUrl: '',
  instagramUrl: '',
  order: 0,
  isActive: true,
};

export default function AdminPengurusPage() {
  const [pengurusList, setPengurusList] = useState<Pengurus[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const fetchPengurus = useCallback(() => {
    setLoading(true);
    fetch('/api/admin/pengurus')
      .then(res => res.json())
      .then(data => setPengurusList(data.pengurus || []))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPengurus(); }, [fetchPengurus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nama || !formData.jabatan) {
      toast.error('Nama dan jabatan wajib diisi');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = editingId ? `/api/admin/pengurus/${editingId}` : '/api/admin/pengurus';
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          fotoUrl: formData.fotoUrl || null,
          instagramUrl: formData.instagramUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Gagal menyimpan');
        return;
      }

      toast.success(editingId ? 'Pengurus berhasil diperbarui' : 'Pengurus berhasil ditambahkan');
      setFormData(emptyForm);
      setEditingId(null);
      setDialogOpen(false);
      fetchPengurus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (p: Pengurus) => {
    setFormData({
      nama: p.nama,
      jabatan: p.jabatan,
      fotoUrl: p.fotoUrl || '',
      instagramUrl: p.instagramUrl || '',
      order: p.order,
      isActive: p.isActive,
    });
    setEditingId(p.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengurus ini?')) return;
    try {
      const res = await fetch(`/api/admin/pengurus/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Pengurus berhasil dihapus');
        fetchPengurus();
      }
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  const handleToggleActive = async (p: Pengurus) => {
    try {
      const res = await fetch(`/api/admin/pengurus/${p.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !p.isActive }),
      });
      if (res.ok) {
        toast.success(`Pengurus ${!p.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
        fetchPengurus();
      }
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const openAddDialog = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Manajemen Pengurus</h1>
          <p className="text-muted-foreground mt-1">Kelola data pengurus untuk halaman Struktur Organisasi</p>
        </div>
        <Button onClick={openAddDialog} className="bg-pmii-blue hover:bg-pmii-blue/90">
          <Plus className="h-4 w-4 mr-2" />
          Tambah Pengurus
        </Button>
      </div>

      {/* Dialog Add/Edit */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) { setEditingId(null); setFormData(emptyForm); } }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.nama}
                  onChange={(e) => setFormData(prev => ({ ...prev, nama: e.target.value }))}
                  placeholder="Nama lengkap"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Jabatan <span className="text-red-500">*</span></Label>
                <Input
                  value={formData.jabatan}
                  onChange={(e) => setFormData(prev => ({ ...prev, jabatan: e.target.value }))}
                  placeholder="Ketua, Sekretaris, dll."
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>URL Foto <span className="text-muted-foreground text-xs">(opsional, Google Drive link)</span></Label>
              <Input
                value={formData.fotoUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, fotoUrl: e.target.value }))}
                placeholder="https://drive.google.com/... atau URL foto"
              />
            </div>

            <div className="space-y-2">
              <Label>Instagram <span className="text-muted-foreground text-xs">(opsional)</span></Label>
              <Input
                value={formData.instagramUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, instagramUrl: e.target.value }))}
                placeholder="https://instagram.com/username atau @username"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                  min={0}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 h-9">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                  />
                  <span className="text-sm">{formData.isActive ? 'Aktif' : 'Nonaktif'}</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" disabled={isSubmitting} className="bg-pmii-blue hover:bg-pmii-blue/90">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {editingId ? 'Simpan' : 'Tambah'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Table */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Daftar Pengurus ({pengurusList.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
          ) : pengurusList.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>Belum ada data pengurus</p>
              <Button onClick={openAddDialog} variant="outline" className="mt-4">
                <Plus className="h-4 w-4 mr-2" /> Tambah Pengurus Pertama
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">No</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Jabatan</TableHead>
                    <TableHead>Foto</TableHead>
                    <TableHead>Instagram</TableHead>
                    <TableHead className="w-16">Urutan</TableHead>
                    <TableHead className="w-20">Status</TableHead>
                    <TableHead className="w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pengurusList.map((p, i) => (
                    <TableRow key={p.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{p.nama}</TableCell>
                      <TableCell>{p.jabatan}</TableCell>
                      <TableCell>
                        {p.fotoUrl ? (
                          <Badge variant="secondary" className="text-xs">✓ Ada</Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.instagramUrl ? (
                          <a href={p.instagramUrl.startsWith('http') ? p.instagramUrl : `https://instagram.com/${p.instagramUrl.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-pmii-blue text-xs hover:underline">
                            Link ↗
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{p.order}</TableCell>
                      <TableCell>
                        <Switch
                          checked={p.isActive}
                          onCheckedChange={() => handleToggleActive(p)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(p)} className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
