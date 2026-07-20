import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [
      totalParticipants,
      totalQuestions,
      totalCompleted,
      activeExams,
      avgScoreResult,
    ] = await Promise.all([
      prisma.participant.count(),
      prisma.question.count({ where: { isActive: true } }),
      prisma.examSession.count({ where: { status: "SUBMITTED" } }),
      prisma.examSession.count({ where: { status: "IN_PROGRESS" } }),
      prisma.result.aggregate({ _avg: { totalScore: true } }),
    ]);

    const completionRate = totalParticipants > 0
      ? Math.round((totalCompleted / totalParticipants) * 100)
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalParticipants,
        totalQuestions,
        totalCompleted,
        activeExams,
        averageScore: avgScoreResult._avg.totalScore ?? 0,
        completionRate,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
