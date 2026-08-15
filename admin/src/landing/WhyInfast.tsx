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
    <section id="academy" className="py-28 bg-black border-y border-white/[0.08] relative overflow-hidden text-white">
      {/* Apple Glow */}
      <div className="absolute top-1/3 left-0 w-[600px] h-[600px] bg-[#FF6A00]/5 blur-[200px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="InFast Standartlari"
          title="Nima uchun aynan InFast IT-Academy?"
          description="Biz shunchaki nazariya o'rgatmaymiz — har bir talabamizni IT industriyaning eng yuqori talablariga mos mutaxassis qilib tayyorlaymiz."
        />

        {/* Apple Bento Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          {WHY_INFAST_FEATURES.map((feature, index) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative p-10 sm:p-12 rounded-[36px] bg-zinc-950/80 border border-white/[0.12] hover:border-[#FF6A00]/40 transition-all duration-500 backdrop-blur-3xl group hover:bg-zinc-900/60 shadow-2xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-6xl sm:text-7xl font-black tracking-tight text-white/10 group-hover:text-[#FF6A00]/40 transition-colors duration-500">
                    {feature.number}
                  </span>
                  <div className="p-4 rounded-2xl bg-white/[0.05] border border-white/[0.1] group-hover:border-[#FF6A00]/40 transition-colors">
                    {icons[index]}
                  </div>
                </div>

                <h3 className="text-3xl font-extrabold text-white mb-4 group-hover:text-[#FF6A00] transition-colors">
                  {feature.title}
                </h3>

                <p className="text-base text-[#86868B] font-normal leading-relaxed mb-8 tracking-tight">
                  {feature.description}
                </p>
              </div>

              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold text-[#FF6A00] bg-[#FF6A00]/15 border border-[#FF6A00]/30 px-4 py-2 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-pulse" />
                  {feature.highlight}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
