import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const mapabaData = [
  {
    fakultas: "Ushuluddin",
    jurusans: [
      "Studi Agama-Agama",
      "Ilmu Alquran dan Tafsir",
      "Ilmu Hadist",
      "Tasawuf dan Psikoterapi",
      "Aqidah dan Filsafat Islam",
    ],
  },
  {
    fakultas: "Tarbiyah dan Keguruan",
    jurusans: [
      "Manajemen Pendidikan Islam",
      "Pendidikan Agama Islam",
      "Pendidikan Bahasa Arab",
      "Pendidikan Bahasa Inggris",
      "Pendidikan Matematika",
      "Pendidikan Biologi",
      "Pendidikan Fisika",
      "Pendidikan Kimia",
      "Pendidikan Guru MI",
      "Pendidikan Islam Anak Usia Dini",
      "Tadris Bahasa Indonesia",
    ],
  },
  {
    fakultas: "Syariah dan Hukum",
    jurusans: [
      "Hukum Keluarga (Ahwal Syakhsiyah)",
      "Hukum Ekonomi Syari'ah (Muamalah)",
      "Hukum Tata Negara (Siyasah)",
      "Perbandingan Mazhab dan Hukum",
      "Ilmu Hukum",
      "Hukum Pidana Islam",
    ],
  },
  {
    fakultas: "Dakwah dan Komunikasi",
    jurusans: [
      "Bimbingan Konseling Islam",
      "Komunikasi dan Penyiaran Islam",
      "Manajemen Dakwah",
      "Pengembangan Masyarakat Islam",
      "Ilmu Komunikasi Jurnalistik",
      "Ilmu Komunikasi Humas",
      "Manajemen Haji dan Umrah",
    ],
  },
  {
    fakultas: "Adab dan Humaniora",
    jurusans: [
      "Sejarah Peradaban Islam",
      "Bahasa dan Sastra Arab",
      "Sastra Inggris",
      "Ilmu Perpustakaan dan Informasi Islam",
    ],
  },
  {
    fakultas: "Psikologi",
    jurusans: [
      "Psikologi",
    ],
  },
  {
    fakultas: "Sains dan Teknologi",
    jurusans: [
      "Matematika",
      "Biologi",
      "Fisika",
      "Kimia",
      "Teknik Informatika",
      "Agroteknologi",
      "Teknik Elektro",
      "Teknik Lingkungan",
    ],
  },
  {
    fakultas: "Ilmu Sosial dan Ilmu Politik",
    jurusans: [
      "Administrasi Publik",
      "Sosiologi",
      "Ilmu Politik",
    ],
  },
  {
    fakultas: "Ekonomi dan Bisnis Islam",
    jurusans: [
      "Akuntansi Syari'ah",
      "Ekonomi Syari'ah",
      "Manajemen Keuangan Syari'ah",
      "Manajemen",
      "Manajemen Industri Halal",
      "Bisnis Digital",
    ],
  },
];

async function seedMapaba() {
  console.log("🌱 Memulai seeding data Fakultas dan Jurusan untuk MAPABA...\n");

  let countFakultas = 0;
  let countJurusan = 0;

  for (const item of mapabaData) {
    const fakultas = await prisma.fakultas.upsert({
      where: { nama: item.fakultas },
      update: {},
      create: { nama: item.fakultas },
    });
    countFakultas++;

    for (const jurusanNama of item.jurusans) {
      const existingJurusan = await prisma.jurusan.findFirst({
        where: {
          nama: jurusanNama,
          fakultasId: fakultas.id,
        },
      });

      if (!existingJurusan) {
        await prisma.jurusan.create({
          data: {
            nama: jurusanNama,
            fakultasId: fakultas.id,
          },
        });
        countJurusan++;
      }
    }
  }

  console.log(`✅ Berhasil menambahkan ${countFakultas} Fakultas dan ${countJurusan} Jurusan/Prodi.`);
}

seedMapaba()
  .catch((e) => {
    console.error("❌ Error seeding MAPABA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
