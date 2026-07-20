import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database CBT BIMTES PMII 2026 (MongoDB)...\n");

  // Clear existing data in MongoDB to avoid duplicates during testing
  try {
    await prisma.activityLog.deleteMany({});
    await prisma.result.deleteMany({});
    await prisma.answer.deleteMany({});
    await prisma.sessionGroup.deleteMany({});
    await prisma.examSession.deleteMany({});
    await prisma.choice.deleteMany({});
    await prisma.question.deleteMany({});
    await prisma.participant.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("🧹 Database dibersihkan.");
  } catch (err) {
    console.log("ℹ️ Info: Tidak ada tabel/koleksi untuk dibersihkan atau database kosong.");
  }

  // ─── Admin ────────────────────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.create({
    data: {
      username: "admin",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin dibuat: username=admin, password=admin123 (ID: ${admin.id})`);

  // ─── Demo Peserta MIPA ───────────────────────────────────────────────────
  const pesertaMIPA = [
    { username: "peserta01", name: "Ahmad Fauzi", school: "SMA Negeri 1 Bandung" },
    { username: "peserta02", name: "Siti Rahayu", school: "SMA Negeri 3 Bandung" },
    { username: "peserta03", name: "Rizki Pratama", school: "MAN 1 Bandung" },
  ];

  for (const p of pesertaMIPA) {
    const hash = await bcrypt.hash("peserta123", 10);
    await prisma.user.create({
      data: {
        username: p.username,
        password: hash,
        role: "PARTICIPANT",
        participant: {
          create: {
            name: p.name,
            school: p.school,
            track: "MIPA",
          },
        },
      },
    });
    console.log(`✅ Peserta MIPA: ${p.username} / peserta123`);
  }

  // ─── Demo Peserta SOSHUM ─────────────────────────────────────────────────
  const pesertaSOSHUM = [
    { username: "peserta04", name: "Dewi Lestari", school: "SMA Negeri 5 Bandung" },
    { username: "peserta05", name: "Muhammad Iqbal", school: "SMA Negeri 6 Bandung" },
  ];

  for (const p of pesertaSOSHUM) {
    const hash = await bcrypt.hash("peserta123", 10);
    await prisma.user.create({
      data: {
        username: p.username,
        password: hash,
        role: "PARTICIPANT",
        participant: {
          create: {
            name: p.name,
            school: p.school,
            track: "SOSHUM",
          },
        },
      },
    });
    console.log(`✅ Peserta SOSHUM: ${p.username} / peserta123`);
  }

  // ─── Soal Contoh ─────────────────────────────────────────────────────────
  const sampleQuestions = [
    // MIPA
    {
      category: "MIPA" as const,
      text: "Sebuah benda bermassa 2 kg dilempar vertikal ke atas dengan kecepatan awal 20 m/s. Jika percepatan gravitasi g = 10 m/s², berapakah tinggi maksimum yang dicapai benda tersebut?",
      choices: [
        { label: "A", text: "10 meter", isCorrect: false },
        { label: "B", text: "20 meter", isCorrect: true },
        { label: "C", text: "30 meter", isCorrect: false },
        { label: "D", text: "40 meter", isCorrect: false },
        { label: "E", text: "50 meter", isCorrect: false },
      ],
      explanation: "h = v²/(2g) = 400/20 = 20 meter",
      difficulty: 2,
    },
    {
      category: "MIPA" as const,
      text: "Persamaan kuadrat x² - 5x + 6 = 0 memiliki akar-akar x₁ dan x₂. Nilai dari x₁² + x₂² adalah...",
      choices: [
        { label: "A", text: "11", isCorrect: false },
        { label: "B", text: "13", isCorrect: true },
        { label: "C", text: "15", isCorrect: false },
        { label: "D", text: "17", isCorrect: false },
        { label: "E", text: "19", isCorrect: false },
      ],
      explanation: "x₁+x₂=5, x₁x₂=6, x₁²+x₂²=(x₁+x₂)²-2x₁x₂=25-12=13",
      difficulty: 3,
    },
    // SOSHUM
    {
      category: "SOSHUM" as const,
      text: "Salah satu faktor yang mendorong terjadinya mobilitas sosial vertikal ke atas dalam masyarakat modern adalah...",
      choices: [
        { label: "A", text: "Sistem kasta yang ketat", isCorrect: false },
        { label: "B", text: "Diskriminasi berbasis ras", isCorrect: false },
        { label: "C", text: "Pendidikan formal yang berkualitas", isCorrect: true },
        { label: "D", text: "Keterbatasan akses informasi", isCorrect: false },
        { label: "E", text: "Isolasi geografis", isCorrect: false },
      ],
      explanation: "Pendidikan formal membuka peluang untuk meningkatkan status sosial seseorang.",
      difficulty: 2,
    },
    {
      category: "SOSHUM" as const,
      text: "Paham yang mengedepankan kepentingan bangsa dan negara di atas kepentingan individu atau golongan disebut...",
      choices: [
        { label: "A", text: "Liberalisme", isCorrect: false },
        { label: "B", text: "Komunisme", isCorrect: false },
        { label: "C", text: "Nasionalisme", isCorrect: true },
        { label: "D", text: "Kapitalisme", isCorrect: false },
        { label: "E", text: "Sosialisme", isCorrect: false },
      ],
      explanation: "Nasionalisme adalah paham yang memprioritaskan kepentingan nasional.",
      difficulty: 1,
    },
    // Wawasan Kebangsaan
    {
      category: "WAWASAN_KEBANGSAAN" as const,
      text: "Dalam sila ke-3 Pancasila 'Persatuan Indonesia', makna persatuan yang dimaksud adalah...",
      choices: [
        { label: "A", text: "Keseragaman dalam segala aspek kehidupan", isCorrect: false },
        { label: "B", text: "Kesatuan wilayah tanpa keberagaman budaya", isCorrect: false },
        { label: "C", text: "Bhinneka Tunggal Ika — bersatu dalam keberagaman", isCorrect: true },
        { label: "D", text: "Penyamaan bahasa daerah menjadi satu", isCorrect: false },
        { label: "E", text: "Penghapusan suku dan adat istiadat", isCorrect: false },
      ],
      explanation: "Persatuan Indonesia berarti bersatu dalam keberagaman (Bhinneka Tunggal Ika).",
      difficulty: 1,
    },
    {
      category: "WAWASAN_KEBANGSAAN" as const,
      text: "Undang-Undang Dasar 1945 merupakan hukum dasar tertulis yang memuat...",
      choices: [
        { label: "A", text: "Hanya aturan mengenai pemerintahan pusat", isCorrect: false },
        { label: "B", text: "Ketentuan mengenai dasar negara, hak warga negara, dan sistem pemerintahan", isCorrect: true },
        { label: "C", text: "Aturan pelaksanaan kegiatan perekonomian nasional", isCorrect: false },
        { label: "D", text: "Tata cara pemilihan umum presiden dan wakil presiden", isCorrect: false },
        { label: "E", text: "Hukum pidana dan perdata di Indonesia", isCorrect: false },
      ],
      explanation: "UUD 1945 memuat dasar negara, hak dan kewajiban warga negara, serta sistem pemerintahan.",
      difficulty: 2,
    },
    // Literasi
    {
      category: "LITERASI" as const,
      text: "Bacalah paragraf berikut:\n\n\"Perubahan iklim telah menjadi ancaman nyata bagi keberlangsungan ekosistem laut. Peningkatan suhu air laut menyebabkan pemutihan terumbu karang secara masif, yang mengancam ribuan spesies ikan dan biota laut lainnya.\"\n\nIde pokok paragraf di atas adalah...",
      choices: [
        { label: "A", text: "Spesies ikan yang terancam punah akibat perubahan iklim", isCorrect: false },
        { label: "B", text: "Peningkatan suhu air laut yang tidak terkendali", isCorrect: false },
        { label: "C", text: "Perubahan iklim sebagai ancaman bagi ekosistem laut", isCorrect: true },
        { label: "D", text: "Pemutihan terumbu karang akibat aktivitas manusia", isCorrect: false },
        { label: "E", text: "Keberagaman biota laut yang semakin berkurang", isCorrect: false },
      ],
      explanation: "Kalimat pertama merupakan kalimat utama yang menjadi ide pokok paragraf.",
      difficulty: 2,
    },
    // Tes Skolastik
    {
      category: "TES_SKOLASTIK" as const,
      text: "Jika semua A adalah B, dan semua B adalah C, maka...",
      choices: [
        { label: "A", text: "Semua C adalah A", isCorrect: false },
        { label: "B", text: "Semua A adalah C", isCorrect: true },
        { label: "C", text: "Beberapa C bukan A", isCorrect: false },
        { label: "D", text: "Semua B adalah A", isCorrect: false },
        { label: "E", text: "Tidak ada hubungan antara A dan C", isCorrect: false },
      ],
      explanation: "Transitifitas silogisme: A→B, B→C, maka A→C",
      difficulty: 1,
    },
    {
      category: "TES_SKOLASTIK" as const,
      text: "Deret berikut: 2, 4, 8, 16, 32, ... Bilangan selanjutnya adalah...",
      choices: [
        { label: "A", text: "48", isCorrect: false },
        { label: "B", text: "56", isCorrect: false },
        { label: "C", text: "64", isCorrect: true },
        { label: "D", text: "72", isCorrect: false },
        { label: "E", text: "128", isCorrect: false },
      ],
      explanation: "Pola deret geometri dengan rasio 2: 32 × 2 = 64",
      difficulty: 1,
    },
    // Keagamaan
    {
      category: "KEAGAMAAN" as const,
      text: "Dalam Islam, hukum mempelajari ilmu fardhu 'ain adalah...",
      choices: [
        { label: "A", text: "Sunnah muakkad", isCorrect: false },
        { label: "B", text: "Fardhu kifayah", isCorrect: false },
        { label: "C", text: "Fardhu 'ain", isCorrect: true },
        { label: "D", text: "Mubah", isCorrect: false },
        { label: "E", text: "Makruh", isCorrect: false },
      ],
      explanation: "Mempelajari ilmu yang berhubungan langsung dengan kewajiban pribadi (sholat, puasa, dll) hukumnya fardhu 'ain.",
      difficulty: 2,
    },
    {
      category: "KEAGAMAAN" as const,
      text: "Organisasi PMII (Pergerakan Mahasiswa Islam Indonesia) didirikan pada tanggal...",
      choices: [
        { label: "A", text: "17 April 1960", isCorrect: true },
        { label: "B", text: "17 Agustus 1945", isCorrect: false },
        { label: "C", text: "31 Januari 1926", isCorrect: false },
        { label: "D", text: "16 Juni 1965", isCorrect: false },
        { label: "E", text: "22 Oktober 1945", isCorrect: false },
      ],
      explanation: "PMII didirikan pada 17 April 1960 di Surabaya.",
      difficulty: 2,
    },
  ];

  let questionCount = 0;
  for (const q of sampleQuestions) {
    await prisma.question.create({
      data: {
        category: q.category,
        text: q.text,
        explanation: q.explanation,
        difficulty: q.difficulty,
        choices: {
          create: q.choices,
        },
      },
    });
    questionCount++;
  }

  console.log(`\n✅ ${questionCount} soal contoh berhasil ditambahkan`);

  console.log("\n═══════════════════════════════════════════════════════");
  console.log("🎉 Seeding selesai!\n");
  console.log("📋 Akun yang tersedia:");
  console.log("   Admin   : admin / admin123");
  console.log("   Peserta : peserta01 s/d peserta05 / peserta123");
  console.log("═══════════════════════════════════════════════════════\n");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
