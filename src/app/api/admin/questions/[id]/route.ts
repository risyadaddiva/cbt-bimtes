import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

function isAdmin(session: any) {
  return session && session.user?.role === "ADMIN";
}

const updateSchema = z.object({
  category: z.enum(["MIPA", "SOSHUM", "WAWASAN_KEBANGSAAN", "LITERASI", "TES_SKOLASTIK", "KEAGAMAAN"]).optional(),
  text: z.string().min(1).optional(),
  explanation: z.string().optional(),
  difficulty: z.number().min(1).max(5).optional(),
  isActive: z.boolean().optional(),
  choices: z.array(z.object({
    id: z.string().optional(),
    label: z.enum(["A", "B", "C", "D", "E"]),
    text: z.string().min(1),
    isCorrect: z.boolean(),
  })).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const question = await prisma.question.findUnique({
      where: { id },
      include: { choices: { orderBy: { label: "asc" } } },
    });

    if (!question) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true, data: question });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Validation failed" }, { status: 400 });

    const { choices, ...questionData } = parsed.data;

    await prisma.$transaction(async (tx) => {
      await tx.question.update({
        where: { id },
        data: questionData as any,
      });

      if (choices) {
        // Delete old choices and recreate
        await tx.choice.deleteMany({ where: { questionId: id } });
        await tx.choice.createMany({
          data: choices.map((c) => ({
            questionId: id,
            label: c.label,
            text: c.text,
            isCorrect: c.isCorrect,
          })),
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    await prisma.question.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
