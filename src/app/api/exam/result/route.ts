import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CATEGORY_LABELS, Category } from "@/lib/randomize";


export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "PARTICIPANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const participantId = (session.user as any).participantId;

    const examSession = await prisma.examSession.findFirst({
      where: { participantId, status: "SUBMITTED" },
      include: {
        result: true,
        participant: true,
        sessionGroups: {
          include: {
            answers: {
              include: {
                question: {
                  include: {
                    choices: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { submittedAt: "desc" },
    });

    if (!examSession?.result) {
      return NextResponse.json({ error: "No result found" }, { status: 404 });
    }

    const result = examSession.result;
    const scorePerCategoryRaw = result.scorePerCategory as Record<string, {
      score: number;
      correct: number;
      incorrect: number;
      unanswered: number;
      total: number;
    }>;

    const scorePerCategory = Object.entries(scorePerCategoryRaw).map(([cat, data]) => ({
      category: cat as Category,
      label: CATEGORY_LABELS[cat as Category] ?? cat,
      ...data,
    }));

    // Map detailed reviews per question
    const details = examSession.sessionGroups.map((group) => {
      const questionOrder = (group.questionOrder as string[]) || [];
      const optionOrder = (group.optionOrder as Record<string, string[]>) || {};

      const questions = group.answers
        .map((ans) => {
          const q = ans.question;
          const qOptionOrder = optionOrder[q.id] || [];

          // Sort choices according to optionOrder, fallback to default ordering by label
          const sortedChoices = [...q.choices].sort((a, b) => {
            const idxA = qOptionOrder.indexOf(a.id);
            const idxB = qOptionOrder.indexOf(b.id);
            if (idxA !== -1 && idxB !== -1) return idxA - idxB;
            return a.label.localeCompare(b.label);
          });

          return {
            id: q.id,
            text: q.text,
            explanation: q.explanation,
            difficulty: q.difficulty,
            selectedChoiceId: ans.selectedChoiceId,
            isCorrect: ans.isCorrect,
            isMarkedReview: ans.isMarkedReview,
            choices: sortedChoices.map((c) => ({
              id: c.id,
              label: c.label,
              text: c.text,
              isCorrect: c.isCorrect,
            })),
          };
        })
        .sort((a, b) => {
          const idxA = questionOrder.indexOf(a.id);
          const idxB = questionOrder.indexOf(b.id);
          return idxA - idxB;
        });

      return {
        category: group.category,
        label: CATEGORY_LABELS[group.category as Category] ?? group.category,
        questions,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        id: result.id,
        totalScore: result.totalScore,
        scorePerCategory,
        totalCorrect: result.totalCorrect,
        totalIncorrect: result.totalIncorrect,
        totalUnanswered: result.totalUnanswered,
        rank: result.rank,
        percentile: result.percentile,
        submittedAt: examSession.submittedAt?.toISOString(),
        participant: {
          name: examSession.participant.name,
          school: examSession.participant.school,
          track: examSession.participant.track,
        },
        details,
      },
    });
  } catch (error) {
    console.error("Error fetching result:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
