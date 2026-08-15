import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Sparkles, Send, Phone, User, BookOpen } from 'lucide-react';
import { COURSES } from './academyData';

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCourseName?: string;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  isOpen,
  onClose,
  selectedCourseName,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [course, setCourse] = useState(selectedCourseName || COURSES[0].name);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (selectedCourseName) {
      setCourse(selectedCourseName);
    }
  }, [selectedCourseName]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1000);
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setName('');
    setPhone('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleResetAndClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative w-full max-w-lg rounded-3xl bg-zinc-950 border border-white/10 shadow-2xl p-6 sm:p-8 backdrop-blur-2xl z-10 overflow-hidden"
          >
            {/* Top Close Button */}
            <button
              onClick={handleResetAndClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {!isSubmitted ? (
              <>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#FF6A00] uppercase tracking-wider mb-2">
                  <Sparkles className="w-4 h-4" />
                  Qabul 2026
                </div>

                <h3 className="text-2xl font-bold text-white mb-2">
                  Kursga ariza topshirish
                </h3>

                <p className="text-sm text-zinc-400 mb-6">
                  Ma'lumotlaringizni qoldiring va biz siz bilan 15 daqiqa ichida bog'lanamiz hamda bepul konsultatsiya beramiz.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Ism va Familiya
                    </label>
                    <div className="relative">
                      <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Masalan: Ali Valiyev"
                        className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A00] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Telefon Raqami
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+998 (90) 123-45-67"
                        className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF6A00] transition-colors"
                      />
                    </div>
                  </div>

                  {/* Course Select */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                      Tanlangan Yo'nalish
                    </label>
                    <div className="relative">
                      <BookOpen className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <select
                        value={course}
                        onChange={(e) => setCourse(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-zinc-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-[#FF6A00] transition-colors appearance-none cursor-pointer"
                      >
                        {COURSES.map((c) => (
                          <option key={c.id} value={c.name} className="bg-zinc-900 text-white">
                            {c.name} ({c.duration})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-4 py-3.5 px-6 rounded-xl bg-[#FF6A00] hover:bg-[#E05D00] text-white font-bold text-sm shadow-xl shadow-[#FF6A00]/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Arizani yuborish</span>
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Arizangiz qabul qilindi!
                </h3>
                <p className="text-sm text-zinc-400 mb-6 max-w-xs mx-auto">
                  Rahmat! InFast IT-Academy mutaxassisi tez orada ko'rsatilgan telefon raqami bo'yicha siz bilan bog'lanadi.
                </p>
                <button
                  onClick={handleResetAndClose}
                  className="px-6 py-2.5 rounded-xl bg-zinc-900 border border-white/10 text-white text-sm font-semibold hover:bg-zinc-800 transition-colors"
                >
                  Yopish
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
