import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, PhoneCall } from 'lucide-react';
import { CONTACT_INFO } from './academyData';

interface FinalCTAProps {
  onOpenEnroll: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenEnroll }) => {
  return (
    <section className="py-32 relative overflow-hidden bg-black text-white">
      {/* High-intensity Ambient Orange Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-[#FF6A00]/15 blur-[220px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="p-12 sm:p-20 rounded-[40px] bg-zinc-950/90 border border-white/[0.15] shadow-2xl backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FF6A00]/20 border border-[#FF6A00]/40 text-[#FF6A00] text-xs font-extrabold uppercase tracking-widest mb-8">
            <Sparkles className="w-4 h-4" />
            Birinchi Qadam
          </div>

          <h2 className="text-5xl sm:text-7xl font-black text-white tracking-tight leading-[1.05] mb-8">
            Kelajakni kutmang. <br />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-[#FF6A00] bg-clip-text text-transparent">
              Uni o‘zingiz quring.
            </span>
          </h2>

          <p className="text-xl text-[#86868B] font-normal max-w-2xl mx-auto leading-relaxed mb-12 tracking-tight">
            InFast IT-Academy bilan IT yo‘lingizni bugun boshlang. Amaliy darslar va professional mentorlar ko'magida orzuingizdagi kasbga erishing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
            <button
              onClick={onOpenEnroll}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-5 text-lg font-bold text-white bg-[#FF6A00] hover:bg-[#E05D00] rounded-full shadow-2xl shadow-[#FF6A00]/40 hover:shadow-[#FF6A00]/60 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <span>Kursga yozilish</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <a
              href={`tel:${CONTACT_INFO.phone}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-5 text-base font-bold text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] rounded-full transition-all duration-300 cursor-pointer backdrop-blur-2xl"
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
