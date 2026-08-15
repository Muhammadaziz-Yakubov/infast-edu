'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { TESTIMONIALS, Testimonial } from '@/data/academyData';
import { Star, Quote } from 'lucide-react';

export const StudentStories: React.FC = () => {
  return (
    <section className="py-24 relative overflow-hidden bg-grid-pattern">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="O'quvchilar Fikri"
          title="Bitiruvchilarimiz InFast haqida"
          description="Biz erishgan eng katta yutuq — bu talabalarimizning muvaffaqiyati va ularning samimiy e'tirofidir."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((t: Testimonial, index: number) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-[#FF6A00]/40 transition-all duration-300 backdrop-blur-xl flex flex-col justify-between hover:-translate-y-1 shadow-xl"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#FF6A00] text-[#FF6A00]" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-zinc-700" />
                </div>

                <p className="text-sm text-zinc-300 italic font-normal leading-relaxed mb-6">
                  "{t.review}"
                </p>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#FF6A00]/20 border border-[#FF6A00]/40 flex items-center justify-center font-bold text-xs text-[#FF6A00]">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-zinc-400">
                    {t.role} • <span className="text-[#FF6A00]">{t.course}</span>
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
