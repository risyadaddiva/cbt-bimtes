import { Shield, Scale, MessageCircle, Users, FileText, Phone } from 'lucide-react';
import AdvokasiForm from './_components/advokasi-form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Layanan Advokasi — PK PMII UIN Sunan Gunung Djati',
  description: 'Layanan advokasi dan pengaduan PK PMII UIN Sunan Gunung Djati Bandung. Kami siap membantu memperjuangkan hak-hak mahasiswa.',
};

const layanan = [
  {
    icon: Scale,
    title: 'Advokasi Akademik',
    description: 'Pendampingan masalah perkuliahan, nilai, kebijakan akademik, dan hak-hak mahasiswa di kampus.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: Users,
    title: 'Advokasi Non-Akademik',
    description: 'Bantuan untuk permasalahan di luar akademik seperti beasiswa, fasilitas kampus, dan kegiatan kemahasiswaan.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: FileText,
    title: 'Advokasi Organisasi',
    description: 'Konsultasi terkait organisasi kemahasiswaan, perizinan kegiatan, dan hubungan antar lembaga.',
    color: 'bg-amber-100 text-amber-600',
  },
  {
    icon: MessageCircle,
    title: 'Konsultasi Umum',
    description: 'Layanan konsultasi untuk permasalahan lainnya yang dialami mahasiswa di lingkungan kampus.',
    color: 'bg-green-100 text-green-600',
  },
];

export default function LayananAdvokasiPage() {
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
            Layanan Advokasi
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Kami hadir untuk memperjuangkan hak-hak mahasiswa. Sampaikan keluhan Anda, kami siap mendampingi.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pmii-blue via-pmii-gold to-pmii-blue" />
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="site-container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="ribbon-label inline-block mb-4">Layanan Kami</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family:var(--font-heading)]">
              Jenis Layanan Advokasi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {layanan.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="bg-white rounded-2xl p-6 border shadow-sm card-hover text-center">
                  <div className={`w-14 h-14 rounded-full ${item.color} flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              );
            })}
          </div>

          {/* How it works */}
          <div className="bg-white rounded-2xl shadow-lg border p-8 md:p-12 mb-16">
            <div className="text-center mb-10">
              <span className="ribbon-label inline-block mb-4">Alur Pengaduan</span>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 font-[family:var(--font-heading)]">
                Bagaimana Cara Kerjanya?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Isi Formulir', desc: 'Sampaikan pengaduan Anda melalui formulir di bawah ini.' },
                { step: '2', title: 'Tim Review', desc: 'Tim advokasi kami akan mereview pengaduan yang masuk.' },
                { step: '3', title: 'Pendampingan', desc: 'Kami akan menghubungi Anda untuk pendampingan lebih lanjut.' },
                { step: '4', title: 'Penyelesaian', desc: 'Masalah ditindaklanjuti hingga mendapatkan solusi terbaik.' },
              ].map((item) => (
                <div key={item.step} className="text-center relative">
                  <div className="w-12 h-12 rounded-full bg-pmii-blue text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
                    {item.step}
                  </div>
                  <h4 className="font-bold text-gray-900 mb-1">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="py-20 bg-white" id="form-pengaduan">
        <div className="site-container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="ribbon-label inline-block mb-4">Pengaduan</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family:var(--font-heading)] mb-3">
              Form Pengaduan
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Isi formulir di bawah ini dengan lengkap. Identitas Anda akan dijaga kerahasiaannya.
            </p>
          </div>

          <div className="bg-gray-50 rounded-2xl shadow-lg border p-6 md:p-10 max-w-2xl mx-auto">
            <AdvokasiForm />
          </div>
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-16 bg-pmii-blue text-white">
        <div className="site-container mx-auto px-4 text-center">
          <Shield className="w-12 h-12 text-pmii-gold mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-3">Butuh Bantuan Segera?</h3>
          <p className="text-gray-200 mb-6 max-w-lg mx-auto">
            Jika masalah Anda bersifat mendesak, silakan hubungi langsung tim advokasi kami melalui kontak berikut.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 px-6 py-3 rounded-full text-white font-medium">
            <Phone className="w-5 h-5" />
            Hubungi via Instagram: @pmii_uinbandung
          </div>
        </div>
      </section>
    </div>
  );
}
