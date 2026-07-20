import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getDriveDisplayUrl, getDriveHighResUrl } from '@/lib/media';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowLeft, Calendar, Image as ImageIcon } from 'lucide-react';
import { Metadata } from 'next';

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const album = await prisma.galleryAlbum.findUnique({
    where: { slug, isPublished: true },
  });

  if (!album) {
    return {
      title: 'Album Tidak Ditemukan | PK PMII UIN SGD Bandung',
    };
  }

  return {
    title: `${album.title} - Galeri | PK PMII UIN SGD Bandung`,
    description: album.description || `Galeri kegiatan ${album.title}`,
  };
}

export default async function AlbumDetailPage({ params }: Props) {
  const { slug } = await params;
  const album = await prisma.galleryAlbum.findUnique({
    where: { slug, isPublished: true },
    include: { 
      photos: { 
        orderBy: { order: 'asc' } 
      } 
    },
  });

  if (!album) {
    notFound();
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="site-container mx-auto px-4 py-12">
          <Link href="/galeri" className="inline-flex items-center text-pmii-blue hover:underline mb-8 font-medium">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Galeri
          </Link>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-4 font-[family:var(--font-heading)] text-gray-900">
            {album.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
            {album.eventDate && (
              <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md text-sm">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{format(new Date(album.eventDate), 'd MMMM yyyy', { locale: id })}</span>
              </div>
            )}
            <div className="flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-md text-sm">
              <ImageIcon className="h-4 w-4 text-gray-500" />
              <span>{album.photos.length} Foto</span>
            </div>
          </div>
          
          {album.description && (
            <p className="text-gray-700 text-lg max-w-3xl leading-relaxed">
              {album.description}
            </p>
          )}
        </div>
      </div>

      {/* Masonry/Grid Photos */}
      <div className="site-container mx-auto px-4 py-12">
        {album.photos.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            {album.photos.map((photo, index) => (
              <div key={photo.id} className="break-inside-avoid bg-white rounded-lg shadow-sm overflow-hidden group">
                <div className="relative overflow-hidden cursor-zoom-in">
                  <img 
                    src={getDriveHighResUrl(photo.imageUrl)} 
                    alt={photo.caption || `Foto ${index + 1} dari album ${album.title}`}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                </div>
                {photo.caption && (
                  <div className="p-4 border-t border-gray-100">
                    <p className="text-sm text-gray-700 italic">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-xl border shadow-sm">
            <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 font-medium">Belum ada foto dalam album ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
