'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Terminal, Code2, CheckCircle2, Zap, Users, Sparkles, BookOpen } from 'lucide-react';

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
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-grid-pattern">
      {/* Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#FF6A00]/15 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-orange-600/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900/80 border border-[#FF6A00]/30 text-xs font-semibold text-zinc-300 shadow-xl mb-6 backdrop-blur-md"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF6A00] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF6A00]"></span>
            </span>
            <span className="text-zinc-200">Zamonaviy IT ta'lim maskani</span>
            <span className="text-zinc-600">|</span>
            <span className="text-[#FF6A00] font-bold">Qabul ochiq 2026</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6"
          >
            Kelajakdagi kasbingni <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-white via-orange-100 to-[#FF6A00] bg-clip-text text-transparent">
              bugundan boshla.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg sm:text-xl text-zinc-400 font-normal max-w-2xl leading-relaxed mb-8"
          >
            InFast IT-Academy — zamonaviy IT kasblarini real amaliyot va tajribali mentorlar ko'magi orqali o‘rgatadigan zamonaviy akademiya.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          >
            <button
              onClick={() => scrollToSection('#courses')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-semibold text-white bg-[#FF6A00] hover:bg-[#E05D00] rounded-full shadow-xl shadow-[#FF6A00]/25 hover:shadow-[#FF6A00]/40 transition-all duration-300 active:scale-[0.98] cursor-pointer"
            >
              <span>Kurslarni ko‘rish</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => scrollToSection('#academy')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold text-zinc-300 hover:text-white bg-zinc-900/80 hover:bg-zinc-800/90 border border-white/10 rounded-full transition-all duration-200 cursor-pointer backdrop-blur-md"
            >
              <span>Akademiya haqida</span>
            </button>
          </motion.div>

          {/* Quick bullet perks */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-10 flex flex-wrap justify-center items-center gap-6 text-xs sm:text-sm text-zinc-400"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
              <span>Real amaliy loyihalar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
              <span>Ekspert mentorlar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#FF6A00]" />
              <span>Ishga tayyor portfolio</span>
            </div>
          </motion.div>
        </div>

        {/* Hero Visual Composition Frame */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-14 relative max-w-5xl mx-auto"
        >
          {/* Glass window container */}
          <div className="relative rounded-2xl bg-zinc-950/90 border border-white/10 shadow-2xl overflow-hidden backdrop-blur-2xl group">
            {/* Top Editor Bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/90 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-xs font-mono text-zinc-400 hidden sm:inline-block">
                  infast-academy-workspace.tsx — InFast OS
                </span>
              </div>

              {/* Interactive Editor Tabs */}
              <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-white/5 text-xs font-medium">
                <button
                  onClick={() => setActiveTab('code')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                    activeTab === 'code'
                      ? 'bg-[#FF6A00]/20 text-[#FF6A00]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Kod Muhiti</span>
                </button>
                <button
                  onClick={() => setActiveTab('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                    activeTab === 'preview'
                      ? 'bg-[#FF6A00]/20 text-[#FF6A00]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Natija</span>
                </button>
                <button
                  onClick={() => setActiveTab('curriculum')}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-colors ${
                    activeTab === 'curriculum'
                      ? 'bg-[#FF6A00]/20 text-[#FF6A00]'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Dars Jadvali</span>
                </button>
              </div>
            </div>

            {/* Window Content */}
            <div className="p-6 font-mono text-sm min-h-[340px] flex flex-col justify-between">
              {activeTab === 'code' && (
                <div className="space-y-2 text-zinc-300">
                  <div className="flex gap-4">
                    <span className="text-zinc-600 select-none">1</span>
                    <span>
                      <span className="text-purple-400">import</span> {'{'} Student, Course {'}'}{' '}
                      <span className="text-purple-400">from</span>{' '}
                      <span className="text-amber-300">'@infast/academy'</span>;
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <span className="text-zinc-600 select-none">2</span>
                    <span>
                      <span className="text-purple-400">const</span>{' '}
                      <span className="text-blue-400">student</span> ={' '}
                      <span className="text-purple-400">new</span>{' '}
                      <span className="text-yellow-300">Student</span>({'{'}
                    </span>
                  </div>
                  <div className="flex gap-4 pl-4">
                    <span className="text-zinc-600 select-none">3</span>
                    <span>
                      name: <span className="text-amber-300">'Kelajak Dasturchisi'</span>,
                    </span>
                  </div>
                  <div className="flex gap-4 pl-4">
                    <span className="text-zinc-600 select-none">4</span>
                    <span>
                      academy: <span className="text-amber-300">'InFast IT-Academy'</span>,
                    </span>
                  </div>
                  <div className="flex gap-4 pl-4">
                    <span className="text-zinc-600 select-none">5</span>
                    <span>
                      direction: <span className="text-amber-300">'Full-Stack Development'</span>,
                    </span>
                  </div>
                  <div className="flex gap-4 pl-4">
                    <span className="text-zinc-600 select-none">6</span>
                    <span>
                      status: <span className="text-[#FF6A00] font-bold">'Real Amaliyotda'</span>,
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
                      <span className="text-green-400">buildFuture</span>();{' '}
                      <span className="text-zinc-500">// Result: 100% Guaranteed Success</span>
                    </span>
                  </div>
                </div>
              )}

              {activeTab === 'preview' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-emerald-500/20 text-emerald-400 font-mono text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>[InFast OS]: Build succeeded! Live production ready app deployed.</span>
                    </div>
                    <span className="text-zinc-500">24ms</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                      <div className="text-xs text-zinc-400">O'zlashtirish</div>
                      <div className="text-2xl font-bold text-white mt-1">98.4%</div>
                      <div className="text-xs text-emerald-400 mt-1">▲ Exceeding target</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                      <div className="text-xs text-zinc-400">Tayyor Loyihalar</div>
                      <div className="text-2xl font-bold text-[#FF6A00] mt-1">6 Loyiha</div>
                      <div className="text-xs text-zinc-400 mt-1">GitHub & Vercel live</div>
                    </div>
                    <div className="p-4 rounded-xl bg-zinc-900/60 border border-white/10">
                      <div className="text-xs text-zinc-400">Mentor Feedback</div>
                      <div className="text-2xl font-bold text-emerald-400 mt-1">A+ Grade</div>
                      <div className="text-xs text-zinc-400 mt-1">5/5 Star rating</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'curriculum' && (
                <div className="space-y-3 font-sans">
                  <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Sprint rejasi va bosqichlar:
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-white/5">
                    <span className="text-sm font-medium text-white">01. Web Asoslari & Modern Layouts</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">O'zlashtirildi</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-white/5">
                    <span className="text-sm font-medium text-white">02. JavaScript ES6+ & TypeScript Deep Dive</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FF6A00]/10 text-[#FF6A00] border border-[#FF6A00]/20">Amalda</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-white/5 opacity-70">
                    <span className="text-sm font-medium text-zinc-300">03. React, Next.js & Full-Stack Apps</span>
                    <span className="text-[#FF6A00] text-xs font-medium">Navbatda</span>
                  </div>
                </div>
              )}

              {/* Bottom status bar */}
              <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-sans text-zinc-400">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-[#FF6A00]" />
                    Amaliy darslar formati
                  </span>
                  <span className="flex items-center gap-1.5 hidden sm:inline-flex">
                    <Users className="w-4 h-4 text-emerald-400" />
                    Kichik va ixcham guruhlar
                  </span>
                </div>
                <button
                  onClick={onOpenEnroll}
                  className="text-[#FF6A00] hover:text-orange-400 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  Guruhga qo'shilish →
                </button>
              </div>
            </div>
          </div>

          {/* Floating Accent Badge 1 */}
          <div className="absolute -bottom-6 -left-6 hidden lg:flex items-center gap-3 p-4 rounded-xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="w-10 h-10 rounded-lg bg-[#FF6A00]/20 flex items-center justify-center text-[#FF6A00]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">100% Amaliyot</div>
              <div className="text-xs text-zinc-400">Har bir darsda kod yozish</div>
            </div>
          </div>

          {/* Floating Accent Badge 2 */}
          <div className="absolute -top-6 -right-6 hidden lg:flex items-center gap-3 p-4 rounded-xl bg-zinc-900/90 border border-white/10 shadow-2xl backdrop-blur-xl">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">Sertifikat & Portfolio</div>
              <div className="text-xs text-zinc-400">Xalqaro standartlar</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
