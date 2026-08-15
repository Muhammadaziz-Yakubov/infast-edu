import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { LEARNING_STEPS } from './academyData';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const LearningProcess: React.FC = () => {
  return (
    <section className="py-24 bg-zinc-950/80 border-y border-white/5 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-[#FF6A00]/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="O'quv Bosqichlari"
          title="Noldan natijagacha bo'lgan yo'ling"
          description="InFast IT-Academy'da o'quv jarayoni har bir talaba uchun aniq va tizimli ketma-ketlikda tashkil etiladi."
        />

        {/* 6-Step Timeline Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {LEARNING_STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="relative p-7 rounded-3xl bg-zinc-900/40 border border-white/10 hover:border-[#FF6A00]/40 transition-all duration-300 backdrop-blur-xl group hover:bg-zinc-900/70 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-black text-[#FF6A00] bg-[#FF6A00]/10 border border-[#FF6A00]/20 px-3.5 py-1 rounded-xl">
                    {step.step}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">Bosqich {index + 1}/6</span>
                </div>

                <h3 className="text-xl font-bold text-white mb-1.5 group-hover:text-[#FF6A00] transition-colors">
                  {step.title}
                </h3>

                <h4 className="text-xs font-semibold text-[#FF6A00] uppercase tracking-wider mb-3">
                  {step.subtitle}
                </h4>

                <p className="text-sm text-zinc-400 font-normal leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FF6A00]" />
                  Bosqich talabi
                </span>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#FF6A00] group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
