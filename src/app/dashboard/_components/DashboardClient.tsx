"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Clock,
  FileQuestion,
  Layers,
  CheckCircle2,
  ArrowRight,
  Eye,
  School,
  User,
  FlaskConical,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CATEGORY_LABELS, EXAM_CONFIG, Category } from "@/lib/randomize";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type ExamStatus = "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "EXPIRED";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  MIPA: <FlaskConical className="w-4 h-4" />,
  SOSHUM: <BookOpen className="w-4 h-4" />,
  WAWASAN_KEBANGSAAN: <Layers className="w-4 h-4" />,
  LITERASI: <FileQuestion className="w-4 h-4" />,
  TES_SKOLASTIK: <FlaskConical className="w-4 h-4" />,
  KEAGAMAAN: <BookOpen className="w-4 h-4" />,
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  MIPA: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  SOSHUM: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300",
  WAWASAN_KEBANGSAAN: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  LITERASI: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  TES_SKOLASTIK: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
  KEAGAMAAN: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
};

interface Props {
  name: string;
  school: string;
  track: Category | null;
  examStatus: ExamStatus | null;
}

const ALL_GROUPS: Category[] = [
  "MIPA",
  "SOSHUM",
  "WAWASAN_KEBANGSAAN",
  "LITERASI",
  "TES_SKOLASTIK",
  "KEAGAMAAN",
];

