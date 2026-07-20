import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseQuestionsFromExcel, mapCategory } from "@/lib/excel";

const createQuestionSchema = z.object({
  category: z.enum(["MIPA", "SOSHUM", "WAWASAN_KEBANGSAAN", "LITERASI", "TES_SKOLASTIK", "KEAGAMAAN"]),
  text: z.string().min(1),
  explanation: z.string().optional(),
  difficulty: z.number().min(1).max(5).default(1),
  choices: z.array(z.object({
    label: z.enum(["A", "B", "C", "D", "E"]),
    text: z.string().min(1),
    isCorrect: z.boolean(),
  })).length(5),
});

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
    const category = searchParams.get("category") ?? "";
    const search = searchParams.get("search") ?? "";

    const where: any = { isActive: true };
    if (category) where.category = category;
    if (search) where.text = { contains: search, mode: "insensitive" };

    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        include: { choices: { orderBy: { label: "asc" } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.question.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: questions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") ?? "";

    // Handle Excel import
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

      const buffer = await file.arrayBuffer();
      const rows = parseQuestionsFromExcel(buffer);

      let created = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          const category = mapCategory(row.category);
          if (!category) {
            errors.push(`Unknown category: ${row.category}`);
            continue;
          }

          const correctMap: Record<string, string> = {
            A: row.optionA, B: row.optionB, C: row.optionC, D: row.optionD, E: row.optionE,
          };

          await prisma.question.create({
            data: {
              category,
              text: row.text,
              explanation: row.explanation,
              choices: {
                create: ["A", "B", "C", "D", "E"].map((label) => ({
                  label,
                  text: correctMap[label] ?? "",
                  isCorrect: label === row.correctAnswer,
                })),
              },
            },
          });
          created++;
        } catch (e: any) {
          errors.push(e.message);
        }
      }

      return NextResponse.json({ success: true, data: { created, errors } });
    }

    // JSON creation
    const body = await req.json();
    const parsed = createQuestionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const { category, text, explanation, difficulty, choices } = parsed.data;

    const question = await prisma.question.create({
      data: {
        category: category as any,
        text,
        explanation,
        difficulty,
        choices: { create: choices },
      },
      include: { choices: true },
    });

    return NextResponse.json({ success: true, data: question }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
