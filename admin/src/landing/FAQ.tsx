import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SectionHeader } from './SectionHeader';
import { FAQ_ITEMS } from './academyData';
import type { FAQItem } from './academyData';
import { ChevronDown, HelpCircle } from 'lucide-react';

export const FAQ: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-28 bg-black border-y border-white/[0.08] relative overflow-hidden text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="Savol-Javoblar"
          title="Tez-tez beriladigan savollar"
          description="Sizda paydo bo'lishi mumkin bo'lgan barcha savollarga aniq va shaffof javoblar."
        />

        <div className="mt-20 space-y-4">
          {FAQ_ITEMS.map((item: FAQItem) => {
            const isOpen = openId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="rounded-[24px] bg-zinc-950/80 border border-white/[0.12] overflow-hidden backdrop-blur-3xl transition-colors hover:border-white/[0.25]"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full p-7 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="text-xl font-bold text-white flex items-center gap-3.5">
                    <HelpCircle className="w-5 h-5 text-[#FF6A00] flex-shrink-0" />
                    {item.question}
                  </span>
                  <div
                    className={`p-2.5 rounded-full bg-white/[0.06] border border-white/[0.1] transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#FF6A00]/20 text-[#FF6A00] border-[#FF6A00]/40' : 'text-zinc-400'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-7 pb-7 pt-1 text-base text-[#86868B] font-normal leading-relaxed border-t border-white/[0.06] tracking-tight">
                        {item.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
