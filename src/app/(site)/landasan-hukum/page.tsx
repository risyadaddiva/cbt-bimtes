import Link from 'next/link';
import { ArrowLeft, BookOpen, FileText, Info } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Landasan Hukum | PK PMII UIN SGD Bandung',
  description: 'Dokumen landasan konstitusional, AD/ART, dan pedoman organisasi PMII.',
};

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

        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-6 md:p-10">
          <div className="flex items-start gap-4 p-4 mb-8 bg-blue-50 border border-blue-100 rounded-lg text-blue-800">
            <Info className="h-5 w-5 mt-0.5 flex-shrink-0 text-pmii-blue" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Pemberitahuan</p>
              <p>
                Dokumen lengkap saat ini sedang dalam proses digitalisasi sistem. Ringkasan di bawah ini merupakan poin-poin utama dari masing-masing landasan hukum. Hubungi pengurus komisariat untuk mendapatkan salinan dokumen resmi.
              </p>
            </div>
          </div>

          <Accordion className="w-full space-y-4">
            <AccordionItem value="ad" className="border rounded-lg px-6 data-[state=open]:bg-gray-50 transition-colors">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-pmii-blue/10 p-3 rounded-full text-pmii-blue">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 font-[family:var(--font-heading)]">Anggaran Dasar (AD) PMII</h3>
                    <p className="text-sm text-gray-500 font-normal mt-1">Landasan fundamental organisasi</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-6 pt-2">
                <p className="mb-4">
                  Anggaran Dasar (AD) PMII adalah landasan konstitusional organisasi tingkat tertinggi yang memuat ketentuan-ketentuan pokok mengenai asas, sifat, tujuan, usaha, dan struktur organisasi Pergerakan Mahasiswa Islam Indonesia.
                </p>
                <p className="mb-4">
                  Dalam AD PMII ditegaskan bahwa organisasi ini berasaskan Pancasila dan berlandaskan Islam Ahlussunnah wal Jama'ah. Tujuan PMII adalah terbentuknya pribadi muslim Indonesia yang bertaqwa kepada Allah SWT, berbudi luhur, berilmu, cakap dan bertanggung jawab dalam mengamalkan ilmunya serta komitmen memperjuangkan cita-cita kemerdekaan Indonesia.
                </p>
                <p>
                  AD PMII hanya dapat diubah dan disempurnakan melalui forum Kongres, yang merupakan instansi pengambilan keputusan tertinggi dalam struktur organisasi PMII di tingkat nasional.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="art" className="border rounded-lg px-6 data-[state=open]:bg-gray-50 transition-colors">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-pmii-gold/10 p-3 rounded-full text-pmii-gold">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 font-[family:var(--font-heading)]">Anggaran Rumah Tangga (ART) PMII</h3>
                    <p className="text-sm text-gray-500 font-normal mt-1">Aturan turunan dan operasional organisasi</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-6 pt-2">
                <p className="mb-4">
                  Anggaran Rumah Tangga (ART) PMII mengatur secara lebih rinci ketentuan-ketentuan operasional yang merujuk pada Anggaran Dasar. ART berfungsi sebagai pedoman pelaksanaan dari prinsip-prinsip yang tertuang dalam AD.
                </p>
                <p className="mb-4">
                  ART mengatur hal-hal teknis seperti keanggotaan (syarat, hak, kewajiban, dan pemberhentian), kaderisasi, struktur kepengurusan dari tingkat Rayon hingga Pengurus Besar, mekanisme permusyawaratan/rapat, hingga urusan keuangan organisasi.
                </p>
                <p>
                  Setiap aturan, surat keputusan, maupun kebijakan yang dikeluarkan oleh kepengurusan di tingkat manapun tidak diperkenankan bertentangan dengan ketentuan dalam Anggaran Dasar dan Anggaran Rumah Tangga PMII.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="ndp" className="border rounded-lg px-6 data-[state=open]:bg-gray-50 transition-colors">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-green-100 p-3 rounded-full text-green-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 font-[family:var(--font-heading)]">Nilai Dasar Pergerakan (NDP)</h3>
                    <p className="text-sm text-gray-500 font-normal mt-1">Filosofi dan kerangka berpikir kader</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-6 pt-2">
                <p className="mb-4">
                  Nilai Dasar Pergerakan (NDP) merupakan nilai-nilai filosofis yang menjadi landasan teologis, sosiologis, dan politis bagi setiap kader PMII dalam berpikir, bersikap, dan bertindak. NDP disahkan pertama kali pada Kongres Bandung tahun 1973 yang dirumuskan oleh Mahbub Djunaidi dan kawan-kawan.
                </p>
                <p className="mb-4">
                  NDP PMII memuat empat tauhid/hubungan fundamental:
                </p>
                <ul className="list-disc pl-6 mb-4 space-y-2">
                  <li><strong>Hablun Minallah</strong> (Hubungan dengan Allah): Nilai ketauhidan yang menjiwai seluruh gerak langkah organisasi.</li>
                  <li><strong>Hablun Minannas</strong> (Hubungan dengan Manusia): Nilai kemanusiaan, persaudaraan, dan kesetaraan antar sesama.</li>
                  <li><strong>Hablun Minal 'Alam</strong> (Hubungan dengan Alam): Komitmen untuk menjaga dan merawat kelestarian lingkungan hidup.</li>
                  <li><strong>Hubungan dengan Diri Sendiri</strong>: Pengembangan kapasitas diri dan penyucian jiwa (tazkiyatun nafs).</li>
                </ul>
                <p>
                  NDP berfungsi sebagai kerangka refleksi dan aksi (paradigma pergerakan) yang membimbing kader PMII dalam merespon berbagai dinamika dan realitas sosial di masyarakat.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="po" className="border rounded-lg px-6 data-[state=open]:bg-gray-50 transition-colors">
              <AccordionTrigger className="hover:no-underline py-6">
                <div className="flex items-center gap-4 text-left">
                  <div className="bg-purple-100 p-3 rounded-full text-purple-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 font-[family:var(--font-heading)]">Pedoman Organisasi Komisariat</h3>
                    <p className="text-sm text-gray-500 font-normal mt-1">Aturan teknis tingkat komisariat UIN SGD</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-gray-600 leading-relaxed pb-6 pt-2">
                <p className="mb-4">
                  Pedoman organisasi tingkat komisariat merupakan aturan turunan khusus yang dirumuskan melalui forum Rapat Tahunan Komisariat (RTK) PK PMII UIN Sunan Gunung Djati Bandung.
                </p>
                <p className="mb-4">
                  Pedoman ini disusun untuk menyesuaikan dengan iklim akademis, kultur, dan dinamika spesifik yang ada di kampus UIN Sunan Gunung Djati Bandung tanpa bertentangan dengan AD/ART dan Peraturan Organisasi (PO) tingkat nasional.
                </p>
                <p>
                  Dokumen ini memuat standar operasional prosedur terkait administrasi kesekretariatan, pelaksanaan kaderisasi formal (Mapaba dan PKD), serta garis besar haluan program kerja komisariat selama satu masa khidmat kepengurusan.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
