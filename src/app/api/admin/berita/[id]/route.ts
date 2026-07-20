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
    const article = await prisma.newsArticle.findUnique({
      where: { id },
    });

    if (!article) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    return NextResponse.json(article);
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
    const { title, excerpt, content, coverImage, isPublished, author, category, tags } = body;

    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 });
    }

    let slug = existing.slug;
    if (title && title !== existing.title) {
      slug = `${slugify(title)}-${Date.now()}`;
    }

    let publishedAt = existing.publishedAt;
    if (isPublished && !existing.isPublished) {
      publishedAt = new Date();
    } else if (isPublished === false) {
      publishedAt = null;
    }

    const article = await prisma.newsArticle.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug,
        excerpt: excerpt ?? existing.excerpt,
        content: content ?? existing.content,
        coverImage: coverImage ?? existing.coverImage,
        isPublished: isPublished ?? existing.isPublished,
        publishedAt,
        author: author ?? existing.author,
        category: category ?? existing.category,
        tags: tags ?? existing.tags,
      },
    });

    return NextResponse.json(article);
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
    await prisma.newsArticle.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
