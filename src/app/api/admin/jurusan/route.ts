import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET — admin: list jurusans, optionally filter by fakultasId
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fakultasId = searchParams.get('fakultasId');

    const where: any = {};
    if (fakultasId) {
      where.fakultasId = fakultasId;
    }

    const jurusans = await prisma.jurusan.findMany({
      where,
      orderBy: { nama: 'asc' },
      include: {
        fakultas: true,
        _count: { select: { mapabaRegistrations: true } },
      },
    });

    return NextResponse.json({ jurusans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST — admin: create new jurusan
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { nama, fakultasId } = body;

    if (!nama || !nama.trim()) {
      return NextResponse.json({ error: 'Nama jurusan wajib diisi' }, { status: 400 });
    }
    if (!fakultasId) {
      return NextResponse.json({ error: 'Fakultas wajib dipilih' }, { status: 400 });
    }

    const jurusan = await prisma.jurusan.create({
      data: { nama: nama.trim(), fakultasId },
    });

    return NextResponse.json(jurusan, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
