import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — public: list active pengurus for struktur page
export async function GET() {
  try {
    const pengurus = await prisma.pengurus.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });

    return NextResponse.json({ pengurus });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
