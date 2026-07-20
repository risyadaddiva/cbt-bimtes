# CBT BIMTES PMII 2026

**Computer Based Test (CBT)** untuk BIMTES PMII 2026  
*Komisariat UIN Sunan Gunung Djati Bandung*

![PMII](https://img.shields.io/badge/PMII-BIMTES%202026-0F52BA?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)

---

## 📋 Fitur Utama

### Peserta
- ✅ Login dengan username/password (akun dibuat admin)
- ✅ Dashboard dengan status ujian dan instruksi
- ✅ Ujian CBT dengan 90 soal, 120 menit
- ✅ **Randomisasi penuh**: urutan kelompok, soal, dan pilihan berbeda per peserta
- ✅ Timer per kelompok soal (server-synced, tahan refresh)
- ✅ Auto-save jawaban setiap perubahan
- ✅ Navigasi soal (answered/marked/unanswered visual)
- ✅ Deteksi tab switching + log aktivitas mencurigakan
- ✅ Auto-submit saat waktu habis
- ✅ Halaman hasil langsung setelah submit (cetak-siap)

### Admin
- ✅ Dashboard statistik (total peserta, soal, nilai rata-rata, dll)
- ✅ CRUD peserta dengan import Excel
- ✅ Bank soal (6 kategori) dengan import/export Excel
- ✅ Manajemen hasil ujian dengan export Excel
- ✅ Analytics: rata-rata per kategori, soal tersulit/termudah, leaderboard
- ✅ Reset password, aktifkan/nonaktifkan akun peserta

---

## 🏗️ Struktur Ujian

| Kelompok | Kategori | Soal | Waktu |
|----------|----------|------|-------|
| 1 | MIPA *atau* SOSHUM | 30 | 45 menit |
| 2 | Wawasan Kebangsaan | 10 | 15 menit |
| 3 | Literasi Bahasa | 20 | 30 menit |
| 4 | Tes Skolastik | 15 | 15 menit |
| 5 | Keagamaan | 15 | 15 menit |
| **Total** | | **90** | **120 menit** |

---

## 🛠️ Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, TailwindCSS |
| UI Components | Shadcn/UI, Framer Motion |
| Backend | Next.js API Routes |
| Database | PostgreSQL 16 + Prisma ORM |
| Authentication | NextAuth v5 (Auth.js) |
| Testing | Vitest |
| Docker | Docker Compose |

---

## 🚀 Quick Start

### Prasyarat
- Node.js 20+
- PostgreSQL 16 (atau Docker)
- npm

### 1. Clone & Install

```bash
git clone <repo-url> cbt-bimtes
cd cbt-bimtes
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/cbt_bimtes"
NEXTAUTH_SECRET="ganti-dengan-string-rahasia-minimal-32-karakter"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Database Setup

**Dengan Docker (rekomendasi):**
```bash
docker-compose up postgres -d
```

**Atau PostgreSQL lokal** — pastikan PostgreSQL berjalan dan database `cbt_bimtes` sudah dibuat.

### 4. Migrate & Seed Database

```bash
npm run db:migrate:dev  # buat tabel
npm run db:seed         # isi data awal (50 peserta, 200 soal)
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka: [http://localhost:3000](http://localhost:3000)

### Akun Default Setelah Seed

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Admin | `superadmin` | `super123` |
| Peserta | `peserta001` | `bimtes001` |
| Peserta | `peserta050` | `bimtes050` |

---

## 📁 Struktur Folder

```
cbt-bimtes/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/           # Halaman login
│   │   ├── dashboard/           # Dashboard peserta
│   │   ├── exam/                # Halaman ujian
│   │   │   ├── countdown/       # Countdown sebelum ujian
│   │   │   ├── page.tsx         # Interface ujian utama
│   │   │   └── result/          # Halaman hasil
│   │   ├── admin/               # Panel admin
│   │   │   ├── dashboard/       # Dashboard admin
│   │   │   ├── participants/    # Manajemen peserta
│   │   │   ├── questions/       # Bank soal
│   │   │   ├── results/         # Hasil ujian
│   │   │   └── analytics/       # Analitik
│   │   └── api/                 # API Routes
│   │       ├── auth/            # NextAuth handler
│   │       ├── exam/            # Exam engine
│   │       └── admin/           # Admin endpoints
│   ├── components/
│   │   └── ui/                  # Shadcn components
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── randomize.ts         # Engine randomisasi
│   │   ├── excel.ts             # Import/export Excel
│   │   └── utils.ts             # Utility functions
│   ├── types/
│   │   └── index.ts             # TypeScript types
│   ├── auth.ts                  # NextAuth config
│   └── middleware.ts            # Route protection
├── prisma/
│   ├── schema.prisma            # Database schema
│   └── seed.ts                  # Seed data
├── tests/
│   └── randomize.test.ts        # Unit tests
├── docs/
│   ├── API.md                   # Dokumentasi API
│   ├── INSTALL.md               # Panduan instalasi
│   └── DEPLOYMENT.md            # Panduan deployment
├── docker-compose.yml
├── Dockerfile
└── README.md
```

---

## 🧪 Testing

```bash
npm run test         # Jalankan semua unit tests
npm run test:watch   # Mode watch
```

---

## 🐳 Docker Production

```bash
# Build dan jalankan dengan Docker Compose
docker-compose --profile production up --build -d

# Lihat logs
docker-compose logs -f app
```

---

## 📖 Dokumentasi

- [Panduan Instalasi Lengkap](docs/INSTALL.md)
- [Dokumentasi API](docs/API.md)
- [Panduan Deployment](docs/DEPLOYMENT.md)

---

## 🔐 Keamanan

- Password di-hash dengan bcrypt (12 rounds)
- JWT session dengan secret key
- Deteksi tab switching + log aktivitas
- Blokir login ganda saat ujian berlangsung
- Rate limiting via Next.js middleware
- Server-side timer validation

---

## 📊 Skor

Sistem penilaian menggunakan skema SNBT:
- ✅ Benar: **+4 poin**
- ❌ Salah: **-1 poin**
- ⬜ Tidak dijawab: **0 poin**
- Skor final = max(0, (poin_mentah / poin_maksimal) × 100)

---

## 👥 Tim PMII Komisariat UIN Sunan Gunung Djati Bandung

Dibuat untuk BIMTES PMII 2026 🌟
