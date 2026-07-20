import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, Category } from "@/lib/randomize";


function isAdmin(session: any) {
  return session && session.user?.role === "ADMIN";
}

export async function GET() {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Average score per category
    const results = await prisma.result.findMany({
      select: { scorePerCategory: true, totalScore: true },
    });

    const categoryTotals: Record<string, { sum: number; count: number }> = {};
    const scoreDistribution: Record<string, number> = {
      "0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0,
    };

    for (const result of results) {
      const spc = result.scorePerCategory as Record<string, { score: number }>;
      for (const [cat, val] of Object.entries(spc)) {
        if (!categoryTotals[cat]) categoryTotals[cat] = { sum: 0, count: 0 };
        categoryTotals[cat].sum += val.score;
        categoryTotals[cat].count++;
      }

      // Score distribution
      const s = result.totalScore;
      if (s <= 20) scoreDistribution["0-20"]++;
      else if (s <= 40) scoreDistribution["21-40"]++;
      else if (s <= 60) scoreDistribution["41-60"]++;
      else if (s <= 80) scoreDistribution["61-80"]++;
      else scoreDistribution["81-100"]++;
    }

    const scoreByCategory = Object.entries(categoryTotals).map(([cat, { sum, count }]) => ({
      category: CATEGORY_LABELS[cat as Category] ?? cat,
      avg: count > 0 ? Math.round((sum / count) * 100) / 100 : 0,
    }));

    // Hardest and easiest questions - database agnostic approach
    const answersList = await prisma.answer.findMany({
      where: {
        selectedChoiceId: { not: null },
      },
      select: {
        questionId: true,
        isCorrect: true,
      },
    });

    const statsMap: Record<string, { total: number; correct: number }> = {};
    for (const ans of answersList) {
      if (!statsMap[ans.questionId]) {
        statsMap[ans.questionId] = { total: 0, correct: 0 };
      }
      statsMap[ans.questionId].total++;
      if (ans.isCorrect) {
        statsMap[ans.questionId].correct++;
      }
    }

    const questionStats = Object.entries(statsMap)
      .map(([questionId, stat]) => ({
        questionId,
        total: stat.total,
        correct: stat.correct,
      }))
      .filter((q) => q.total >= 3);

    const questionIds = questionStats.map((q) => q.questionId);
    const questions = await prisma.question.findMany({
      where: { id: { in: questionIds } },
      select: { id: true, text: true },
    });
    const qMap = new Map(questions.map((q) => [q.id, q.text]));

    const statsWithRate = questionStats.map((q) => ({
      id: q.questionId,
      text: (qMap.get(q.questionId) ?? "").substring(0, 80) + "...",
      total: q.total,
      correct: q.correct,
      correctRate: q.correct / q.total,
      wrongRate: 1 - q.correct / q.total,
    }));

    statsWithRate.sort((a, b) => b.wrongRate - a.wrongRate);
    const hardestQuestions = statsWithRate.slice(0, 5);
    const easiestQuestions = [...statsWithRate].sort((a, b) => b.correctRate - a.correctRate).slice(0, 5);

    // Leaderboard
    const leaderboard = await prisma.result.findMany({
      orderBy: { totalScore: "desc" },
      take: 10,
      include: {
        examSession: {
          include: { participant: { select: { name: true, school: true } } },
        },
      },
    });

    const rankingLeaderboard = leaderboard.map((r, i) => ({
      rank: i + 1,
      name: r.examSession.participant.name,
      school: r.examSession.participant.school,
      score: r.totalScore,
    }));

    // Completion rate
    const [totalP, completed] = await Promise.all([
      prisma.participant.count(),
      prisma.examSession.count({ where: { status: "SUBMITTED" } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        scoreByCategory,
        hardestQuestions,
        easiestQuestions,
        completionRate: totalP > 0 ? Math.round((completed / totalP) * 100) : 0,
        rankingLeaderboard,
        scoreDistribution: Object.entries(scoreDistribution).map(([range, count]) => ({ range, count })),
      },
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
