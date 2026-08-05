import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  importCourse,
} from '../api/courses';
import {
  FileCode,
  Plus,
  Upload,
  Download,
  Copy,
  Check,
  Trash2,
  Edit,
  ExternalLink,
  BookOpen,
  Layers,
  HelpCircle,
  Search,
  Sparkles,
  RefreshCw,
  X,
  AlertCircle,
  FileJson,
} from 'lucide-react';

const SAMPLE_JSON_SPEC = {
  title: "Frontend Development",
  description: "HTML, CSS va JavaScript asoslarini o'rganish kursi shabloni",
  price: 300000,
  duration: "6 oy",
  level: "Frontend Asoslari",
  status: "ACTIVE",
  thumbnail: "",
  modules: [
    {
      title: "1-Modul: HTML Asoslari",
      order: 1,
      lessons: [
        {
          title: "1-Dars: HTML Kirish va Tuzilishi",
          description: "HTML hujjati strukturasini o'rganish",
          order: 1,
          practice: {
            title: "HTML Kirish va Tuzilishi elementlarini yarating",
            description: "Ushbu mashqda HTML Kirish va Tuzilishi bo'yicha berilgan boshlang'ich koddan foydalanib, shartlarni bajaring va kod yozing.",
            language: "html",
            starterCode: "<!-- HTML tuzilishini yarating -->",
            validationType: "contains",
            validationRules: [
              "<html>",
              "</html>",
              "<head>",
              "<body>"
            ],
            xpReward: 50,
            coinReward: 10
          },
          quiz: {
            passingScore: 80,
            questions: [
              {
                question: "HTML Kirish va Tuzilishi mavzusida asosan nima o'rganiladi?",
                options: [
                  "Mavzuning asosiy sintaksisi va qo'llanish doirasi",
                  "Faqat ma'lumotlar bazasi bilan ishlash",
                  "Faqat server sozlamalari",
                  "Dizayn loyihalash bosqichlari"
                ],
                correctAnswer: 0,
                round: 1
              },
              {
                question: "Quyidagilardan qaysi biri to'g'ri HTML elementi?",
                options: [
                  "<selector>",
                  "<div class='test'>",
                  "<property: value>",
                  "function() {}"
                ],
                correctAnswer: 1,
                round: 1
              }
            ]
          }
        }
      ]
    }
  ]
};

