'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { MENTORS, Mentor } from '@/data/academyData';
import { Send, Sparkles, Award, CheckCircle } from 'lucide-react';
import { GithubIcon, LinkedinIcon } from './Icons';

export const Mentors: React.FC = () => {
  const mentor: Mentor = MENTORS[0];

  return (
    <section id="mentors" className="py-24 bg-zinc-950/80 border-y border-white/5 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#FF6A00]/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="Akademiya Asoschisi & Bosh Mentor"
          title="Ustozdan o‘rgan. Tajribadan foydalan."
          description="InFast IT-Academy'da barcha ta'lim dasturlari amaliy tajribaga ega bo'lgan asoschi va bosh mentor nazorati ostida olib boriladi."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mt-16 p-8 sm:p-12 rounded-3xl bg-zinc-900/50 border border-white/10 hover:border-[#FF6A00]/40 transition-all duration-300 backdrop-blur-2xl shadow-2xl relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Col: Founder Photo & Quick Stats */}
            <div className="lg:col-span-5 flex flex-col items-center text-center">
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-3xl overflow-hidden border-2 border-[#FF6A00]/40 p-1 bg-zinc-950 shadow-2xl group">
                <img
                  src={mentor.avatar}
                  alt={mentor.name}
                  className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center gap-1.5 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-[11px] font-bold text-[#FF6A00] border border-[#FF6A00]/30">
                  <Sparkles className="w-3.5 h-3.5" />
                  {mentor.experience}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                  <CheckCircle className="w-3.5 h-3.5" /> Verifikatsiyalangan Mentor
                </span>
              </div>
            </div>

            {/* Right Col: Detailed Bio & Tech Stack */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <span className="text-xs font-mono text-[#FF6A00] uppercase tracking-widest font-bold">
                  {mentor.company}
                </span>
                <h3 className="text-3xl font-extrabold text-white mt-1">
                  {mentor.name}
                </h3>
                <p className="text-sm font-medium text-zinc-400 mt-1">{mentor.role}</p>
              </div>

              <p className="text-base text-zinc-300 font-normal leading-relaxed">
                {mentor.bio}
              </p>

              {/* Key Highlights */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <div className="text-xs text-zinc-400">Mutaxassislik</div>
                  <div className="text-sm font-bold text-white mt-0.5">Full-Stack & Mobile</div>
                </div>
                <div className="p-3.5 rounded-2xl bg-zinc-950/80 border border-white/5">
                  <div className="text-xs text-zinc-400">Ekosistema</div>
                  <div className="text-sm font-bold text-[#FF6A00] mt-0.5">InFast OS Muallifi</div>
                </div>
              </div>

              {/* Skills tags */}
              <div>
                <div className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider mb-2.5">
                  Asosiy Texnologiyalar Steki:
                </div>
                <div className="flex flex-wrap gap-2">
                  {mentor.skills.map((skill) => (
                    <span
                      key={skill}
                      className="text-xs font-mono text-zinc-200 bg-zinc-950 border border-white/10 px-3 py-1.5 rounded-xl font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Social Links & Contact */}
              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-[#FF6A00]" />
                  InFast IT-Academy
                </span>

                <div className="flex items-center gap-3">
                  {mentor.social.github && (
                    <a
                      href={mentor.social.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
                      title="GitHub Profil"
                    >
                      <GithubIcon className="w-4 h-4" />
                    </a>
                  )}
                  {mentor.social.linkedin && (
                    <a
                      href={mentor.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-zinc-950 border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 transition-colors"
                      title="LinkedIn Profil"
                    >
                      <LinkedinIcon className="w-4 h-4" />
                    </a>
                  )}
                  {mentor.social.telegram && (
                    <a
                      href={mentor.social.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-zinc-950 border border-white/10 text-zinc-400 hover:text-[#FF6A00] hover:border-[#FF6A00]/40 transition-colors"
                      title="Telegram Aloqa"
                    >
                      <Send className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
