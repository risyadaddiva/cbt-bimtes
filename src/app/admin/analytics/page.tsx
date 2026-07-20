"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { Trophy, TrendingUp, TrendingDown, Target, Activity } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function AnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F52BA]"></div>
      </div>
    );
  }

  const COLORS = ["#0F52BA", "#1A6FE8", "#0A3D8A", "#2563EB", "#3B82F6", "#60A5FA"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Analisis Data Ujian</h1>
        <p className="text-muted-foreground mt-1">
          Evaluasi performa peserta secara komprehensif
        </p>
      </div>

      {/* Overview Card */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-border shadow-sm bg-[#0F52BA] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tingkat Penyelesaian</CardTitle>
            <Activity className="w-5 h-5 opacity-80" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{data.completionRate}%</div>
            <p className="text-sm text-blue-100 mt-1">
              Peserta telah menyelesaikan ujian
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Bar chart per kategori */}
        <Card className="border-border shadow-sm col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-[#0F52BA]" />
              Rata-rata Nilai per Kategori Soal
            </CardTitle>
            <CardDescription>Skor 0–100 per kategori</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.scoreByCategory}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="category"
                    angle={-40}
                    textAnchor="end"
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  />
                  <Bar dataKey="avg" name="Nilai Rata-rata" radius={[4, 4, 0, 0]}>
                    {data.scoreByCategory.map((_: any, index: number) => (
                      <Cell key={"cell-" + index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Soal Termudah */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              Soal Termudah
            </CardTitle>
            <CardDescription>Tingkat benar tertinggi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.easiestQuestions.map((q: any, i: number) => (
              <div
                key={q.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold shrink-0 text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium line-clamp-2 mb-1"
                    dangerouslySetInnerHTML={{ __html: q.text }}
                  />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="text-green-600 font-bold">
                      {(q.correctRate * 100).toFixed(1)}% Benar
                    </span>
                    <span>Total {q.total} Jawaban</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Soal Tersulit */}
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <TrendingDown className="w-5 h-5" />
              Soal Tersulit
            </CardTitle>
            <CardDescription>Tingkat salah tertinggi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.hardestQuestions.map((q: any, i: number) => (
              <div
                key={q.id}
                className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold shrink-0 text-sm">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium line-clamp-2 mb-1"
                    dangerouslySetInnerHTML={{ __html: q.text }}
                  />
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="text-red-600 font-bold">
                      {(q.wrongRate * 100).toFixed(1)}% Salah
                    </span>
                    <span>Total {q.total} Jawaban</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="border-border shadow-sm md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Trophy className="w-5 h-5" />
              Top 10 Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-6 py-3 font-medium w-16 text-center">Rank</th>
                    <th className="px-6 py-3 font-medium">Nama Peserta</th>
                    <th className="px-6 py-3 font-medium">Asal Sekolah</th>
                    <th className="px-6 py-3 font-medium text-right">Skor Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.rankingLeaderboard.map((r: any, i: number) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-6 py-3 text-center">
                        {i === 0 ? (
                          <Trophy className="w-5 h-5 mx-auto text-yellow-500" />
                        ) : i === 1 ? (
                          <Trophy className="w-5 h-5 mx-auto text-gray-400" />
                        ) : i === 2 ? (
                          <Trophy className="w-5 h-5 mx-auto text-amber-700" />
                        ) : (
                          <span className="font-bold text-muted-foreground">{i + 1}</span>
                        )}
                      </td>
                      <td className="px-6 py-3 font-semibold">{r.name}</td>
                      <td className="px-6 py-3 text-muted-foreground">{r.school}</td>
                      <td className="px-6 py-3 text-right font-bold text-[#0F52BA] text-lg">
                        {Number(r.score).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
