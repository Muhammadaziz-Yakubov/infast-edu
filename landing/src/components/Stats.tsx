'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ACADEMY_STATS, Statistic } from '@/data/academyData';

interface CounterProps {
  value: number;
  suffix: string;
}

const AnimatedCounter: React.FC<CounterProps> = ({ value, suffix }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const end = value;
    const duration = 1500; // ms
    const incrementTime = 30; // ms
    const steps = duration / incrementTime;
    const stepValue = (end - start) / steps;

    const timer = setInterval(() => {
      start += stepValue;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref} className="text-5xl sm:text-6xl lg:text-7xl font-black text-white tracking-tighter">
      {count}
      <span className="text-[#FF6A00]">{suffix}</span>
    </span>
  );
};

export const Stats: React.FC = () => {
  return (
    <section className="py-20 md:py-28 bg-black border-y border-white/[0.08] relative overflow-hidden text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-widest text-[#FF6A00] mb-3">
            Raqamlar va Ishonch
          </p>
          <h3 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Biz bilan kelajagini qurayotganlar
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {ACADEMY_STATS.map((stat: Statistic, index: number) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center p-8 rounded-[32px] bg-zinc-950/80 border border-white/[0.12] backdrop-blur-3xl hover:border-[#FF6A00]/40 transition-all duration-500 shadow-2xl"
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <span className="mt-4 text-lg font-extrabold text-white">
                {stat.label}
              </span>
              <p className="mt-2 text-xs sm:text-sm text-[#86868B] font-normal leading-relaxed max-w-[220px]">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
