import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

function slugify(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const album = await prisma.galleryAlbum.findUnique({
      where: { id },
      include: {
        photos: {
          orderBy: { order: 'asc' }
        }
      }
    });

    if (!album) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json(album);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { title, description, coverImage, isPublished, eventDate } = body;

    const existing = await prisma.galleryAlbum.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = `${slugify(title)}-${Date.now()}`;
    }

    const album = await prisma.galleryAlbum.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug,
        description: description ?? existing.description,
        coverImage: coverImage ?? existing.coverImage,
        isPublished: isPublished ?? existing.isPublished,
        eventDate: eventDate ? new Date(eventDate) : existing.eventDate,
      },
    });

    return NextResponse.json(album);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.galleryAlbum.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
