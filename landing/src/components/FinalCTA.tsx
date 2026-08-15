'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, PhoneCall } from 'lucide-react';
import { CONTACT_INFO } from '@/data/academyData';

interface FinalCTAProps {
  onOpenEnroll: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenEnroll }) => {
  return (
    <section className="py-28 relative overflow-hidden bg-zinc-950">
      {/* High-intensity Ambient Orange Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#FF6A00]/20 blur-[180px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="p-10 sm:p-16 rounded-3xl bg-zinc-900/60 border border-[#FF6A00]/30 shadow-2xl backdrop-blur-2xl relative overflow-hidden"
        >
          {/* Subtle Corner Accents */}
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Sparkles className="w-32 h-32 text-[#FF6A00]" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6A00]/15 border border-[#FF6A00]/30 text-[#FF6A00] text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-4 h-4" />
            Birinchi Qadam
          </div>

          <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.15] mb-6">
            Kelajakni kutma. <br />
            <span className="bg-gradient-to-r from-white via-orange-100 to-[#FF6A00] bg-clip-text text-transparent">
              Uni o‘zing qur.
            </span>
          </h2>

          <p className="text-lg sm:text-xl text-zinc-300 font-normal max-w-2xl mx-auto leading-relaxed mb-10">
            InFast IT-Academy bilan IT yo‘lingni bugun boshlagin. Amaliy darslar va kuchli mentorlar ko'magida orzuingdagi kasbga erish.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onOpenEnroll}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 text-lg font-bold text-white bg-[#FF6A00] hover:bg-[#E05D00] rounded-full shadow-2xl shadow-[#FF6A00]/40 hover:shadow-[#FF6A00]/60 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <span>Kursga yozilish</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href={`tel:${CONTACT_INFO.phone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 text-base font-semibold text-zinc-200 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-colors cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#FF6A00]" />
              <span>{CONTACT_INFO.phoneFormatted}</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
