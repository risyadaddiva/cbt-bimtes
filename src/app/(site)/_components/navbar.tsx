'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';

const navLinks = [
  { href: '/', label: 'Beranda' },
  { href: '/berita', label: 'Berita' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/landasan-hukum', label: 'Landasan Hukum' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="site-container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/icon.svg" alt="Logo PMII" className="h-8 w-8 object-contain" />
          <span className="font-bold text-pmii-blue hidden sm:inline-block">PK PMII UIN SGD Bandung</span>
          <span className="font-bold text-pmii-blue sm:hidden">PMII UIN SGD</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-pmii-blue ${
                  isActive ? 'text-pmii-blue font-bold border-b-2 border-pmii-blue pb-1' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />

          <Link href="/login" className="hidden md:block">
            <Button className="bg-pmii-gold text-white hover:bg-pmii-gold/90 border-0 rounded px-4 py-2 font-medium">
              CBT BIMTES
            </Button>
          </Link>

          {/* Mobile Nav Toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-left font-bold text-pmii-blue flex items-center gap-2 mb-6">
                <img src="/logo pmii.svg" alt="Logo PMII" className="h-6 w-6 object-contain" /> PMII UIN SGD
              </SheetTitle>
              <nav className="flex flex-col gap-4">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-2 py-1 text-lg font-medium transition-colors hover:text-pmii-blue ${
                        isActive ? 'text-pmii-blue font-bold' : 'text-gray-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
                <Link href="/login" onClick={() => setIsOpen(false)} className="mt-4">
                  <Button className="w-full bg-pmii-gold text-white hover:bg-pmii-gold/90">
                    CBT BIMTES
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
