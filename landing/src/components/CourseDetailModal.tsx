'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, BarChart3, Calendar, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Course } from '@/data/academyData';

interface CourseDetailModalProps {
  course: Course | null;
  onClose: () => void;
  onEnroll: (courseName: string) => void;
}

export const CourseDetailModal: React.FC<CourseDetailModalProps> = ({
  course,
  onClose,
  onEnroll,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (course) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [course, onClose]);

  if (!course) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
          className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl p-6 sm:p-8 backdrop-blur-2xl z-10"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF6A00]/15 text-[#FF6A00] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            {course.tag}
          </div>

          <h3 className="text-3xl font-bold text-white mb-2">{course.name}</h3>

          <p className="text-base text-zinc-300 font-normal leading-relaxed mb-6">
            {course.longDescription}
          </p>

          {/* Quick Details Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-900 border border-white/10 mb-6 text-xs text-zinc-300">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#FF6A00]" />
              <div>
                <div className="text-zinc-500">Davomiyligi:</div>
                <div className="font-semibold text-white">{course.duration}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#FF6A00]" />
              <div>
                <div className="text-zinc-500">Jadval:</div>
                <div className="font-semibold text-white">{course.schedule}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#FF6A00]" />
              <div>
                <div className="text-zinc-500">Daraja:</div>
                <div className="font-semibold text-white">{course.difficulty}</div>
              </div>
            </div>
          </div>

          {/* Curriculum / Topics */}
          <div className="space-y-3 mb-8">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider">
              O'rganiladigan asosiy modul va texnologiyalar:
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {course.topics.map((topic, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/50 border border-white/5 text-sm text-zinc-200"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#FF6A00] flex-shrink-0" />
                  <span>{topic}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
            <span className="text-xs text-zinc-400">
              Kamida <strong className="text-white">{course.projectsCount} ta real loyiha</strong> portfolio uchun!
            </span>

            <button
              onClick={() => {
                onClose();
                onEnroll(course.name);
              }}
              className="px-6 py-3 rounded-full bg-[#FF6A00] hover:bg-[#E05D00] text-white font-bold text-sm shadow-lg shadow-[#FF6A00]/25 transition-all duration-200 flex items-center gap-2 cursor-pointer"
            >
              <span>Kursga yozilish</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
