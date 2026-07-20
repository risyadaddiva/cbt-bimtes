import * as XLSX from "xlsx";
import { Category } from "@/lib/randomize";

export interface QuestionImportRow {
  category: string;
  text: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  optionE: string;
  correctAnswer: string; // A, B, C, D, or E
  explanation?: string;
}

export interface ParticipantImportRow {
  username: string;
  password: string;
  name: string;
  school: string;
  track: string; // MIPA or SOSHUM
  phone?: string;
}

const CATEGORY_MAP: Record<string, Category> = {
  MIPA: "MIPA",
  IPA: "MIPA",
  SOSHUM: "SOSHUM",
  IPS: "SOSHUM",
  "WAWASAN KEBANGSAAN": "WAWASAN_KEBANGSAAN",
  WAWASAN: "WAWASAN_KEBANGSAAN",
  WAWASAN_KEBANGSAAN: "WAWASAN_KEBANGSAAN",
  LITERASI: "LITERASI",
  "BAHASA INDONESIA": "LITERASI",
  "TES SKOLASTIK": "TES_SKOLASTIK",
  SKOLASTIK: "TES_SKOLASTIK",
  TES_SKOLASTIK: "TES_SKOLASTIK",
  KEAGAMAAN: "KEAGAMAAN",
  AGAMA: "KEAGAMAAN",
};

export function parseQuestionsFromExcel(buffer: ArrayBuffer): QuestionImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    header: 1,
    defval: "",
  });

  // Skip header row
  const data = rows.slice(1) as string[][];

  return data
    .filter((row) => row[0] && row[1])
    .map((row) => ({
      category: String(row[0] ?? "").trim().toUpperCase(),
      text: String(row[1] ?? "").trim(),
      optionA: String(row[2] ?? "").trim(),
      optionB: String(row[3] ?? "").trim(),
      optionC: String(row[4] ?? "").trim(),
      optionD: String(row[5] ?? "").trim(),
      optionE: String(row[6] ?? "").trim(),
      correctAnswer: String(row[7] ?? "").trim().toUpperCase(),
      explanation: String(row[8] ?? "").trim(),
    }));
}

export function parseParticipantsFromExcel(
  buffer: ArrayBuffer
): ParticipantImportRow[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
    header: 1,
    defval: "",
  });

  const data = rows.slice(1) as string[][];

  return data
    .filter((row) => row[0] && row[1] && row[2])
    .map((row) => ({
      username: String(row[0] ?? "").trim(),
      password: String(row[1] ?? "").trim(),
      name: String(row[2] ?? "").trim(),
      school: String(row[3] ?? "").trim(),
      track: String(row[4] ?? "MIPA").trim().toUpperCase(),
      phone: String(row[5] ?? "").trim() || undefined,
    }));
}

export function mapCategory(raw: string): Category | null {
  return CATEGORY_MAP[raw.toUpperCase()] ?? null;
}

export function exportResultsToExcel(
  results: Array<{
    name: string;
    username: string;
    school: string;
    track: string;
    totalScore: number;
    totalCorrect: number;
    totalIncorrect: number;
    rank?: number | null;
    submittedAt?: Date | null;
  }>
) {
  const data = results.map((r, i) => ({
    No: i + 1,
    Nama: r.name,
    Username: r.username,
    Asal_Sekolah: r.school,
    Jalur: r.track,
    Nilai_Total: r.totalScore.toFixed(2),
    Benar: r.totalCorrect,
    Salah: r.totalIncorrect,
    Peringkat: r.rank ?? "-",
    Waktu_Selesai: r.submittedAt
      ? new Date(r.submittedAt).toLocaleString("id-ID")
      : "-",
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Hasil CBT BIMTES 2026");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}
