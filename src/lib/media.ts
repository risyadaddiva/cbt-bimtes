/**
 * src/lib/media.ts
 * Utility untuk mengonversi Google Drive sharing URL
 * menjadi URL gambar yang bisa digunakan langsung di <img> src.
 *
 * Format yang didukung:
 * 1. https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
 * 2. https://drive.google.com/open?id={FILE_ID}
 * 3. https://drive.google.com/uc?id={FILE_ID}
 * 4. https://lh3.googleusercontent.com/... (sudah dalam format embed)
 */

/**
 * Mengekstrak FILE_ID dari berbagai format Google Drive URL.
 */
export function extractDriveFileId(url: string): string | null {
  if (!url) return null;

  // Format: /file/d/{id}/
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  // Format: ?id={id} atau &id={id}
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];

  return null;
}

/**
 * Mengonversi Google Drive URL menjadi direct-display URL.
 * Jika bukan Google Drive URL, dikembalikan apa adanya.
 */
export function getDriveDisplayUrl(url: string): string {
  if (!url) return "";

  // Sudah dalam format embed / bukan drive
  if (!url.includes("drive.google.com")) return url;

  const fileId = extractDriveFileId(url);
  if (!fileId) return url;

  // Gunakan endpoint thumbnail untuk menghindari CORS/view-only issue
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
}

/**
 * Mengonversi Google Drive URL ke resolusi lebih besar (untuk cover/hero).
 */
export function getDriveHighResUrl(url: string): string {
  if (!url) return "";
  if (!url.includes("drive.google.com")) return url;

  const fileId = extractDriveFileId(url);
  if (!fileId) return url;

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
}

/**
 * Fallback image placeholder jika gambar tidak tersedia.
 */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%230F52BA' opacity='0.08'/%3E%3Ctext x='400' y='225' font-family='system-ui' font-size='20' fill='%230F52BA' text-anchor='middle' dominant-baseline='middle'%3EPMII UIN SGD Bandung%3C/text%3E%3C/svg%3E";
