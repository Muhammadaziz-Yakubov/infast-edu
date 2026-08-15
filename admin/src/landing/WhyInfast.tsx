import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { WHY_INFAST_FEATURES } from './academyData';
import { Code, Briefcase, UserCheck, Cpu } from 'lucide-react';

const icons = [
  <Code key="0" className="w-8 h-8 text-[#FF6A00]" />,
  <Briefcase key="1" className="w-8 h-8 text-[#FF6A00]" />,
  <UserCheck key="2" className="w-8 h-8 text-[#FF6A00]" />,
  <Cpu key="3" className="w-8 h-8 text-[#FF6A00]" />,
];

export const WhyInfast: React.FC = () => {
  return (
    <section id="academy" className="py-24 bg-zinc-950/60 border-y border-white/5 relative overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-1/3 left-0 w-[500px] h-[500px] bg-[#FF6A00]/5 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="Farqimiz nimada?"
          title="Oddiy kurs emas. Haqiqiy tajriba."
          description="InFast IT-Academy'da bilim berish faqat dars o'tish bilan cheklanmaydi — biz talabalarni haqiqiy IT industriyaga tayyorlaymiz."
        />

        {/* Editorial Feature Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12">
          {WHY_INFAST_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative p-8 sm:p-10 rounded-3xl bg-zinc-900/40 border border-white/10 hover:border-[#FF6A00]/40 transition-all duration-300 backdrop-blur-xl group hover:bg-zinc-900/70"
            >
              <div className="flex items-start justify-between mb-8">
                <span className="text-5xl sm:text-6xl font-black tracking-tight text-white/20 group-hover:text-[#FF6A00] transition-colors duration-300">
                  {feature.number}
                </span>
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 group-hover:border-[#FF6A00]/50 transition-colors">
                  {icons[index]}
                </div>
              </div>

              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-[#FF6A00] transition-colors">
                {feature.title}
              </h3>

              <p className="text-base text-zinc-400 font-normal leading-relaxed mb-6">
                {feature.description}
              </p>

              <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF6A00] bg-[#FF6A00]/10 border border-[#FF6A00]/20 px-3.5 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />
                {feature.highlight}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
