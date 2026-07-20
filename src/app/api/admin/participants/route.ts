import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { parseParticipantsFromExcel } from "@/lib/excel";

const createParticipantSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6),
  name: z.string().min(1),
  school: z.string().min(1),
  track: z.enum(["MIPA", "SOSHUM"]),
  phone: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/admin/participants — list all participants
// ─────────────────────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") ?? "1");
    const limit = parseInt(searchParams.get("limit") ?? "20");
    const search = searchParams.get("search") ?? "";
    const school = searchParams.get("school") ?? "";
    const track = searchParams.get("track") ?? "";

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { school: { contains: search, mode: "insensitive" } },
        { user: { username: { contains: search, mode: "insensitive" } } },
      ];
    }
    if (school) where.school = { contains: school, mode: "insensitive" };
    if (track) where.track = track;

    const [participants, total] = await Promise.all([
      prisma.participant.findMany({
        where,
        include: {
          user: { select: { username: true, isActive: true, createdAt: true } },
          examSessions: {
            include: { result: { select: { totalScore: true, rank: true } } },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.participant.count({ where }),
    ]);

    const data = participants.map((p) => ({
      id: p.id,
      userId: p.userId,
      username: p.user.username,
      name: p.name,
      school: p.school,
      track: p.track,
      phone: p.phone,
      plainPassword: (p as any).plainPassword,
      isActive: p.user.isActive,
      createdAt: p.createdAt,
      examStatus: p.examSessions[0]?.status ?? "NOT_STARTED",
      totalScore: p.examSessions[0]?.result?.totalScore ?? null,
      rank: p.examSessions[0]?.result?.rank ?? null,
    }));

    return NextResponse.json({
      success: true,
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error listing participants:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/admin/participants — create participant
// ─────────────────────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentType = req.headers.get("content-type") ?? "";

    // Handle Excel import
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

      const buffer = await file.arrayBuffer();
      const rows = parseParticipantsFromExcel(buffer);

      let created = 0;
      const errors: string[] = [];

      for (const row of rows) {
        try {
          const hashed = await bcrypt.hash(row.password, 10);
          const user = await prisma.user.create({
            data: {
              username: row.username,
              password: hashed,
              role: "PARTICIPANT",
            },
          });
          await prisma.participant.create({
            data: {
              userId: user.id,
              name: row.name,
              school: row.school,
              track: (row.track === "SOSHUM" ? "SOSHUM" : "MIPA") as any,
              phone: row.phone,
              plainPassword: row.password,
            } as any,
          });
          created++;
        } catch (e: any) {
          errors.push(`${row.username}: ${e.message}`);
        }
      }

      return NextResponse.json({
        success: true,
        data: { created, errors },
      });
    }

    // Regular JSON creation
    const body = await req.json();
    const parsed = createParticipantSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { username, password, name, school, track, phone } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        password: hashed,
        role: "PARTICIPANT",
        participant: {
          create: { name, school, track: track as any, phone, plainPassword: password } as any,
        },
      },
      include: { participant: true },
    }) as any;

    return NextResponse.json({
      success: true,
      data: {
        id: user.participant!.id,
        username: user.username,
        name: user.participant!.name,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating participant:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
