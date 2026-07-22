import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST — public: submit advocacy complaint
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nama, email, nomorTelepon, kategori, judul, deskripsi } = body;

    if (!nama || !nomorTelepon || !kategori || !judul || !deskripsi) {
      return NextResponse.json({ error: 'Semua field wajib diisi (kecuali email)' }, { status: 400 });
    }

    const validKategori = ['Akademik', 'Non-Akademik', 'Organisasi', 'Lainnya'];
    if (!validKategori.includes(kategori)) {
      return NextResponse.json({ error: 'Kategori tidak valid' }, { status: 400 });
    }

    const complaint = await prisma.advocacyComplaint.create({
      data: {
        nama,
        email: email || null,
        nomorTelepon,
        kategori,
        judul,
        deskripsi,
      },
    });

    return NextResponse.json({ success: true, complaint }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
