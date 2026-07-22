import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET — public: get registration status + fakultas/jurusan list
export async function GET() {
  try {
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'mapaba_registration_open' },
    });

    const isOpen = setting?.value === 'true';

    const fakultas = await prisma.fakultas.findMany({
      orderBy: { nama: 'asc' },
      include: {
        jurusans: {
          orderBy: { nama: 'asc' },
        },
      },
    });

    return NextResponse.json({ isOpen, fakultas });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// POST — public: submit MAPABA registration
export async function POST(req: NextRequest) {
  try {
    // Check if registration is open
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'mapaba_registration_open' },
    });

    if (setting?.value !== 'true') {
      return NextResponse.json({ error: 'Pendaftaran MAPABA belum dibuka' }, { status: 403 });
    }

    const body = await req.json();
    const { nama, fakultasId, jurusanId, semester, jenisKelamin, alamat, nomorTelepon } = body;

    // Basic validation
    if (!nama || !fakultasId || !jurusanId || !semester || !jenisKelamin || !alamat || !nomorTelepon) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (!['Laki-laki', 'Perempuan'].includes(jenisKelamin)) {
      return NextResponse.json({ error: 'Jenis kelamin tidak valid' }, { status: 400 });
    }

    const semesterNum = parseInt(semester);
    if (isNaN(semesterNum) || semesterNum < 1 || semesterNum > 14) {
      return NextResponse.json({ error: 'Semester tidak valid' }, { status: 400 });
    }

    // Verify fakultas and jurusan exist
    const fakultas = await prisma.fakultas.findUnique({ where: { id: fakultasId } });
    if (!fakultas) {
      return NextResponse.json({ error: 'Fakultas tidak ditemukan' }, { status: 400 });
    }

    const jurusan = await prisma.jurusan.findUnique({ where: { id: jurusanId } });
    if (!jurusan || jurusan.fakultasId !== fakultasId) {
      return NextResponse.json({ error: 'Jurusan tidak ditemukan atau tidak sesuai fakultas' }, { status: 400 });
    }

    const registration = await prisma.mapabaRegistration.create({
      data: {
        nama,
        fakultasId,
        jurusanId,
        semester: semesterNum,
        jenisKelamin,
        alamat,
        nomorTelepon,
      },
    });

    return NextResponse.json({ success: true, registration }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
