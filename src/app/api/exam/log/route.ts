import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Log tab switching and other suspicious activities
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action, metadata } = body;

    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: action ?? "UNKNOWN",
        metadata: metadata ?? {},
        ipAddress: req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? null,
        userAgent: req.headers.get("user-agent") ?? null,
      },
    });

    // If tab switch, increment counter
    if (action === "TAB_SWITCH") {
      const participantId = (session.user as any).participantId;
      if (participantId) {
        await prisma.examSession.updateMany({
          where: { participantId, status: "IN_PROGRESS" },
          data: { tabSwitchCount: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error logging activity:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
