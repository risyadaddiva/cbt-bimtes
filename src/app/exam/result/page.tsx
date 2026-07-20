"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Printer,
  ChevronLeft,
  CheckCircle2,
  XCircle,
  MinusCircle,
  Award,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CATEGORY_LABELS } from "@/lib/randomize";

interface CategoryScore {
  category: string;
  label: string;
  score: number;
  correct: number;
  incorrect: number;
  unanswered: number;
  total: number;
}

interface ChoiceReview {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

interface QuestionReview {
  id: string;
  text: string;
  explanation: string | null;
  difficulty: number;
  selectedChoiceId: string | null;
  isCorrect: boolean;
  isMarkedReview: boolean;
  choices: ChoiceReview[];
}

interface CategoryDetails {
  category: string;
  label: string;
  questions: QuestionReview[];
}

interface ResultData {
  id: string;
  totalScore: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
  rank: number | null;
  scorePerCategory: CategoryScore[];
  submittedAt: string;
  participant: {
    name: string;
    school: string;
    track: string;
  };
  details: CategoryDetails[];
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("");
  const [formattedDate, setFormattedDate] = useState<string>("");

  useEffect(() => {
    setFormattedDate(new Date().toLocaleString("id-ID"));
  }, []);

  useEffect(() => {
    fetch("/api/exam/result")
      .then((res) => res.json())
      .then((data) => {
        console.log("API Result Data:", data);
        if (data.success && data.data) {
          console.log("Setting result state:", data.data);
          setResult(data.data);
          if (data.data.details && data.data.details.length > 0) {
            setActiveCategoryTab(data.data.details[0].category);
          }
        } else {
          console.error("API response was not successful:", data);
          router.replace("/dashboard");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch result:", err);
        router.replace("/dashboard");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F52BA]"></div>
      </div>
    );
  }

  const { participant } = result;
  const trackLabel =
    CATEGORY_LABELS[participant.track as keyof typeof CATEGORY_LABELS] ||
    participant.track;

  const activeCategory = result.details?.find((cat) => cat.category === activeCategoryTab);

  return (
    <div className="min-h-screen bg-muted/30 py-8 px-4 md:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Actions — hidden when printing */}
        <div className="flex items-center justify-between no-print">
          <Button variant="ghost" onClick={() => router.push("/dashboard")}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Button>
          <Button
            onClick={() => window.print()}
            className="bg-[#0F52BA] hover:bg-blue-800 text-white"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak Sertifikat
          </Button>
        </div>

        {/* Main Result Card (certificate) */}
        <Card className="border-none shadow-xl overflow-hidden bg-white dark:bg-card">
          {/* Header */}
          <div className="bg-gradient-to-br from-[#0F52BA] via-[#1A6FE8] to-[#0A3D8A] p-8 text-center text-white">
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center mx-auto mb-4 p-3 shadow-md">
              <img src="/logo pmii.svg" alt="Logo PMII" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Sertifikat Hasil Tryout</h1>
            <h2 className="text-xl text-blue-100">
              BIMTES PMII UIN Bandung 2026
            </h2>
          </div>

          <CardContent className="p-8">
            {/* Participant Info */}
            <div className="text-center mb-10 pb-8 border-b border-border">
              <p className="text-muted-foreground mb-1">Diberikan Kepada:</p>
              <h3 className="text-3xl font-bold text-[#0F52BA] mb-2">
                {participant.name}
              </h3>
              <p className="text-lg text-muted-foreground font-medium">
                {participant.school}
              </p>
              <div className="mt-4 inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-950/30 text-[#0F52BA] px-4 py-1.5 rounded-full font-semibold text-sm">
                Jalur: {trackLabel}
              </div>
            </div>

            {/* Score Display */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="flex flex-col items-center justify-center p-6 bg-muted/50 rounded-2xl border border-border">
                <p className="text-muted-foreground font-medium mb-2 text-sm">
                  Nilai Total (Metode SNBT)
                </p>
                <div className="text-6xl font-black text-[#0F52BA] tracking-tighter">
                  {Number(result.totalScore).toFixed(1)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border border-green-100 dark:border-green-900">
                  <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                  <span className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {result.totalCorrect}
                  </span>
                  <span className="text-xs font-medium text-green-600 uppercase">
                    Benar
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900">
                  <XCircle className="w-8 h-8 text-red-500 mb-2" />
                  <span className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {result.totalIncorrect}
                  </span>
                  <span className="text-xs font-medium text-red-600 uppercase">
                    Salah
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  <MinusCircle className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
                    {result.totalUnanswered}
                  </span>
                  <span className="text-xs font-medium text-gray-500 uppercase">
                    Kosong
                  </span>
                </div>
                <div className="flex flex-col items-center justify-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-xl border border-yellow-100 dark:border-yellow-900">
                  <Award className="w-8 h-8 text-yellow-500 mb-2" />
                  <span className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    #{result.rank || "-"}
                  </span>
                  <span className="text-xs font-medium text-yellow-600 uppercase">
                    Peringkat
                  </span>
                </div>
              </div>
            </div>

            {/* Breakdown by Category */}
            <div>
              <h4 className="font-bold text-lg mb-4 text-foreground">
                Rincian Nilai per Subtes
              </h4>
              <div className="space-y-4">
                {result.scorePerCategory.map((cat) => (
                  <div
                    key={cat.category}
                    className="bg-card border border-border p-4 rounded-xl"
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{cat.label}</span>
                      <span className="font-bold text-[#0F52BA] text-lg">
                        {Number(cat.score).toFixed(1)}
                      </span>
                    </div>
                    {/* Visual progress bar */}
                    <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden flex">
                      <div
                        style={{
                          width:
                            cat.total > 0
                              ? (cat.correct / cat.total) * 100 + "%"
                              : "0%",
                        }}
                        className="bg-green-500 h-full"
                      />
                      <div
                        style={{
                          width:
                            cat.total > 0
                              ? (cat.incorrect / cat.total) * 100 + "%"
                              : "0%",
                        }}
                        className="bg-red-500 h-full"
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                      <span>Total: {cat.total} soal</span>
                      <div className="flex gap-3">
                        <span className="text-green-600">{cat.correct} Benar</span>
                        <span className="text-red-600">{cat.incorrect} Salah</span>
                        <span className="text-gray-500">{cat.unanswered} Kosong</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 text-center text-sm text-muted-foreground border-t border-border pt-6">
              Dicetak pada: {formattedDate}
              <br />
              Sistem Ujian Terkomputerisasi - PMII Komisariat UIN Sunan Gunung
              Djati Bandung
            </div>
          </CardContent>
        </Card>

        {/* Pembahasan Soal Card */}
        <Card className="no-print border border-border bg-card shadow-lg">
          <CardContent className="p-6 md:p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-[#0F52BA]" />
                Pembahasan & Review Soal
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Tinjau kembali jawaban Anda dan pelajari pembahasan untuk setiap soal.
              </p>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-border pb-4">
              {result.details?.map((cat) => (
                <button
                  key={cat.category}
                  onClick={() => setActiveCategoryTab(cat.category)}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all border ${
                    activeCategoryTab === cat.category
                      ? "bg-[#0F52BA] text-white border-transparent shadow-sm"
                      : "bg-background text-muted-foreground hover:text-foreground border-border hover:bg-muted/50"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Questions List */}
            <div className="space-y-8">
              {activeCategory?.questions.map((q, idx) => {
                let statusBadge = null;
                if (q.selectedChoiceId === null) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      <MinusCircle className="w-3.5 h-3.5" />
                      Tidak Dijawab
                    </span>
                  );
                } else if (q.isCorrect) {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Benar (+4)
                    </span>
                  );
                } else {
                  statusBadge = (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400">
                      <XCircle className="w-3.5 h-3.5" />
                      Salah (-1)
                    </span>
                  );
                }

                return (
                  <div key={q.id} className="border-b border-border pb-6 last:border-b-0 last:pb-0 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                      <span className="font-bold text-[#0F52BA] text-sm">
                        SOAL {idx + 1}
                      </span>
                      {statusBadge}
                    </div>

                    <div
                      className="prose prose-sm max-w-none text-foreground leading-relaxed font-medium"
                      dangerouslySetInnerHTML={{
                        __html: q.text.replace(/\n/g, "<br/>"),
                      }}
                    />

                    {/* Choices */}
                    <div className="grid gap-2.5">
                      {q.choices.map((choice) => {
                        const isUserChoice = q.selectedChoiceId === choice.id;
                        const isCorrectChoice = choice.isCorrect;

                        let choiceStyle = "border-border bg-card hover:bg-muted/10";
                        let checkIcon = null;

                        if (isCorrectChoice) {
                          choiceStyle = "border-green-500 bg-green-50/70 dark:bg-green-950/20 text-green-900 dark:text-green-300 font-medium";
                          checkIcon = <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />;
                        } else if (isUserChoice && !isCorrectChoice) {
                          choiceStyle = "border-red-500 bg-red-50/70 dark:bg-red-950/20 text-red-900 dark:text-red-300";
                          checkIcon = <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />;
                        }

                        return (
                          <div
                            key={choice.id}
                            className={`flex items-start p-3 border-2 rounded-xl text-sm transition-all select-none ${choiceStyle}`}
                          >
                            <span className={`font-bold mr-2.5 ${isCorrectChoice ? "text-green-700 dark:text-green-400" : isUserChoice ? "text-red-700 dark:text-red-400" : "text-muted-foreground"}`}>
                              {choice.label}.
                            </span>
                            <span
                              className="flex-1"
                              dangerouslySetInnerHTML={{ __html: choice.text }}
                            />
                            {checkIcon}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/50 p-4 rounded-xl space-y-2">
                        <h5 className="font-bold text-xs text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                          Pembahasan / Penjelasan:
                        </h5>
                        <p
                          className="text-sm text-foreground leading-relaxed"
                          dangerouslySetInnerHTML={{
                            __html: q.explanation.replace(/\n/g, "<br/>"),
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
