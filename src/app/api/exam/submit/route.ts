import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculateGroupScore } from "@/lib/randomize";


export async function POST() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "PARTICIPANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const participantId = (session.user as any).participantId;

    const examSession = await prisma.examSession.findFirst({
      where: { participantId, status: "IN_PROGRESS" },
      include: {
        sessionGroups: {
          include: { answers: true },
        },
      },
    });

    if (!examSession) {
      return NextResponse.json({ error: "No active exam session" }, { status: 404 });
    }

    // Submit all pending/in-progress groups
    const now = new Date();
    for (const group of examSession.sessionGroups) {
      if (group.status !== "SUBMITTED") {
        await prisma.sessionGroup.update({
          where: { id: group.id },
          data: { status: "SUBMITTED", submittedAt: now },
        });
      }
    }

    // Calculate scores per category
    const scorePerCategory: Record<string, { score: number; correct: number; incorrect: number; unanswered: number; total: number }> = {};
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalUnanswered = 0;

    for (const group of examSession.sessionGroups) {
      const { score, correct, incorrect, unanswered } = calculateGroupScore(
        group.answers.map((a) => ({
          isCorrect: a.isCorrect,
          selectedChoiceId: a.selectedChoiceId,
        }))
      );

      scorePerCategory[group.category] = {
        score,
        correct,
        incorrect,
        unanswered,
        total: group.answers.length,
      };

      totalCorrect += correct;
      totalIncorrect += incorrect;
      totalUnanswered += unanswered;
    }

    // Overall score = weighted average across all groups
    const allAnswers = examSession.sessionGroups.flatMap((g) => g.answers);
    const { score: totalScore } = calculateGroupScore(
      allAnswers.map((a) => ({
        isCorrect: a.isCorrect,
        selectedChoiceId: a.selectedChoiceId,
      }))
    );

    // Update exam session status
    await prisma.examSession.update({
      where: { id: examSession.id },
      data: { status: "SUBMITTED", submittedAt: now },
    });

    // Create result
    const result = await prisma.result.upsert({
      where: { examSessionId: examSession.id },
      update: {
        totalScore,
        scorePerCategory,
        totalCorrect,
        totalIncorrect,
        totalUnanswered,
      },
      create: {
        examSessionId: examSession.id,
        totalScore,
        scorePerCategory,
        totalCorrect,
        totalIncorrect,
        totalUnanswered,
      },
    });

    // Calculate ranking
    const rank = await prisma.result.count({
      where: { totalScore: { gt: totalScore } },
    });

    await prisma.result.update({
      where: { id: result.id },
      data: { rank: rank + 1 },
    });

    // Log
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "EXAM_SUBMITTED",
        metadata: {
          sessionId: examSession.id,
          totalScore,
          totalCorrect,
          totalIncorrect,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { resultId: result.id },
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
