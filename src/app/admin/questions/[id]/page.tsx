"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/randomize";

const choiceSchema = z.object({
  label: z.enum(["A", "B", "C", "D", "E"]),
  text: z.string().min(1, "Pilihan tidak boleh kosong"),
  isCorrect: z.boolean(),
});

const formSchema = z
  .object({
    category: z.enum([
      "MIPA",
      "SOSHUM",
      "WAWASAN_KEBANGSAAN",
      "LITERASI",
      "TES_SKOLASTIK",
      "KEAGAMAAN",
    ]),
    text: z.string().min(10, "Soal minimal 10 karakter"),
    explanation: z.string().optional(),
    difficulty: z.coerce.number().min(1).max(5),
    choices: z.array(choiceSchema).length(5),
  })
  .refine((data) => data.choices.filter((c) => c.isCorrect).length === 1, {
    message: "Pilih tepat satu jawaban benar",
    path: ["choices"],
  });

type FormValues = z.infer<typeof formSchema>;

const CHOICE_LABELS = ["A", "B", "C", "D", "E"] as const;

export default function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      category: "MIPA",
      difficulty: 3,
      text: "",
      explanation: "",
      choices: [
        { label: "A", text: "", isCorrect: true },
        { label: "B", text: "", isCorrect: false },
        { label: "C", text: "", isCorrect: false },
        { label: "D", text: "", isCorrect: false },
        { label: "E", text: "", isCorrect: false },
      ],
    },
  });

  const { fields } = useFieldArray({ control, name: "choices" });
  const choicesWatch = watch("choices");

  useEffect(() => {
    const getQuestion = async () => {
      try {
        const res = await fetch(`/api/admin/questions/${id}`);
        const data = await res.json();
        if (data.success) {
          const q = data.data;
          reset({
            category: q.category,
            difficulty: q.difficulty,
            text: q.text,
            explanation: q.explanation || "",
            choices: q.choices.map((c: any) => ({
              label: c.label,
              text: c.text,
              isCorrect: c.isCorrect,
            })),
          });
        } else {
          toast.error(data.error || "Gagal memuat soal");
          router.push("/admin/questions");
        }
      } catch (error) {
        toast.error("Terjadi kesalahan koneksi");
        router.push("/admin/questions");
      } finally {
        setFetching(false);
      }
    };
    getQuestion();
  }, [id, reset, router]);

  const handleCorrectChange = (index: number) => {
    const updated = choicesWatch.map((c, i) => ({ ...c, isCorrect: i === index }));
    setValue("choices", updated);
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        toast.success("Soal berhasil diperbarui");
        router.push("/admin/questions");
      } else {
        const errData = await res.json();
        toast.error(errData.error || "Gagal memperbarui soal");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoading(false);
    }
  };

  const categoryEntries = Object.entries(CATEGORY_LABELS) as [string, string][];

  if (fetching) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#0F52BA] mx-auto" />
          <p className="text-muted-foreground text-sm">Memuat detail soal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/questions">
          <Button variant="outline" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Edit Soal</h1>
          <p className="text-muted-foreground text-sm">Perbarui detail soal ujian</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Kategori Soal</Label>
                <select
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {categoryEntries.map(([val, label]) => (
                    <option key={val} value={val}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-xs text-red-500">{errors.category.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tingkat Kesulitan (1-5)</Label>
                <select
                  {...register("difficulty")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      Level {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Pertanyaan</Label>
              <Textarea
                {...register("text")}
                placeholder="Ketik pertanyaan di sini..."
                className="min-h-36"
              />
              {errors.text && (
                <p className="text-xs text-red-500">{errors.text.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-bold">Pilihan Jawaban</Label>
              {errors.choices?.root && (
                <p className="text-sm font-medium text-red-500">
                  {errors.choices.root.message}
                </p>
              )}
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => {
                const isSelected = choicesWatch[index]?.isCorrect;
                return (
                  <div
                    key={field.id}
                    className={
                      "flex gap-4 p-4 rounded-lg border transition-colors " +
                      (isSelected
                        ? "border-green-500 bg-green-50 dark:bg-green-950/20"
                        : "border-border")
                    }
                  >
                    <div className="flex flex-col items-center gap-2 pt-2">
                      <span className="font-bold text-lg">
                        {CHOICE_LABELS[index]}
                      </span>
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={isSelected}
                        onChange={() => handleCorrectChange(index)}
                        className="w-5 h-5 text-green-600 focus:ring-green-500"
                        title="Tandai sebagai jawaban benar"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <Textarea
                        {...register(`choices.${index}.text`)}
                        placeholder={"Teks pilihan " + CHOICE_LABELS[index]}
                        className="min-h-20"
                      />
                      {errors.choices?.[index]?.text && (
                        <p className="text-xs text-red-500">
                          {errors.choices[index]?.text?.message}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-2">
            <Label>Penjelasan / Pembahasan (Opsional)</Label>
            <Textarea
              {...register("explanation")}
              placeholder="Penjelasan jawaban untuk referensi admin..."
              className="min-h-24"
            />
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading}
            size="lg"
            className="bg-[#0F52BA] hover:bg-blue-800 text-white w-full sm:w-auto"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Simpan Perubahan
          </Button>
        </div>
      </form>
    </div>
  );
}
