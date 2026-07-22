'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Trash2, MessageSquare, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Complaint {
  id: string;
  nama: string;
  email: string | null;
  nomorTelepon: string;
  kategori: string;
  judul: string;
  deskripsi: string;
  status: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  Baru: 'bg-blue-100 text-blue-700',
  Diproses: 'bg-amber-100 text-amber-700',
  Selesai: 'bg-green-100 text-green-700',
};

export default function AdminAdvokasiPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const fetchComplaints = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filterStatus) params.set('status', filterStatus);
    fetch(`/api/admin/advokasi?${params}`)
      .then(res => res.json())
      .then(data => {
        setComplaints(data.complaints || []);
        setTotal(data.total || 0);
      })
      .finally(() => setLoading(false));
  }, [filterStatus]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/advokasi/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Status diubah ke "${newStatus}"`);
        fetchComplaints();
        if (selectedComplaint?.id === id) {
          setSelectedComplaint(prev => prev ? { ...prev, status: newStatus } : null);
        }
      }
    } catch {
      toast.error('Gagal mengubah status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus pengaduan ini?')) return;
    try {
      const res = await fetch(`/api/admin/advokasi/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Pengaduan dihapus');
        setSelectedComplaint(null);
        fetchComplaints();
      }
    } catch {
      toast.error('Gagal menghapus');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Layanan Advokasi</h1>
        <p className="text-muted-foreground mt-1">Kelola pengaduan yang masuk dari layanan advokasi</p>
      </div>

      {/* Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={(open) => { if (!open) setSelectedComplaint(null); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Detail Pengaduan</DialogTitle>
          </DialogHeader>
          {selectedComplaint && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nama:</span>
                  <p className="font-medium">{selectedComplaint.nama}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Telepon:</span>
                  <p className="font-medium">{selectedComplaint.nomorTelepon}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{selectedComplaint.email || '—'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Kategori:</span>
                  <p className="font-medium">{selectedComplaint.kategori}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Tanggal:</span>
                  <p className="font-medium">{new Date(selectedComplaint.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>
                  <div className="mt-1">
                    <Badge className={statusColors[selectedComplaint.status] || ''}>{selectedComplaint.status}</Badge>
                  </div>
                </div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Judul:</span>
                <p className="font-bold text-lg">{selectedComplaint.judul}</p>
              </div>
              <div>
                <span className="text-sm text-muted-foreground">Deskripsi:</span>
                <p className="text-sm mt-1 bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">{selectedComplaint.deskripsi}</p>
              </div>
              <div className="flex gap-2 pt-2">
                <span className="text-sm text-muted-foreground mr-2 self-center">Ubah status:</span>
                {['Baru', 'Diproses', 'Selesai'].map(s => (
                  <Button
                    key={s}
                    variant={selectedComplaint.status === s ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleStatusChange(selectedComplaint.id, s)}
                    className={selectedComplaint.status === s ? 'bg-pmii-blue' : ''}
                  >
                    {s}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Filter & Table */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Pengaduan Masuk ({total})
            </CardTitle>
            <div className="flex gap-2">
              {['', 'Baru', 'Diproses', 'Selesai'].map(s => (
                <Button
                  key={s}
                  variant={filterStatus === s ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus(s)}
                  className={filterStatus === s ? 'bg-pmii-blue' : ''}
                >
                  {s || 'Semua'}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Memuat data...</div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
              <p>Belum ada pengaduan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Judul</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="w-24">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((c, i) => (
                    <TableRow key={c.id}>
                      <TableCell className="text-muted-foreground">{i + 1}</TableCell>
                      <TableCell className="font-medium">{c.nama}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{c.kategori}</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{c.judul}</TableCell>
                      <TableCell>
                        <Badge className={`${statusColors[c.status] || ''} text-xs`}>{c.status}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString('id-ID')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(c)} className="h-8 w-8 p-0">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)} className="text-destructive hover:text-destructive h-8 w-8 p-0">
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
