"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const formSchema = z.object({
  username: z.string().min(3, "Minimal 3 karakter").max(20),
  password: z.string().min(6, "Minimal 6 karakter"),
  name: z.string().min(3, "Minimal 3 karakter"),
  school: z.string().min(3, "Minimal 3 karakter"),
  track: z.enum(["MIPA", "SOSHUM"]),
  phone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function NewParticipantPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { track: "MIPA" },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/participants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.success) {
        toast.success("Peserta berhasil ditambahkan");
        router.push("/admin/participants");
      } else {
        toast.error(result.error || "Gagal menambahkan peserta");
      }
    } catch (err) {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/admin/participants">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Tambah Peserta</h1>
          <p className="text-muted-foreground text-sm">Buat akun baru untuk peserta tryout</p>
        </div>
      </div>

      <Card className="border-border shadow-sm">
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username <span className="text-red-500">*</span></Label>
                <Input id="username" {...register("username")} placeholder="contoh: peserta001" />
                {errors.username && <p className="text-xs text-red-500">{errors.username.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password <span className="text-red-500">*</span></Label>
                <Input id="password" type="password" {...register("password")} placeholder="minimal 6 karakter" />
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap <span className="text-red-500">*</span></Label>
              <Input id="name" {...register("name")} placeholder="Nama lengkap peserta" />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">Asal Sekolah <span className="text-red-500">*</span></Label>
                <Input id="school" {...register("school")} placeholder="contoh: SMAN 1 Bandung" />
                {errors.school && <p className="text-xs text-red-500">{errors.school.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="track">Jalur Ujian <span className="text-red-500">*</span></Label>
                <select 
                  id="track" 
                  {...register("track")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="MIPA">MIPA (Saintek)</option>
                  <option value="SOSHUM">SOSHUM (Soshum)</option>
                </select>
                {errors.track && <p className="text-xs text-red-500">{errors.track.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Nomor Telepon/WA</Label>
              <Input id="phone" {...register("phone")} placeholder="opsional" />
            </div>

            <div className="pt-4 border-t flex justify-end">
              <Button type="submit" disabled={loading} className="bg-pmii-blue text-white w-full sm:w-auto">
                {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Simpan Peserta
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
