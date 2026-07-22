import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// DELETE — admin: delete jurusan by ID
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const regCount = await prisma.mapabaRegistration.count({
      where: { jurusanId: id },
    });

    if (regCount > 0) {
      return NextResponse.json(
        { error: `Tidak bisa menghapus. Ada ${regCount} pendaftar yang menggunakan jurusan ini.` },
        { status: 409 }
      );
    }

    await prisma.jurusan.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
