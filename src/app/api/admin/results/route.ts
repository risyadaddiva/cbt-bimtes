import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { exportResultsToExcel } from "@/lib/excel";
import { CATEGORY_LABELS, Category } from "@/lib/randomize";


function isAdmin(session: any) {
  return session && session.user?.role === "ADMIN";
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const school = searchParams.get("school") ?? "";
    const minScore = parseFloat(searchParams.get("minScore") ?? "0");
    const exportFormat = searchParams.get("export") ?? "";

    const where: any = {
      examSession: {
        status: "SUBMITTED",
        ...(school ? { participant: { school: { contains: school, mode: "insensitive" } } } : {}),
      },
    };

    if (minScore > 0) where.totalScore = { gte: minScore };

    if (exportFormat === "excel") {
      const results = await prisma.result.findMany({
        where,
        include: {
          examSession: {
            include: {
              participant: { include: { user: { select: { username: true } } } },
            },
          },
        },
        orderBy: { totalScore: "desc" },
      });

      const data = results.map((r) => ({
        name: r.examSession.participant.name,
        username: r.examSession.participant.user.username,
        school: r.examSession.participant.school,
        track: r.examSession.participant.track,
        totalScore: r.totalScore,
        totalCorrect: r.totalCorrect,
        totalIncorrect: r.totalIncorrect,
        rank: r.rank,
        submittedAt: r.examSession.submittedAt,
      }));

      const buffer = exportResultsToExcel(data);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="hasil-cbt-bimtes-2026.xlsx"',
        },
      });
    }

    const [results, total] = await Promise.all([
      prisma.result.findMany({
        where,
        include: {
          examSession: {
            include: {
              participant: { include: { user: { select: { username: true } } } },
            },
          },
        },
        orderBy: { totalScore: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.result.count({ where }),
    ]);

    const data = results.map((r) => {
      const scorePerCategory = r.scorePerCategory as Record<string, { score: number; correct: number; incorrect: number }>;
      return {
        id: r.id,
        participantId: r.examSession.participantId,
        name: r.examSession.participant.name,
        username: r.examSession.participant.user.username,
        school: r.examSession.participant.school,
        track: r.examSession.participant.track,
        totalScore: r.totalScore,
        totalCorrect: r.totalCorrect,
        totalIncorrect: r.totalIncorrect,
        totalUnanswered: r.totalUnanswered,
        rank: r.rank,
        scorePerCategory: Object.entries(scorePerCategory).map(([cat, val]) => ({
          category: cat,
          label: CATEGORY_LABELS[cat as Category] ?? cat,
          ...val,
        })),
        submittedAt: r.examSession.submittedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching results:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
