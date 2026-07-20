"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Trophy,
  Activity,
  BarChart2,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardData {
  totalParticipants: number;
  totalQuestions: number;
  totalCompleted: number;
  activeExams: number;
  averageScore: number;
  completionRate: number;
}

const statCards = (data: DashboardData) => [
  {
    label: "Total Peserta",
    value: data.totalParticipants.toLocaleString("id-ID"),
    icon: Users,
    color: "from-blue-500 to-blue-600",
    bg: "bg-blue-50",
    textColor: "text-blue-600",
    suffix: "peserta",
  },
  {
    label: "Total Soal Aktif",
    value: data.totalQuestions.toLocaleString("id-ID"),
    icon: BookOpen,
    color: "from-violet-500 to-violet-600",
    bg: "bg-violet-50",
    textColor: "text-violet-600",
    suffix: "soal",
  },
  {
    label: "Ujian Selesai",
    value: data.totalCompleted.toLocaleString("id-ID"),
    icon: CheckCircle2,
    color: "from-emerald-500 to-emerald-600",
    bg: "bg-emerald-50",
    textColor: "text-emerald-600",
    suffix: "sesi",
  },
  {
    label: "Ujian Aktif",
    value: data.activeExams.toLocaleString("id-ID"),
    icon: Activity,
    color: "from-amber-500 to-orange-500",
    bg: "bg-amber-50",
    textColor: "text-amber-600",
    suffix: "sedang berlangsung",
  },
  {
    label: "Rata-rata Nilai",
    value: data.averageScore.toFixed(1),
    icon: Trophy,
    color: "from-rose-500 to-pink-500",
    bg: "bg-rose-50",
    textColor: "text-rose-600",
    suffix: "/ 100",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

function AnimatedCounter({
  value,
  suffix,
}: {
  value: string;
  suffix?: string;
}) {
  return (
    <div>
      <span className="text-3xl font-bold tracking-tight">{value}</span>
      {suffix && (
        <span className="ml-1.5 text-xs text-muted-foreground">{suffix}</span>
      )}
    </div>
  );
}

function CompletionRing({ rate }: { rate: number }) {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (rate / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          stroke="url(#grad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0F52BA" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-lg font-bold text-[#0F52BA]">{rate}%</span>
        <span className="text-[9px] text-muted-foreground leading-tight">
          selesai
        </span>
      </div>
    </div>
  );
}

export default function DashboardClientWrapper({
  data,
}: {
  data: DashboardData;
}) {
  const cards = statCards(data);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Ringkasan data CBT BIMTES PMII 2026
        </p>
      </motion.div>

      {/* Stat Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4"
      >
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.label} variants={itemVariants}>
              <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div
                  className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${card.color}`}
                />
                <CardContent className="pt-5 pb-4 px-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        {card.label}
                      </p>
                      <AnimatedCounter
                        value={card.value}
                        suffix={card.suffix}
                      />
                    </div>
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}
                    >
                      <Icon className={`h-5 w-5 ${card.textColor}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Second Row */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Completion Rate Card */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#0F52BA]" />
                Tingkat Penyelesaian
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 pt-2">
              <CompletionRing rate={data.completionRate} />
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {data.totalCompleted} dari {data.totalParticipants} peserta
                  telah menyelesaikan ujian
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-0 shadow-sm h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-[#0F52BA]" />
                Aktivitas Terkini
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              <ActivityRow
                icon={<Activity className="h-4 w-4 text-amber-500" />}
                label="Ujian berlangsung saat ini"
                value={`${data.activeExams} sesi`}
                badge={data.activeExams > 0 ? "live" : "idle"}
              />
              <ActivityRow
                icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                label="Ujian sudah selesai"
                value={`${data.totalCompleted} sesi`}
                badge="done"
              />
              <ActivityRow
                icon={<Clock className="h-4 w-4 text-blue-500" />}
                label="Peserta belum mulai"
                value={`${Math.max(0, data.totalParticipants - data.totalCompleted - data.activeExams)} peserta`}
                badge="pending"
              />
              <ActivityRow
                icon={<Trophy className="h-4 w-4 text-rose-500" />}
                label="Nilai rata-rata keseluruhan"
                value={`${data.averageScore.toFixed(2)}`}
                badge="score"
              />
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

function ActivityRow({
  icon,
  label,
  value,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  badge: string;
}) {
  const badgeMap: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
      className: string;
    }
  > = {
    live: {
      variant: "default",
      label: "LIVE",
      className: "bg-amber-100 text-amber-700 border-amber-200",
    },
    idle: {
      variant: "secondary",
      label: "IDLE",
      className: "bg-gray-100 text-gray-600 border-gray-200",
    },
    done: {
      variant: "default",
      label: "SELESAI",
      className: "bg-emerald-100 text-emerald-700 border-emerald-200",
    },
    pending: {
      variant: "secondary",
      label: "MENUNGGU",
      className: "bg-blue-50 text-blue-600 border-blue-100",
    },
    score: {
      variant: "outline",
      label: "NILAI",
      className: "bg-rose-50 text-rose-600 border-rose-100",
    },
  };

  const b = badgeMap[badge] ?? badgeMap.idle;

  return (
    <div className="flex items-center gap-3 rounded-xl border bg-gray-50/50 px-4 py-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold text-gray-800">{value}</p>
      </div>
      <Badge
        variant={b.variant}
        className={`text-[10px] font-semibold shrink-0 ${b.className}`}
      >
        {b.label}
      </Badge>
    </div>
  );
}
