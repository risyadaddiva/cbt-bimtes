'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState, useRef, useEffect } from 'react';

const navLinks = [
  { href: '/', label: 'Beranda' },
  {
    label: 'Profil',
    children: [
      { href: '/profil/sejarah', label: 'Sejarah' },
      { href: '/profil/struktur', label: 'Struktur' },
    ],
  },
  { href: '/berita', label: 'Artikel' },
  { href: '/galeri', label: 'Galeri' },
  { href: '/landasan-hukum', label: 'Landasan Hukum' },
  { href: '/layanan-advokasi', label: 'Layanan Advokasi' },
  { href: '/mapaba', label: 'MAPABA' },
];

export function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [profilOpen, setProfilOpen] = useState(false);
  const [mobileProfilOpen, setMobileProfilOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfilOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isProfilActive = pathname.startsWith('/profil');

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="site-container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <img src="/icon.svg" alt="Logo PMII" className="h-8 w-8 object-contain" />
          <div className="flex flex-col leading-tight hidden sm:flex">
            <span className="font-bold text-pmii-blue text-sm">PK PMII UIN Sunan Gunung Djati</span>
            <span className="text-[12px] text-gray-500 font-medium">Cabang Kabupaten Bandung</span>
          </div>
          <div className="flex flex-col leading-tight sm:hidden">
            <span className="font-bold text-pmii-blue text-sm">PMII UIN SGD</span>
            <span className="text-[10px] text-gray-500 font-medium">Cab. Kab. Bandung</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-5">
          {navLinks.map((link) => {
            // Dropdown for Profil
            if ('children' in link && link.children) {
              return (
                <div
                  key={link.label}
                  ref={dropdownRef}
                  className="relative"
                  onMouseEnter={() => setProfilOpen(true)}
                  onMouseLeave={() => setProfilOpen(false)}
                >
                  <button
                    onClick={() => setProfilOpen(!profilOpen)}
                    className={`flex items-center gap-1 text-sm font-medium transition-colors hover:text-pmii-blue ${
                      isProfilActive ? 'text-pmii-blue font-bold border-b-2 border-pmii-blue pb-1' : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {link.label}
                    <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${profilOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown menu */}
                  <div
                    className={`absolute top-full left-1/2 -translate-x-1/2 pt-2 transition-all duration-200 ${
                      profilOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1'
                    }`}
                  >
                    <div className="bg-background border rounded-xl shadow-xl py-2 min-w-[180px] overflow-hidden">
                      {link.children.map((child) => {
                        const isChildActive = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={() => setProfilOpen(false)}
                            className={`block px-4 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-pmii-blue ${
                              isChildActive ? 'text-pmii-blue bg-accent font-bold' : 'text-foreground'
                            }`}
                          >
                            {child.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            }

            // Regular link
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href!));
            return (
              <Link
                key={link.href}
                href={link.href!}
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

          {/* Mobile Nav Toggle */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" />}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <SheetTitle className="text-left font-bold text-pmii-blue flex items-center gap-2 mb-6">
                <img src="/logo pmii.svg" alt="Logo PMII" className="h-6 w-6 object-contain" /> PMII UIN SGD
              </SheetTitle>
              <nav className="flex flex-col gap-2">
                {navLinks.map((link) => {
                  // Expandable for Profil on mobile
                  if ('children' in link && link.children) {
                    return (
                      <div key={link.label}>
                        <button
                          onClick={() => setMobileProfilOpen(!mobileProfilOpen)}
                          className={`flex items-center justify-between w-full px-2 py-2 text-lg font-medium transition-colors hover:text-pmii-blue ${
                            isProfilActive ? 'text-pmii-blue font-bold' : 'text-gray-600'
                          }`}
                        >
                          {link.label}
                          <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileProfilOpen ? 'rotate-180' : ''}`} />
                        </button>
                        <div className={`overflow-hidden transition-all duration-300 ${mobileProfilOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                          {link.children.map((child) => {
                            const isChildActive = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => { setIsOpen(false); setMobileProfilOpen(false); }}
                                className={`block pl-6 pr-2 py-2 text-base font-medium transition-colors hover:text-pmii-blue ${
                                  isChildActive ? 'text-pmii-blue font-bold' : 'text-gray-500'
                                }`}
                              >
                                {child.label}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href!));
                  return (
                    <Link
                      key={link.href}
                      href={link.href!}
                      onClick={() => setIsOpen(false)}
                      className={`block px-2 py-2 text-lg font-medium transition-colors hover:text-pmii-blue ${
                        isActive ? 'text-pmii-blue font-bold' : 'text-gray-600'
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
