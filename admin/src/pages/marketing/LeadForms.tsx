import React, { useEffect, useState } from 'react';
import { getLeadForms, createLeadForm, deleteLeadForm } from '../../api/leadForms';
import type { LeadFormItem } from '../../api/leadForms';
import { getLeadSources } from '../../api/leads';
import { getCourses } from '../../api/courses';
import { Plus, Trash2, Link as LinkIcon, Copy, ExternalLink, Check, FileText, X, Users, Tag, BookOpen } from 'lucide-react';

export const LeadForms: React.FC = () => {
  const [forms, setForms] = useState<LeadFormItem[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [sourceId, setSourceId] = useState('');
  const [description, setDescription] = useState('');
  const [interestedCourseId, setInterestedCourseId] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [formsData, sourcesData, coursesData] = await Promise.all([
        getLeadForms(),
        getLeadSources(),
        getCourses(),
      ]);
      setForms(formsData || []);
      setSources(sourcesData || []);
      setCourses(coursesData || []);
    } catch (err) {
      console.error('Data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !sourceId) {
      alert('Iltimos, Form nomi va Manbani tanlang');
      return;
    }

    try {
      await createLeadForm({
        title,
        source: sourceId,
        description: description || undefined,
        interestedCourse: interestedCourseId || undefined,
      });

      setTitle('');
      setSourceId('');
      setDescription('');
      setInterestedCourseId('');
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error(err);
      alert('Forma yaratishda xatolik yuz berdi');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ushbu lead formani o\'chirmoqchimisiz?')) return;
    try {
      await deleteLeadForm(id);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (formId: string) => {
    const publicUrl = `${window.location.origin}/form/${formId}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Formlar (Form Generators)</h1>
          <p className="text-muted-foreground text-sm">
            E'lon va aksiyalar uchun unikal havolali formalar yaratish va leadlar kelishini kuzatish.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi Form Yaratish
        </button>
      </div>

      {/* Forms List Grid */}
      {forms.length === 0 ? (
        <div className="bg-card p-12 text-center rounded-xl border border-dashed flex flex-col items-center justify-center">
          <div className="p-4 rounded-full bg-primary/10 text-primary mb-3">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold">Hozircha faol formalar yo'q</h3>
          <p className="text-muted-foreground text-sm max-w-md mt-1 mb-4">
            E'lonlaringiz, Instagram yoki Telegram kanallaringiz uchun yangi lead formasini yarating va manbasini kuzating.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Birinchi Formani Yaratish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {forms.map((f) => {
            const sourceName = typeof f.source === 'object' ? f.source?.name : 'Noma\'lum manba';
            const courseTitle = typeof f.interestedCourse === 'object' ? f.interestedCourse?.title : null;
            const publicUrl = `${window.location.origin}/form/${f._id}`;

            return (
              <div
                key={f._id}
                className="bg-card p-5 rounded-xl border shadow-sm flex flex-col justify-between hover:shadow-md transition-all group relative overflow-hidden"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-lg bg-primary/10 text-primary shrink-0">
                        <FileText className="w-5 h-5" />
                      </span>
                      <div>
                        <h3 className="font-bold text-base line-clamp-1">{f.title}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground border">
                            <Tag className="w-3 h-3 text-primary" />
                            {sourceName}
                          </span>
                          {courseTitle && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-accent/10 text-accent-foreground border">
                              <BookOpen className="w-3 h-3 text-accent" />
                              {courseTitle}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDelete(f._id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all"
                      title="Formani o'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {f.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-3 bg-secondary/50 p-2.5 rounded-lg border">
                      {f.description}
                    </p>
                  )}

                  {/* Submission Counter */}
                  <div className="flex items-center justify-between py-2 px-3 bg-secondary/30 rounded-lg text-xs font-medium mb-4">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-primary" />
                      Jami kelgan arizalar:
                    </span>
                    <span className="text-sm font-bold text-primary">{f.submissionCount || 0} ta</span>
                  </div>

                  {/* Link Box */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block">
                      E'lon uchun unikal link:
                    </label>
                    <div className="flex items-center gap-1.5 bg-secondary border p-1.5 rounded-lg text-xs font-mono text-muted-foreground truncate select-all">
                      <LinkIcon className="w-3.5 h-3.5 shrink-0 text-primary" />
                      <span className="truncate flex-1">{publicUrl}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 mt-4 border-t">
                  <button
                    onClick={() => copyToClipboard(f._id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${
                      copiedId === f._id
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                  >
                    {copiedId === f._id ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Nusxalandi!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Linkni nusxalash
                      </>
                    )}
                  </button>

                  <a
                    href={publicUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-all border border-primary/20"
                    title="Formaga o'tib ko'rish"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Ochish
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="bg-card w-full max-w-md p-6 rounded-2xl border shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold">Yangi Lead Form Yaratish</h2>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Form Nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Instagram Yozgi Aksiya Formasi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-transparent focus:border-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Manbani Tanlang (Lead Source) *</label>
                <select
                  required
                  value={sourceId}
                  onChange={(e) => setSourceId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-transparent focus:border-primary outline-none transition-all"
                >
                  <option value="">-- Manbani tanlang --</option>
                  {sources.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                {sources.length === 0 && (
                  <p className="text-[11px] text-destructive mt-1">
                    {"Avval CRM → Lead Sources bo'limida kamida bitta manba yaratishingiz kerak."}
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Qaysi kurs uchun (Ixtiyoriy)</label>
                <select
                  value={interestedCourseId}
                  onChange={(e) => setInterestedCourseId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-transparent focus:border-primary outline-none transition-all"
                >
                  <option value="">-- Barcha kurslar / Unversal --</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Landing Sahifa Sarlavhasi / Tavsif (Ixtiyoriy)</label>
                <textarea
                  rows={3}
                  placeholder="Formaga kirgan foydalanuvchiga ko'rinadigan matn. Masalan: Kurslarimizga a'zo bo'ling va chegirmalarga ega bo'ling!"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-secondary border border-transparent focus:border-primary outline-none transition-all resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-secondary transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={!title || !sourceId}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-lg hover:bg-primary/95 transition-all disabled:opacity-50"
                >
                  Formani Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadForms;
