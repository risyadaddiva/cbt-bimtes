import Link from "next/link";
import {
  Newspaper,
  Images,
  BookOpen,
  Monitor,
  CheckCircle,
  Heart,
  Lightbulb,
  Shield,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { getDriveDisplayUrl, PLACEHOLDER_IMAGE } from "@/lib/media";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latestNews = await prisma.newsArticle.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: "desc" },
    take: 3,
  });

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://pmiiuinsgd.site";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "PK PMII UIN Sunan Gunung Djati Cabang Kabupaten Bandung",
    alternateName: [
      "PMII UIN SGD Bandung",
      "PMII UIN Sunan Gunung Djati",
      "PK PMII UIN SGD CAKABA",
    ],
    url: baseUrl,
    logo: `${baseUrl}/icon.svg`,
    description:
      "Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung Djati Cabang Kabupaten Bandung.",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Jl. A.H. Nasution No. 105, Cipadung, Cibiru",
      addressLocality: "Kota Bandung",
      addressRegion: "Jawa Barat",
      countryName: "Indonesia",
    },
    sameAs: ["https://instagram.com/pmii_uinbandung/"],
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Section 1 - Hero (full-width) */}
      <section className="relative w-full overflow-hidden bg-pmii-gradient text-white py-24 md:py-32">
        {/* Animated background dots placeholder (CSS-based animation could be added in globals, but keeping it simple as requested) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-pmii-gold/20 blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="site-container mx-auto px-4 relative z-10 text-center flex flex-col items-center">
          <div className="w-20 h-1 bg-pmii-gold mb-8 rounded-full"></div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 font-[family:var(--font-heading)] drop-shadow-md">
            PK PMII UIN Sunan Gunung Djati
          </h1>
          <h3 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-4 font-[family:var(--font-heading)] drop-shadow-md">
            Cabang Kabupaten Bandung
          </h3>
          <p className="text-xl md:text-2xl text-pmii-gold font-bold italic mb-6 tracking-wide drop-shadow">
            Dzikir, Fikir, Amal Sholeh
          </p>
          <p className="text-sm md:text-base text-gray-200 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung
            Djati Cabang Kabupaten Bandung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="#tentang-kami">
              <Button
                variant="outline"
                className="w-full sm:w-auto text-pmii-blue border-white bg-white hover:bg-gray-100 hover:text-pmii-blue rounded-full px-8 py-6 text-lg font-bold transition-all shadow-lg hover:shadow-xl"
              >
                Tentang Kami
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pmii-blue via-pmii-gold to-pmii-blue"></div>
      </section>

      {/* Section 2 - Quick Access Cards */}
      <section className="py-16 bg-gray-50">
        <div className="site-container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="ribbon-label inline-block mb-4">Layanan</span>
            <h2 className="text-3xl font-bold text-gray-900 font-[family:var(--font-heading)]">
              Akses Cepat
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/berita"
              className="group block card-hover bg-white rounded-xl p-6 border shadow-sm flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-blue-100 text-pmii-blue flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Newspaper className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Artikel Terkini
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Kumpulan artikel dan informasi terbaru seputar PMII UIN SGD
                Bandung.
              </p>
              <span className="text-pmii-blue font-semibold text-sm group-hover:underline flex items-center">
                Lihat <span className="ml-1">→</span>
              </span>
            </Link>

            <Link
              href="/galeri"
              className="group block card-hover bg-white rounded-xl p-6 border shadow-sm flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Images className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Galeri Kegiatan
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Dokumentasi momen berharga dari berbagai kegiatan organisasi.
              </p>
              <span className="text-indigo-600 font-semibold text-sm group-hover:underline flex items-center">
                Lihat <span className="ml-1">→</span>
              </span>
            </Link>

            <Link
              href="/landasan-hukum"
              className="group block card-hover bg-white rounded-xl p-6 border shadow-sm flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Landasan Hukum
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Akses dokumen konstitusi, AD/ART, dan pedoman organisasi PMII.
              </p>
              <span className="text-purple-600 font-semibold text-sm group-hover:underline flex items-center">
                Lihat <span className="ml-1">→</span>
              </span>
            </Link>

            <Link
              href="/login"
              className="group block card-hover bg-white rounded-xl p-6 border shadow-sm flex flex-col items-center text-center ring-2 ring-pmii-gold/20"
            >
              <div className="w-16 h-16 rounded-full bg-amber-100 text-pmii-gold flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Monitor className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                CBT BIMTES 2026
              </h3>
              <p className="text-sm text-gray-500 mb-4 flex-1">
                Platform ujian masuk tryout dan bimbingan tes PMII UIN SGD.
              </p>
              <span className="text-pmii-gold font-semibold text-sm group-hover:underline flex items-center">
                Akses Platform <span className="ml-1">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 3 - Tentang PMII */}
      <section id="tentang-kami" className="py-20 bg-white">
        <div className="site-container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="ribbon-label mb-4 inline-block">
                Tentang Kami
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 font-[family:var(--font-heading)] leading-tight">
                Pergerakan Mahasiswa Islam Indonesia
              </h2>
              <div className="text-gray-600 space-y-4 mb-8 text-lg leading-relaxed">
                <p>
                  Pergerakan Mahasiswa Islam Indonesia (PMII) adalah organisasi
                  kemahasiswaan yang berlandaskan Islam Ahlussunnah wal Jama'ah.
                  Berdiri pada 17 April 1960 di Surabaya.
                </p>
                <p>
                  PMII Komisariat UIN Sunan Gunung Djati Bandung merupakan wadah
                  pergerakan dan kaderisasi mahasiswa dalam mengembangkan
                  potensi intelektual, spiritual, dan sosial untuk mewujudkan
                  kemajuan bangsa.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg border flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-2 rounded-full mb-3 text-pmii-blue">
                    <Heart className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-gray-900">Dzikir</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Kesadaran spiritual kepada Allah SWT.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border flex flex-col items-center text-center">
                  <div className="bg-amber-100 p-2 rounded-full mb-3 text-pmii-gold">
                    <Lightbulb className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-gray-900">Fikir</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Pengembangan intelektual dan analisis kritis.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border flex flex-col items-center text-center">
                  <div className="bg-green-100 p-2 rounded-full mb-3 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <h4 className="font-bold text-gray-900">Amal Sholeh</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    Implementasi nyata untuk umat dan bangsa.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Decorative Card */}
              <div className="bg-pmii-blue rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-pmii-gold/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -ml-24 -mb-24"></div>

                <div className="relative z-10 flex flex-col items-center text-center justify-center h-full min-h-[300px]">
                  <Shield className="h-20 w-20 text-pmii-gold mb-6 opacity-80" />
                  <p className="text-2xl md:text-3xl font-[family:var(--font-heading)] font-bold italic leading-snug">
                    "Tumbuh Subur Kader PMII, <br />
                    Maju Terus PMII"
                  </p>
                  <div className="mt-8 w-16 h-1 bg-pmii-gold mx-auto"></div>
                  <p className="mt-4 font-semibold tracking-wider uppercase text-sm text-gray-300">
                    Salam Pergerakan!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 - Latest News */}
      <section className="py-20 bg-gray-50">
        <div className="site-container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <span className="ribbon-label inline-block mb-4">
                Artikel Terkini
              </span>
              <h2 className="text-3xl font-bold text-gray-900 font-[family:var(--font-heading)]">
                Info Terbaru PMII
              </h2>
            </div>
            <Link
              href="/berita"
              className="hidden md:inline-flex items-center text-pmii-blue font-semibold hover:underline group"
            >
              Lihat Semua Artikel{" "}
              <span className="ml-2 group-hover:translate-x-1 transition-transform">
                →
              </span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {latestNews.length > 0
              ? latestNews.map((news) => (
                  <Link
                    key={news.id}
                    href={`/berita/${news.slug}`}
                    className="group bg-white rounded-xl overflow-hidden border shadow-sm card-hover flex flex-col h-full"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-200">
                      <img
                        src={
                          news.coverImage
                            ? getDriveDisplayUrl(news.coverImage)
                            : PLACEHOLDER_IMAGE
                        }
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-pmii-gold hover:bg-pmii-gold text-white font-semibold">
                          {news.category}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="text-xs text-gray-500 mb-2 font-medium">
                        {news.publishedAt
                          ? format(new Date(news.publishedAt), "d MMMM yyyy", {
                              locale: id,
                            })
                          : ""}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pmii-blue transition-colors line-clamp-2">
                        {news.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                        {news.excerpt}
                      </p>
                      <span className="text-pmii-blue font-semibold text-sm inline-flex items-center mt-auto">
                        Baca Selengkapnya{" "}
                        <span className="ml-1 group-hover:translate-x-1 transition-transform">
                          →
                        </span>
                      </span>
                    </div>
                  </Link>
                ))
              : // Placeholder when no news exists
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl overflow-hidden border shadow-sm flex flex-col h-full opacity-70"
                  >
                    <div className="relative h-48 bg-gray-100 flex items-center justify-center">
                      <Newspaper className="h-12 w-12 text-gray-300" />
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      <div className="w-24 h-4 bg-gray-200 rounded mb-3"></div>
                      <div className="w-full h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="w-3/4 h-6 bg-gray-200 rounded mb-4"></div>
                      <div className="w-full h-16 bg-gray-100 rounded mb-4 flex-1 flex items-center justify-center text-sm font-medium text-gray-400">
                        Segera hadir
                      </div>
                    </div>
                  </div>
                ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/berita">
              <Button
                variant="outline"
                className="w-full border-pmii-blue text-pmii-blue hover:bg-blue-50"
              >
                Lihat Semua Artikel
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 5 - Quote Banner */}
      <section className="bg-pmii-blue py-16 md:py-24">
        <div className="site-container mx-auto px-4 text-center">
          <p className="text-2xl md:text-4xl lg:text-5xl font-[family:var(--font-heading)] font-bold italic text-white leading-tight max-w-4xl mx-auto drop-shadow-sm">
            "Terlahir dari Rahim Kampus, <br className="hidden md:block" />{" "}
            Tumbuh Bersama Umat"
          </p>
          <div className="mt-8 text-pmii-gold text-lg md:text-xl font-semibold tracking-wider">
            — PMII
          </div>
        </div>
      </section>
    </div>
  );
}
