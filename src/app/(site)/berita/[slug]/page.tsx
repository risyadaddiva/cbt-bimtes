import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getDriveDisplayUrl, getDriveHighResUrl, PLACEHOLDER_IMAGE } from '@/lib/media';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Calendar, User, Eye, Tag } from 'lucide-react';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await prisma.newsArticle.findUnique({
    where: { slug, isPublished: true },
  });

  if (!article) {
    return {
      title: 'Artikel Tidak Ditemukan | PK PMII UIN SGD Bandung',
    };
  }

  return {
    title: `${article.title} | PK PMII UIN SGD Bandung`,
    description: article.excerpt,
  };
}

export const dynamic = 'force-dynamic';

export default async function ArticleDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await prisma.newsArticle.findUnique({
    where: { slug, isPublished: true },
  });

  if (!article) {
    notFound();
  }

  // Increment views in background
  await prisma.newsArticle.update({
    where: { id: article.id },
    data: { views: { increment: 1 } },
  });

  return (
    <article className="bg-white min-h-screen pb-20">
      {/* Header / Hero */}
      <div className="w-full bg-gray-900 text-white relative">
        {article.coverImage ? (
          <div className="absolute inset-0 z-0">
            <img 
              src={getDriveHighResUrl(article.coverImage)} 
              alt={article.title}
              className="w-full h-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
          </div>
        ) : (
          <div className="absolute inset-0 z-0 bg-pmii-gradient opacity-90"></div>
        )}
        
        <div className="site-container mx-auto px-4 pt-32 pb-16 relative z-10">
          <Link href="/berita" className="inline-flex items-center text-gray-300 hover:text-white mb-8 transition-colors text-sm font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Artikel
          </Link>
          
          <div className="mb-6">
            <Badge className="bg-pmii-gold hover:bg-pmii-gold text-white font-semibold text-sm px-3 py-1">
              {article.category}
            </Badge>
          </div>
          
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 font-[family:var(--font-heading)] leading-tight max-w-4xl">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-300 text-sm">
            {article.author && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{article.author}</span>
              </div>
            )}
            {article.publishedAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(article.publishedAt), 'd MMMM yyyy', { locale: id })}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              <span>{article.views + 1} tayangan</span>
            </div>
          </div>
        </div>
      </div>

      <div className="site-container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            <div 
              className="prose prose-lg prose-blue max-w-none text-gray-800
                         prose-headings:font-[family:var(--font-heading)] prose-headings:font-bold prose-headings:text-gray-900
                         prose-a:text-pmii-blue hover:prose-a:text-pmii-blue/80
                         prose-img:rounded-xl prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
            
            {article.tags && article.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t flex items-center gap-3 flex-wrap">
                <Tag className="h-5 w-5 text-gray-400" />
                <span className="font-medium text-gray-700 mr-2">Tags:</span>
                {article.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-normal">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <aside className="lg:col-span-4">
            <div className="sticky top-24">
              <div className="bg-gray-50 rounded-xl p-6 border shadow-sm">
                <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Bagikan Artikel</h3>
                <div className="flex gap-2 mb-8">
                  {/* Share buttons placeholder */}
                  <Button variant="outline" size="sm" className="flex-1">Facebook</Button>
                  <Button variant="outline" size="sm" className="flex-1">Twitter</Button>
                  <Button variant="outline" size="sm" className="flex-1">WhatsApp</Button>
                </div>
                
                <h3 className="font-bold text-lg mb-4 text-gray-900 border-b pb-2">Tentang PMII</h3>
                <p className="text-sm text-gray-600 leading-relaxed mb-4">
                  Pergerakan Mahasiswa Islam Indonesia (PMII) adalah organisasi kemahasiswaan yang berlandaskan Islam Ahlussunnah wal Jama'ah dan berasaskan Pancasila.
                </p>
                <Link href="/#tentang-kami">
                  <Button className="w-full bg-pmii-blue text-white hover:bg-pmii-blue/90">
                    Pelajari Lebih Lanjut
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </article>
  );
}
