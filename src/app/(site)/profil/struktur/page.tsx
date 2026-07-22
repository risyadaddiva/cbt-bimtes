import { prisma } from '@/lib/prisma';
import { getDriveDisplayUrl, PLACEHOLDER_IMAGE } from '@/lib/media';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Struktur Organisasi — PK PMII UIN Sunan Gunung Djati',
  description: 'Struktur kepengurusan PK PMII UIN Sunan Gunung Djati Bandung Cabang Kabupaten Bandung.',
};

export default async function StrukturPage() {
  const pengurus = await prisma.pengurus.findMany({
    where: { isActive: true },
    orderBy: { order: 'asc' },
  });

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-pmii-gradient text-white py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-pmii-gold/20 blur-3xl animate-pulse" />
        </div>
        <div className="site-container mx-auto px-4 relative z-10 text-center">
          <div className="w-20 h-1 bg-pmii-gold mb-6 rounded-full mx-auto" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-[family:var(--font-heading)] drop-shadow-md">
            Struktur Organisasi
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Kepengurusan PK PMII UIN Sunan Gunung Djati Bandung Cabang Kabupaten Bandung.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pmii-blue via-pmii-gold to-pmii-blue" />
      </section>

      {/* Pengurus Grid */}
      <section className="py-20 bg-gray-50">
        <div className="site-container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="ribbon-label inline-block mb-4">Pengurus</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family:var(--font-heading)]">
              Tim Kepengurusan
            </h2>
          </div>

          {pengurus.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-6 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-500 mb-2">Data Pengurus Belum Tersedia</h3>
              <p className="text-gray-400">Silakan hubungi admin untuk menambahkan data pengurus.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {pengurus.map((p) => {
                const fotoSrc = p.fotoUrl ? getDriveDisplayUrl(p.fotoUrl) : PLACEHOLDER_IMAGE;
                return (
                  <div
                    key={p.id}
                    className="group relative bg-white rounded-2xl overflow-hidden shadow-lg border card-hover"
                  >
                    {/* Photo container */}
                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-200">
                      <img
                        src={fotoSrc}
                        alt={p.nama}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-5">
                        <h3 className="text-white font-bold text-lg leading-snug mb-0.5 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {p.nama}
                        </h3>
                        <p className="text-pmii-gold font-medium text-sm mb-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                          {p.jabatan}
                        </p>
                        {p.instagramUrl && (
                          <a
                            href={p.instagramUrl.startsWith('http') ? p.instagramUrl : `https://instagram.com/${p.instagramUrl.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-white/90 hover:text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-150 hover:scale-105"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                            </svg>
                            Instagram
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Name bar (always visible) */}
                    <div className="p-4 text-center">
                      <h3 className="font-bold text-gray-900 text-sm truncate">{p.nama}</h3>
                      <p className="text-xs text-gray-500 truncate">{p.jabatan}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
