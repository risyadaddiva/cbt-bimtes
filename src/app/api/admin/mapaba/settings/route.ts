import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

// GET — admin: get mapaba registration setting
export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'mapaba_registration_open' },
    });

    return NextResponse.json({ isOpen: setting?.value === 'true' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// PUT — admin: toggle mapaba registration
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { isOpen } = body;

    await prisma.siteSetting.upsert({
      where: { key: 'mapaba_registration_open' },
      update: { value: isOpen ? 'true' : 'false' },
      create: { key: 'mapaba_registration_open', value: isOpen ? 'true' : 'false' },
    });

    return NextResponse.json({ success: true, isOpen });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
