import { Navbar } from './_components/navbar';
import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="bg-pmii-gradient text-white py-12 mt-auto">
        <div className="site-container mx-auto px-4 md:px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-8 w-8 text-white" />
              <span className="font-bold text-xl">PK PMII UIN SGD Bandung</span>
            </div>
            <p className="italic text-pmii-gold mb-2 font-medium">"Dzikir, Fikir, Amal Sholeh"</p>
            <p className="text-sm text-gray-200 max-w-md leading-relaxed">
              Pergerakan Mahasiswa Islam Indonesia Komisariat UIN Sunan Gunung Djati Bandung. 
              Organisasi ekstra kampus yang berlandaskan Islam Ahlussunnah wal Jama'ah dan Pancasila.
            </p>
          </div>
          
          <div>
            <h3 className="font-bold text-lg mb-4 text-pmii-gold border-b border-white/20 pb-2 inline-block">Tautan Cepat</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li><Link href="/" className="hover:text-white hover:underline transition-colors">Beranda</Link></li>
              <li><Link href="/berita" className="hover:text-white hover:underline transition-colors">Berita</Link></li>
              <li><Link href="/galeri" className="hover:text-white hover:underline transition-colors">Galeri</Link></li>
              <li><Link href="/landasan-hukum" className="hover:text-white hover:underline transition-colors">Landasan Hukum</Link></li>
              <li><Link href="/login" className="hover:text-white hover:underline transition-colors">CBT BIMTES</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-lg mb-4 text-pmii-gold border-b border-white/20 pb-2 inline-block">Kontak</h3>
            <ul className="space-y-2 text-sm text-gray-200">
              <li>Email: info@pmiiuinsgd.or.id</li>
              <li>Instagram: @pmiiuinsgd</li>
              <li>Sekretariat: Jl. A.H. Nasution No. 105, Cipadung, Cibiru, Kota Bandung</li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 pt-6 text-center text-xs text-gray-300 px-4">
          <p>&copy; 2026 PK PMII UIN Sunan Gunung Djati Bandung. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
