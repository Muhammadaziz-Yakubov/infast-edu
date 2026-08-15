import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ACADEMY_STATS } from './academyData';
import type { Statistic } from './academyData';

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
    <span ref={ref} className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight">
      {count}
      <span className="text-[#FF6A00]">{suffix}</span>
    </span>
  );
};

export const Stats: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-zinc-950/80 border-y border-white/5 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-radial-gradient opacity-50 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-12">
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#FF6A00] mb-2">
            Natijalar va ishonch
          </p>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-200">
            Biz bilan kelajagini qurayotganlar
          </h3>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          {ACADEMY_STATS.map((stat: Statistic, index: number) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-900/40 border border-white/5 backdrop-blur-md hover:border-[#FF6A00]/30 transition-colors"
            >
              <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              <span className="mt-3 text-base sm:text-lg font-bold text-zinc-200">
                {stat.label}
              </span>
              <p className="mt-1 text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed max-w-[200px]">
                {stat.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
