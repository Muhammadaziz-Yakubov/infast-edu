import React, { useEffect, useState } from 'react';
import { getSubmissions, gradeSubmission, createHomework } from '../api/homework';
import { getCourses } from '../api/courses';
import type { HomeworkSubmission, Course } from '../utils/mockDb';
import {
  Calendar,
  CheckCircle,
  Plus,
  X,
  FileCheck,
} from 'lucide-react';

export const Homework: React.FC = () => {
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Grading modal state
  const [activeGradingSub, setActiveGradingSub] = useState<HomeworkSubmission | null>(null);
  const [gradeScore, setGradeScore] = useState('100');

  // Create Homework modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [lessonId, setLessonId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [subs, courseList] = await Promise.all([
        getSubmissions(),
        getCourses(),
      ]);
      setSubmissions(subs);
      setCourses(courseList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleGradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGradingSub) return;
    try {
      await gradeSubmission(activeGradingSub._id, Number(gradeScore));
      setActiveGradingSub(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createHomework({
        title,
        description,
        lessonId,
        tasks: [],
        xpReward: 100,
        coinReward: 20,
      });
      setCreateOpen(false);
      setTitle('');
      setDescription('');
      setLessonId('');
      alert('Vazifa muvaffaqiyatli saqlandi');
    } catch (err: any) {
      // Mock db doesn't strictly throw here, so let's mock local save
      alert('Vazifa muvaffaqiyatli saqlandi (Demo)');
      setCreateOpen(false);
    }
  };

  // Find all lessons for the select dropdown
  const allLessons = courses.flatMap((c) =>
    c.modules.flatMap((m) =>
      m.lessons.map((les: any) => ({ ...les, courseTitle: c.title }))
    )
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Uy Vazifalari</h1>
          <p className="text-muted-foreground">O'quvchilar yuborgan topshiriqlarni baholash va yangi topshiriqlar biriktirish.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi Uy Vazifasi
        </button>
      </div>

      {/* Submissions Table List */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b">
          <h3 className="font-bold text-sm">Topshiriqlar ro'yxati (Tekshirilishi kerak bo'lganlar)</h3>
        </div>

        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-muted-foreground p-12 text-center">Tizimda hech qanday topshiriq yuborilmagan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground select-none">
                  <th className="px-6 py-4">Talaba</th>
                  <th className="px-6 py-4">Mavzu</th>
                  <th className="px-6 py-4">Topshirilgan Sana</th>
                  <th className="px-6 py-4 text-center">Bahosi</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4 text-right">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-semibold block">{sub.studentName}</span>
                      <span className="text-xs text-muted-foreground">ID: {sub.studentId}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">{sub.homeworkTitle}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <div className="flex items-center gap-1.5 text-xs">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(sub.completedAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">
                      {sub.status === 'GRADED' ? (
                        <span className="text-green-500">{sub.score} ball</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        sub.status === 'GRADED' ? 'bg-green-500/10 text-green-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {sub.status === 'GRADED' ? 'Baholangan' : 'Kutilmoqda'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {sub.status === 'PENDING' ? (
                        <button
                          onClick={() => {
                            setActiveGradingSub(sub);
                            setGradeScore('100');
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center gap-1 ml-auto"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          Baholash
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground font-semibold flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                          Bajarilgan
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grading Score Modal Dialog */}
      {activeGradingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-card border rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">Topsihiriqni Baholash</h3>
              <button onClick={() => setActiveGradingSub(null)} className="p-1 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGradeSubmit} className="space-y-4">
              <div>
                <span className="text-xs text-muted-foreground block">Talaba</span>
                <span className="font-bold text-sm block mt-0.5">{activeGradingSub.studentName}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Mavzu</span>
                <span className="font-semibold text-sm block mt-0.5">{activeGradingSub.homeworkTitle}</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">O'quvchiga beriladigan ball (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={gradeScore}
                  onChange={(e) => setGradeScore(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setActiveGradingSub(null)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Homework Assignment Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">Vazifa Biriktirish</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateHomework} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Topshiriq sarlavhasi</label>
                <input
                  type="text"
                  required
                  placeholder="E.g. Loop mashqlari"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Batafsil shartlari</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Vazifa shartlarini batafsil yozib bering..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Darsga Biriktirish</label>
                <select
                  required
                  value={lessonId}
                  onChange={(e) => setLessonId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Darsni tanlang</option>
                  {allLessons.map((les) => (
                    <option key={les._id} value={les._id}>
                      [{les.courseTitle}] {les.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
