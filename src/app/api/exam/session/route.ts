import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "PARTICIPANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const participantId = (session.user as any).participantId;

    const examSession = await prisma.examSession.findFirst({
      where: { participantId, status: { in: ["IN_PROGRESS", "SUBMITTED"] } },
      include: {
        sessionGroups: {
          include: {
            answers: {
              include: { question: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!examSession) {
      return NextResponse.json({ data: null });
    }

    // Build enriched session with question text and shuffled choices
    const enrichedGroups = await Promise.all(
      examSession.sessionGroups.map(async (group) => {
        const questionOrder = group.questionOrder as string[];
        const optionOrder = group.optionOrder as Record<string, string[]>;

        // Fetch all questions with their choices
        const questions = await prisma.question.findMany({
          where: { id: { in: questionOrder } },
          include: { choices: true },
        });

        const qMap = new Map(questions.map((q) => [q.id, q]));

        const enrichedQuestions = questionOrder.map((qId, idx) => {
          const q = qMap.get(qId);
          if (!q) return null;

          const answer = group.answers.find((a) => a.questionId === qId);
          const choiceOrder = optionOrder[qId] ?? q.choices.map((c) => c.id);

          const sortedChoices = choiceOrder.map((cId, i) => {
            const choice = q.choices.find((c) => c.id === cId);
            return {
              id: choice?.id ?? cId,
              label: String.fromCharCode(65 + i), // A, B, C, D, E
              text: choice?.text ?? "",
            };
          });

          return {
            id: q.id,
            number: idx + 1,
            text: q.text,
            choices: sortedChoices,
            selectedChoiceId: answer?.selectedChoiceId ?? null,
            isMarkedReview: answer?.isMarkedReview ?? false,
          };
        }).filter(Boolean);

        return {
          id: group.id,
          category: group.category,
          status: group.status,
          durationSecs: group.durationSecs,
          startedAt: group.startedAt?.toISOString() ?? null,
          submittedAt: group.submittedAt?.toISOString() ?? null,
          questions: enrichedQuestions,
        };
      })
    );

    // Check for expired groups and auto-submit them
    const now = new Date();
    for (const group of examSession.sessionGroups) {
      if (group.status === "IN_PROGRESS" && group.startedAt) {
        const elapsed = (now.getTime() - group.startedAt.getTime()) / 1000;
        if (elapsed > group.durationSecs) {
          await prisma.sessionGroup.update({
            where: { id: group.id },
            data: { status: "SUBMITTED", submittedAt: now },
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: examSession.id,
        status: examSession.status,
        groupOrder: examSession.groupOrder,
        startedAt: examSession.startedAt?.toISOString() ?? null,
        groups: enrichedGroups,
      },
    });
  } catch (error) {
    console.error("Error fetching session:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