export const CourseTemplates: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState('ALL');

  // Modals state
  const [showSampleModal, setShowSampleModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  // Import state
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [copiedSample, setCopiedSample] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    duration: '6 oy',
    level: 'Asosiy',
    status: 'ACTIVE',
    thumbnail: '',
  });

  const loadCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);
    } catch (err: any) {
      console.error('Kurslarni yuklashda xatolik:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCopySample = () => {
    navigator.clipboard.writeText(JSON.stringify(SAMPLE_JSON_SPEC, null, 2));
    setCopiedSample(true);
    setTimeout(() => setCopiedSample(false), 2000);
  };

  const handleDownloadSample = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(SAMPLE_JSON_SPEC, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "lms_course_template_namuna.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCourseJson = (course: any) => {
    // Format course as export JSON
    const exportData = {
      title: course.title,
      description: course.description || '',
      price: course.price || 0,
      duration: course.duration || '',
      level: course.level || '',
      status: course.status || 'ACTIVE',
      thumbnail: course.thumbnail || '',
      modules: (course.modules || []).map((m: any, mIdx: number) => ({
        title: m.title,
        order: mIdx + 1,
        lessons: (m.lessons || []).map((l: any, lIdx: number) => ({
          title: l.title,
          description: l.description || '',
          order: lIdx + 1,
          practice: l.practice ? {
            title: l.practice.title,
            description: l.practice.description || '',
            language: l.practice.language || 'html',
            starterCode: l.practice.starterCode || '',
            validationType: l.practice.validationType || 'contains',
            validationRules: l.practice.validationRules || [],
            xpReward: l.practice.xpReward ?? 50,
            coinReward: l.practice.coinReward ?? 10,
          } : undefined,
          quiz: l.quiz && l.quiz.length > 0 ? {
            passingScore: l.passingScore || 80,
            questions: l.quiz.map((q: any) => ({
              question: q.question,
              options: q.options || [],
              correctAnswer: q.correctAnswerIndex ?? q.correctAnswer ?? 0,
              round: q.round || 1,
            }))
          } : undefined,
        }))
      }))
    };

    const fileName = `${course.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_shablon.json`;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", fileName);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        JSON.parse(text); // validate syntax
        setImportJsonText(text);
        setImportError(null);
      } catch (err: any) {
        setImportError("JSON fayli syntax xatosiga ega. Iltimos to'g'ri JSON fayl kiriting.");
      }
    };
    reader.readAsText(file);
  };

  const handleImportSubmit = async () => {
    if (!importJsonText.trim()) {
      setImportError('Iltimos, JSON matnini kiriting yoki fayl yuklang.');
      return;
    }

    try {
      setImporting(true);
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      await importCourse(parsed);
      setShowImportModal(false);
      setImportJsonText('');
      await loadCourses();
    } catch (err: any) {
      setImportError(err?.response?.data?.message || err.message || 'Import qilishda xatolik yuz berdi.');
    } finally {
      setImporting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCourse(formData);
      setShowCreateModal(false);
      setFormData({
        title: '',
        description: '',
        price: 0,
        duration: '6 oy',
        level: 'Asosiy',
        status: 'ACTIVE',
        thumbnail: '',
      });
      await loadCourses();
    } catch (err: any) {
      alert('Yangi shablon yaratishda xatolik: ' + (err.message || 'Xato'));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    try {
      await updateCourse(editingCourse._id, formData);
      setEditingCourse(null);
      await loadCourses();
    } catch (err: any) {
      alert('Shablonni tahrirlashda xatolik: ' + (err.message || 'Xato'));
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    try {
      await deleteCourse(id);
      setDeletingCourseId(null);
      await loadCourses();
    } catch (err: any) {
      alert('Shablonni o\'chirishda xatolik: ' + (err.message || 'Xato'));
    }
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      price: course.price || 0,
      duration: course.duration || '6 oy',
      level: course.level || 'Asosiy',
      status: course.status || 'ACTIVE',
      thumbnail: course.thumbnail || '',
    });
  };

  // Filtered courses
  const filteredCourses = courses.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesLevel = levelFilter === 'ALL' || c.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  // Calculate statistics
  const totalModulesCount = courses.reduce((acc, c) => acc + (c.modules?.length || 0), 0);
  const totalLessonsCount = courses.reduce((acc, c) => {
    return acc + (c.modules?.reduce((mAcc: number, m: any) => mAcc + (m.lessons?.length || 0), 0) || 0);
  }, 0);
  const activeCount = courses.filter((c) => c.status === 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-6 rounded-2xl shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-wide uppercase mb-1">
            <FileCode className="w-4 h-4" />
            <span>LMS Boshqaruvi</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
            Shablonlar Ro'yxati
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            LMS kursi shablonlarini boshqarish: mavjud shablonlarni ko'rish, tahrirlash, o'chirish, 
            eksport va standart JSON strukturasi asosida import qilish.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={() => setShowSampleModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs border border-border/50"
          >
            <HelpCircle className="w-4 h-4 text-primary" />
            <span>JSON Shablon Namuna</span>
          </button>

          <button
            onClick={() => {
              setImportJsonText('');
              setImportError(null);
              setShowImportModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs border border-border/50"
          >
            <Upload className="w-4 h-4 text-blue-500" />
            <span>JSON Import</span>
          </button>

          <button
            onClick={() => {
              setFormData({
                title: '',
                description: '',
                price: 0,
                duration: '6 oy',
                level: 'Asosiy',
                status: 'ACTIVE',
                thumbnail: '',
              });
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Yangi Shablon</span>
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Jami Shablonlar</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{courses.length} ta</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Jami Modullar</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{totalModulesCount} ta</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 font-bold">
            <FileCode className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Jami Darslar</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{totalLessonsCount} ta</h3>
          </div>
        </div>

        <div className="bg-card border border-border p-5 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 font-bold">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Faol Shablonlar</p>
            <h3 className="text-2xl font-black text-foreground mt-0.5">{activeCount} ta</h3>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card border border-border p-4 rounded-xl">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Shablon nomi bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-2 bg-background border border-border rounded-xl text-sm font-medium text-foreground focus:outline-none"
          >
            <option value="ALL">Barcha Darajalar</option>
            <option value="Frontend Asoslari">Frontend Asoslari</option>
            <option value="Backend Professional">Backend Professional</option>
            <option value="Asosiy">Asosiy</option>
          </select>

          <button
            onClick={loadCourses}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl transition-colors border border-border"
            title="Yangilash"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Course Templates List Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-2xl">
          <RefreshCw className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Shablonlar yuklanmoqda...</p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 bg-card border border-border rounded-2xl text-center px-4">
          <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Hech qanday shablon topilmadi</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Qidiruv shartlariga mos shablon mavjud emas yoki hali yaratilmagan.
          </p>
          <button
            onClick={() => {
              setImportJsonText('');
              setShowImportModal(true);
            }}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl"
          >
            JSON Shablon Import Qilish
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const modulesCount = course.modules?.length || 0;
            const lessonsCount =
              course.modules?.reduce((acc: number, m: any) => acc + (m.lessons?.length || 0), 0) || 0;

            return (
              <div
                key={course._id}
                className="bg-card border border-border rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
              >
                {/* Header Banner */}
                <div>
                  <div className="h-32 bg-gradient-to-br from-primary/20 via-primary/5 to-background border-b border-border/50 p-4 relative flex flex-col justify-between">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 bg-background/80 backdrop-blur-xs text-xs font-bold rounded-lg border border-border/60 text-foreground">
                        {course.level || 'Shablon'}
                      </span>

                      <span
                        className={`px-2.5 py-1 text-[11px] font-extrabold rounded-lg ${
                          course.status === 'ACTIVE'
                            ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {course.status || 'DRAFT'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground font-black text-lg flex items-center justify-center shadow-sm shrink-0">
                        {course.title.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base text-foreground truncate group-hover:text-primary transition-colors">
                          {course.title}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          {course.duration || '6 oy'} • {course.price ? `${course.price.toLocaleString()} so'm` : 'Bepul'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed min-h-[36px]">
                      {course.description || 'Shablon tavsifi kiritilmagan'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                      <div className="bg-secondary/50 p-2.5 rounded-xl flex items-center gap-2 border border-border/40">
                        <Layers className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-normal">Modullar</span>
                          <span className="text-foreground font-bold">{modulesCount} ta modul</span>
                        </div>
                      </div>

                      <div className="bg-secondary/50 p-2.5 rounded-xl flex items-center gap-2 border border-border/40">
                        <FileCode className="w-4 h-4 text-blue-500 shrink-0" />
                        <div>
                          <span className="text-[10px] text-muted-foreground block font-normal">Darslar</span>
                          <span className="text-foreground font-bold">{lessonsCount} ta dars</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="p-4 bg-secondary/30 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(course)}
                      className="p-2 text-muted-foreground hover:text-primary hover:bg-secondary rounded-xl transition-colors"
                      title="Shablon nomini va sozlamalarini tahrirlash"
                    >
                      <Edit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleExportCourseJson(course)}
                      className="p-2 text-muted-foreground hover:text-blue-500 hover:bg-secondary rounded-xl transition-colors"
                      title="JSON shablon sifatida yuklab olish"
                    >
                      <Download className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeletingCourseId(course._id)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-xl transition-colors"
                      title="Shablonni o'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    onClick={() => navigate('/lms')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground text-xs font-bold rounded-xl transition-all"
                  >
                    <span>LMS Builder</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* JSON SHABLON NAMUNASI MODAL */}
      {showSampleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <FileJson className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">JSON Shablon Namunasi</h3>
                  <p className="text-xs text-muted-foreground">Kurs va darslar shablonini yuklash uchun standart fayl formati</p>
                </div>
              </div>

              <button
                onClick={() => setShowSampleModal(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 p-4 rounded-xl text-xs space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>JSON Shablon talablari va tuzilishi:</span>
                </p>
                <ul className="list-disc list-inside space-y-0.5 ml-1 text-muted-foreground">
                  <li>Har bir kursda <code className="text-foreground font-mono font-bold">title</code> va <code className="text-foreground font-mono font-bold">description</code> majburiy.</li>
                  <li><code className="text-foreground font-mono font-bold">modules</code> massivida modullar, va ularning ichida <code className="text-foreground font-mono font-bold">lessons</code> bo'ladi.</li>
                  <li>Har bir darsda optional <code className="text-foreground font-mono font-bold">practice</code> (amaliy topshiriq) va <code className="text-foreground font-mono font-bold">quiz</code> (test savollari) bo'lishi mumkin.</li>
                  <li>Quiz dagi savollarda <code className="text-foreground font-mono font-bold">options</code> 4 ta variantdan iborat bo'ladi hamda <code className="text-foreground font-mono font-bold">correctAnswer</code> to'g'ri javob indeksini (0, 1, 2 yoki 3) ko'rsatadi.</li>
                </ul>
              </div>

              {/* Code display box */}
              <div className="relative rounded-xl border border-border bg-slate-950 p-4 font-mono text-xs text-slate-100 overflow-x-auto max-h-96">
                <pre>{JSON.stringify(SAMPLE_JSON_SPEC, null, 2)}</pre>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-secondary/30 flex items-center justify-between gap-3">
              <button
                onClick={handleCopySample}
                className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 text-xs font-bold rounded-xl transition-all cursor-pointer border border-border"
              >
                {copiedSample ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-500" />
                    <span>Nusxalandi!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Kodni Nusxalash</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadSample}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Namuna JSON Yuklab Olish</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl flex flex-col shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">JSON Shablon Import Qilish</h3>
                  <p className="text-xs text-muted-foreground">Faylni tanlang yoki JSON matnini nusxalab joylashtiring</p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {importError && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-foreground mb-2">
                  JSON Faylni Tanlang (.json):
                </label>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="w-full text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-2">
                  Yoki JSON Matnini Shu Yerga Joylang:
                </label>
                <textarea
                  rows={10}
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    setImportError(null);
                  }}
                  placeholder='{"title": "Kurs Nomi", "modules": [...] }'
                  className="w-full p-3 font-mono text-xs bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="p-4 border-t border-border bg-secondary/30 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={importing || !importJsonText.trim()}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                {importing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Import qilinmoqda...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Shablonni Saqlash</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT COURSE MODAL */}
      {(showCreateModal || editingCourse) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-lg flex flex-col shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="font-bold text-lg text-foreground">
                {editingCourse ? 'Shablonni Tahrirlash' : 'Yangi Shablon Yaratish'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingCourse(null);
                }}
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editingCourse ? handleEditSubmit : handleCreateSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Shablon Nomi *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Masalan: Fullstack Web Development"
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Tavsif</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Shablon haqida qisqacha ma'lumot..."
                  className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Daraja (Level)</label>
                  <input
                    type="text"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    placeholder="Masalan: Frontend Asoslari"
                    className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Davomiyligi</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Masalan: 6 oy"
                    className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Narx (so'm)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">Holati</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2 text-sm bg-background border border-border rounded-xl focus:outline-none"
                  >
                    <option value="ACTIVE">ACTIVE (Faol)</option>
                    <option value="DRAFT">DRAFT (Qoralama)</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCourse(null);
                  }}
                  className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold rounded-xl transition-all"
                >
                  {editingCourse ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingCourseId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-3 bg-destructive/10 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-foreground">Shablonni O'chirish</h3>
                <p className="text-xs text-muted-foreground">Ushbu shablon va undagi barhca modullar o'chiriladi</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              Haqiqatan ham ushbu kurs shablonini o'chirib tashlamoqchimisiz? Bu amalni ortga qaytarib bo'lmaydi.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingCourseId(null)}
                className="px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground"
              >
                Bekor qilish
              </button>
              <button
                onClick={() => handleDeleteConfirm(deletingCourseId)}
                className="px-5 py-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-bold rounded-xl transition-all"
              >
                Ha, O'chirish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseTemplates;
