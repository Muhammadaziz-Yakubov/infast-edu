import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code2, Terminal, BookOpen, Sparkles, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onOpenEnroll: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenEnroll }) => {
  const [activeTab, setActiveTab] = useState<'code' | 'preview' | 'curriculum'>('code');

  const scrollToSection = (id: string) => {
    const el = document.querySelector(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.pageYOffset - 90;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-32 pb-24 md:pt-44 md:pb-32 overflow-hidden bg-black text-white selection:bg-[#FF6A00] selection:text-white">
      {/* Apple Subtle Radial Ambient Light */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-[#FF6A00]/20 via-[#FF6A00]/5 to-transparent blur-[160px] pointer-events-none rounded-full" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Apple-style floating pill badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.12] text-xs font-semibold text-zinc-300 shadow-2xl backdrop-blur-2xl mb-8"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6A00]"></span>
            </span>
            <span className="tracking-wide text-zinc-200">InFast OS 2026</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#FF6A00] font-bold tracking-wider uppercase">Qabul Ochiq</span>
          </motion.div>

          {/* Apple Grand Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.05] mb-8"
          >
            Dasturlash. <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-white via-zinc-200 to-[#FF6A00] bg-clip-text text-transparent">
              Yangi darajada.
            </span>
          </motion.h1>

          {/* Subtitle in Apple's signature silver text */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg sm:text-2xl text-[#86868B] font-normal max-w-2xl leading-relaxed mb-10 tracking-tight"
          >
            InFast IT-Academy — zamonaviy IT kasblarini real amaliyot va tajribali mentorlar ko‘magida o‘rgatuvchi muassasa.
          </motion.p>

          {/* Apple Pill Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={onOpenEnroll}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-9 py-4 text-base font-bold text-white bg-[#FF6A00] hover:bg-[#E05D00] rounded-full shadow-2xl shadow-[#FF6A00]/30 hover:shadow-[#FF6A00]/50 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <span>Kursga yozilish</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => scrollToSection('#courses')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-zinc-200 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] rounded-full transition-all duration-300 cursor-pointer backdrop-blur-2xl"
            >
              <span>Dasturlarni ko‘rish</span>
            </button>
          </motion.div>

          {/* Apple Minimal Perk Badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex flex-wrap justify-center items-center gap-8 text-xs sm:text-sm text-[#86868B] font-medium"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
              <span>100% Amaliy Darslar</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#FF6A00]" />
              <span>Xalqaro Sertifikat</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#FF6A00]" />
              <span>Tayyor Portfolio</span>
            </div>
          </motion.div>
        </div>

        {/* Apple Style Glass Product Card Container */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mt-16 relative max-w-5xl mx-auto"
        >
          <div className="relative rounded-[32px] bg-zinc-950/90 border border-white/[0.12] shadow-2xl overflow-hidden backdrop-blur-3xl p-1">
            {/* Top Editor Bar */}
            <div className="flex items-center justify-between px-6 py-4 bg-zinc-900/80 rounded-t-[28px] border-b border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F56]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]" />
                <div className="w-3.5 h-3.5 rounded-full bg-[#27C93F]" />
                <span className="ml-4 text-xs font-mono text-zinc-400 hidden sm:inline-block">
                  infast-academy-environment.tsx — InFast OS
                </span>
              </div>

              {/* Editor Tabs */}
              <div className="flex items-center bg-black/60 p-1 rounded-xl border border-white/10 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === 'code'
                      ? 'bg-[#FF6A00] text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Kod Muhiti</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === 'preview'
                      ? 'bg-[#FF6A00] text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Natija</span>
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg transition-all ${
                    activeTab === 'curriculum'
                      ? 'bg-[#FF6A00] text-white font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Jadval</span>
                </button>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="p-8 font-mono text-sm min-h-[350px] flex flex-col justify-between bg-black/40">
              {activeTab === 'code' && (
                <div className="space-y-2.5 text-zinc-300 leading-relaxed">
                  <div className="flex gap-4">
                    <span className="text-zinc-600 select-none">1</span>
                    <span>
                      <span className="text-orange-400 font-bold">import</span> {'{'} Student, InFastAcademy {'}'}{' '}
                      <span className="text-orange-400 font-bold">from</span>{' '}
                      <span className="text-amber-300">'@infast/academy'</span>;
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-600 select-none">2</span>
                    <span>
                      <span className="text-purple-400 font-bold">const</span>{' '}
                      <span className="text-blue-400">student</span> ={' '}
                      <span className="text-purple-400 font-bold">new</span>{' '}
                      <span className="text-yellow-300">Student</span>({'{'}
                    </span>
                  </div>
                  <div className="flex gap-4 pl-6">
                    <span className="text-zinc-600 select-none">3</span>
                    <span>
                      name: <span className="text-amber-300">'Kelajak Dasturchisi'</span>,
                    </span>
                  </div>
                  <div className="flex gap-4 pl-6">
                    <span className="text-zinc-600 select-none">4</span>
                    <span>
                      academy: <span className="text-amber-300">'InFast IT-Academy'</span>,
                    </span>
                  </div>
                  <div className="flex gap-4 pl-6">
                    <span className="text-zinc-600 select-none">5</span>
                    <span>
                      mentor: <span className="text-amber-300">'Muhammadaziz Yakubov'</span>,
                    </span>
                  </div>
                  <div className="flex gap-4 pl-6">
                    <span className="text-zinc-600 select-none">6</span>
                    <span>
                      status: <span className="text-[#FF6A00] font-bold">'100% Amaliy Darsda'</span>,
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-600 select-none">7</span>
                    <span>{'}'});</span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-600 select-none">8</span>
                    <span>
                      <span className="text-blue-400">student</span>.
                      <span className="text-emerald-400 font-bold">buildCareer</span>();{' '}
                      <span className="text-zinc-500">// Result: Guaranteed Tech Job</span>
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-4 font-sans">
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>[InFast OS System]: Live production workspace initialized cleanly.</span>
                    </div>
                    <span className="text-zinc-500">18ms</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
                      <div className="text-xs text-zinc-400">O'zlashtirish Darajasi</div>
                      <div className="text-3xl font-extrabold text-white mt-1">98.4%</div>
                      <div className="text-xs text-emerald-400 mt-1">▲ Yuqori natija</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
                      <div className="text-xs text-zinc-400">Tayyor Loyihalar</div>
                      <div className="text-3xl font-extrabold text-[#FF6A00] mt-1">6 Loyiha</div>
                      <div className="text-xs text-zinc-400 mt-1">GitHub & Vercel live</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-zinc-900/60 border border-white/10">
                      <div className="text-xs text-zinc-400">Mentorlik Bahosi</div>
                      <div className="text-3xl font-extrabold text-emerald-400 mt-1">5.0 / 5</div>
                      <div className="text-xs text-zinc-400 mt-1">100% Amaliy ko'mak</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-3 font-sans">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    O'quv bosqichlari ketma-ketligi:
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-white/5">
                    <span className="text-sm font-medium text-white">01. HTML5, CSS3, Modern Layouts & UI/UX</span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Muvaffaqiyatli</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-white/5">
                    <span className="text-sm font-medium text-white">02. JavaScript ES6+, TypeScript & Algorithms</span>
                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20">Amalda</span>
                  </div>
                  <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-900 border border-white/5 opacity-60">
                    <span className="text-sm font-medium text-zinc-300">03. React, Next.js & Full-Stack Projects</span>
                    <span className="text-[#FF6A00] text-xs font-medium">Keyingi bosqich</span>
                  </div>
                </div>
              )}

              {/* Bottom Status Line */}
              <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-zinc-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#FF6A00]" />
                    Faqat Amaliy Darslar
                  </span>
                </div>
                <button
                  onClick={onOpenEnroll}
                  className="text-[#FF6A00] hover:text-orange-400 font-bold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Kursga yozilish →
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
