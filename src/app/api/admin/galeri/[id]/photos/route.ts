import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { imageUrl, caption, order } = body;

    const album = await prisma.galleryAlbum.findUnique({ where: { id } });
    if (!album) {
      return NextResponse.json({ error: 'Album Not Found' }, { status: 404 });
    }

    const photo = await prisma.galleryPhoto.create({
      data: {
        albumId: id,
        imageUrl,
        caption,
        order: order || 0,
      },
    });

    return NextResponse.json(photo, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
