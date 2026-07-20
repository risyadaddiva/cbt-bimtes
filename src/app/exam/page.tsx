"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Clock,
  Flag,
  ChevronLeft,
  ChevronRight,
  Menu,
  AlertTriangle,
  CheckCircle2,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatTime, getRemainingSeconds } from "@/lib/utils";
import { CATEGORY_LABELS } from "@/lib/randomize";

interface Choice {
  id: string;
  label: string;
  text: string;
}

interface Question {
  id: string;
  number: number;
  text: string;
  choices: Choice[];
  selectedChoiceId: string | null;
  isMarkedReview: boolean;
}

interface Group {
  id: string;
  category: string;
  status: string;
  durationSecs: number;
  startedAt: string | null;
  questions: Question[];
}

interface ExamSession {
  id: string;
  status: string;
  groups: Group[];
}

export default function ExamPage() {
  const router = useRouter();
  const [examSession, setExamSession] = useState<ExamSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentGroupIndex, setCurrentGroupIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const finalSubmit = useCallback(async () => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/exam/submit", { method: "POST" });
      if (res.ok) {
        toast.success("Ujian berhasil diselesaikan!");
        router.replace("/exam/result");
      } else {
        toast.error("Gagal submit ujian.");
        setSubmitting(false);
      }
    } catch {
      toast.error("Gagal submit ujian.");
      setSubmitting(false);
    }
  }, [router]);

  // Load exam session on mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/api/exam/session");
        const json = await res.json();

        if (!json.data || json.data.status === "SUBMITTED") {
          router.replace("/dashboard");
          return;
        }

        const session: ExamSession = json.data;
        setExamSession(session);

        // Find the active group
        const activeIdx = session.groups.findIndex(
          (g) => g.status === "IN_PROGRESS"
        );
        if (activeIdx >= 0) {
          setCurrentGroupIndex(activeIdx);
          const activeGroup = session.groups[activeIdx];
          const remaining = getRemainingSeconds(
            activeGroup.startedAt,
            activeGroup.durationSecs
          );
          setTimeLeft(remaining);
        } else {
          // All groups submitted — final submit
          await finalSubmit();
        }
      } catch {
        toast.error("Gagal memuat sesi ujian");
        router.replace("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [router, finalSubmit]);

  // Countdown timer
  useEffect(() => {
    if (!examSession || loading || timeLeft <= 0) return;

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // Auto-submit current group when time is up
          (async () => {
            toast.error("Waktu habis untuk bagian ini!");
            await submitCurrentGroup();
          })();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examSession, loading]);

  // Tab switch detection
  useEffect(() => {
    if (!examSession) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        toast.error("⚠️ Peringatan: Anda meninggalkan halaman ujian!", {
          duration: 5000,
        });
        fetch("/api/exam/log", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "TAB_SWITCH" }),
        }).catch(console.error);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [examSession]);

  const submitCurrentGroup = async () => {
    if (!examSession || submitting) return;
    const group = examSession.groups[currentGroupIndex];

    setSubmitting(true);
    try {
      const res = await fetch("/api/exam/submit-group", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionGroupId: group.id }),
      });

      const data = await res.json();
      if (data.success) {
        if (data.data.isLastGroup) {
          await finalSubmit();
        } else {
          toast.success("Bagian selesai. Memuat bagian berikutnya...");
          setTimeout(() => window.location.reload(), 800);
        }
      }
    } catch {
      toast.error("Gagal submit bagian ini.");
      setSubmitting(false);
    }
  };

  const handleAnswerSelect = async (choiceId: string) => {
    if (!examSession) return;

    // Optimistic update
    const updated = { ...examSession };
    const group = updated.groups[currentGroupIndex];
    const question = { ...group.questions[currentQuestionIndex] };
    question.selectedChoiceId = choiceId;
    group.questions[currentQuestionIndex] = question;
    setExamSession(updated);

    // Save to server (fire-and-forget)
    fetch("/api/exam/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionGroupId: group.id,
        questionId: question.id,
        selectedChoiceId: choiceId,
        isMarkedReview: question.isMarkedReview,
      }),
    }).catch(() => toast.error("Gagal menyimpan jawaban"));
  };

  const toggleMarkReview = async () => {
    if (!examSession) return;

    const updated = { ...examSession };
    const group = updated.groups[currentGroupIndex];
    const question = { ...group.questions[currentQuestionIndex] };
    question.isMarkedReview = !question.isMarkedReview;
    group.questions[currentQuestionIndex] = question;
    setExamSession(updated);

    fetch("/api/exam/answer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionGroupId: group.id,
        questionId: question.id,
        selectedChoiceId: question.selectedChoiceId,
        isMarkedReview: question.isMarkedReview,
      }),
    }).catch(console.error);
  };

  if (loading || !examSession) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0F52BA] mx-auto"></div>
          <p className="text-muted-foreground">Memuat soal ujian...</p>
        </div>
      </div>
    );
  }

  const group = examSession.groups[currentGroupIndex];
  const question = group.questions[currentQuestionIndex];
  const categoryLabel =
    CATEGORY_LABELS[group.category as keyof typeof CATEGORY_LABELS] ||
    group.category;
  const isLastQuestion = currentQuestionIndex === group.questions.length - 1;
  const answeredCount = group.questions.filter((q) => q.selectedChoiceId).length;

  const QuestionNavigator = () => (
    <div className="grid grid-cols-5 gap-2 p-2">
      {group.questions.map((q, idx) => (
        <button
          key={q.id}
          onClick={() => setCurrentQuestionIndex(idx)}
          className={cn(
            "h-9 w-full rounded-md text-xs font-semibold flex items-center justify-center transition-all border",
            currentQuestionIndex === idx
              ? "ring-2 ring-[#0F52BA] ring-offset-1 scale-105"
              : "",
            q.selectedChoiceId && !q.isMarkedReview
              ? "bg-[#0F52BA] text-white border-transparent"
              : "",
            q.isMarkedReview
              ? "bg-amber-500 text-white border-transparent"
              : "",
            !q.selectedChoiceId && !q.isMarkedReview
              ? "bg-card hover:bg-muted border-border"
              : ""
          )}
        >
          {idx + 1}
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-muted/10 overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 bg-background border-b border-border shadow-sm flex-shrink-0">
        <div>
          <div className="font-semibold text-sm">{categoryLabel}</div>
          <div className="text-xs text-muted-foreground">
            {currentQuestionIndex + 1}/{group.questions.length}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center gap-1 font-mono font-bold text-sm",
              timeLeft < 300 ? "text-red-500 animate-pulse" : "text-[#0F52BA]"
            )}
          >
            <Clock className="w-4 h-4" />
            {formatTime(timeLeft)}
          </div>
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="outline" size="icon" className="h-8 w-8" />
              }
            >
              <Menu className="w-4 h-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 overflow-y-auto">
              <div className="py-4">
                <h3 className="font-bold mb-2 flex items-center gap-2 px-2">
                  <LayoutGrid className="w-4 h-4" />
                  Navigasi Soal
                </h3>
                <QuestionNavigator />
                <div className="mt-4 px-2 space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-[#0F52BA]"></div>{" "}
                    Dijawab
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-amber-500"></div>{" "}
                    Ragu-ragu
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded border border-border"></div>{" "}
                    Belum
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Desktop header */}
        <div className="hidden md:flex items-center justify-between px-8 py-4 bg-background border-b border-border shadow-sm flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo pmii.svg" alt="Logo PMII" className="w-8 h-8 object-contain" />
            <div>
              <h1 className="text-xl font-bold text-[#0F52BA]">
                CBT BIMTES 2026
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                {categoryLabel} — Soal {currentQuestionIndex + 1} dari{" "}
                {group.questions.length}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold text-green-600">
                {answeredCount}
              </span>{" "}
              / {group.questions.length} dijawab
            </div>
            <div
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-mono font-bold text-xl border-2",
                timeLeft < 300
                  ? "bg-red-50 text-red-600 border-red-300 animate-pulse"
                  : "bg-blue-50 text-[#0F52BA] border-blue-200"
              )}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        {/* Question area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="max-w-3xl mx-auto"
            >
              {/* Question header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-[#0F52BA] to-[#1A6FE8] text-white font-bold text-lg shadow">
                    {currentQuestionIndex + 1}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleMarkReview}
                  className={cn(
                    "gap-2 transition-colors",
                    question.isMarkedReview
                      ? "bg-amber-100 text-amber-700 border-amber-300"
                      : ""
                  )}
                >
                  <Flag
                    className={cn(
                      "w-4 h-4",
                      question.isMarkedReview ? "fill-current" : ""
                    )}
                  />
                  {question.isMarkedReview ? "Ditandai Ragu" : "Tandai Ragu"}
                </Button>
              </div>

              {/* Question Card */}
              <Card className="shadow-sm mb-6">
                <CardContent className="p-6 md:p-8">
                  <div
                    className="prose prose-lg max-w-none mb-8 text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{
                      __html: question.text.replace(/\n/g, "<br/>"),
                    }}
                  />

                  <div className="space-y-3">
                    {question.choices.map((choice) => (
                      <label
                        key={choice.id}
                        className={cn(
                          "flex items-start p-4 border-2 rounded-xl cursor-pointer transition-all duration-150 select-none",
                          "hover:border-[#0F52BA] hover:bg-blue-50/60 dark:hover:bg-blue-900/20",
                          question.selectedChoiceId === choice.id
                            ? "border-[#0F52BA] bg-blue-50 dark:bg-blue-900/30"
                            : "border-border bg-card"
                        )}
                      >
                        <div className="flex items-center h-6 shrink-0">
                          <input
                            type="radio"
                            name={"question-" + question.id}
                            value={choice.id}
                            checked={question.selectedChoiceId === choice.id}
                            onChange={() => handleAnswerSelect(choice.id)}
                            className="w-5 h-5 text-[#0F52BA] accent-[#0F52BA]"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <span className="font-bold mr-2 text-[#0F52BA]">
                            {choice.label}.
                          </span>
                          <span
                            className="text-base text-foreground"
                            dangerouslySetInnerHTML={{ __html: choice.text }}
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() =>
                    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentQuestionIndex === 0}
                  className="w-32"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" />
                  Sebelumnya
                </Button>

                {isLastQuestion ? (
                  <Button
                    size="lg"
                    onClick={() => setShowSubmitConfirm(true)}
                    disabled={submitting}
                    className="w-48 bg-green-600 hover:bg-green-700 text-white font-bold"
                  >
                    <CheckCircle2 className="w-5 h-5 mr-2" />
                    Selesaikan Bagian
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(group.questions.length - 1, prev + 1)
                      )
                    }
                    className="w-32 bg-[#0F52BA] hover:bg-blue-800 text-white"
                  >
                    Selanjutnya
                    <ChevronRight className="w-5 h-5 ml-1" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop right sidebar navigator */}
      <div className="hidden md:flex w-72 bg-background border-l border-border shadow-sm flex-col overflow-hidden flex-shrink-0">
        <div className="p-4 border-b border-border bg-muted/30">
          <h3 className="font-bold flex items-center gap-2 text-sm">
            <LayoutGrid className="w-4 h-4 text-[#0F52BA]" />
            Navigasi Soal
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            {answeredCount} dari {group.questions.length} sudah dijawab
          </p>
        </div>
        <div className="flex-1 overflow-y-auto">
          <QuestionNavigator />
        </div>
        <div className="p-4 border-t border-border bg-muted/30 space-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#0F52BA] shrink-0"></div>
            Sudah Dijawab
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-500 shrink-0"></div>
            Ditandai Ragu-ragu
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded border border-border shrink-0"></div>
            Belum Dijawab
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Selesaikan Bagian Ini?</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menyelesaikan bagian{" "}
              <strong>{categoryLabel}</strong>? Setelah disubmit, Anda tidak
              dapat mengubah jawaban pada bagian ini lagi.
            </DialogDescription>
          </DialogHeader>

          <div className="my-4 p-4 bg-muted rounded-lg space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Total Soal:</span>
              <span className="font-bold">{group.questions.length}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Sudah Dijawab:</span>
              <span className="font-bold">{answeredCount}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Belum Dijawab:</span>
              <span className="font-bold">
                {group.questions.length - answeredCount}
              </span>
            </div>
            <div className="flex justify-between text-amber-600">
              <span>Ditandai Ragu:</span>
              <span className="font-bold">
                {group.questions.filter((q) => q.isMarkedReview).length}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmitConfirm(false)}
              disabled={submitting}
            >
              Batal, Lanjut Periksa
            </Button>
            <Button
              onClick={() => {
                setShowSubmitConfirm(false);
                submitCurrentGroup();
              }}
              disabled={submitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {submitting ? "Menyimpan..." : "Ya, Selesaikan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
