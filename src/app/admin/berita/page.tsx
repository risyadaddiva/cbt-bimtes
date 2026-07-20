'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Pencil, Trash2, Plus, Search } from 'lucide-react';

export default function BeritaPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/berita?page=${page}&limit=10`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (filter === 'published') url += `&isPublished=true`;
      if (filter === 'draft') url += `&isPublished=false`;

      const res = await fetch(url);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat berita');

      setArticles(data.articles);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, [page, search, filter]);

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/berita/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      if (!res.ok) throw new Error('Gagal mengubah status');
      toast.success('Status berhasil diubah');
      fetchArticles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/berita/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus berita');
      toast.success('Berita berhasil dihapus');
      fetchArticles();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-pmii-blue">Portal Berita</h1>
        <Link href="/admin/berita/new">
          <Button className="bg-pmii-blue hover:bg-blue-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Tulis Artikel Baru
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4">
          <CardTitle className="text-lg">Daftar Artikel</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul..."
                className="pl-8"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>
            <div className="flex bg-muted p-1 rounded-md">
              <Button
                variant={filter === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('all')}
                className={filter === 'all' ? 'bg-white text-black shadow-sm' : ''}
              >
                Semua
              </Button>
              <Button
                variant={filter === 'published' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('published')}
                className={filter === 'published' ? 'bg-white text-black shadow-sm' : ''}
              >
                Diterbitkan
              </Button>
              <Button
                variant={filter === 'draft' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilter('draft')}
                className={filter === 'draft' ? 'bg-white text-black shadow-sm' : ''}
              >
                Draft
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b">
                      <td className="px-4 py-4"><Skeleton className="h-4 w-4" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-4 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-4 py-4 flex justify-end"><Skeleton className="h-8 w-24" /></td>
                    </tr>
                  ))
                ) : articles.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada artikel ditemukan.
                    </td>
                  </tr>
                ) : (
                  articles.map((article, idx) => (
                    <tr key={article.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{(page - 1) * 10 + idx + 1}</td>
                      <td className="px-4 py-3 font-medium text-gray-900">{article.title}</td>
                      <td className="px-4 py-3">{article.category}</td>
                      <td className="px-4 py-3">
                        <Badge variant={article.isPublished ? "default" : "secondary"} className={article.isPublished ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                          {article.isPublished ? 'Diterbitkan' : 'Draft'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(article.createdAt).toLocaleDateString('id-ID')}
                      </td>
                      <td className="px-4 py-3 flex items-center justify-end gap-2">
                        <div className="flex items-center gap-2 mr-2" title="Toggle Publish">
                          <Switch 
                            checked={article.isPublished}
                            onCheckedChange={() => handleTogglePublish(article.id, article.isPublished)}
                          />
                        </div>
                        <Link href={`/admin/berita/${article.id}`}>
                          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </Link>
                        <AlertDialog>
                          <AlertDialogTrigger render={<Button variant="destructive" size="sm" className="h-8 w-8 p-0" />}>
                            <Trash2 className="h-4 w-4" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Apakah Anda yakin ingin menghapus "{article.title}"? Tindakan ini tidak dapat dibatalkan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(article.id)} className="bg-red-600">
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {total > 10 && (
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-gray-500">
                Menampilkan {(page - 1) * 10 + 1} - {Math.min(page * 10, total)} dari {total}
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Sebelumnya
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={page * 10 >= total}
                  onClick={() => setPage(p => p + 1)}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
