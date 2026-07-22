import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getDriveDisplayUrl, PLACEHOLDER_IMAGE } from '@/lib/media';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Artikel | PK PMII UIN SGD Bandung',
  description: 'Kumpulan artikel dan informasi terbaru seputar kegiatan dan kajian PMII UIN SGD Bandung.',
};

export const dynamic = 'force-dynamic';

export default async function BeritaPage() {
  const news = await prisma.newsArticle.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="site-container mx-auto px-4">
        <div className="mb-12">
          <span className="ribbon-label inline-block mb-4">Artikel Terkini</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-[family:var(--font-heading)]">Informasi & Artikel</h1>
          <p className="mt-4 text-gray-600 max-w-2xl text-lg">
            Ikuti perkembangan terbaru, opini, dan hasil diskusi kader PMII Komisariat UIN Sunan Gunung Djati Cabang Kabupaten Bandung.
          </p>
        </div>

        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {news.map((article) => (
              <Link key={article.id} href={`/berita/${article.slug}`} className="group bg-white rounded-xl overflow-hidden border shadow-sm card-hover flex flex-col h-full">
                <div className="relative h-56 overflow-hidden bg-gray-200">
                  <img 
                    src={article.coverImage ? getDriveDisplayUrl(article.coverImage) : PLACEHOLDER_IMAGE} 
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-pmii-gold hover:bg-pmii-gold text-white font-semibold">
                      {article.category}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center text-xs text-gray-500 mb-3 font-medium gap-2">
                    <span>{article.publishedAt ? format(new Date(article.publishedAt), 'd MMMM yyyy', { locale: id }) : ''}</span>
                    {article.author && (
                      <>
                        <span>•</span>
                        <span>{article.author}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-pmii-blue transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                    {article.excerpt}
                  </p>
                  <span className="text-pmii-blue font-semibold text-sm inline-flex items-center mt-auto">
                    Baca Selengkapnya <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 bg-blue-50 text-pmii-blue rounded-full flex items-center justify-center mb-6">
              <Newspaper className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-[family:var(--font-heading)]">Belum ada artikel</h3>
            <p className="text-gray-500 max-w-md">
              Belum ada artikel yang dipublikasikan saat ini. Silakan kunjungi kembali nanti untuk informasi terbaru.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
