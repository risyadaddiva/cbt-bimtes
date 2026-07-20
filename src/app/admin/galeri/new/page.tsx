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
import { ArrowLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(3, 'Judul minimal 3 karakter'),
  description: z.string().optional(),
  coverImage: z.string().optional(),
  eventDate: z.string().optional(),
  isPublished: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewAlbumPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPublished: false,
    }
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/galeri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Gagal menyimpan album');
      }

      const newAlbum = await res.json();
      toast.success('Album berhasil dibuat');
      router.push(`/admin/galeri/${newAlbum.id}`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold text-pmii-blue">Buat Album Baru</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Judul Album <span className="text-red-500">*</span></Label>
              <Input id="title" {...register('title')} placeholder="Contoh: Kegiatan BIMTES 2026..." />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea 
                id="description" 
                {...register('description')} 
                placeholder="Deskripsi singkat mengenai album..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="coverImage">Link Gambar Cover (Google Drive)</Label>
                <Input id="coverImage" {...register('coverImage')} placeholder="https://drive.google.com/..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="eventDate">Tanggal Acara</Label>
                <Input id="eventDate" type="date" {...register('eventDate')} />
              </div>
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
                {isSubmitting ? 'Menyimpan...' : 'Simpan Album'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
