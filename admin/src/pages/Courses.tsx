import React, { useEffect, useState } from 'react';
import { getCourses, createCourse, updateCourse, deleteCourse } from '../api/courses';
import { showSuccess, showError, confirmDialog } from '../utils/toast';
import {
  Plus,
  Layers,
  MonitorPlay,
  Coins,
  Clock,
  X,
  Pencil,
  Trash2,
  BookOpen,
} from 'lucide-react';

// ─── types ────────────────────────────────────────────────────────────────────

interface CourseItem {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  price: number;
  duration: string;
  level: string;
  status?: string;
  modules?: Array<{
    _id: string;
    title: string;
    lessons?: Array<{ _id: string; title: string; order: number }>;
  }>;
}

// ─── blank form state ─────────────────────────────────────────────────────────

const BLANK = {
  title: '',
  description: '',
  thumbnail: '',
  price: '500000',
  duration: '',
  level: 'Beginner',
};

// ─── component ────────────────────────────────────────────────────────────────

export const Courses: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  // ── modal state (shared between create & edit) ────────────────────────────
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null = create mode
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(BLANK);

  // ── load ──────────────────────────────────────────────────────────────────

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getCourses();
      setCourses(data);
      if (data.length > 0 && !selectedCourse) {
        setSelectedCourse(data[0]);
      }
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Kurslarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── open modals ───────────────────────────────────────────────────────────

  const openCreate = () => {
    setEditingId(null);
    setForm(BLANK);
    setModalOpen(true);
  };

  const openEdit = (course: CourseItem, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent selecting card
    setEditingId(course._id);
    setForm({
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail || '',
      price: String(course.price),
      duration: course.duration,
      level: course.level,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  // ── submit (create or edit) ───────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      title: form.title,
      description: form.description,
      thumbnail: form.thumbnail || undefined,
      price: Number(form.price),
      duration: form.duration,
      level: form.level,
      status: 'ACTIVE',
    };

    try {
      if (editingId) {
        const updated = await updateCourse(editingId, payload);
        showSuccess('Kurs muvaffaqiyatli yangilandi ✓');
        closeModal();
        await loadData();
        setSelectedCourse(updated || null);
      } else {
        const created = await createCourse(payload);
        showSuccess('Yangi kurs muvaffaqiyatli yaratildi ✓');
        closeModal();
        await loadData();
        setSelectedCourse(created || null);
      }
    } catch (err: any) {
      showError(err?.response?.data?.message || err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  // ── delete ────────────────────────────────────────────────────────────────

  const handleDelete = async (course: CourseItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = await confirmDialog(
      `"${course.title}" kursini o'chirishni tasdiqlaysizmi?\n\nBu amalni ortga qaytarib bo'lmaydi.`
    );
    if (!ok) return;
    try {
      await deleteCourse(course._id);
      showSuccess(`Kurs o'chirildi`);
      if (selectedCourse?._id === course._id) setSelectedCourse(null);
      await loadData();
    } catch (err: any) {
      showError(err?.response?.data?.message || 'Ochirishda xatolik');
    }
  };

  // ─── helpers ──────────────────────────────────────────────────────────────

  const field = (key: keyof typeof BLANK, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  // ─── render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Kurslar Shablonlari</h1>
          <p className="text-muted-foreground">
            O'quv rejalari andozalari, modullar va video darsliklar ro'yxati.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi Kurs Yaratish
        </button>
      </div>

      {/* ── Two-column layout ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: course cards */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">
            Mavjud Kurslar
          </h3>

          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-10 border border-dashed rounded-xl text-center">
              <BookOpen className="w-10 h-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Hech qanday kurs yaratilmagan.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {courses.map((course) => {
                const isSelected = selectedCourse?._id === course._id;
                return (
                  <div
                    key={course._id}
                    onClick={() => setSelectedCourse(course)}
                    className={`relative p-4 bg-card border rounded-xl shadow-sm cursor-pointer hover:border-primary/50 transition-all group ${
                      isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.01]' : ''
                    }`}
                  >
                    {/* Action buttons — appear on hover */}
                    <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => openEdit(course, e)}
                        title="Tahrirlash"
                        className="p-1.5 bg-background border rounded-lg text-muted-foreground hover:text-primary hover:border-primary/40 transition-all shadow-sm"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(course, e)}
                        title="O'chirish"
                        className="p-1.5 bg-background border rounded-lg text-muted-foreground hover:text-red-500 hover:border-red-300 transition-all shadow-sm"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Thumbnail */}
                    <div className="aspect-[16/9] w-full rounded-lg overflow-hidden bg-secondary mb-3">
                      {course.thumbnail ? (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm line-clamp-1 pr-16">{course.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{course.description}</p>
                      <div className="flex items-center justify-between pt-2 border-t mt-2 text-xs font-semibold text-muted-foreground">
                        <span className="flex items-center gap-1 text-primary">
                          <Coins className="w-3.5 h-3.5" />
                          {course.price.toLocaleString()} so'm
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {course.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: course details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedCourse ? (
            <div className="space-y-6 bg-card border rounded-xl p-6 shadow-sm">

              {/* Header row */}
              <div className="flex flex-col sm:flex-row gap-6 border-b pb-6">
                <div className="w-full sm:w-48 aspect-[16/10] rounded-lg overflow-hidden bg-secondary shrink-0">
                  {selectedCourse.thumbnail ? (
                    <img
                      src={selectedCourse.thumbnail}
                      alt={selectedCourse.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-10 h-10 text-muted-foreground/30" />
                    </div>
                  )}
                </div>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-primary/10 text-primary uppercase">
                      {selectedCourse.level}
                    </span>
                    {selectedCourse.status === 'ACTIVE' && (
                      <span className="inline-flex px-2 py-0.5 text-[10px] font-bold rounded-full bg-green-500/10 text-green-600 uppercase">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold">{selectedCourse.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">{selectedCourse.description}</p>
                  <div className="flex items-center gap-4 text-sm font-semibold text-muted-foreground pt-1">
                    <span className="flex items-center gap-1 text-primary">
                      <Coins className="w-4 h-4" />
                      {selectedCourse.price.toLocaleString()} so'm
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedCourse.duration}
                    </span>
                  </div>
                  {/* Quick action buttons in detail view */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={(e) => openEdit(selectedCourse, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border rounded-lg hover:bg-secondary transition-all"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      Tahrirlash
                    </button>
                    <button
                      onClick={(e) => handleDelete(selectedCourse, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>

              {/* Modules & Lessons */}
              <div className="space-y-4">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Kurs tuzilishi (Modullar)
                </h3>

                {(selectedCourse.modules || []).length === 0 ? (
                  <div className="p-6 text-center border border-dashed rounded-lg text-muted-foreground text-sm">
                    Bu kursga hali hech qanday modullar qo'shilmagan. Uni{' '}
                    <strong>LMS Builder</strong> yordamida loyihalashingiz mumkin.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {(selectedCourse.modules || []).map((mod) => (
                      <div key={mod._id} className="border rounded-lg p-4 space-y-3 bg-secondary/20">
                        <h4 className="font-bold text-sm text-foreground flex items-center justify-between">
                          {mod.title}
                          <span className="text-xs text-muted-foreground font-normal">
                            {(mod.lessons || []).length} dars
                          </span>
                        </h4>
                        <div className="space-y-2">
                          {(mod.lessons || []).map((les) => (
                            <div
                              key={les._id}
                              className="flex items-center gap-3 p-2.5 bg-card border rounded-lg text-sm"
                            >
                              <MonitorPlay className="w-4 h-4 text-muted-foreground shrink-0" />
                              <span className="font-medium text-foreground">{les.title}</span>
                              <span className="text-xs text-muted-foreground ml-auto">
                                #{les.order}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 min-h-[300px] border border-dashed rounded-xl bg-card text-center p-8">
              <BookOpen className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground">
                Tafsilotlarni ko'rish uchun chapdan kursni tanlang.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Create / Edit Modal ─────────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">

            {/* Modal header */}
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                {editingId ? (
                  <>
                    <Pencil className="w-5 h-5 text-primary" />
                    Kursni Tahrirlash
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 text-primary" />
                    Yangi Kurs Yaratish
                  </>
                )}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Kurs nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Fullstack JS Development"
                  value={form.title}
                  onChange={(e) => field('title', e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tavsif *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Kurs haqida qisqacha ma'lumot..."
                  value={form.description}
                  onChange={(e) => field('description', e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Rasm (Thumbnail URL)</label>
                <input
                  type="text"
                  placeholder="https://domain.com/photo.jpg"
                  value={form.thumbnail}
                  onChange={(e) => field('thumbnail', e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                />
                {form.thumbnail && (
                  <img
                    src={form.thumbnail}
                    alt="preview"
                    onError={(e) => (e.currentTarget.style.display = 'none')}
                    className="mt-1 h-20 w-full object-cover rounded-lg border"
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Narxi (UZS) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    placeholder="500000"
                    value={form.price}
                    onChange={(e) => field('price', e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Davomiyligi *</label>
                  <input
                    type="text"
                    required
                    placeholder="E.g. 6 months"
                    value={form.duration}
                    onChange={(e) => field('duration', e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Qiyinchilik darajasi</label>
                <select
                  value={form.level}
                  onChange={(e) => field('level', e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="Beginner">Beginner (Boshlang'ich)</option>
                  <option value="Intermediate">Intermediate (O'rta)</option>
                  <option value="Advanced">Advanced (Mukammal)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : editingId ? (
                    <Pencil className="w-4 h-4" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {editingId ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
