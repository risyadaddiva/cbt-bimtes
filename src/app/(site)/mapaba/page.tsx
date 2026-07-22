import { prisma } from '@/lib/prisma';
import { Shield, AlertCircle } from 'lucide-react';
import MapabaForm from './_components/mapaba-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pendaftaran MAPABA — PK PMII UIN Sunan Gunung Djati',
  description: 'Formulir pendaftaran Masa Penerimaan Anggota Baru (MAPABA) PK PMII UIN Sunan Gunung Djati Bandung.',
};

export const dynamic = 'force-dynamic';

export default async function MapabaPage() {
  const setting = await prisma.siteSetting.findUnique({
    where: { key: 'mapaba_registration_open' },
  });

  const isOpen = setting?.value === 'true';

  let fakultasList: any[] = [];
  if (isOpen) {
    fakultasList = await prisma.fakultas.findMany({
      orderBy: { nama: 'asc' },
      include: {
        jurusans: { orderBy: { nama: 'asc' } },
      },
    });
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-pmii-gradient text-white py-20 md:py-28">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 rounded-full bg-pmii-gold/20 blur-3xl animate-pulse" />
        </div>
        <div className="site-container mx-auto px-4 relative z-10 text-center">
          <div className="w-20 h-1 bg-pmii-gold mb-6 rounded-full mx-auto" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-[family:var(--font-heading)] drop-shadow-md">
            Pendaftaran MAPABA
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Masa Penerimaan Anggota Baru — PK PMII UIN Sunan Gunung Djati Bandung
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pmii-blue via-pmii-gold to-pmii-blue" />
      </section>

      {/* Content */}
      <section className="py-16 bg-gray-50">
        <div className="site-container mx-auto px-4">
          {isOpen ? (
            <div>
              <div className="text-center mb-12">
                <span className="ribbon-label inline-block mb-4">Formulir Pendaftaran</span>
                <h2 className="text-3xl font-bold text-gray-900 font-[family:var(--font-heading)] mb-3">
                  Isi Data Diri
                </h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                  Lengkapi formulir di bawah ini untuk mendaftar sebagai calon anggota baru PMII.
                  Pastikan semua data terisi dengan benar.
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg border p-6 md:p-10 max-w-2xl mx-auto">
                <MapabaForm fakultasList={fakultasList} />
              </div>
            </div>
          ) : (
            <div className="text-center py-20 max-w-lg mx-auto">
              <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-12 h-12 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Pendaftaran Belum Dibuka
              </h2>
              <p className="text-gray-600 mb-6">
                Mohon maaf, pendaftaran MAPABA PK PMII UIN Sunan Gunung Djati Bandung saat ini belum dibuka. 
                Silakan pantau informasi terbaru melalui media sosial kami.
              </p>
              <div className="inline-flex items-center gap-2 text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
                <Shield className="w-4 h-4" />
                Hubungi admin untuk informasi lebih lanjut
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
