import Link from 'next/link';
import { Images, Calendar, Image as ImageIcon } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { getDriveDisplayUrl, PLACEHOLDER_IMAGE } from '@/lib/media';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Galeri | PK PMII UIN SGD Bandung',
  description: 'Dokumentasi kegiatan dan momen berharga PMII UIN SGD Bandung.',
};

export const dynamic = 'force-dynamic';

export default async function GaleriPage() {
  const albums = await prisma.galleryAlbum.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    include: { 
      photos: { 
        take: 1, 
        orderBy: { order: 'asc' } 
      },
      _count: {
        select: { photos: true }
      }
    }
  });

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="site-container mx-auto px-4">
        <div className="mb-12">
          <span className="ribbon-label inline-block mb-4">Galeri</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-[family:var(--font-heading)]">Dokumentasi Kegiatan</h1>
          <p className="mt-4 text-gray-600 max-w-2xl text-lg">
            Rekam jejak dan memori kegiatan keluarga besar PMII UIN Sunan Gunung Djati Bandung dalam bingkai foto.
          </p>
        </div>

        {albums.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {albums.map((album) => {
              const coverImg = album.coverImage 
                ? getDriveDisplayUrl(album.coverImage) 
                : (album.photos[0]?.imageUrl ? getDriveDisplayUrl(album.photos[0].imageUrl) : PLACEHOLDER_IMAGE);

              return (
                <Link key={album.id} href={`/galeri/${album.slug}`} className="group bg-white rounded-xl overflow-hidden border shadow-sm card-hover flex flex-col h-full">
                  <div className="relative h-64 overflow-hidden bg-gray-200">
                    <img 
                      src={coverImg} 
                      alt={album.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-black/60 hover:bg-black/80 backdrop-blur-sm text-white font-semibold flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {album._count.photos} Foto
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-pmii-blue transition-colors line-clamp-2">
                      {album.title}
                    </h2>
                    {album.eventDate && (
                      <div className="flex items-center text-sm text-gray-500 mb-3 gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(album.eventDate), 'd MMMM yyyy', { locale: id })}</span>
                      </div>
                    )}
                    {album.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">
                        {album.description}
                      </p>
                    )}
                    <span className="text-pmii-blue font-semibold text-sm inline-flex items-center mt-auto">
                      Lihat Album <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-xl border p-16 flex flex-col items-center justify-center text-center shadow-sm">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-6">
              <Images className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 font-[family:var(--font-heading)]">Belum ada album</h3>
            <p className="text-gray-500 max-w-md">
              Belum ada album galeri yang dipublikasikan saat ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
