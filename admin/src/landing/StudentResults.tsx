import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { STUDENT_RESULTS } from './academyData';
import { ExternalLink, Award, CheckCircle, Flame } from 'lucide-react';
import { GithubIcon } from './Icons';

export const StudentResults: React.FC = () => {
  return (
    <section id="results" className="py-24 relative overflow-hidden bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="Bitiruvchilar Natijalari"
          title="Natija — biz uchun eng muhim ko‘rsatkich."
          description="InFast IT-Academy talabalari o'qish jarayonida tayyorlaydigan real loyihalar va portfolio namunalari."
        />

        {/* Bento Grid Showcase */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          {STUDENT_RESULTS.map((res, index) => (
            <motion.div
              key={res.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`group relative p-7 rounded-3xl bg-gradient-to-b ${res.imageBg} bg-zinc-950/90 border border-white/10 hover:border-[#FF6A00]/40 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-1.5 shadow-2xl`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/10">
                    {res.projectCategory}
                  </span>
                  <span className="text-xs font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {res.metrics}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white group-hover:text-[#FF6A00] transition-colors mb-2">
                  {res.projectTitle}
                </h3>

                <p className="text-sm text-zinc-300 font-normal leading-relaxed mb-6">
                  {res.description}
                </p>

                <div className="flex flex-wrap gap-1.5 mb-6">
                  {res.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-mono text-zinc-300 bg-zinc-900/80 border border-white/10 px-2.5 py-1 rounded-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-xs text-zinc-400">Muallif:</div>
                  <div className="text-sm font-bold text-white">{res.studentName}</div>
                  <div className="text-[11px] text-[#FF6A00]">{res.course}</div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-zinc-900 border border-white/10 text-zinc-400 group-hover:text-white transition-colors">
                    <GithubIcon className="w-4 h-4" />
                  </span>
                  <span className="p-2 rounded-xl bg-[#FF6A00]/20 border border-[#FF6A00]/40 text-[#FF6A00] group-hover:bg-[#FF6A00] group-hover:text-white transition-all">
                    <ExternalLink className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Highlighted Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 p-8 rounded-3xl bg-zinc-950/90 border border-[#FF6A00]/30 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/30">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Xalqaro darajadagi Sertifikat</h4>
              <p className="text-sm text-zinc-400">
                Kursni muvaffaqiyatli yakunlagan bitiruvchilarga nufuzli InFast IT-Academy sertifikati taqdim etiladi.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FF6A00] text-white font-semibold text-sm shadow-lg shadow-[#FF6A00]/20 whitespace-nowrap">
            <Flame className="w-4 h-4" />
            90%+ Bitiruvchilar ishga joylashadi
          </div>
        </motion.div>
      </div>
    </section>
  );
};
