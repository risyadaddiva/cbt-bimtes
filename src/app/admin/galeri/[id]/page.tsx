'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { getDriveDisplayUrl } from '@/lib/media';
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

const albumSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  eventDate: z.string().optional().nullable(),
  isPublished: z.boolean(),
});

type AlbumFormValues = z.infer<typeof albumSchema>;

export default function EditAlbumPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [album, setAlbum] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingAlbum, setIsSubmittingAlbum] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);

  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [newPhotoCaption, setNewPhotoCaption] = useState('');

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      isPublished: false,
    }
  });

  const fetchAlbum = async () => {
    try {
      const res = await fetch(`/api/admin/galeri/${id}`);
      if (!res.ok) throw new Error('Album tidak ditemukan');
      const data = await res.json();
      setAlbum(data);
      
      reset({
        title: data.title,
        description: data.description,
        coverImage: data.coverImage,
        eventDate: data.eventDate ? new Date(data.eventDate).toISOString().split('T')[0] : '',
        isPublished: data.isPublished,
      });
    } catch (error: any) {
      toast.error(error.message);
      router.push('/admin/galeri');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchAlbum();
  }, [id]);

  const onUpdateAlbum = async (data: AlbumFormValues) => {
    setIsSubmittingAlbum(true);
    try {
      const payload = {
        ...data,
        eventDate: data.eventDate || null,
      };

      const res = await fetch(`/api/admin/galeri/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Gagal memperbarui album');
      toast.success('Informasi album berhasil diperbarui');
      fetchAlbum();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmittingAlbum(false);
    }
  };

  const handleAddPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhotoUrl) {
      toast.error('URL gambar wajib diisi');
      return;
    }

    setIsAddingPhoto(true);
    try {
      const res = await fetch(`/api/admin/galeri/${id}/photos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: newPhotoUrl,
          caption: newPhotoCaption,
        }),
      });

      if (!res.ok) throw new Error('Gagal menambah foto');
      toast.success('Foto berhasil ditambahkan');
      setNewPhotoUrl('');
      setNewPhotoCaption('');
      fetchAlbum();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsAddingPhoto(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/admin/galeri/${id}/photos/${photoId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus foto');
      toast.success('Foto dihapus');
      fetchAlbum();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return <div className="p-8"><Skeleton className="h-10 w-48 mb-8" /><Skeleton className="h-64 w-full mb-8" /></div>;
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-pmii-blue">Kelola Album</h1>
      </div>

      {/* Bagian Edit Info Album */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Album</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onUpdateAlbum)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Album <span className="text-red-500">*</span></Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea id="description" {...register('description')} rows={3} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Link Gambar Cover</Label>
                <Input id="coverImage" value={watch('coverImage') || ''} onChange={(e) => setValue('coverImage', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Tanggal Acara</Label>
                <Input id="eventDate" type="date" value={watch('eventDate') || ''} onChange={(e) => setValue('eventDate', e.target.value)} />
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-gray-50 p-4 rounded-lg">
              <Switch 
                id="isPublished" 
                checked={watch('isPublished')}
                onCheckedChange={(checked) => setValue('isPublished', checked)}
              />
              <Label htmlFor="isPublished" className="font-medium cursor-pointer">
                Terbitkan
              </Label>
            </div>

            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isSubmittingAlbum} className="bg-pmii-blue hover:bg-blue-800">
                {isSubmittingAlbum ? 'Menyimpan...' : 'Simpan Perubahan Album'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bagian Kelola Foto */}
      <Card>
        <CardHeader>
          <CardTitle>Foto dalam Album ({album.photos?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          
          {/* Form Tambah Foto */}
          <form onSubmit={handleAddPhoto} className="flex flex-col md:flex-row gap-4 p-4 bg-muted/50 rounded-lg border border-muted items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="photoUrl">Link Google Drive Gambar <span className="text-red-500">*</span></Label>
              <Input 
                id="photoUrl" 
                value={newPhotoUrl} 
                onChange={(e) => setNewPhotoUrl(e.target.value)} 
                placeholder="https://drive.google.com/..."
              />
            </div>
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="photoCaption">Keterangan (Opsional)</Label>
              <Input 
                id="photoCaption" 
                value={newPhotoCaption} 
                onChange={(e) => setNewPhotoCaption(e.target.value)} 
                placeholder="Keterangan foto..."
              />
            </div>
            <Button type="submit" disabled={isAddingPhoto || !newPhotoUrl} className="w-full md:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              {isAddingPhoto ? 'Menambahkan...' : 'Tambah Foto'}
            </Button>
          </form>

          {/* Grid Foto */}
          {album.photos && album.photos.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {album.photos.map((photo: any) => (
                <div key={photo.id} className="relative group rounded-lg overflow-hidden border aspect-square bg-gray-100 flex items-center justify-center">
                  <img src={getDriveDisplayUrl(photo.imageUrl)} alt={photo.caption || 'Foto'} className="w-full h-full object-cover" />
                  
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-center gap-3">
                    {photo.caption && (
                      <span className="text-white text-sm line-clamp-3">{photo.caption}</span>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
                        <Trash2 className="h-4 w-4" />
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Foto?</AlertDialogTitle>
                          <AlertDialogDescription>Apakah Anda yakin ingin menghapus foto ini dari album?</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeletePhoto(photo.id)} className="bg-red-600">
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 border rounded-lg border-dashed">
              <ImageIcon className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>Belum ada foto dalam album ini.</p>
            </div>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
