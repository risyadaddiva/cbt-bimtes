import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { randomizeExamSession, EXAM_CONFIG, QuestionWithChoices, Category } from "@/lib/randomize";

export async function POST() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "PARTICIPANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const participantId = (session.user as any).participantId;
    if (!participantId) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return NextResponse.json({ error: "Participant not found" }, { status: 404 });
    }

    // Check for existing session
    const existingSession = await prisma.examSession.findFirst({
      where: { participantId, status: { in: ["IN_PROGRESS", "SUBMITTED", "EXPIRED"] } },
    });

    if (existingSession?.status === "IN_PROGRESS") {
      return NextResponse.json({
        success: true,
        data: { sessionId: existingSession.id, isExisting: true },
      });
    }

    if (existingSession?.status === "SUBMITTED") {
      return NextResponse.json({ error: "Exam already submitted" }, { status: 400 });
    }

    // Fetch questions for all categories
    const track = participant.track as Category;
    const categories: Category[] = [
      track,
      "WAWASAN_KEBANGSAAN",
      "LITERASI",
      "TES_SKOLASTIK",
      "KEAGAMAAN",
    ];

    const questionsByCategory: Record<Category, QuestionWithChoices[]> = {} as any;

    for (const cat of categories) {
      const config = EXAM_CONFIG.groups[cat];
      const questions = await prisma.question.findMany({
        where: { category: cat, isActive: true },
        include: { choices: true },
        take: config.questions * 3, // Fetch extra for better randomization pool
      });
      questionsByCategory[cat] = questions as QuestionWithChoices[];
    }

    // Randomize the session
    const randomizedGroups = randomizeExamSession(track, questionsByCategory);

    // Create exam session in DB
    const examSession = await prisma.examSession.create({
      data: {
        participantId,
        status: "IN_PROGRESS",
        groupOrder: randomizedGroups.map((g) => g.category),
        startedAt: new Date(),
        sessionGroups: {
          create: randomizedGroups.map((group) => ({
            category: group.category,
            questionOrder: group.questionOrder,
            optionOrder: group.optionOrder,
            durationSecs: group.durationSecs,
            status: "PENDING",
            answers: {
              create: group.questionOrder.map((questionId) => ({
                questionId,
                selectedChoiceId: null,
                isCorrect: false,
              })),
            },
          })),
        },
      },
    });

    // Mark first group as IN_PROGRESS
    const firstGroup = await prisma.sessionGroup.findFirst({
      where: { examSessionId: examSession.id },
      orderBy: { createdAt: "asc" },
    });

    if (firstGroup) {
      await prisma.sessionGroup.update({
        where: { id: firstGroup.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });
    }

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "EXAM_STARTED",
        metadata: { sessionId: examSession.id, track },
      },
    });

    return NextResponse.json({
      success: true,
      data: { sessionId: examSession.id, isExisting: false },
    });
  } catch (error) {
    console.error("Error starting exam:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
