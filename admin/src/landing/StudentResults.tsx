import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { STUDENT_RESULTS } from './academyData';
import { ExternalLink, Award, CheckCircle, Flame } from 'lucide-react';
import { GithubIcon } from './Icons';

export const StudentResults: React.FC = () => {
  return (
    <section id="results" className="py-28 relative overflow-hidden bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="Bitiruvchilar Natijalari"
          title="Natija — eng muhim ko‘rsatkich."
          description="InFast IT-Academy talabalari ta'lim jarayonida tayyorlaydigan real loyihalar va portfolio namunalari."
        />

        {/* Bento Grid Showcase */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          {STUDENT_RESULTS.map((res, index) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="group relative p-8 rounded-[32px] bg-zinc-950/80 border border-white/[0.12] hover:border-[#FF6A00]/40 transition-all duration-500 backdrop-blur-3xl flex flex-col justify-between hover:-translate-y-2 shadow-2xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-6">
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-white/[0.06] text-white border border-white/[0.1]">
                    {res.projectCategory}
                  </span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {res.metrics}
                  </span>
                </div>

                <h3 className="text-2xl font-extrabold text-white group-hover:text-[#FF6A00] transition-colors mb-3">
                  {res.projectTitle}
                </h3>

                <p className="text-sm text-[#86868B] font-normal leading-relaxed mb-6 tracking-tight">
                  {res.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {res.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono text-zinc-300 bg-white/[0.05] border border-white/[0.08] px-3 py-1 rounded-xl"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between">
                <div>
                  <div className="text-xs text-[#86868B]">Muallif:</div>
                  <div className="text-sm font-bold text-white mt-0.5">{res.studentName}</div>
                  <div className="text-[11px] font-semibold text-[#FF6A00]">{res.course}</div>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="p-2.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-zinc-400 group-hover:text-white transition-colors">
                    <GithubIcon className="w-4 h-4" />
                  </span>
                  <span className="p-2.5 rounded-xl bg-[#FF6A00]/20 border border-[#FF6A00]/40 text-[#FF6A00] group-hover:bg-[#FF6A00] group-hover:text-white transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlighted Banner */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mt-12 p-8 sm:p-10 rounded-[32px] bg-zinc-950/90 border border-[#FF6A00]/30 backdrop-blur-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
        >
          <div className="flex items-center gap-5">
            <div className="p-4 rounded-2xl bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/30">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-2xl font-extrabold text-white">Xalqaro darajadagi Sertifikat</h4>
              <p className="text-sm text-[#86868B] mt-1">
                Kursni muvaffaqiyatli yakunlagan bitiruvchilarga nufuzli InFast IT-Academy sertifikati taqdim etiladi.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6A00] text-white font-bold text-sm shadow-xl shadow-[#FF6A00]/25 whitespace-nowrap">
            <Flame className="w-4 h-4" />
            90%+ Bitiruvchilar Ishga Joylashadi
          </div>
        </motion.div>
      </div>
    </section>
  );
};
