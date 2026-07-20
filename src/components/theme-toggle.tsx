"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className={`w-9 h-9 opacity-0 ${className || ""}`}>
        <Sun className="h-5 w-5" />
      </Button>
    );
  }

  const isDark = theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`w-9 h-9 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 ${className || ""}`}
      title={isDark ? "Ubah ke Tema Terang" : "Ubah ke Tema Gelap"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-5 w-5 text-amber-400 transition-all" />
      ) : (
        <Moon className="h-5 w-5 text-slate-700 dark:text-slate-200 transition-all" />
      )}
    </Button>
  );
}