function getStatusInfo(status: ExamStatus | null) {
  if (!status || status === "NOT_STARTED") {
    return { label: "Belum Mulai", className: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300" };
  }
  if (status === "IN_PROGRESS") {
    return { label: "Sedang Berlangsung", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" };
  }
  return {
    label: status === "SUBMITTED" ? "Selesai" : "Waktu Habis",
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  };
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const EXAM_STATS = [
  { icon: <Layers className="w-4 h-4" />, value: "5", label: "Kelompok", color: "from-blue-500 to-blue-600" },
  { icon: <FileQuestion className="w-4 h-4" />, value: "90", label: "Soal", color: "from-violet-500 to-purple-600" },
  { icon: <Clock className="w-4 h-4" />, value: "120", label: "Menit", color: "from-emerald-500 to-teal-600" },
];

const EXAM_RULES = [
  "Ujian terdiri dari 5 kelompok soal dengan waktu dan urutan yang telah diacak.",
  "Setiap soal benar bernilai +4, salah −1, dan tidak dijawab 0 (sistem SNBT).",
  "Pastikan koneksi internet stabil sebelum memulai ujian.",
  "Perpindahan tab atau jendela browser akan tercatat sebagai pelanggaran.",
  "Jawaban tersimpan otomatis; ujian tidak dapat diulang setelah selesai.",
];

export default function DashboardClient({ name, school, track, examStatus }: Props) {
  const router = useRouter();
  const statusInfo = getStatusInfo(examStatus);

  const isDone = examStatus === "SUBMITTED" || examStatus === "EXPIRED";
  const isInProgress = examStatus === "IN_PROGRESS";

  // Change password states
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      toast.error("Password tidak boleh kosong");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password minimal 6 karakter");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }

    setLoadingPassword(true);
    try {
      const res = await fetch("/api/participant/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Password berhasil diubah!");
        setShowChangePasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.error || "Gagal mengubah password");
      }
    } catch {
      toast.error("Terjadi kesalahan jaringan");
    } finally {
      setLoadingPassword(false);
    }
  };

  const relevantGroups = ALL_GROUPS.filter((cat) => {
    if (cat === "MIPA" || cat === "SOSHUM") return cat === track;
    return true;
  });

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {/* Welcome Header */}
          <motion.div variants={itemVariants} className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground tracking-wide uppercase">Selamat datang,</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">{name}</h1>
          </motion.div>

          {/* Info Cards */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-border/60 shadow-sm rounded-2xl bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-pmii-gradient flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">Nama Peserta</p>
                  <p className="text-sm font-semibold text-foreground truncate">{name}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
                  <School className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-0.5">Asal Sekolah</p>
                  <p className="text-sm font-semibold text-foreground truncate">{school}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm rounded-2xl bg-card/80 backdrop-blur-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Jalur / Status</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {track && (
                      <span className="text-xs font-semibold text-foreground">{CATEGORY_LABELS[track]}</span>
                    )}
                    <span className={"inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " + statusInfo.className}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Main area */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <Card className="border-border/60 shadow-sm rounded-2xl bg-card/80 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-3 px-6 pt-6">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <FileQuestion className="w-5 h-5 text-[#0F52BA]" />
                    Instruksi Ujian
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-6 space-y-5">
                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3">
                    {EXAM_STATS.map((stat) => (
                      <div key={stat.label} className={"relative flex flex-col items-center justify-center rounded-xl p-3 text-white shadow-sm bg-gradient-to-br " + stat.color}>
                        <div className="mb-1 opacity-90">{stat.icon}</div>
                        <p className="text-xl font-bold leading-none">{stat.value}</p>
                        <p className="text-xs mt-1 opacity-80 font-medium">{stat.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Rules */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-foreground">Ketentuan Ujian:</p>
                    <ul className="space-y-2.5">
                      {EXAM_RULES.map((rule, i) => (
                        <li key={i} className="flex items-start gap-2.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                          <span className="text-sm text-muted-foreground leading-relaxed">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Group breakdown */}
              <Card className="border-border/60 shadow-sm rounded-2xl bg-card/80 backdrop-blur-sm">
                <CardHeader className="pb-3 px-6 pt-5">
                  <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#0F52BA]" />
                    Kelompok Soal Kamu
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="space-y-2">
                    {relevantGroups.map((cat) => {
                      const config = EXAM_CONFIG.groups[cat];
                      return (
                        <div key={cat} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <span className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold " + (CATEGORY_BADGE_COLORS[cat] ?? "")}>
                              {CATEGORY_ICONS[cat]}
                              {CATEGORY_LABELS[cat]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                            <span>{config.questions} soal</span>
                            <span className="text-border">|</span>
                            <span>{config.durationMinutes} menit</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* CTA Panel */}
            <div className="space-y-4">
              <motion.div whileHover={{ scale: isDone ? 1 : 1.01 }} transition={{ duration: 0.2 }}>
                <Card className="border-0 shadow-xl rounded-2xl overflow-hidden bg-pmii-gradient">
                  <CardContent className="p-6 text-white">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mb-4 shadow-lg">
                      <BookOpen className="w-7 h-7 text-white" />
                    </div>
                    <h2 className="text-xl font-bold mb-1">
                      {isDone ? "Ujian Selesai" : isInProgress ? "Ujian Berlangsung" : "Siap Ujian?"}
                    </h2>
                    <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                      {isDone
                        ? "Kamu telah menyelesaikan ujian. Lihat hasil dan analisis nilaimu."
                        : isInProgress
                        ? "Ujianmu sedang berlangsung. Lanjutkan dari halaman ujian."
                        : "Pastikan kamu sudah membaca instruksi dengan seksama sebelum memulai."}
                    </p>

                    {isDone ? (
                      <Button
                        id="btn-lihat-hasil"
                        onClick={() => router.push("/exam/result")}
                        className="w-full bg-white text-[#0F52BA] hover:bg-blue-50 font-bold rounded-xl h-11"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Hasil
                      </Button>
                    ) : isInProgress ? (
                      <Button
                        id="btn-lanjutkan-ujian"
                        onClick={() => router.push("/exam")}
                        className="w-full bg-white text-[#0F52BA] hover:bg-blue-50 font-bold rounded-xl h-11"
                      >
                        <ArrowRight className="mr-2 h-4 w-4" />
                        Lanjutkan Ujian
                      </Button>
                    ) : (
                      <Button
                        id="btn-mulai-ujian"
                        onClick={() => router.push("/exam/countdown")}
                        className="w-full bg-white text-[#0F52BA] hover:bg-blue-50 font-bold rounded-xl h-11 group"
                      >
                        Mulai Ujian
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <Card className="border-border/60 shadow-sm rounded-2xl bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Info Cepat</p>
                  {[
                    { label: "Total Soal", value: "90 soal" },
                    { label: "Durasi Total", value: "120 menit" },
                    { label: "Penilaian", value: "+4 / −1 / 0" },
                    { label: "Jumlah Kelompok", value: "5 kelompok" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{item.label}</span>
                      <span className="text-xs font-semibold text-foreground">{item.value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Security / Password Reset card */}
              <Card className="border-border/60 shadow-sm rounded-2xl bg-card/80 backdrop-blur-sm">
                <CardContent className="p-5 space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Keamanan</p>
                  <Button
                    onClick={() => setShowChangePasswordModal(true)}
                    variant="outline"
                    className="w-full text-xs font-semibold border-border hover:bg-muted/50 gap-2 h-9 flex items-center justify-center text-blue-600 dark:text-blue-400"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    Ubah Password Akun
                  </Button>
                </CardContent>
              </Card>
            </div>
          </motion.div>

          <motion.p variants={itemVariants} className="text-center text-xs text-muted-foreground pb-4">
            © 2026 PMII Komisariat UIN Sunan Gunung Djati Bandung · CBT BIMTES
          </motion.p>
        </motion.div>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showChangePasswordModal} onOpenChange={(open) => {
        if (!open) {
          setShowChangePasswordModal(false);
          setNewPassword("");
          setConfirmPassword("");
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-blue-600" />
              Ubah Password Ujian
            </DialogTitle>
            <DialogDescription>
              Silakan masukkan password baru Anda. Pastikan password mudah diingat namun tetap aman.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleChangePassword} className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Password Baru</label>
              <Input
                type="password"
                placeholder="Masukkan password baru (min. 6 karakter)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Konfirmasi Password Baru</label>
              <Input
                type="password"
                placeholder="Ulangi password baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
                disabled={loadingPassword}
              >
                Batal
              </Button>
              <Button
                type="submit"
                className="bg-blue-600 text-white hover:bg-blue-700"
                disabled={loadingPassword}
              >
                {loadingPassword ? "Menyimpan..." : "Simpan Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
