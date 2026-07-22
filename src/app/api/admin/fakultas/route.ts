import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET — admin: list all fakultas with jurusan
export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fakultas = await prisma.fakultas.findMany({
      orderBy: { nama: 'asc' },
      include: {
        jurusans: { orderBy: { nama: 'asc' } },
        _count: { select: { mapabaRegistrations: true } },
      },
    });

    return NextResponse.json({ fakultas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST — admin: create new fakultas
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { nama } = body;

    if (!nama || !nama.trim()) {
      return NextResponse.json({ error: 'Nama fakultas wajib diisi' }, { status: 400 });
    }

    const fakultas = await prisma.fakultas.create({
      data: { nama: nama.trim() },
    });

    return NextResponse.json(fakultas, { status: 201 });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Fakultas sudah ada' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
