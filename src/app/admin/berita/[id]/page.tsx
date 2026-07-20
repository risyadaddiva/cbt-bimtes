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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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

const formSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  category: z.string().min(1, 'Kategori harus dipilih'),
  author: z.string().min(1, 'Penulis tidak boleh kosong'),
  excerpt: z.string().max(200, 'Maksimal 200 karakter'),
  content: z.string().min(10, 'Konten minimal 10 karakter'),
  coverImage: z.string().optional().nullable(),
  tags: z.string().optional(),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function EditBeritaPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPublished: false,
    }
  });

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("File harus berformat PDF");
      return;
    }

    setIsExtractingPdf(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/berita/extract-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengekstrak teks");

      if (data.text) {
        setValue("content", data.text.trim(), {
          shouldValidate: true,
          shouldDirty: true,
        });
        toast.success("Teks berhasil diekstrak dari PDF!");
      } else {
        toast.warning("PDF kosong atau tidak berisi teks.");
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsExtractingPdf(false);
      e.target.value = "";
    }
  };

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/admin/berita/${id}`);
        if (!res.ok) throw new Error('Artikel tidak ditemukan');
        const data = await res.json();
        
        reset({
          title: data.title,
          category: data.category,
          author: data.author,
          excerpt: data.excerpt,
          content: data.content,
          coverImage: data.coverImage || '',
          tags: data.tags ? data.tags.join(', ') : '',
          isPublished: data.isPublished,
        });
      } catch (error: any) {
        toast.error(error.message);
        router.push('/admin/berita');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchArticle();
  }, [id, reset, router]);

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      };

      const res = await fetch(`/api/admin/berita/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Gagal menyimpan artikel');
      }

      toast.success('Artikel berhasil diperbarui');
      router.push('/admin/berita');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/berita/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Gagal menghapus berita');
      toast.success('Berita berhasil dihapus');
      router.push('/admin/berita');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-10 w-48" />
        <Card><CardContent className="pt-6 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-32 w-full" /></CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-pmii-blue">Edit Artikel</h1>
        </div>
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
            <Trash2 className="h-4 w-4 mr-2" /> Hapus
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Artikel?</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus artikel ini? Tindakan ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600">
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Artikel <span className="text-red-500">*</span></Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori <span className="text-red-500">*</span></Label>
                <Select value={watch('category') || ''} onValueChange={(val) => setValue('category', val || '')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Berita">Berita</SelectItem>
                    <SelectItem value="Pengumuman">Pengumuman</SelectItem>
                    <SelectItem value="Kegiatan">Kegiatan</SelectItem>
                    <SelectItem value="Prestasi">Prestasi</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="author">Penulis <span className="text-red-500">*</span></Label>
                <Input id="author" {...register('author')} />
                {errors.author && <p className="text-sm text-red-500">{errors.author.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt">Ringkasan / Excerpt</Label>
              <Textarea id="excerpt" {...register('excerpt')} rows={3} />
              {errors.excerpt && <p className="text-sm text-red-500">{errors.excerpt.message}</p>}
            </div>

             <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Konten Artikel <span className="text-red-500">*</span></Label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="file" 
                    accept=".pdf" 
                    onChange={handlePdfUpload} 
                    className="hidden" 
                    id="pdf-upload"
                    disabled={isExtractingPdf}
                  />
                  <Label 
                    htmlFor="pdf-upload" 
                    className="inline-flex items-center gap-1 text-xs bg-pmii-blue text-white px-2.5 py-1.5 rounded cursor-pointer hover:bg-blue-800 disabled:opacity-50 font-medium"
                  >
                    {isExtractingPdf ? 'Mengekstrak...' : 'Impor dari PDF'}
                  </Label>
                </div>
              </div>
              <Textarea id="content" {...register('content')} rows={10} />
              {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Link Gambar Cover</Label>
              <Input id="coverImage" value={watch('coverImage') || ''} onChange={(e) => setValue('coverImage', e.target.value)} />
              <p className="text-xs text-gray-500">Gunakan link Google Drive. Contoh: https://drive.google.com/file/d/xxx/view</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input id="tags" {...register('tags')} placeholder="pmii, bimtes, acara (pisahkan dengan koma)" />
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

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-pmii-blue hover:bg-blue-800">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
