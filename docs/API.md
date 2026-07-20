# Dokumentasi API — CBT BIMTES PMII 2026

Base URL: `http://localhost:3000/api`

> Semua endpoint (kecuali `/api/auth` dan `/api/health`) memerlukan autentikasi via session cookie (NextAuth).

---

## 🔐 Autentikasi

### POST `/api/auth/signin`
Login dengan credentials.

**Request Body:**
```json
{
  "username": "peserta001",
  "password": "bimtes001"
}
```

**Response (success):** Session cookie set

**Error Codes:**
- `ACTIVE_SESSION` — Akun sedang aktif di sesi lain

---

## 🎯 Exam Endpoints

### POST `/api/exam/start`
Mulai sesi ujian baru (peserta saja).

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "clxxxx",
    "isExisting": false
  }
}
```

---

### GET `/api/exam/session`
Ambil state sesi ujian aktif.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "session-id",
    "status": "IN_PROGRESS",
    "groupOrder": ["MIPA", "WAWASAN_KEBANGSAAN", "LITERASI", "TES_SKOLASTIK", "KEAGAMAAN"],
    "startedAt": "2026-06-26T06:00:00Z",
    "groups": [
      {
        "id": "group-id",
        "category": "MIPA",
        "status": "IN_PROGRESS",
        "durationSecs": 2700,
        "startedAt": "2026-06-26T06:00:00Z",
        "questions": [
          {
            "id": "q-id",
            "number": 1,
            "text": "Soal nomor 1...",
            "choices": [
              { "id": "c-id", "label": "A", "text": "Pilihan A" }
            ],
            "selectedChoiceId": null,
            "isMarkedReview": false
          }
        ]
      }
    ]
  }
}
```

---

### POST `/api/exam/answer`
Simpan jawaban (auto-save).

**Request Body:**
```json
{
  "sessionGroupId": "group-id",
  "questionId": "q-id",
  "selectedChoiceId": "choice-id",
  "isMarkedReview": false
}
```

**Response:**
```json
{ "success": true }
```

**Error:** `TIME_EXPIRED` — Waktu kelompok sudah habis

---

### POST `/api/exam/submit-group`
Submit/selesaikan kelompok soal saat ini.

**Request Body:**
```json
{ "sessionGroupId": "group-id" }
```

**Response:**
```json
{
  "success": true,
  "data": {
    "nextGroupId": "next-group-id",
    "isLastGroup": false
  }
}
```

---

### POST `/api/exam/submit`
Submit seluruh ujian (submit final).

**Response:**
```json
{
  "success": true,
  "data": { "resultId": "result-id" }
}
```

---

### GET `/api/exam/result`
Ambil hasil ujian peserta.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "result-id",
    "totalScore": 75.5,
    "totalCorrect": 62,
    "totalIncorrect": 15,
    "totalUnanswered": 13,
    "rank": 5,
    "scorePerCategory": [
      {
        "category": "MIPA",
        "label": "MIPA (IPA)",
        "score": 80.0,
        "correct": 22,
        "incorrect": 5,
        "unanswered": 3,
        "total": 30
      }
    ],
    "submittedAt": "2026-06-26T08:00:00Z",
    "participant": {
      "name": "Ahmad Fauzi",
      "school": "SMAN 1 Bandung",
      "track": "MIPA"
    }
  }
}
```

---

### POST `/api/exam/log`
Log aktivitas (tab switching, dll).

**Request Body:**
```json
{
  "action": "TAB_SWITCH",
  "metadata": { "count": 2 }
}
```

---

## 👨‍💼 Admin Endpoints

> Semua endpoint `/api/admin/*` hanya bisa diakses oleh role ADMIN.

---

### GET `/api/admin/dashboard`
Statistik dashboard admin.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalParticipants": 50,
    "totalQuestions": 200,
    "totalCompleted": 35,
    "activeExams": 3,
    "averageScore": 68.5,
    "completionRate": 70
  }
}
```

---

### GET `/api/admin/participants`
Daftar peserta dengan pagination.

**Query Params:**
- `page` (default: 1)
- `limit` (default: 20)
- `search` — cari nama/username/sekolah
- `school` — filter sekolah
- `track` — filter MIPA/SOSHUM

---

### POST `/api/admin/participants`
Buat peserta baru (JSON).

**Request Body:**
```json
{
  "username": "peserta051",
  "password": "rahasia123",
  "name": "Budi Santoso",
  "school": "SMAN 3 Bandung",
  "track": "MIPA",
  "phone": "08123456789"
}
```

### POST `/api/admin/participants` (Import Excel)
Content-Type: `multipart/form-data`  
Field: `file` — file Excel (.xlsx)

**Format Excel:**
| username | password | nama | sekolah | jalur | telepon |
|----------|----------|------|---------|-------|---------|

---

### GET `/api/admin/participants/:id`
Detail peserta.

### PUT `/api/admin/participants/:id`
Update peserta (nama, sekolah, jalur, isActive, password).

### DELETE `/api/admin/participants/:id`
Hapus peserta (soft delete via user cascade).

---

### GET `/api/admin/questions`
Daftar soal dengan pagination dan filter.

**Query Params:**
- `category` — filter kategori
- `search` — cari teks soal
- `page`, `limit`

---

### POST `/api/admin/questions`
Buat soal baru.

**Request Body:**
```json
{
  "category": "MIPA",
  "text": "Teks soal...",
  "explanation": "Penjelasan...",
  "difficulty": 3,
  "choices": [
    { "label": "A", "text": "Pilihan A", "isCorrect": false },
    { "label": "B", "text": "Pilihan B", "isCorrect": true },
    { "label": "C", "text": "Pilihan C", "isCorrect": false },
    { "label": "D", "text": "Pilihan D", "isCorrect": false },
    { "label": "E", "text": "Pilihan E", "isCorrect": false }
  ]
}
```

### POST `/api/admin/questions` (Import Excel)
Content-Type: `multipart/form-data`

**Format Excel:**
| kategori | soal | pilihan_A | pilihan_B | pilihan_C | pilihan_D | pilihan_E | jawaban_benar | penjelasan |
|----------|------|-----------|-----------|-----------|-----------|-----------|----------------|------------|

Kategori yang diterima: `MIPA`, `SOSHUM`, `WAWASAN KEBANGSAAN`, `LITERASI`, `TES SKOLASTIK`, `KEAGAMAAN`  
Jawaban benar: `A`, `B`, `C`, `D`, atau `E`

---

### GET `/api/admin/results`
Daftar hasil ujian.

**Query Params:**
- `school` — filter sekolah
- `minScore` — filter nilai minimum
- `page`, `limit`
- `export=excel` — download file Excel

---

### GET `/api/admin/analytics`
Data analitik lengkap.

**Response:**
```json
{
  "success": true,
  "data": {
    "scoreByCategory": [
      { "category": "MIPA (IPA)", "avg": 72.5 }
    ],
    "hardestQuestions": [...],
    "easiestQuestions": [...],
    "completionRate": 70,
    "rankingLeaderboard": [...],
    "scoreDistribution": [
      { "range": "0-20", "count": 2 },
      { "range": "21-40", "count": 8 }
    ]
  }
}
```

---

## 🔧 Error Responses

Semua error mengikuti format:
```json
{
  "error": "Deskripsi error",
  "details": {} // opsional, untuk validation errors
}
```

**HTTP Status Codes:**
- `200` — OK
- `201` — Created
- `400` — Bad Request
- `401` — Unauthorized
- `404` — Not Found
- `409` — Conflict (username sudah ada)
- `500` — Internal Server Error
