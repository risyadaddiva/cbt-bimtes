import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, Users, BookOpen, BarChart2, 
  Trophy, LogOut, Menu, UserCircle, Newspaper, Images,
  GraduationCap, UsersRound, MessageSquare
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Peserta", href: "/admin/participants", icon: Users },
  { name: "Bank Soal", href: "/admin/questions", icon: BookOpen },
  { name: "Hasil Ujian", href: "/admin/results", icon: Trophy },
  { name: "Analitik", href: "/admin/analytics", icon: BarChart2 },
  { name: "Portal Berita", href: "/admin/berita", icon: Newspaper },
  { name: "Galeri", href: "/admin/galeri", icon: Images },
  { name: "MAPABA", href: "/admin/mapaba", icon: GraduationCap },
  { name: "Pengurus", href: "/admin/pengurus", icon: UsersRound },
  { name: "Advokasi", href: "/admin/advokasi", icon: MessageSquare },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any).role !== "ADMIN") {
    redirect("/login");
  }

  const username = (session.user as any).username;

  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-pmii-gradient text-white">
      <div className="flex h-16 items-center border-b border-white/20 px-6 font-bold text-lg gap-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center p-1 shadow-sm shrink-0">
            <img src="/logo pmii.svg" alt="Logo PMII" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-white text-sm">PMII UIN SGD</span>
            <span className="text-[12px] text-blue-100 font-normal">Cabang Kabupaten Bandung</span>
          </div>
        </Link>
      </div>
        
      
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={cn(
              "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/10 hover:text-white"
            )}
          >
            <link.icon className="mr-3 h-5 w-5 shrink-0" />
            {link.name}
          </Link>
        ))}
      </nav>

      <div className="border-t border-white/20 p-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <UserCircle className="h-8 w-8 text-blue-200" />
          <div className="flex flex-col">
            <span className="text-sm font-semibold">{username}</span>
            <span className="text-xs text-blue-200">Administrator</span>
          </div>
        </div>
        <form
          action={async () => {
            "use server";
            await signOut();
          }}
          className="mt-2"
        >
          <Button 
            variant="ghost" 
            className="w-full justify-start text-white hover:bg-white/10 hover:text-white" 
            type="submit"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Keluar
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 md:block flex-shrink-0 z-30">
        <div className="fixed inset-y-0 w-64">
          <SidebarContent />
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b bg-background px-4 md:px-8">
          <div className="font-bold text-pmii-blue flex items-center gap-2">
            <img src="/logo pmii.svg" alt="Logo PMII" className="w-6 h-6 object-contain" />
            <span className="hidden md:inline">Admin Panel PK PMII UIN SGD CAKABA</span>
            <span className="md:hidden">Admin Panel</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="md:hidden" />
                }
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Buka menu</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0 border-r-0">
                <SidebarContent />
              </SheetContent>
            </Sheet>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
