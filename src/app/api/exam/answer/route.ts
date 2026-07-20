import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const answerSchema = z.object({
  sessionGroupId: z.string(),
  questionId: z.string(),
  selectedChoiceId: z.string().nullable(),
  isMarkedReview: z.boolean().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "PARTICIPANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = answerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { sessionGroupId, questionId, selectedChoiceId, isMarkedReview } = parsed.data;

    // Verify the group belongs to this participant
    const participantId = (session.user as any).participantId;
    const group = await prisma.sessionGroup.findFirst({
      where: {
        id: sessionGroupId,
        examSession: { participantId },
        status: "IN_PROGRESS",
      },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found or not active" }, { status: 404 });
    }

    // Check time hasn't expired
    if (group.startedAt) {
      const elapsed = (Date.now() - group.startedAt.getTime()) / 1000;
      if (elapsed > group.durationSecs) {
        // Auto-submit this group
        await prisma.sessionGroup.update({
          where: { id: group.id },
          data: { status: "SUBMITTED", submittedAt: new Date() },
        });
        return NextResponse.json({ error: "Time expired", code: "TIME_EXPIRED" }, { status: 400 });
      }
    }

    // Determine if answer is correct
    let isCorrect = false;
    if (selectedChoiceId) {
      const choice = await prisma.choice.findUnique({ where: { id: selectedChoiceId } });
      isCorrect = choice?.isCorrect ?? false;
    }

    // Upsert the answer
    await prisma.answer.upsert({
      where: { sessionGroupId_questionId: { sessionGroupId, questionId } },
      update: {
        selectedChoiceId,
        isCorrect,
        isMarkedReview: isMarkedReview ?? false,
        answeredAt: selectedChoiceId ? new Date() : null,
      },
      create: {
        sessionGroupId,
        questionId,
        selectedChoiceId,
        isCorrect,
        isMarkedReview: isMarkedReview ?? false,
        answeredAt: selectedChoiceId ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error saving answer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
