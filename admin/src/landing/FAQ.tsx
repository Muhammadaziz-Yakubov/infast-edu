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
    <section id="faq" className="py-24 bg-zinc-950/60 border-y border-white/5 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="Savol-Javoblar"
          title="Tez-tez beriladigan savollar"
          description="Sizda paydo bo'lishi mumkin bo'lgan barcha savollarga aniq va ochiq javoblar."
        />

        <div className="mt-16 space-y-4">
          {FAQ_ITEMS.map((item: FAQItem) => {
            const isOpen = openId === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-2xl bg-zinc-900/40 border border-white/10 overflow-hidden backdrop-blur-xl transition-colors hover:border-white/20"
              >
                <button
                  onClick={() => toggleFAQ(item.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className="text-lg font-bold text-white flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-[#FF6A00] flex-shrink-0" />
                    {item.question}
                  </span>
                  <div
                    className={`p-2 rounded-full bg-white/5 border border-white/10 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 bg-[#FF6A00]/20 text-[#FF6A00]' : 'text-zinc-400'
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
                      <div className="px-6 pb-6 pt-2 text-base text-zinc-300 font-normal leading-relaxed border-t border-white/5">
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
