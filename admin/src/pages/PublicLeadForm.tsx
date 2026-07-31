import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getPublicLeadForm, submitPublicLeadForm } from '../api/leadForms';
import { getCourses } from '../api/courses';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const [data, courseList] = await Promise.all([
          getPublicLeadForm(id),
          getCourses().catch(() => []),
        ]);
        setFormDetails(data);
        setCourses(courseList || []);
        if (data?.interestedCourse) {
          const cid = typeof data.interestedCourse === 'object'
            ? data.interestedCourse._id
            : data.interestedCourse;
          setSelectedCourse(cid);
        }
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || 'Forma topilmadi.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !age) {
      setErrorMsg("Barcha maydonlarni to'ldiring.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await submitPublicLeadForm(id!, {
        firstName, lastName, phone,
        age: Number(age),
        interestedCourse: selectedCourse || undefined,
      });
      setSuccessResponse(res.message || "Qabul qilindi.");
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-black/15 border-t-black rounded-full animate-spin" />
      </div>
    );
  }

  /* ─── Not found ─── */
  if (errorMsg && !formDetails) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-xs">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-4" />
          <p className="text-sm text-neutral-500">{errorMsg}</p>
        </div>
      </div>
    );
  }

  const courseTitle = typeof formDetails?.interestedCourse === 'object'
    ? formDetails?.interestedCourse?.title
    : null;

  /* ─── Success ─── */
  if (successResponse) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-6" />
          <h2 className="text-xl font-semibold text-neutral-900 mb-2">Qabul qilindi</h2>
          <p className="text-sm text-neutral-500 leading-relaxed mb-8">{successResponse}</p>
          <button
            onClick={() => {
              setSuccessResponse(null);
              setFirstName(''); setLastName('');
              setPhone('+998'); setAge('');
            }}
            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            Yana ariza yuborish
          </button>
        </div>
      </div>
    );
  }

  /* ─── Form ─── */
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-neutral-100 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <span className="text-sm font-semibold text-neutral-900 tracking-tight">InFast Academy</span>
          <span className="text-xs text-neutral-400">
            {formDetails?.source?.name}
          </span>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-lg mx-auto px-6 pt-14 pb-20">

        {/* Heading */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight leading-snug mb-3">
            {formDetails?.title || "Ro'yxatdan o'ting"}
          </h1>
          {formDetails?.description && (
            <p className="text-neutral-500 text-[15px] leading-relaxed">
              {formDetails.description}
            </p>
          )}
          {courseTitle && !formDetails?.description && (
            <p className="text-neutral-500 text-[15px]">
              {courseTitle} kursi uchun ariza
            </p>
          )}
        </div>

        {/* Error */}
        {errorMsg && (
          <p className="text-red-500 text-sm mb-6">{errorMsg}</p>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Ismi & Familiyasi */}
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Ismi"
              type="text"
              required
              placeholder="Sardor"
              value={firstName}
              onChange={setFirstName}
            />
            <Field
              label="Familiyasi"
              type="text"
              required
              placeholder="Alimov"
              value={lastName}
              onChange={setLastName}
            />
          </div>

          <Field
            label="Telefon"
            type="tel"
            required
            placeholder="+998 90 000 00 00"
            value={phone}
            onChange={setPhone}
          />

          <Field
            label="Yoshi"
            type="number"
            required
            placeholder="18"
            value={age === '' ? '' : String(age)}
            onChange={(v) => setAge(v ? Number(v) : '')}
            min={6}
            max={99}
          />

          {courses.length > 0 && (
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-400 uppercase tracking-widest">
                Kurs
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-transparent border-b border-neutral-200 py-2.5 text-[15px] text-neutral-900 focus:outline-none focus:border-neutral-900 transition-colors appearance-none"
              >
                <option value="">
                  {courseTitle || "Kursni tanlang"}
                </option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>{c.title}</option>
                ))}
              </select>
            </div>
          )}

          {/* Submit */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-neutral-900 text-white text-[15px] font-semibold py-3.5 rounded-2xl hover:bg-neutral-800 active:scale-[0.99] transition-all disabled:opacity-40"
            >
              {submitting ? 'Yuborilmoqda...' : 'Arizani Yuborish'}
            </button>
            <p className="text-center text-xs text-neutral-400 mt-4">
              © {new Date().getFullYear()} InFast Academy
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─── Reusable input field ─── */
interface FieldProps {
  label: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  max?: number;
}

const Field: React.FC<FieldProps> = ({ label, type, required, placeholder, value, onChange, min, max }) => (
  <div className="space-y-1.5">
    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-widest">
      {label}
    </label>
    <input
      type={type}
      required={required}
      placeholder={placeholder}
      value={value}
      min={min}
      max={max}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-transparent border-b border-neutral-200 py-2.5 text-[15px] text-neutral-900 placeholder-neutral-300 focus:outline-none focus:border-neutral-900 transition-colors"
    />
  </div>
);

export default PublicLeadForm;
