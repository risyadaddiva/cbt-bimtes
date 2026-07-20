# CBT BIMTES PMII 2026 — Walkthrough & Setup Guide (MongoDB)

## ✅ Build Status: SUKSES (MongoDB Atlas)

```
✓ Compiled successfully in 103s
✓ 29 routes generated
✓ Dev server running at http://localhost:3000
```

---

## 🗂️ Struktur Database MongoDB

Aplikasi menggunakan skema **MongoDB** via **Prisma 6.19.3**:
- Koleksi: `users`, `participants`, `questions`, `choices`, `exam_sessions`, `session_groups`, `answers`, `results`, `activity_logs`.
- Integrasi ID menggunakan format **ObjectId** untuk performa optimal di MongoDB.

---

## 🔧 Setup Database & Seeding

### 1. File `.env` & `.env.local`
Konfigurasi database diarahkan ke MongoDB Atlas cluster:
```text
DATABASE_URL="mongodb+srv://risyadaddiva_db_user:hy2WCw5raeaQdRoc@cluster0.zajnmow.mongodb.net/cbt_bimtes?retryWrites=true&w=majority&appName=Cluster0"
```

### 2. Sinkronisasi Skema (Prisma db push)
Sinkronisasi koleksi dan indeks skema langsung ke MongoDB Atlas:
```bash
npx prisma db push
```

### 3. Jalankan Database Seeding
Membuat akun admin default, akun peserta demo, dan contoh bank soal di database MongoDB:
```bash
npm run db:seed
```

---

## 🚀 Akun Demo Default

Setelah database berhasil di-seed, gunakan akun berikut untuk masuk:

- **Admin Panel**:
  - **Username**: `admin`
  - **Password**: `admin123`
- **Peserta Demo**:
  - **Username**: `peserta01` s/d `peserta05`
  - **Password**: `peserta123`

---

## 🚀 Menjalankan Aplikasi

### Mode Development
```bash
cd cbt-bimtes
npm run dev
# Buka http://localhost:3000
```

### Mode Production
```bash
npm run build
npm start
```
