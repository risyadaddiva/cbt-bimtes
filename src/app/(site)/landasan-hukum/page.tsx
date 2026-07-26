import Link from 'next/link';
import { ArrowLeft, BookOpen, ExternalLink, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Landasan Hukum | PK PMII UIN Bandung',
  description: 'Dokumen landasan konstitusional, AD/ART, PO, dan Nilai Dasar Pergerakan PMII.',
};

const documents = [
  {
    id: 'ad-art',
    title: 'Anggaran Dasar & Anggaran Rumah Tangga (AD/ART) PMII',
    subtitle: 'Hasil Kongres XXI Palembang 2024',
    fileUrl: '/AD_ART%20PMII%20Hasil%20Kongres%20XXI%20Palembang%202024.pdf',
    iconColor: 'bg-pmii-blue/10 text-pmii-blue',
    badge: 'Kongres XXI 2024',
  },
  {
    id: 'po',
    title: 'Peraturan Organisasi (PO) PMII',
    subtitle: 'Hasil Muspimnas PMII Tulungagung 2022',
    fileUrl: '/HASIL%20MUSPIMNAS%20PMII%20TULUNGAGUNG%202022.pdf',
    iconColor: 'bg-pmii-gold/10 text-pmii-gold',
    badge: 'Muspimnas 2022',
  },
  {
    id: 'ndp',
    title: 'Nilai Dasar Pergerakan (NDP) PMII',
    subtitle: 'Landasan Filosofis & Ideologis Kader',
    fileUrl: '/Nilai%20Dasar%20Pergerakan%20PMII.pdf',
    iconColor: 'bg-emerald-100 text-emerald-600',
    badge: 'Dokumen Resmi',
  },
];

export default function LandasanHukumPage() {
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Hero Header */}
      <div className="bg-pmii-gradient text-white py-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-pmii-gold/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
        
        <div className="site-container mx-auto px-4 relative z-10 text-center">
          <BookOpen className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-[family:var(--font-heading)] drop-shadow-md">
            Landasan Hukum & Konstitusi
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto font-medium">
            Pedoman dasar yang mengatur tata kelola organisasi Pergerakan Mahasiswa Islam Indonesia.
          </p>
        </div>
      </div>

      <div className="site-container mx-auto px-4 py-12">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="text-gray-600 hover:text-pmii-blue pl-0 hover:bg-transparent">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>

        <div className="max-w-4xl mx-auto space-y-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div className={`p-4 rounded-xl ${doc.iconColor} flex-shrink-0`}>
                  <FileText className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                      {doc.badge}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg md:text-xl text-gray-900 font-[family:var(--font-heading)]">
                    {doc.title}
                  </h3>
                  <p className="text-sm text-gray-500 font-normal mt-0.5">
                    {doc.subtitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end md:self-center w-full md:w-auto">
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto"
                >
                  <Button className="w-full md:w-auto bg-pmii-blue hover:bg-blue-700 text-white font-medium rounded-xl px-5 py-2.5 gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Buka Dokumen
                  </Button>
                </a>
                <a
                  href={doc.fileUrl}
                  download
                  className="w-full md:w-auto"
                >
                  <Button variant="outline" className="w-full md:w-auto border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl px-4 py-2.5 gap-2">
                    <Download className="h-4 w-4 text-gray-500" />
                    Unduh
                  </Button>
                </a>
              </div>
            </div>
          ))}

          {/* Pedoman Organisasi Komisariat */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-4 rounded-xl bg-purple-100 text-purple-600 flex-shrink-0">
                <FileText className="h-7 w-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                    Tingkat Komisariat
                  </span>
                </div>
                <h3 className="font-bold text-lg md:text-xl text-gray-900 font-[family:var(--font-heading)]">
                  Pedoman Organisasi Komisariat
                </h3>
                <p className="text-sm text-gray-500 font-normal mt-0.5">
                  Aturan teknis tingkat komisariat UIN Bandung (dalam pengembangan)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

