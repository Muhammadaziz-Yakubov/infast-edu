import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicLeadForm, submitPublicLeadForm } from '../api/leadForms';
import { getCourses } from '../api/courses';
import { Sparkles, CheckCircle2, User, Phone, Calendar, BookOpen, Send, AlertCircle, ArrowRight } from 'lucide-react';

export const PublicLeadForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [formDetails, setFormDetails] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResponse, setSuccessResponse] = useState<string | null>(null);

  // Form Fields
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
          const courseId = typeof data.interestedCourse === 'object' ? data.interestedCourse._id : data.interestedCourse;
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
      alert('Iltimos, barcha zaruriy maydonlarni to\'ldiring!');
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

      setSuccessResponse(res.message || 'Arizangiz muvaffaqiyatli qabul qilindi!');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Arizani yuborishda xatolik yuz berdi. Qayta urinib ko\'ring.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-slate-400 text-sm mt-3 font-medium">Forma yuklanmoqda...</p>
      </div>
    );
  }

  if (errorMsg && !formDetails) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl">
          <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Forma Topilmadi</h2>
          <p className="text-slate-400 text-sm mb-6">{errorMsg}</p>
        </div>
      </div>
    );
  }

  const courseTitle = typeof formDetails?.interestedCourse === 'object' ? formDetails?.interestedCourse?.title : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4 sm:p-6 select-none font-sans text-slate-100">
      <div className="w-full max-w-lg">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            InFast Academy
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {formDetails?.title || 'Arizani Qoldiring'}
          </h1>
          {formDetails?.description && (
            <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
              {formDetails.description}
            </p>
          )}
        </div>

        {/* Form Card / Success Screen */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -z-10" />

          {successResponse ? (
            <div className="text-center py-6 animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Arizangiz Qabul Qilindi!</h2>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                {successResponse}
              </p>

              <button
                onClick={() => {
                  setSuccessResponse(null);
                  setFirstName('');
                  setLastName('');
                  setPhone('+998');
                  setAge('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm rounded-xl transition-all border border-slate-700"
              >
                Yana ariza qoldirish
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Ismi */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Ismingiz <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Sardor"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Familiyasi */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Familiyangiz <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Alimov"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Telefon Raqami */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Telefon Raqamingiz <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Yoshi */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Yoshiningiz <span className="text-indigo-400">*</span>
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="number"
                    required
                    min={6}
                    max={99}
                    placeholder="Masalan: 18"
                    value={age}
                    onChange={(e) => setAge(e.target.value ? Number(e.target.value) : '')}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Qiziqqan Kursingiz
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-3 pointer-events-none" />
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all appearance-none"
                  >
                    <option value="" className="bg-slate-900">
                      {courseTitle ? `-- ${courseTitle} --` : '-- Kursni tanlang --'}
                    </option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id} className="bg-slate-900">
                        {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Yuborilmoqda...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Arizani Yuborish
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6">
          © {new Date().getFullYear()} InFast Academy. Barcha huquqlar himoyalangan.
        </p>
      </div>
    </div>
  );
};

export default PublicLeadForm;
