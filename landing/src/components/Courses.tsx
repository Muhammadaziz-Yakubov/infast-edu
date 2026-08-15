'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Layout,
  Server,
  Smartphone,
  Layers,
  Monitor,
  BrainCircuit,
  Clock,
  BarChart3,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { COURSES, Course } from '@/data/academyData';
import { SectionHeader } from './SectionHeader';

interface CoursesProps {
  onSelectCourse: (course: Course) => void;
  onEnrollCourse: (courseName: string) => void;
}

const getCourseIcon = (iconName: string) => {
  switch (iconName) {
    case 'Layout':
      return <Layout className="w-6 h-6 text-[#FF6A00]" />;
    case 'Server':
      return <Server className="w-6 h-6 text-[#FF6A00]" />;
    case 'Smartphone':
      return <Smartphone className="w-6 h-6 text-[#FF6A00]" />;
    case 'Layers':
      return <Layers className="w-6 h-6 text-[#FF6A00]" />;
    case 'Monitor':
      return <Monitor className="w-6 h-6 text-[#FF6A00]" />;
    case 'BrainCircuit':
      return <BrainCircuit className="w-6 h-6 text-[#FF6A00]" />;
    default:
      return <Layout className="w-6 h-6 text-[#FF6A00]" />;
  }
};

export const Courses: React.FC<CoursesProps> = ({ onSelectCourse, onEnrollCourse }) => {
  return (
    <section id="courses" className="py-28 relative overflow-hidden bg-black text-white">
      {/* Apple Subtle Glow Background */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-[#FF6A00]/10 blur-[180px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="Akademiya Dasturlari"
          title="Kelajagingiz uchun mos yo‘nalishni tanlang."
          description="Barcha yo'nalishlar noldan tajribali mutaxassis darajasigacha 100% amaliyotga asoslangan holda o'rgatiladi."
        />

        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {COURSES.map((course: Course, index: number) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative flex flex-col justify-between p-8 rounded-[32px] bg-zinc-950/80 border border-white/[0.12] hover:border-[#FF6A00]/50 transition-all duration-500 hover:-translate-y-2 shadow-2xl backdrop-blur-3xl"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-6">
                  <div className="p-3.5 rounded-2xl bg-white/[0.05] border border-white/[0.1] group-hover:border-[#FF6A00]/50 group-hover:bg-[#FF6A00]/10 transition-colors">
                    {getCourseIcon(course.iconName)}
                  </div>
                  {course.popular ? (
                    <span className="inline-flex items-center gap-1 px-3.5 py-1 rounded-full text-xs font-bold bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/40">
                      <Sparkles className="w-3 h-3" />
                      {course.tag}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[#86868B] bg-white/[0.05] border border-white/[0.1] px-3 py-1 rounded-full">
                      {course.tag}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-extrabold text-white group-hover:text-[#FF6A00] transition-colors">
                  {course.name}
                </h3>

                <p className="mt-3 text-sm text-[#86868B] leading-relaxed line-clamp-2 font-normal">
                  {course.description}
                </p>

                {/* Topics Pills */}
                <div className="mt-6 flex flex-wrap gap-2">
                  {course.topics.slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="text-[11px] font-medium text-zinc-300 bg-white/[0.05] border border-white/[0.08] px-3 py-1 rounded-xl"
                    >
                      {topic}
                    </span>
                  ))}
                  {course.topics.length > 4 && (
                    <span className="text-[11px] font-bold text-[#FF6A00] bg-[#FF6A00]/10 px-2.5 py-1 rounded-xl">
                      +{course.topics.length - 4}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom Meta & CTAs */}
              <div className="mt-8 pt-6 border-t border-white/[0.08]">
                <div className="flex items-center justify-between text-xs text-[#86868B] mb-6">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <BarChart3 className="w-4 h-4 text-zinc-500" />
                    <span>{course.difficulty}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => onSelectCourse(course)}
                    className="w-full py-3 px-4 text-xs font-bold text-zinc-300 hover:text-white bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.12] rounded-full transition-all cursor-pointer"
                  >
                    Batafsil
                  </button>
                  <button
                    onClick={() => onEnrollCourse(course.name)}
                    className="w-full py-3 px-4 text-xs font-bold text-white bg-[#FF6A00] hover:bg-[#E05D00] rounded-full transition-all duration-300 shadow-lg shadow-[#FF6A00]/25 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Yozilish</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
