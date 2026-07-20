import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { PDFParse } from "pdf-parse";
import { getPath } from "pdf-parse/worker";

// Explicitly register the pdf.js worker path
PDFParse.setWorker(getPath());

export async function POST(req: NextRequest) {
  // 1. Authenticate user and ensure they are an ADMIN
  const session = await auth();
  if (!session || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "File tidak ditemukan" }, { status: 400 });
    }

    // Verify it is indeed a PDF
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      return NextResponse.json({ error: "File harus berformat PDF" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();

    // Extract text from PDF using modern PDFParse class API
    const parser = new PDFParse({ data: arrayBuffer });
    const parsedPdf = await parser.getText();
    const text = parsedPdf.text;
    await parser.destroy();

    return NextResponse.json({ text });
  } catch (error: any) {
    console.error("PDF extraction error:", error);
    return NextResponse.json(
      { error: "Gagal mengekstrak teks dari PDF" },
      { status: 500 }
    );
  }
}
