import { Shield, Calendar, MapPin, Users, BookOpen, Star } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sejarah PMII — PK PMII UIN Sunan Gunung Djati',
  description: 'Sejarah pendirian dan perkembangan Pergerakan Mahasiswa Islam Indonesia (PMII) Komisariat UIN Sunan Gunung Djati Bandung.',
};

const timeline = [
  {
    year: '1960',
    title: 'Pendirian PMII',
    description: 'Pergerakan Mahasiswa Islam Indonesia (PMII) didirikan pada 17 April 1960 di Surabaya oleh para tokoh pemuda Islam yang berhaluan Ahlussunnah wal Jamaah.',
    icon: Star,
  },
  {
    year: '1966',
    title: 'Peran dalam Orde Baru',
    description: 'PMII turut berperan aktif dalam pergerakan mahasiswa di masa transisi politik Indonesia. Kader-kader PMII menjadi pelopor di berbagai lini perjuangan.',
    icon: Shield,
  },
  {
    year: '1972',
    title: 'Kemandirian Organisasi',
    description: 'PMII menyatakan kemandirian dari organisasi induknya dan menetapkan diri sebagai organisasi pergerakan mahasiswa yang independen.',
    icon: Users,
  },
  {
    year: '1998',
    title: 'Reformasi',
    description: 'Kader-kader PMII turut serta dalam gerakan reformasi 1998 yang membawa perubahan besar bagi demokrasi Indonesia.',
    icon: BookOpen,
  },
  {
    year: '2000-an',
    title: 'Komisariat UIN SGD Bandung',
    description: 'PK PMII UIN Sunan Gunung Djati Bandung Cabang Kabupaten Bandung terus berkembang sebagai wadah kaderisasi mahasiswa yang beriman, berilmu, dan bergerak.',
    icon: MapPin,
  },
  {
    year: 'Kini',
    title: 'Masa Depan Pergerakan',
    description: 'PMII terus berkontribusi dalam pengembangan SDM unggul melalui tri-dharma pergerakan: Dzikir, Fikir, dan Amal Sholeh.',
    icon: Calendar,
  },
];

export default function SejarahPage() {
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
            Sejarah PMII
          </h1>
          <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Perjalanan panjang Pergerakan Mahasiswa Islam Indonesia dari awal pendirian hingga kini.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pmii-blue via-pmii-gold to-pmii-blue" />
      </section>

      {/* Timeline Section */}
      <section className="py-20 bg-gray-50">
        <div className="site-container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="ribbon-label inline-block mb-4">Linimasa</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-[family:var(--font-heading)]">
              Perjalanan Pergerakan
            </h2>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pmii-blue via-pmii-gold to-pmii-blue hidden md:block" />
            
            <div className="space-y-12 md:space-y-0">
              {timeline.map((item, index) => {
                const Icon = item.icon;
                const isEven = index % 2 === 0;

                return (
                  <div key={item.year} className="relative md:flex md:items-center md:mb-16">
                    {/* Desktop: alternating sides */}
                    <div className={`md:w-1/2 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12 md:ml-auto'}`}>
                      <div className="bg-white rounded-2xl p-6 md:p-8 shadow-lg border card-hover relative">
                        {/* Arrow pointing to center line */}
                        <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border rotate-45 ${
                          isEven ? '-right-2 border-l-0 border-b-0' : '-left-2 border-r-0 border-t-0'
                        }`} />
                        
                        <div className={`flex items-center gap-3 mb-3 ${isEven ? 'md:justify-end' : ''}`}>
                          <div className="w-10 h-10 rounded-full bg-pmii-blue/10 flex items-center justify-center shrink-0">
                            <Icon className="h-5 w-5 text-pmii-blue" />
                          </div>
                          <span className="text-pmii-gold font-bold text-lg">{item.year}</span>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{item.description}</p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="hidden md:block absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-pmii-gold border-4 border-white shadow-md z-10" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="site-container mx-auto px-4 text-center">
          <span className="ribbon-label inline-block mb-4 mx-auto">Identitas</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 font-[family:var(--font-heading)]">
            Nilai-Nilai PMII
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-50 p-8 rounded-2xl border card-hover">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🤲</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Dzikir</h3>
              <p className="text-gray-600 text-sm">
                Kesadaran spiritual dalam setiap langkah pergerakan. Mengingat Allah SWT sebagai landasan utama.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border card-hover">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💡</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fikir</h3>
              <p className="text-gray-600 text-sm">
                Intelektualitas dan berpikir kritis sebagai modal utama pergerakan mahasiswa Islam.
              </p>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl border card-hover">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✊</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Amal Sholeh</h3>
              <p className="text-gray-600 text-sm">
                Aksi nyata untuk kemaslahatan umat dan bangsa. Teori tanpa praktek adalah kesia-siaan.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
