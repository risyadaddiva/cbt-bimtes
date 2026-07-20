"use client";

import React, { useState, useEffect } from "react";
import { Search, Download, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), school: search });
      const res = await fetch("/api/admin/results?" + params.toString());
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
        setTotalPages(data.totalPages);
      }
    } catch {
      toast.error("Gagal mengambil data hasil ujian");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(), 500);
    return () => clearTimeout(timer);
  }, [search, page]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleExport = () => {
    window.location.href = "/api/admin/results?export=excel";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hasil Ujian</h1>
          <p className="text-muted-foreground mt-1">
            Daftar nilai dan peringkat peserta
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-green-600 hover:bg-green-700 text-white gap-2"
        >
          <Download className="w-4 h-4" /> Export Excel
        </Button>
      </div>

      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Filter berdasarkan sekolah..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
              <tr>
                <th className="px-6 py-4 font-medium w-16 text-center">
                  Rank
                </th>
                <th className="px-6 py-4 font-medium">Nama Peserta</th>
                <th className="px-6 py-4 font-medium">Asal Sekolah</th>
                <th className="px-6 py-4 font-medium text-center">
                  Nilai Total
                </th>
                <th className="px-6 py-4 font-medium text-center">Detail</th>
                <th className="px-6 py-4 font-medium">Waktu Selesai</th>
                <th className="px-6 py-4 font-medium w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Memuat data...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Tidak ada hasil ditemukan.
                  </td>
                </tr>
              ) : (
                results.map((r) => (
                  <React.Fragment key={r.id}>
                    <tr
                      className={
                        "hover:bg-muted/30 transition-colors cursor-pointer " +
                        (expandedId === r.id ? "bg-muted/30" : "")
                      }
                      onClick={() => toggleExpand(r.id)}
                    >
                      <td className="px-6 py-4 text-center font-bold text-[#0F52BA] text-lg">
                        #{r.rank}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground">
                          {r.name}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          {r.username}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {r.school}
                        <div className="mt-1">
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-background"
                          >
                            {r.track}
                          </Badge>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-xl font-bold">
                          {Number(r.totalScore).toFixed(1)}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center whitespace-nowrap">
                        <span className="text-green-600 font-medium">
                          {r.totalCorrect} B
                        </span>{" "}
                        /{" "}
                        <span className="text-red-600 font-medium">
                          {r.totalIncorrect} S
                        </span>{" "}
                        /{" "}
                        <span className="text-gray-500 font-medium">
                          {r.totalUnanswered} K
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">
                        {r.submittedAt
                          ? new Date(r.submittedAt).toLocaleString("id-ID")
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          {expandedId === r.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>

                    {/* Expanded row */}
                    {expandedId === r.id && (
                      <tr className="bg-muted/10">
                        <td colSpan={7} className="p-0">
                          <div className="px-12 py-4 border-l-4 border-[#0F52BA]">
                            <h4 className="font-semibold text-sm mb-3">
                              Rincian per Kelompok Soal
                            </h4>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                              {(r.scorePerCategory || []).map((cat: any) => (
                                <div
                                  key={cat.category}
                                  className="bg-card p-3 rounded-lg border border-border"
                                >
                                  <div
                                    className="text-xs text-muted-foreground mb-1 truncate"
                                    title={cat.label}
                                  >
                                    {cat.label}
                                  </div>
                                  <div className="flex justify-between items-end">
                                    <div className="text-lg font-bold text-[#0F52BA]">
                                      {Number(cat.score).toFixed(1)}
                                    </div>
                                    <div className="text-[10px] space-x-2">
                                      <span className="text-green-600">
                                        {cat.correct}B
                                      </span>
                                      <span className="text-red-600">
                                        {cat.incorrect}S
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Halaman {page} dari {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Sebelumnya
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
