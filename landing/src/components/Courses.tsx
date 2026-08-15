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
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { COURSES, Course } from '@/data/academyData';
import { SectionHeader } from '@/components/ui/SectionHeader';

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
    <section id="courses" className="py-24 relative overflow-hidden">
      {/* Glow Orbs */}
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-[#FF6A00]/10 blur-[150px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <SectionHeader
          badge="Akademiya Yo'nalishlari"
          title="IT olamiga kirish uchun o‘zingga mos yo‘nalishni tanla."
          description="Har bir kurs bozor talabiga mos holda noldan tajribali mutaxassis darajasigacha ishlab chiqilgan."
        />

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {COURSES.map((course: Course, index: number) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative flex flex-col justify-between p-7 rounded-3xl bg-zinc-950/80 border border-white/10 hover:border-[#FF6A00]/40 transition-all duration-300 hover:-translate-y-2 shadow-xl hover:shadow-2xl hover:shadow-[#FF6A00]/10 backdrop-blur-xl"
            >
              {/* Card top banner/badge */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-5">
                  <div className="p-3 rounded-2xl bg-zinc-900 border border-white/10 group-hover:border-[#FF6A00]/50 group-hover:bg-[#FF6A00]/10 transition-colors">
                    {getCourseIcon(course.iconName)}
                  </div>
                  {course.popular && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6A00]/15 text-[#FF6A00] border border-[#FF6A00]/30">
                      <Sparkles className="w-3 h-3" />
                      {course.tag}
                    </span>
                  )}
                  {!course.popular && (
                    <span className="text-xs font-medium text-zinc-400 bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
                      {course.tag}
                    </span>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-[#FF6A00] transition-colors">
                  {course.name}
                </h3>

                <p className="mt-2.5 text-sm text-zinc-400 leading-relaxed line-clamp-2 font-normal">
                  {course.description}
                </p>

                {/* Topics Pills */}
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {course.topics.slice(0, 4).map((topic) => (
                    <span
                      key={topic}
                      className="text-[11px] font-medium text-zinc-400 bg-zinc-900 border border-white/5 px-2.5 py-1 rounded-lg"
                    >
                      {topic}
                    </span>
                  ))}
                  {course.topics.length > 4 && (
                    <span className="text-[11px] font-medium text-[#FF6A00] bg-[#FF6A00]/10 px-2.5 py-1 rounded-lg">
                      +{course.topics.length - 4} mavzu
                    </span>
                  )}
                </div>
              </div>

              {/* Card Bottom Meta & CTAs */}
              <div className="mt-8 pt-5 border-t border-white/10">
                <div className="flex items-center justify-between text-xs text-zinc-400 mb-5">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span>{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-zinc-500" />
                    <span>{course.difficulty}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => onSelectCourse(course)}
                    className="w-full py-2.5 px-3 text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-white/10 rounded-xl transition-colors cursor-pointer"
                  >
                    Batafsil
                  </button>
                  <button
                    onClick={() => onEnrollCourse(course.name)}
                    className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-[#FF6A00] hover:bg-[#E05D00] rounded-xl transition-all duration-200 shadow-md shadow-[#FF6A00]/20 flex items-center justify-center gap-1.5 group-hover:bg-[#FF6A00] cursor-pointer"
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
