import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submitGroupSchema = z.object({
  sessionGroupId: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "PARTICIPANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitGroupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const { sessionGroupId } = parsed.data;
    const participantId = (session.user as any).participantId;

    const group = await prisma.sessionGroup.findFirst({
      where: {
        id: sessionGroupId,
        examSession: { participantId },
        status: "IN_PROGRESS",
      },
      include: { examSession: { include: { sessionGroups: true } } },
    });

    if (!group) {
      return NextResponse.json({ error: "Group not found or already submitted" }, { status: 404 });
    }

    // Submit current group
    await prisma.sessionGroup.update({
      where: { id: sessionGroupId },
      data: { status: "SUBMITTED", submittedAt: new Date() },
    });

    // Find next pending group
    const allGroups = group.examSession.sessionGroups;
    const nextGroup = allGroups.find((g) => g.status === "PENDING");

    if (nextGroup) {
      await prisma.sessionGroup.update({
        where: { id: nextGroup.id },
        data: { status: "IN_PROGRESS", startedAt: new Date() },
      });

      return NextResponse.json({
        success: true,
        data: { nextGroupId: nextGroup.id, isLastGroup: false },
      });
    }

    // All groups submitted — calculate results
    return NextResponse.json({
      success: true,
      data: { nextGroupId: null, isLastGroup: true },
    });
  } catch (error) {
    console.error("Error submitting group:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
