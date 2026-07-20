import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Users, BookOpen, CheckCircle2, Clock, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") return null;

  const [
    totalParticipants,
    totalQuestions,
    totalCompleted,
    activeExams,
    results,
  ] = await Promise.all([
    prisma.participant.count(),
    prisma.question.count({ where: { isActive: true } }),
    prisma.examSession.count({ where: { status: "SUBMITTED" } }),
    prisma.examSession.count({ where: { status: "IN_PROGRESS" } }),
    prisma.result.findMany({ select: { totalScore: true } }),
  ]);

  const averageScore =
    results.length > 0
      ? results.reduce((acc, curr) => acc + curr.totalScore, 0) / results.length
      : 0;

  const STATS = [
    { title: "Total Peserta", value: totalParticipants, icon: Users, color: "text-blue-600", bgColor: "bg-blue-100" },
    { title: "Total Soal", value: totalQuestions, icon: BookOpen, color: "text-purple-600", bgColor: "bg-purple-100" },
    { title: "Ujian Selesai", value: totalCompleted, icon: CheckCircle2, color: "text-green-600", bgColor: "bg-green-100" },
    { title: "Ujian Aktif", value: activeExams, icon: Clock, color: "text-amber-600", bgColor: "bg-amber-100" },
    { title: "Rata-rata Nilai", value: averageScore.toFixed(1), icon: Activity, color: "text-rose-600", bgColor: "bg-rose-100" },
  ];

  const recentActivities = await prisma.activityLog.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        include: {
          participant: true,
        },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Ringkasan sistem CBT BIMTES 2026</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {STATS.map((stat, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={"p-2 rounded-full " + stat.bgColor}>
                <stat.icon className={"w-4 h-4 " + stat.color} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Aktivitas Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada aktivitas.
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivities.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center gap-4 border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {log.user?.participant?.name || log.user?.username || "Unknown"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {log.action} -{" "}
                        {new Date(log.createdAt).toLocaleTimeString("id-ID")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border shadow-sm bg-[#0F52BA] text-white">
          <CardHeader>
            <CardTitle className="text-white">Akses Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-blue-100 text-sm mb-4">
              Kelola data utama sistem melalui menu cepat berikut:
            </p>
            <div className="grid grid-cols-2 gap-3">
              <a
                href="/admin/participants/new"
                className="bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-lg font-medium text-sm transition-colors border border-white/10"
              >
                + Tambah Peserta
              </a>
              <a
                href="/admin/questions/new"
                className="bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-lg font-medium text-sm transition-colors border border-white/10"
              >
                + Tambah Soal
              </a>
              <a
                href="/admin/results"
                className="bg-white/20 hover:bg-white/30 text-white text-center py-3 rounded-lg font-medium text-sm transition-colors border border-white/10 col-span-2"
              >
                Lihat Semua Hasil
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
