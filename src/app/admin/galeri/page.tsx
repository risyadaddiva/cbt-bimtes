'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
import { Plus, Image as ImageIcon, Trash2, Calendar, Pencil } from 'lucide-react';
import { getDriveDisplayUrl } from '@/lib/media';

export default function GaleriPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchAlbums = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/galeri?page=${page}&limit=12`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal memuat galeri');

      setAlbums(data.albums);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlbums();
  }, [page]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/galeri/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus album');
      toast.success('Album berhasil dihapus');
      fetchAlbums();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-pmii-blue">Galeri</h1>
        <Link href="/admin/galeri/new">
          <Button className="bg-pmii-blue hover:bg-blue-800 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Tambah Album Baru
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : albums.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-lg border">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p>Belum ada album galeri.</p>
          </div>
        ) : (
          albums.map((album) => (
            <Card key={album.id} className="overflow-hidden flex flex-col group">
              <div className="relative h-48 bg-gray-100 flex-shrink-0">
                {album.coverImage ? (
                  <img src={getDriveDisplayUrl(album.coverImage)} alt={album.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-12 w-12 opacity-50" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge variant={album.isPublished ? "default" : "secondary"} className={album.isPublished ? "bg-green-500 hover:bg-green-600" : ""}>
                    {album.isPublished ? 'Diterbitkan' : 'Draft'}
                  </Badge>
                </div>
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Link href={`/admin/galeri/${album.id}`}>
                    <Button variant="secondary" size="sm">
                      <Pencil className="h-4 w-4 mr-2" /> Kelola
                    </Button>
                  </Link>
                  <AlertDialog>
                    <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                      <Trash2 className="h-4 w-4" />
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Album?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Apakah Anda yakin ingin menghapus album "{album.title}" beserta seluruh fotonya? Tindakan ini tidak dapat dibatalkan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(album.id)} className="bg-red-600">
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
              <CardContent className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg line-clamp-1 mb-1">{album.title}</h3>
                <div className="flex items-center text-xs text-gray-500 gap-4 mt-auto pt-2">
                  <span className="flex items-center">
                    <ImageIcon className="h-3.5 w-3.5 mr-1" /> {album._count?.photos || 0} Foto
                  </span>
                  {album.eventDate && (
                    <span className="flex items-center">
                      <Calendar className="h-3.5 w-3.5 mr-1" /> 
                      {new Date(album.eventDate).toLocaleDateString('id-ID')}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {total > 12 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button 
            variant="outline" 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            Sebelumnya
          </Button>
          <Button 
            variant="outline" 
            disabled={page * 12 >= total}
            onClick={() => setPage(p => p + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
