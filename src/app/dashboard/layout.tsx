import { auth, signOut } from "@/auth";
import { BookOpen, LogOut, User } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || (session.user as any).role !== "PARTICIPANT") {
    redirect("/login");
  }

  const name = session?.user?.name || (session?.user as any)?.username || "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <img src="/logo pmii.svg" alt="Logo PMII" className="w-8 h-8 object-contain" />
            <span className="font-bold text-lg hidden sm:inline-block">CBT BIMTES 2026</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <ThemeToggle />
            <div className="flex items-center gap-2 text-sm">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{name}</span>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <Button variant="ghost" size="sm" type="submit" className="text-muted-foreground hover:text-foreground">
                <LogOut className="w-4 h-4 mr-2" />
                Keluar
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
