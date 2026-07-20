import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  school: z.string().min(1).optional(),
  track: z.enum(["MIPA", "SOSHUM"]).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
  password: z.string().min(6).optional(),
});

function isAdmin(session: any) {
  return session && session.user?.role === "ADMIN";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!isAdmin(session)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const participant = await prisma.participant.findUnique({
      where: { id },
      include: {
        user: { select: { username: true, isActive: true, createdAt: true } },
        examSessions: {
          include: {
            sessionGroups: { include: { answers: true } },
            result: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ success: true, data: participant });
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
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed" }, { status: 400 });
    }

    const { name, school, track, phone, isActive, password } = parsed.data;

    const participant = await prisma.participant.findUnique({ where: { id } });
    if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Update participant fields
    const participantUpdate: any = {};
    if (name !== undefined) participantUpdate.name = name;
    if (school !== undefined) participantUpdate.school = school;
    if (track !== undefined) participantUpdate.track = track;
    if (phone !== undefined) participantUpdate.phone = phone;

    const userUpdate: any = {};
    if (isActive !== undefined) userUpdate.isActive = isActive;
    if (password) {
      userUpdate.password = await bcrypt.hash(password, 12);
      participantUpdate.plainPassword = password as any;
    }

    await prisma.$transaction([
      prisma.participant.update({ where: { id }, data: participantUpdate }),
      ...(Object.keys(userUpdate).length > 0
        ? [prisma.user.update({ where: { id: participant.userId }, data: userUpdate })]
        : []),
    ]);

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
    const participant = await prisma.participant.findUnique({ where: { id } });
    if (!participant) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Cascade delete via user
    await prisma.user.delete({ where: { id: participant.userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
