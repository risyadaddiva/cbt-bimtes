"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, LogIn, BookOpen, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import type { Metadata } from "next";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return;

    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.includes("ACTIVE_SESSION")) {
          setError("Akun ini sedang digunakan di sesi lain. Hubungi admin jika ini bukan Anda.");
        } else {
          setError("Username/ Password salah, Jangan maksa DONG!");
        }
        setLoading(false);
        return;
      }

      // Determine redirect based on role
      const res = await fetch("/api/auth/session");
      const session = await res.json();
      const role = session?.user?.role;

      if (role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex flex-1 bg-pmii-gradient items-center justify-center p-12 relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute top-[-80px] right-[-80px] w-[300px] h-[300px] rounded-full bg-white/5" />
        <div className="absolute bottom-[-120px] left-[-60px] w-[400px] h-[400px] rounded-full bg-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-white/3 blur-3xl" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 text-white text-center max-w-md"
        >
          {/* PMII Logo */}
          <div className="w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-6 shadow-2xl p-4">
            <img src="/logo pmii.svg" alt="Logo PMII" className="w-full h-full object-contain" />
          </div>

          <h1 className="text-4xl font-bold mb-3 tracking-tight">
            CBT BIMTES PMII
          </h1>
          <p className="text-2xl font-semibold text-blue-100 mb-6">2026</p>
          <div className="w-16 h-1 bg-white/40 rounded-full mx-auto mb-6" />
          <p className="text-blue-100 text-lg font-medium mb-1">
            Komisariat UIN Sunan Gunung Djati
          </p>
          <p className="text-blue-100 text-lg font-medium">
            Cabang Kabupaten Bandung
          </p>

          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Soal", value: "90" },
              { label: "Menit", value: "120" },
              { label: "Kelompok", value: "5" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-blue-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-background relative">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Mobile header */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-4 shadow-lg p-2.5 border border-border">
              <img src="/logo pmii.svg" alt="Logo PMII" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold text-pmii-blue">CBT BIMTES PMII 2026</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Komisariat UIN Sunan Gunung Djati Bandung
            </p>
            <p className="text-muted-foreground text-sm mt-1">
               Cabang Kabupaten Bandung
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground">Masuk</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Masukkan username & password yang diberikan panitia
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username Anda"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoComplete="username"
                  className="h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    className="h-11 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-pmii-gradient hover:opacity-90 transition-opacity text-white font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-4 w-4" />
                    Masuk
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Akun dibuat oleh panitia BIMTES PMII 2026.
                <br />
                Hubungi panitia jika mengalami masalah login.
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            &copy; 2026 PMII Komisariat UIN Sunan Gunung Djati Bandung
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Cabang Kabupaten Bandung
          </p>
        </motion.div>
      </div>
    </div>
  );
}
