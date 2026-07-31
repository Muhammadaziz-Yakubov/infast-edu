import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicLeadForm, submitPublicLeadForm } from '../api/leadForms';
import { getCourses } from '../api/courses';
import {
  CheckCircle2,
  Phone,
  Calendar,
  BookOpen,
  Send,
  AlertCircle,
  ArrowRight,
  Zap,
  Shield,
  Users,
  Star,
  GraduationCap,
  ChevronRight,
  User,
} from 'lucide-react';

const BRAND_STATS = [
  { value: '5000+', label: "O'quvchilar" },
  { value: '98%', label: 'Muvaffaqiyat' },
  { value: '50+', label: 'Kurslar' },
  { value: '12+', label: 'Yillik tajriba' },
];

const TRUST_BADGES = [
  { icon: Shield, text: "Ma'lumotlaringiz xavfsiz" },
  { icon: Zap, text: '24 soat ichida javob' },
  { icon: Users, text: 'Professional mentorlар' },
];

export const PublicLeadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formDetails, setFormDetails] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('+998');
  const [age, setAge] = useState<number | ''>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    const fetchForm = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        const [data, courseList] = await Promise.all([
          getPublicLeadForm(id),
          getCourses().catch(() => []),
        ]);
        setFormDetails(data);
        setCourses(courseList || []);
        if (data?.interestedCourse) {
          const courseId =
            typeof data.interestedCourse === 'object'
              ? data.interestedCourse._id
              : data.interestedCourse;
          setSelectedCourse(courseId);
        }
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.response?.data?.message || 'Forma topilmadi yoki faol emas.');
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !firstName || !lastName || !phone || !age) {
      setErrorMsg("Iltimos, barcha majburiy maydonlarni to'ldiring!");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitPublicLeadForm(id, {
        firstName,
        lastName,
        phone,
        age: Number(age),
        interestedCourse: selectedCourse || undefined,
      });
      setSuccessResponse(res.message || "Arizangiz muvaffaqiyatli qabul qilindi!");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.message ||
          "Arizani yuborishda xatolik yuz berdi. Qayta urinib ko'ring."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
        className="min-h-screen flex flex-col items-center justify-center p-4"
      >
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-violet-500/20 border-b-violet-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        </div>
        <p className="text-slate-400 text-sm mt-6 font-medium tracking-wider">YUKLANMOQDA...</p>
      </div>
    );
  }

  if (errorMsg && !formDetails) {
    return (
      <div
        style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}
        className="min-h-screen flex items-center justify-center p-4"
      >
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-rose-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Forma Topilmadi</h2>
          <p className="text-slate-400 leading-relaxed">{errorMsg}</p>
        </div>
      </div>
    );
  }

  const courseTitle =
    typeof formDetails?.interestedCourse === 'object'
      ? formDetails?.interestedCourse?.title
      : null;

  return (
    <div
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 40%, #0c0a1e 100%)' }}
      className="min-h-screen font-sans text-white relative overflow-hidden"
    >
      {/* Ambient glow blobs */}
      <div
        className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)', filter: 'blur(60px)' }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)', filter: 'blur(60px)' }}
      />

      {/* Top nav bar */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              IF
            </div>
            <span className="font-bold text-white text-lg tracking-tight">InFast Academy</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 text-xs font-semibold">Ariza qabul qilinmoqda</span>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">

          {/* LEFT COLUMN — Hero Info */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-semibold tracking-wider uppercase">
              <Star className="w-3.5 h-3.5" />
              {formDetails?.source?.name || "O'quv Markazi"}
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                {formDetails?.title || (
                  <>
                    Kelajagingizni
                    <br />
                    <span
                      style={{ background: 'linear-gradient(90deg, #6366f1, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                    >
                      Bugun Boshlang
                    </span>
                  </>
                )}
              </h1>
              {formDetails?.description ? (
                <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                  {formDetails.description}
                </p>
              ) : (
                <p className="text-slate-300 text-lg leading-relaxed max-w-md">
                  Zamonaviy texnologiyalar, tajribali ustozlar va real loyihalar bilan kasbingizni
                  yangi bosqichga olib chiqing.
                </p>
              )}
            </div>

            {/* Interested course badge */}
            {courseTitle && (
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl border border-violet-500/30 bg-violet-500/10">
                <div className="w-9 h-9 rounded-xl bg-violet-500/20 flex items-center justify-center shrink-0">
                  <GraduationCap className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Kurs</p>
                  <p className="text-white font-bold text-sm">{courseTitle}</p>
                </div>
              </div>
            )}

            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4 pt-2">
              {BRAND_STATS.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-2xl font-extrabold text-white">{s.value}</div>
                  <div className="text-xs text-slate-400 mt-0.5 font-medium">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

            {/* Trust badges */}
            <div className="space-y-3">
              {TRUST_BADGES.map((b) => (
                <div key={b.text} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <b.icon className="w-4 h-4 text-indigo-400" />
                  </div>
                  <span className="text-sm text-slate-300 font-medium">{b.text}</span>
                </div>
              ))}
            </div>

            {/* Testimonial snippet */}
            <div className="p-5 rounded-2xl border border-white/8 bg-white/3 backdrop-blur-sm">
              <div className="flex gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-slate-300 text-sm leading-relaxed italic">
                "InFast Academyda o'qib, 6 oyda dasturlashni o'rgandim va rasmiy ish topib oldim.
                Ustozlar judayam professional!"
              </p>
              <div className="flex items-center gap-2 mt-3">
                <div className="w-7 h-7 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs font-bold text-indigo-400">
                  S
                </div>
                <span className="text-xs text-slate-400 font-semibold">Sardor A. — Frontend Developer</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — Form card */}
          <div className="lg:sticky lg:top-8">
            <div
              className="rounded-3xl border border-white/10 overflow-hidden shadow-2xl"
              style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(32px)' }}
            >
              {/* Form header gradient strip */}
              <div
                className="h-1.5 w-full"
                style={{ background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #a855f7)' }}
              />

              <div className="p-8">
                {successResponse ? (
                  /* ── SUCCESS STATE ── */
                  <div className="text-center py-8 animate-in zoom-in-95 duration-300">
                    <div
                      className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/30"
                      style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)' }}
                    >
                      <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-2">Tabriklaymiz! 🎉</h2>
                    <p className="text-slate-300 text-sm mb-2 font-semibold">{firstName} {lastName}</p>
                    <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-xs mx-auto">
                      {successResponse}
                    </p>
                    <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-300 mb-8">
                      Menejerimiz <span className="font-bold text-indigo-200">{phone}</span> raqamiga{' '}
                      <span className="font-bold text-indigo-200">24 soat</span> ichida bog'lanadi.
                    </div>
                    <button
                      onClick={() => {
                        setSuccessResponse(null);
                        setFirstName('');
                        setLastName('');
                        setPhone('+998');
                        setAge('');
                        setErrorMsg(null);
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold transition-all"
                    >
                      Yana ariza qoldirish
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  /* ── FORM STATE ── */
                  <>
                    <div className="mb-7">
                      <h2 className="text-xl font-extrabold text-white">Arizangizni Yuboring</h2>
                      <p className="text-slate-400 text-sm mt-1">
                        Barcha maydonlarni to'ldiring, biz siz bilan bog'lanamiz.
                      </p>
                    </div>

                    {errorMsg && (
                      <div className="mb-5 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                        <span className="text-rose-300 text-sm font-medium">{errorMsg}</span>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                      {/* Name row */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                            Ismi <span className="text-indigo-400">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              required
                              placeholder="Sardor"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all border"
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderColor: 'rgba(255,255,255,0.08)',
                              }}
                              onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                            Familiyasi <span className="text-indigo-400">*</span>
                          </label>
                          <div className="relative">
                            <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                              type="text"
                              required
                              placeholder="Alimov"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all border"
                              style={{
                                background: 'rgba(255,255,255,0.05)',
                                borderColor: 'rgba(255,255,255,0.08)',
                              }}
                              onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                              onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          Telefon Raqam <span className="text-indigo-400">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="tel"
                            required
                            placeholder="+998 90 123 45 67"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all border"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              borderColor: 'rgba(255,255,255,0.08)',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                          />
                        </div>
                      </div>

                      {/* Age */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          Yoshi <span className="text-indigo-400">*</span>
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                          <input
                            type="number"
                            required
                            min={6}
                            max={99}
                            placeholder="Masalan: 18"
                            value={age}
                            onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all border"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              borderColor: 'rgba(255,255,255,0.08)',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                          />
                        </div>
                      </div>

                      {/* Course select */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                          Qiziqqan Kurs
                        </label>
                        <div className="relative">
                          <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full pl-4 pr-8 py-2.5 rounded-xl text-sm text-white outline-none transition-all border appearance-none"
                            style={{
                              background: 'rgba(255,255,255,0.05)',
                              borderColor: 'rgba(255,255,255,0.08)',
                            }}
                            onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
                            onBlur={(e) => (e.target.style.borderColor = 'rgba(255,255,255,0.08)')}
                          >
                            <option value="" style={{ background: '#1e1b4b' }}>
                              {courseTitle ? `${courseTitle}` : "-- Kursni tanlang --"}
                            </option>
                            {courses.map((c) => (
                              <option key={c._id} value={c._id} style={{ background: '#1e1b4b' }}>
                                {c.title}
                              </option>
                            ))}
                          </select>
                          <ChevronRight className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 rotate-90 pointer-events-none" />
                        </div>
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full relative py-3.5 px-6 rounded-xl font-bold text-sm text-white transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        style={{
                          background: submitting
                            ? 'rgba(99,102,241,0.5)'
                            : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                          boxShadow: submitting ? 'none' : '0 8px 32px rgba(99,102,241,0.4)',
                        }}
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2.5">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Yuborilmoqda...
                          </span>
                        ) : (
                          <span className="flex items-center justify-center gap-2.5">
                            <Send className="w-4 h-4" />
                            Arizani Yuborish
                          </span>
                        )}
                      </button>

                      <p className="text-center text-xs text-slate-500 pt-1">
                        Ariza yuborish bilan siz bizning{' '}
                        <span className="text-slate-400 underline underline-offset-2 cursor-pointer">
                          maxfiylik siyosatimiz
                        </span>
                        ga rozilik bildirasiz.
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Bottom info strip */}
            <div className="mt-4 flex items-center justify-center gap-6">
              {TRUST_BADGES.map((b) => (
                <div key={b.text} className="flex items-center gap-1.5">
                  <b.icon className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs text-slate-500">{b.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center font-black text-[10px]"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
            >
              IF
            </div>
            <span className="text-slate-400 text-xs font-semibold">InFast Academy</span>
          </div>
          <p className="text-slate-600 text-xs">
            © {new Date().getFullYear()} InFast Academy. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default PublicLeadForm;
