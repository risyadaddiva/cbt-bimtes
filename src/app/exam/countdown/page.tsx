"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function CountdownPage() {
  const router = useRouter();
  const [count, setCount] = useState(5);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(count - 1), 1000);
      return () => clearTimeout(timer);
    } else if (!starting) {
      startExam();
    }
  }, [count, starting]);

  const startExam = async () => {
    setStarting(true);
    try {
      const res = await fetch("/api/exam/start", { method: "POST" });
      const data = await res.json();

      if (res.ok && data.success) {
        router.replace("/exam");
      } else {
        toast.error(data.error || "Gagal memulai ujian");
        setTimeout(() => router.replace("/dashboard"), 2000);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan jaringan");
      setTimeout(() => router.replace("/dashboard"), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-pmii-gradient flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-2xl bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 md:p-12 text-center text-white shadow-2xl">
        <div className="w-20 h-20 rounded-full bg-white/25 backdrop-blur-sm border border-white/30 flex items-center justify-center mx-auto mb-8 p-3 shadow-xl">
          <img src="/logo pmii.svg" alt="Logo PMII" className="w-full h-full object-contain" />
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Bersiap Memulai Ujian
        </h1>
        
        <div className="h-40 flex items-center justify-center my-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={count}
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.5, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-8xl md:text-9xl font-black tabular-nums tracking-tighter"
            >
              {count > 0 ? count : "Mulai!"}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="bg-black/20 rounded-xl p-6 text-left space-y-4">
          <h3 className="font-semibold flex items-center gap-2 text-blue-100">
            <ShieldAlert className="w-5 h-5" />
            Peraturan Ujian:
          </h3>
          <ul className="space-y-2 text-sm md:text-base text-blue-50 list-disc list-inside">
            <li>Dilarang membuka tab atau aplikasi lain (Sistem akan mendeteksi).</li>
            <li>Waktu akan terus berjalan meskipun Anda merefresh halaman.</li>
            <li>Setiap jawaban akan tersimpan secara otomatis.</li>
            <li>Jika waktu habis, ujian akan disubmit secara otomatis.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
