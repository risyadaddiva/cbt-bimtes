'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Users, GraduationCap, BookOpen, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Jurusan {
  id: string;
  nama: string;
  fakultasId: string;
  _count?: { mapabaRegistrations: number };
}

interface Fakultas {
  id: string;
  nama: string;
  jurusans: Jurusan[];
  _count?: { mapabaRegistrations: number };
}

interface Registration {
  id: string;
  nama: string;
  semester: number;
  jenisKelamin: string;
  alamat: string;
  nomorTelepon: string;
  createdAt: string;
  fakultas: { nama: string };
  jurusan: { nama: string };
}

export default function AdminMapabaPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [settingLoading, setSettingLoading] = useState(true);
  const [toggleLoading, setToggleLoading] = useState(false);

  const [fakultasList, setFakultasList] = useState<Fakultas[]>([]);
  const [fakultasLoading, setFakultasLoading] = useState(true);
  const [newFakultasNama, setNewFakultasNama] = useState('');
  const [addingFakultas, setAddingFakultas] = useState(false);

  const [selectedFakultasForJurusan, setSelectedFakultasForJurusan] = useState('');
  const [newJurusanNama, setNewJurusanNama] = useState('');
  const [addingJurusan, setAddingJurusan] = useState(false);

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [regTotal, setRegTotal] = useState(0);
  const [regLoading, setRegLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch settings
  useEffect(() => {
    fetch('/api/admin/mapaba/settings')
      .then(res => res.json())
      .then(data => setIsOpen(data.isOpen))
      .finally(() => setSettingLoading(false));
  }, []);

  // Fetch fakultas
  const fetchFakultas = useCallback(() => {
    setFakultasLoading(true);
    fetch('/api/admin/fakultas')
      .then(res => res.json())
      .then(data => setFakultasList(data.fakultas || []))
      .finally(() => setFakultasLoading(false));
  }, []);

  useEffect(() => { fetchFakultas(); }, [fetchFakultas]);

  // Fetch registrations
  const fetchRegistrations = useCallback(() => {
    setRegLoading(true);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    fetch(`/api/admin/mapaba?${params}`)
      .then(res => res.json())
      .then(data => {
        setRegistrations(data.registrations || []);
        setRegTotal(data.total || 0);
      })
      .finally(() => setRegLoading(false));
  }, [searchQuery]);

  useEffect(() => { fetchRegistrations(); }, [fetchRegistrations]);

  // Toggle MAPABA
  const handleToggle = async () => {
    setToggleLoading(true);
    try {
      const res = await fetch('/api/admin/mapaba/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isOpen: !isOpen }),
      });
      if (res.ok) {
        setIsOpen(!isOpen);
        toast.success(`Pendaftaran MAPABA ${!isOpen ? 'dibuka' : 'ditutup'}`);
      }
    } finally {
      setToggleLoading(false);
    }
  };

  // Add Fakultas
  const handleAddFakultas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFakultasNama.trim()) return;
    setAddingFakultas(true);
    try {
      const res = await fetch('/api/admin/fakultas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: newFakultasNama.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success('Fakultas berhasil ditambahkan');
      setNewFakultasNama('');
      fetchFakultas();
    } finally {
      setAddingFakultas(false);
    }
  };

  // Delete Fakultas
  const handleDeleteFakultas = async (id: string) => {
    if (!confirm('Hapus fakultas ini? Semua jurusan di bawahnya juga akan terhapus.')) return;
    try {
      const res = await fetch(`/api/admin/fakultas/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success('Fakultas berhasil dihapus');
      fetchFakultas();
    } catch {
      toast.error('Gagal menghapus fakultas');
    }
  };

  // Add Jurusan
  const handleAddJurusan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJurusanNama.trim() || !selectedFakultasForJurusan) return;
    setAddingJurusan(true);
    try {
      const res = await fetch('/api/admin/jurusan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nama: newJurusanNama.trim(), fakultasId: selectedFakultasForJurusan }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success('Jurusan berhasil ditambahkan');
      setNewJurusanNama('');
      fetchFakultas();
    } finally {
      setAddingJurusan(false);
    }
  };

  // Delete Jurusan
  const handleDeleteJurusan = async (id: string) => {
    if (!confirm('Hapus jurusan ini?')) return;
    try {
      const res = await fetch(`/api/admin/jurusan/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error);
        return;
      }
      toast.success('Jurusan berhasil dihapus');
      fetchFakultas();
    } catch {
      toast.error('Gagal menghapus jurusan');
    }
  };

  // Delete registration
  const handleDeleteRegistration = async (id: string) => {
    if (!confirm('Hapus pendaftaran ini?')) return;
    try {
      const res = await fetch(`/api/admin/mapaba?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Pendaftaran dihapus');
        fetchRegistrations();
      }
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Manajemen MAPABA</h1>
        <p className="text-muted-foreground mt-1">Kelola pendaftaran, fakultas, dan jurusan MAPABA</p>
      </div>

      {/* Toggle Section */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status Pendaftaran MAPABA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                Pendaftaran saat ini:{' '}
                {settingLoading ? (
                  <span className="text-muted-foreground">Memuat...</span>
                ) : (
                  <Badge variant={isOpen ? 'default' : 'secondary'} className={isOpen ? 'bg-green-600' : ''}>
                    {isOpen ? 'DIBUKA' : 'DITUTUP'}
                  </Badge>
                )}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isOpen
                  ? 'Halaman pendaftaran MAPABA aktif dan bisa diakses publik.'
                  : 'Halaman pendaftaran MAPABA menampilkan pesan "belum dibuka".'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {toggleLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Switch
                checked={isOpen}
                onCheckedChange={handleToggle}
                disabled={settingLoading || toggleLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fakultas & Jurusan */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Fakultas */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Fakultas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddFakultas} className="flex gap-2">
              <Input
                placeholder="Nama fakultas baru..."
                value={newFakultasNama}
                onChange={(e) => setNewFakultasNama(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" disabled={addingFakultas || !newFakultasNama.trim()} size="sm">
                {addingFakultas ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              </Button>
            </form>

            {fakultasLoading ? (
              <div className="text-center py-4 text-muted-foreground">Memuat...</div>
            ) : fakultasList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada fakultas</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {fakultasList.map(f => (
                  <div key={f.id} className="flex items-center justify-between px-3 py-2 bg-muted/50 rounded-lg">
                    <div>
                      <span className="font-medium text-sm">{f.nama}</span>
                      <span className="text-xs text-muted-foreground ml-2">({f.jurusans.length} jurusan)</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFakultas(f.id)}
                      className="text-destructive hover:text-destructive h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Jurusan */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Jurusan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleAddJurusan} className="space-y-2">
              <select
                value={selectedFakultasForJurusan}
                onChange={(e) => setSelectedFakultasForJurusan(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
              >
                <option value="">Pilih Fakultas</option>
                {fakultasList.map(f => (
                  <option key={f.id} value={f.id}>{f.nama}</option>
                ))}
              </select>
              <div className="flex gap-2">
                <Input
                  placeholder="Nama jurusan baru..."
                  value={newJurusanNama}
                  onChange={(e) => setNewJurusanNama(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={addingJurusan || !newJurusanNama.trim() || !selectedFakultasForJurusan} size="sm">
                  {addingJurusan ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
              </div>
            </form>

            {fakultasLoading ? (
              <div className="text-center py-4 text-muted-foreground">Memuat...</div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {fakultasList.map(f => (
                  f.jurusans.length > 0 && (
                    <div key={f.id}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">{f.nama}</p>
                      <div className="space-y-1">
                        {f.jurusans.map(j => (
                          <div key={j.id} className="flex items-center justify-between px-3 py-1.5 bg-muted/50 rounded-lg">
                            <span className="text-sm">{j.nama}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteJurusan(j.id)}
                              className="text-destructive hover:text-destructive h-7 w-7 p-0"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                ))}
                {fakultasList.every(f => f.jurusans.length === 0) && (
                  <p className="text-sm text-muted-foreground text-center py-4">Belum ada jurusan</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Registrations Table */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Daftar Pendaftar ({regTotal})
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari nama..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {regLoading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
          ) : registrations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Belum ada pendaftar</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Fakultas</TableHead>
                    <TableHead>Jurusan</TableHead>
                    <TableHead>Sem</TableHead>
                    <TableHead>JK</TableHead>
                    <TableHead>Telepon</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {registrations.map((reg, i) => (
                    <TableRow key={reg.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{reg.nama}</TableCell>
                      <TableCell className="text-sm">{reg.fakultas.nama}</TableCell>
                      <TableCell className="text-sm">{reg.jurusan.nama}</TableCell>
                      <TableCell>{reg.semester}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {reg.jenisKelamin === 'Laki-laki' ? 'L' : 'P'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{reg.nomorTelepon}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(reg.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRegistration(reg.id)}
                          className="text-destructive hover:text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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
