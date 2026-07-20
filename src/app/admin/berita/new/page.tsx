'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  category: z.string().min(1, 'Kategori harus dipilih'),
  author: z.string().min(1, 'Penulis tidak boleh kosong'),
  excerpt: z.string().max(200, 'Maksimal 200 karakter'),
  content: z.string().min(10, 'Konten minimal 10 karakter'),
  coverImage: z.string().optional(),
  tags: z.string().optional(),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewBeritaPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      author: 'Admin PMII',
      category: 'Berita',
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

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        ...data,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      };

      const res = await fetch('/api/admin/berita', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Gagal menyimpan artikel');
      }

      toast.success('Artikel berhasil disimpan');
      router.push('/admin/berita');
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-pmii-blue">Tulis Artikel Baru</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Artikel <span className="text-red-500">*</span></Label>
              <Input id="title" {...register('title')} placeholder="Masukkan judul..." />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori <span className="text-red-500">*</span></Label>
                <Select onValueChange={(val) => setValue('category', val || '')} defaultValue="Berita">
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
              <Textarea 
                id="excerpt" 
                {...register('excerpt')} 
                placeholder="Ringkasan singkat artikel..."
                rows={3}
              />
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
              <Textarea 
                id="content" 
                {...register('content')} 
                placeholder="Tulis isi artikel di sini (mendukung HTML)..."
                rows={10}
              />
              {errors.content && <p className="text-sm text-red-500">{errors.content.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="coverImage">Link Gambar Cover</Label>
              <Input id="coverImage" {...register('coverImage')} placeholder="https://drive.google.com/..." />
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
                Terbitkan sekarang
              </Label>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-pmii-blue hover:bg-blue-800">
                {isSubmitting ? 'Menyimpan...' : 'Simpan Artikel'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
