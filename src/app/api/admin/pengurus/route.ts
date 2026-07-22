import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET — admin: list all pengurus
export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pengurus = await prisma.pengurus.findMany({
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ pengurus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST — admin: create new pengurus
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { nama, jabatan, fotoUrl, instagramUrl, order, isActive } = body;

    if (!nama || !jabatan) {
      return NextResponse.json({ error: 'Nama dan jabatan wajib diisi' }, { status: 400 });
    }

    const pengurus = await prisma.pengurus.create({
      data: {
        nama,
        jabatan,
        fotoUrl: fotoUrl || null,
        instagramUrl: instagramUrl || null,
        order: order ?? 0,
        isActive: isActive ?? true,
      },
    });

    return NextResponse.json(pengurus, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
