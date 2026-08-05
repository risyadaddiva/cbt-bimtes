import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

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

// POST — public: submit MAPABA registration (multipart/form-data)
export async function POST(req: NextRequest) {
  try {
    // Check if registration is open
    const setting = await prisma.siteSetting.findUnique({
      where: { key: 'mapaba_registration_open' },
    });

    if (setting?.value !== 'true') {
      return NextResponse.json({ error: 'Pendaftaran MAPABA belum dibuka' }, { status: 403 });
    }

    const contentType = req.headers.get('content-type') || '';
    let nama: string, fakultasId: string, jurusanId: string, semester: string;
    let jenisKelamin: string, asalSekolah: string, isPesantren: boolean;
    let namaPesantren: string, motivasi: string, alamat: string, nomorTelepon: string;
    let buktiBayar: string | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      nama = formData.get('nama') as string;
      fakultasId = formData.get('fakultasId') as string;
      jurusanId = formData.get('jurusanId') as string;
      semester = formData.get('semester') as string;
      jenisKelamin = formData.get('jenisKelamin') as string;
      asalSekolah = formData.get('asalSekolah') as string;
      isPesantren = formData.get('isPesantren') === 'true';
      namaPesantren = formData.get('namaPesantren') as string;
      motivasi = formData.get('motivasi') as string;
      alamat = formData.get('alamat') as string;
      nomorTelepon = formData.get('nomorTelepon') as string;

      const file = formData.get('buktiBayar') as File | null;
      if (file && file.size > 0) {
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json({ error: 'Ukuran bukti pembayaran maksimal 1MB' }, { status: 400 });
        }
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          return NextResponse.json({ error: 'Format file harus JPG, PNG, atau WebP' }, { status: 400 });
        }
        const bytes = await file.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        buktiBayar = `data:${file.type};base64,${base64}`;
      }
    } else {
      // Fallback JSON (backward compat)
      const body = await req.json();
      ({ nama, fakultasId, jurusanId, semester, jenisKelamin, asalSekolah,
        isPesantren, namaPesantren, motivasi, alamat, nomorTelepon } = body);
    }

    // Basic validation
    if (!nama || !fakultasId || !jurusanId || !semester || !jenisKelamin || !alamat || !nomorTelepon) {
      return NextResponse.json({ error: 'Semua field utama wajib diisi' }, { status: 400 });
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
        asalSekolah: asalSekolah || null,
        isPesantren: Boolean(isPesantren),
        namaPesantren: isPesantren ? (namaPesantren || null) : null,
        motivasi: motivasi || null,
        alamat,
        nomorTelepon,
        buktiBayar,
      } as any,
    });

    return NextResponse.json({ success: true, registration }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
