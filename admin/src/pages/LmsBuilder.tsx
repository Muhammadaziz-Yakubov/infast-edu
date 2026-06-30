import React, { useEffect, useState } from 'react';
import { getCourses, createModule, createLesson, updateCourseModules, importCourse, updateLesson } from '../api/courses';
import { getGroups, getGroupModules, cloneCourseLmsToGroup } from '../api/groups';
import type { Course } from '../utils/mockDb';
import {
  Layers,
  Code,
  Plus,
  BookOpen,
  HelpCircle,
  Save,
  ListTodo,
  GripVertical,
  Upload,
  Edit2,
} from 'lucide-react';

export const LmsBuilder: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Group LMS Builder state
  const [builderMode, setBuilderMode] = useState<'COURSE' | 'GROUP'>('COURSE');
  const [allGroupsList, setAllGroupsList] = useState<any[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groupModules, setGroupModules] = useState<any[]>([]);
  const [isCustomGroupLms, setIsCustomGroupLms] = useState(false);
  const [cloneSourceId, setCloneSourceId] = useState<string>('COURSE');
  
  // Group lock & start lesson state (Removed as requested)

  // LMS Navigation pointers
  const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
  const [activeLesson, setActiveLesson] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Drag and Drop reordering state
  const [draggedModuleId, setDraggedModuleId] = useState<string | null>(null);
  const [draggedLessonId, setDraggedLessonId] = useState<string | null>(null);

  // Creation forms states
  const [moduleTitle, setModuleTitle] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDesc, setLessonDesc] = useState('');

  // Practice task creator state
  const [practiceTitle, setPracticeTitle] = useState('');
  const [practiceDesc, setPracticeDesc] = useState('');
  const [practiceLang, setPracticeLang] = useState('html');
  const [practiceStarter, setPracticeStarter] = useState('');
  const [practiceRules, setPracticeRules] = useState('');
  const [practiceXp, setPracticeXp] = useState(50);
  const [practiceCoins, setPracticeCoins] = useState(10);

  // Quiz creator state
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>(['', '', '', '']);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState(0);
  const [quizRound, setQuizRound] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesData, groupsData] = await Promise.all([
        getCourses(),
        getGroups(),
      ]);

      if (Array.isArray(coursesData)) {
        setCourses(coursesData);
        if (coursesData.length > 0) {
          setSelectedCourse(prev => {
            const refreshed = coursesData.find(c => c._id === prev?._id);
            return refreshed || coursesData[0];
          });
        }
      }

      if (Array.isArray(groupsData)) {
        setAllGroupsList(groupsData);
      }
    } catch (e: any) {
      console.error('loadData error:', e);
      alert(`Ma'lumotlarni yuklashda xatolik: ${e?.response?.data?.message || e?.message || 'Noma\'lum xato'}`);
    } finally {
      setLoading(false);
    }
  };

  const loadGroupModules = async (groupId: string) => {
    if (!groupId) return;
    setLoading(true);
    try {
      const data = await getGroupModules(groupId);
      setGroupModules(data);
      const hasCustom = data.some(m => m.groupId);
      setIsCustomGroupLms(hasCustom);
    } catch (e: any) {
      console.error('loadGroupModules error:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshBuilderData = async () => {
    if (builderMode === 'COURSE') {
      await loadData();
    } else if (selectedGroupId) {
      await loadGroupModules(selectedGroupId);
    }
  };

  useEffect(() => {
    if (builderMode === 'GROUP' && selectedGroupId) {
      loadGroupModules(selectedGroupId);
    }
  }, [selectedGroupId, builderMode]);





  const handleImportJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        if (!json.title || !json.description) {
          alert("Xato JSON formati: Kursda 'title' va 'description' bo'lishi shart.");
          return;
        }

        const confirmImport = window.confirm(`"${json.title}" kursini import qilishni xohlaysizmi? Bu yangi kurs, modullar va darslarni avtomatik ravishda yaratadi.`);
        if (!confirmImport) return;

        setLoading(true);
        const imported = await importCourse(json);
        alert("Kurs muvaffaqiyatli import qilindi!");
        
        const updatedCourses = await getCourses();
        setCourses(updatedCourses);
        const matched = updatedCourses.find(c => c._id === imported._id);
        if (matched) {
          setSelectedCourse(matched);
        } else if (updatedCourses.length > 0) {
          setSelectedCourse(updatedCourses[0]);
        }
        
        setActiveModuleId(null);
        setActiveLesson(null);
      } catch (err: any) {
        console.error(err);
        const errMsg = err.response?.data?.message || err.message || 'JSON formati xato';
        alert(`Import qilishda xatolik yuz berdi: ${errMsg}`);
      } finally {
        setLoading(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleAddModule = async () => {
    if (!moduleTitle) return;
    if (builderMode === 'COURSE' && !selectedCourse) return;
    if (builderMode === 'GROUP' && !selectedGroupId) return;

    try {
      await createModule({
        courseId: builderMode === 'COURSE' ? selectedCourse?._id : undefined,
        groupId: builderMode === 'GROUP' ? selectedGroupId : undefined,
        title: moduleTitle,
      });
      setModuleTitle('');
      await refreshBuilderData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAddLesson = async () => {
    if (!activeModuleId || !lessonTitle) return;
    try {
      const newLesson = await createLesson({
        moduleId: activeModuleId,
        title: lessonTitle,
        description: lessonDesc,
        practice: practiceTitle ? {
          title: practiceTitle,
          description: practiceDesc,
          language: practiceLang,
          starterCode: practiceStarter,
          validationType: 'contains',
          validationRules: practiceRules.split(',').map(r => r.trim()).filter(Boolean),
          xpReward: Number(practiceXp),
          coinReward: Number(practiceCoins)
        } : undefined,
        quiz: quizzes,
      });
      setLessonTitle('');
      setLessonDesc('');
      setPracticeTitle('');
      setPracticeDesc('');
      setPracticeLang('html');
      setPracticeStarter('');
      setPracticeRules('');
      setPracticeXp(50);
      setPracticeCoins(10);
      setQuizzes([]);
      setQuizRound(1);
      await refreshBuilderData();
      
      // Select the newly created lesson
      setActiveLesson(newLesson);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const startEditing = () => {
    if (!activeLesson) return;
    setLessonTitle(activeLesson.title || '');
    setLessonDesc(activeLesson.description || '');
    if (activeLesson.practice) {
      setPracticeTitle(activeLesson.practice.title || '');
      setPracticeDesc(activeLesson.practice.description || '');
      setPracticeLang(activeLesson.practice.language || 'html');
      setPracticeStarter(activeLesson.practice.starterCode || '');
      setPracticeRules(activeLesson.practice.validationRules?.join(', ') || '');
      setPracticeXp(activeLesson.practice.xpReward || 50);
      setPracticeCoins(activeLesson.practice.coinReward || 10);
    } else {
      setPracticeTitle('');
      setPracticeDesc('');
      setPracticeLang('html');
      setPracticeStarter('');
      setPracticeRules('');
      setPracticeXp(50);
      setPracticeCoins(10);
    }
    setQuizzes(activeLesson.quiz || []);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!activeLesson || !lessonTitle) return;
    try {
      const updatedLesson = await updateLesson(activeLesson._id, {
        title: lessonTitle,
        description: lessonDesc,
        practice: practiceTitle ? {
          title: practiceTitle,
          description: practiceDesc,
          language: practiceLang,
          starterCode: practiceStarter,
          validationType: 'contains',
          validationRules: practiceRules.split(',').map(r => r.trim()).filter(Boolean),
          xpReward: Number(practiceXp),
          coinReward: Number(practiceCoins)
        } : null,
        quiz: quizzes,
      });

      setIsEditing(false);
      await refreshBuilderData();
      
      // Update the active lesson to reflect the edits
      setActiveLesson(updatedLesson);
    } catch (err: any) {
      alert(err.message || 'Saqlashda xatolik yuz berdi');
    }
  };

  const addQuizQuestion = () => {
    if (!quizQuestion || quizOptions.some(opt => opt === '')) {
      alert('Iltimos, test savoli va barcha javob variantlarini to\'ldiring');
      return;
    }
    const newQuiz = {
      question: quizQuestion,
      options: [...quizOptions],
      correctAnswerIndex: quizCorrectIndex,
      round: quizRound,
    };
    setQuizzes([...quizzes, newQuiz]);
    
    // Clear input
    setQuizQuestion('');
    setQuizOptions(['', '', '', '']);
    setQuizCorrectIndex(0);
  };

  const activeModules = builderMode === 'COURSE' 
    ? (selectedCourse?.modules || []) 
    : groupModules;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">LMS Builder</h1>
          <p className="text-muted-foreground">Kurs mavzulari, amaliy topshiriqlar va quiz testlarini tuzish ish stoli.</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="json-import-input"
            accept=".json"
            onChange={handleImportJson}
            className="hidden"
          />
          <label
            htmlFor="json-import-input"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer text-sm"
          >
            <Upload className="w-4 h-4" />
            Import JSON
          </label>
        </div>
      </div>

      {/* Select Course or Group dropdown */}
      <div className="flex flex-wrap items-center gap-6 bg-card border p-4 rounded-xl shadow-sm">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-muted-foreground">Tahrirlash turi:</span>
          <select
            value={builderMode}
            onChange={(e) => {
              const val = e.target.value as 'COURSE' | 'GROUP';
              setBuilderMode(val);
              setActiveModuleId(null);
              setActiveLesson(null);
            }}
            className="text-sm rounded-lg border bg-background px-2.5 py-1.5 focus:ring-1 focus:ring-primary outline-none font-bold"
          >
            <option value="COURSE">Kurs (Shablon)</option>
            <option value="GROUP">Guruh (Individual)</option>
          </select>
        </div>

        {builderMode === 'COURSE' ? (
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary shrink-0" />
            <span className="font-semibold text-sm">Kurs:</span>
            <select
              value={selectedCourse?._id || ''}
              onChange={(e) => {
                const course = courses.find((c) => c._id === e.target.value);
                setSelectedCourse(course || null);
                setActiveModuleId(null);
                setActiveLesson(null);
              }}
              className="text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
            >
              {courses.map((c) => (
                <option key={c._id} value={c._id}>{c.title}</option>
              ))}
            </select>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary shrink-0" />
            <span className="font-semibold text-sm">Guruh:</span>
            <select
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                setActiveModuleId(null);
                setActiveLesson(null);
              }}
              className="text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="">Guruhni tanlang...</option>
              {allGroupsList.map((g) => (
                <option key={g._id} value={g._id}>{g.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[550px]">
        
        {/* Left Side: Module & Lesson Outline tree */}
        <div className="lg:col-span-4 bg-card border rounded-xl shadow-sm p-4 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-sm text-foreground flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              {builderMode === 'COURSE' ? 'Kurs modullari' : 'Guruh modullari (Mavzular)'}
            </h3>
          </div>

          {builderMode === 'GROUP' && selectedGroupId && !isCustomGroupLms && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs space-y-3">
              <p className="font-semibold text-amber-600">
                Ushbu guruh hozirda umumiy kurs shablonidan foydalanmoqda.
              </p>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground">Mavzular andozasini tanlang:</label>
                <select
                  value={cloneSourceId}
                  onChange={(e) => setCloneSourceId(e.target.value)}
                  className="w-full text-xs rounded border bg-background px-2.5 py-1.5 focus:ring-1 focus:ring-primary outline-none"
                >
                  <option value="COURSE">Kurs shabloni (Andoza)</option>
                  {allGroupsList
                    .filter((g) => g._id !== selectedGroupId)
                    .map((g) => (
                      <option key={g._id} value={g._id}>
                        {g.name} guruhining darslari nusxasi
                      </option>
                    ))}
                </select>
              </div>

              <button
                onClick={async () => {
                  const confirmClone = window.confirm(
                    "Ishonchingiz komilmi? Bu amal tanlangan manbadan barcha darslarni ushbu guruhga nusxalaydi."
                  );
                  if (!confirmClone) return;
                  setLoading(true);
                  try {
                    const sourceGroupIdParam = cloneSourceId === 'COURSE' ? undefined : cloneSourceId;
                    await cloneCourseLmsToGroup(selectedGroupId, sourceGroupIdParam);
                    alert("Darslar guruhga muvaffaqiyatli nusxalandi!");
                    await loadGroupModules(selectedGroupId);
                  } catch (e: any) {
                    alert("Xatolik: " + (e.response?.data?.message || e.message));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full bg-amber-500 text-white font-bold py-1.5 px-3 rounded hover:bg-amber-600 transition-all text-center"
              >
                Guruh uchun alohida yaratish
              </button>
            </div>
          )}

          {activeModules.length === 0 ? (
            <p className="text-xs text-muted-foreground py-6 text-center">Modullar mavjud emas.</p>
          ) : (
            <div className="space-y-4">
              {activeModules.map((mod) => (
                <div key={mod._id} className="space-y-2">
                  <div
                    onClick={() => setActiveModuleId(mod._id)}
                    draggable
                    onDragStart={() => setDraggedModuleId(mod._id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={async (e) => {
                      e.preventDefault();
                      if (!draggedModuleId || draggedModuleId === mod._id) return;
                      const modules = [...activeModules];
                      const dragIdx = modules.findIndex((m) => m._id === draggedModuleId);
                      const hoverIdx = modules.findIndex((m) => m._id === mod._id);
                      if (dragIdx !== -1 && hoverIdx !== -1) {
                        const [removed] = modules.splice(dragIdx, 1);
                        modules.splice(hoverIdx, 0, removed);
                        modules.forEach((m, idx) => {
                          m.order = idx + 1;
                        });
                        const targetId = builderMode === 'COURSE' ? selectedCourse?._id : selectedGroupId;
                        if (!targetId) return;
                        await updateCourseModules(targetId, modules);
                        await refreshBuilderData();
                      }
                      setDraggedModuleId(null);
                    }}
                    className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition-colors ${
                      activeModuleId === mod._id ? 'border-primary bg-primary/[0.02]' : 'hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <GripVertical className="w-3.5 h-3.5 text-muted-foreground shrink-0 cursor-grab active:cursor-grabbing" />
                      <span className="text-xs font-bold text-foreground line-clamp-1">{mod.title}</span>
                    </div>
                    <span title="Dars qo'shish" className="flex items-center shrink-0">
                      <Plus
                        className="w-3.5 h-3.5 text-muted-foreground hover:text-primary cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveModuleId(mod._id);
                          setActiveLesson({ _new: true });
                        }}
                      />
                    </span>
                  </div>

                  <div className="pl-3 space-y-1">
                    {mod.lessons.map((les: any) => {
                      const isSelected = activeLesson?._id === les._id;

                      return (
                        <div
                          key={les._id}
                          onClick={() => {
                            setActiveModuleId(mod._id);
                            setActiveLesson(les);
                            setIsEditing(false);
                          }}
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            setDraggedLessonId(les._id);
                            setActiveModuleId(mod._id);
                          }}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (!draggedLessonId || draggedLessonId === les._id || !activeModuleId) return;
                            const modules = [...activeModules];
                            const mIdx = modules.findIndex((m) => m._id === activeModuleId);
                            if (mIdx === -1) return;
                            const lessons = [...modules[mIdx].lessons];
                            const dragIdx = lessons.findIndex((l) => l._id === draggedLessonId);
                            const hoverIdx = lessons.findIndex((l) => l._id === les._id);
                            if (dragIdx !== -1 && hoverIdx !== -1) {
                              const [removed] = lessons.splice(dragIdx, 1);
                              lessons.splice(hoverIdx, 0, removed);
                              lessons.forEach((l, idx) => {
                                l.order = idx + 1;
                              });
                              modules[mIdx].lessons = lessons;
                              const targetId = builderMode === 'COURSE' ? selectedCourse?._id : selectedGroupId;
                              if (!targetId) return;
                              await updateCourseModules(targetId, modules);
                              await refreshBuilderData();
                            }
                            setDraggedLessonId(null);
                          }}
                          className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs cursor-pointer transition-colors border border-transparent ${
                            isSelected ? 'bg-secondary text-primary font-semibold border-border' : 'text-muted-foreground hover:bg-secondary/30 hover:text-foreground'
                          }`}
                        >
                          <GripVertical className="w-3 h-3 text-muted-foreground/60 shrink-0 cursor-grab" />
                          <Code className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                          <span className="truncate">{les.title}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add Module Input */}
          <div className="pt-4 border-t flex gap-2">
            <input
              type="text"
              placeholder="Yangi modul nomi..."
              value={moduleTitle}
              onChange={(e) => setModuleTitle(e.target.value)}
              className="flex-1 border rounded-lg px-2.5 py-1.5 text-xs bg-background outline-none"
            />
            <button
              onClick={handleAddModule}
              className="p-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all shadow-sm"
              title="Modul yaratish"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Side: Workspace Panel */}
        <div className="lg:col-span-8 bg-card border rounded-xl shadow-sm overflow-hidden flex flex-col">
          {activeLesson ? (
            <div className="p-6 flex-1 overflow-y-auto space-y-6 max-h-[700px]">
              {activeLesson._new ? (
                // Add Lesson Workspace Form
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">Yangi Dars Qo'shish</h3>
                    <p className="text-xs text-muted-foreground">Tanlangan modul uchun yangi amaliy darslik va savollar yarating.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Dars nomi</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. HTML Kirish"
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Dars tavsifi</label>
                        <input
                          type="text"
                          placeholder="Dars haqida qisqacha ma'lumot..."
                          value={lessonDesc}
                          onChange={(e) => setLessonDesc(e.target.value)}
                          className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Practice Task Fields */}
                    <div className="border rounded-xl p-4 space-y-4 bg-secondary/10">
                      <h4 className="font-bold text-xs flex items-center gap-1.5 text-primary uppercase tracking-wider">
                        <Code className="w-4 h-4" />
                        💻 Amaliyot Topshirig'i (Practice Task)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Topshiriq nomi</label>
                          <input
                            type="text"
                            placeholder="E.g. H1 element yarating"
                            value={practiceTitle}
                            onChange={(e) => setPracticeTitle(e.target.value)}
                            className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Dasturlash tili</label>
                          <select
                            value={practiceLang}
                            onChange={(e) => setPracticeLang(e.target.value)}
                            className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                          >
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="javascript">JavaScript</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Topshiriq tavsifi (Yo'riqnoma)</label>
                        <textarea
                          rows={2}
                          placeholder="Topshiriq shartlarini yozing..."
                          value={practiceDesc}
                          onChange={(e) => setPracticeDesc(e.target.value)}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Boshlang'ich kod (Starter Code)</label>
                        <textarea
                          rows={2}
                          placeholder="Talaba muharrirni ochganda chiqadigan kod..."
                          value={practiceStarter}
                          onChange={(e) => setPracticeStarter(e.target.value)}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none font-mono resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Validation qoidalari (Tekshirish so'zlari, vergul bilan ajrating)</label>
                        <input
                          type="text"
                          placeholder="E.g. <h1>, </h1>, Salom"
                          value={practiceRules}
                          onChange={(e) => setPracticeRules(e.target.value)}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">XP Mukofot</label>
                          <input
                            type="number"
                            value={practiceXp}
                            onChange={(e) => setPracticeXp(Number(e.target.value))}
                            className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Coin Mukofot</label>
                          <input
                            type="number"
                            value={practiceCoins}
                            onChange={(e) => setPracticeCoins(Number(e.target.value))}
                            className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quiz editor within creation form */}
                    <div className="border rounded-xl p-4 space-y-4 bg-secondary/10">
                      <h4 className="font-bold text-xs flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        Quiz Test Savollarini Yaratish ({quizzes.length} ta)
                      </h4>

                      {quizzes.length > 0 && (
                        <div className="space-y-2 border-b pb-3">
                          {quizzes.map((q, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-card p-2 border rounded-lg text-xs">
                              <div>
                                <span className="font-semibold block">{idx + 1}. {q.question}</span>
                                <span className="text-muted-foreground">Raund: {q.round || 1} | Variant: {q.options[q.correctAnswerIndex]}</span>
                              </div>
                              <button
                                onClick={() => setQuizzes(quizzes.filter((_, i) => i !== idx))}
                                className="text-destructive hover:underline text-[10px]"
                              >
                                O'chirish
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-3">
                        <input
                           type="text"
                           placeholder="Test savoli..."
                           value={quizQuestion}
                           onChange={(e) => setQuizQuestion(e.target.value)}
                           className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                           {quizOptions.map((opt, oIdx) => (
                             <input
                               key={oIdx}
                               type="text"
                               placeholder={`Variant ${oIdx + 1}...`}
                               value={opt}
                               onChange={(e) => {
                                 const list = [...quizOptions];
                                 list[oIdx] = e.target.value;
                                 setQuizOptions(list);
                               }}
                               className="border rounded-lg p-2 text-xs bg-background outline-none"
                             />
                           ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">To'g'ri javob indexi:</span>
                          <select
                            value={quizCorrectIndex}
                            onChange={(e) => setQuizCorrectIndex(Number(e.target.value))}
                            className="border rounded px-2 py-1 text-xs bg-background outline-none"
                          >
                            <option value={0}>Variant 1</option>
                            <option value={1}>Variant 2</option>
                            <option value={2}>Variant 3</option>
                            <option value={3}>Variant 4</option>
                          </select>

                          <span className="text-xs text-muted-foreground ml-2">Raund:</span>
                          <select
                            value={quizRound}
                            onChange={(e) => setQuizRound(Number(e.target.value))}
                            className="border rounded px-2 py-1 text-xs bg-background outline-none w-24"
                          >
                            <option value={1}>1-Raund</option>
                            <option value={2}>2-Raund</option>
                            <option value={3}>3-Raund</option>
                            <option value={4}>4-Raund</option>
                            <option value={5}>5-Raund</option>
                          </select>

                          <button
                            type="button"
                            onClick={addQuizQuestion}
                            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-secondary text-primary hover:bg-secondary/70 transition-all border"
                          >
                            Savolni Qo'shish
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        onClick={() => setActiveLesson(null)}
                        className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                      >
                        Bekor qilish
                      </button>
                      <button
                        onClick={handleAddLesson}
                        className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        Darsni Saqlash
                      </button>
                    </div>
                  </div>
                </div>
              ) : isEditing ? (
                // Edit Lesson Workspace Form
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold">Darsni Tahrirlash</h3>
                    <p className="text-xs text-muted-foreground">Dars, amaliy topshiriq va quiz testlarini tahrirlang.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Dars nomi</label>
                        <input
                          type="text"
                          required
                          placeholder="E.g. HTML Kirish"
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Dars tavsifi</label>
                        <input
                          type="text"
                          placeholder="Dars haqida qisqacha ma'lumot..."
                          value={lessonDesc}
                          onChange={(e) => setLessonDesc(e.target.value)}
                          className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                        />
                      </div>
                    </div>

                    {/* Practice Task Fields */}
                    <div className="border rounded-xl p-4 space-y-4 bg-secondary/10">
                      <h4 className="font-bold text-xs flex items-center gap-1.5 text-primary uppercase tracking-wider">
                        <Code className="w-4 h-4" />
                        💻 Amaliyot Topshirig'i (Practice Task)
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Topshiriq nomi</label>
                          <input
                            type="text"
                            placeholder="E.g. H1 element yarating"
                            value={practiceTitle}
                            onChange={(e) => setPracticeTitle(e.target.value)}
                            className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Dasturlash tili</label>
                          <select
                            value={practiceLang}
                            onChange={(e) => setPracticeLang(e.target.value)}
                            className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                          >
                            <option value="html">HTML</option>
                            <option value="css">CSS</option>
                            <option value="javascript">JavaScript</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Topshiriq tavsifi (Yo'riqnoma)</label>
                        <textarea
                          rows={2}
                          placeholder="Topshiriq shartlarini yozing..."
                          value={practiceDesc}
                          onChange={(e) => setPracticeDesc(e.target.value)}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Boshlang'ich kod (Starter Code)</label>
                        <textarea
                          rows={2}
                          placeholder="Talaba muharrirni ochganda chiqadigan kod..."
                          value={practiceStarter}
                          onChange={(e) => setPracticeStarter(e.target.value)}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none font-mono resize-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-muted-foreground">Validation qoidalari (Tekshirish so'zlari, vergul bilan ajrating)</label>
                        <input
                          type="text"
                          placeholder="E.g. <h1>, </h1>, Salom"
                          value={practiceRules}
                          onChange={(e) => setPracticeRules(e.target.value)}
                          className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">XP Mukofot</label>
                          <input
                            type="number"
                            value={practiceXp}
                            onChange={(e) => setPracticeXp(Number(e.target.value))}
                            className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-semibold text-muted-foreground">Coin Mukofot</label>
                          <input
                            type="number"
                            value={practiceCoins}
                            onChange={(e) => setPracticeCoins(Number(e.target.value))}
                            className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Quiz editor within creation form */}
                    <div className="border rounded-xl p-4 space-y-4 bg-secondary/10">
                      <h4 className="font-bold text-xs flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        Quiz Test Savollarini Yaratish ({quizzes.length} ta)
                      </h4>

                      {quizzes.length > 0 && (
                        <div className="space-y-2 border-b pb-3">
                          {quizzes.map((q, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-card p-2 border rounded-lg text-xs">
                              <div>
                                <span className="font-semibold block">{idx + 1}. {q.question}</span>
                                <span className="text-muted-foreground">Raund: {q.round || 1} | Variant: {q.options[q.correctAnswerIndex]}</span>
                              </div>
                              <button
                                onClick={() => setQuizzes(quizzes.filter((_, i) => i !== idx))}
                                className="text-destructive hover:underline text-[10px]"
                              >
                                O'chirish
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-3">
                        <input
                           type="text"
                           placeholder="Test savoli..."
                           value={quizQuestion}
                           onChange={(e) => setQuizQuestion(e.target.value)}
                           className="w-full border rounded-lg p-2 text-xs bg-background outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                           {quizOptions.map((opt, oIdx) => (
                             <input
                               key={oIdx}
                               type="text"
                               placeholder={`Variant ${oIdx + 1}...`}
                               value={opt}
                               onChange={(e) => {
                                 const list = [...quizOptions];
                                 list[oIdx] = e.target.value;
                                 setQuizOptions(list);
                               }}
                               className="border rounded-lg p-2 text-xs bg-background outline-none"
                             />
                           ))}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground">To'g'ri javob indexi:</span>
                          <select
                            value={quizCorrectIndex}
                            onChange={(e) => setQuizCorrectIndex(Number(e.target.value))}
                            className="border rounded px-2 py-1 text-xs bg-background outline-none"
                          >
                            <option value={0}>Variant 1</option>
                            <option value={1}>Variant 2</option>
                            <option value={2}>Variant 3</option>
                            <option value={3}>Variant 4</option>
                          </select>

                          <span className="text-xs text-muted-foreground ml-2">Raund:</span>
                          <select
                            value={quizRound}
                            onChange={(e) => setQuizRound(Number(e.target.value))}
                            className="border rounded px-2 py-1 text-xs bg-background outline-none w-24"
                          >
                            <option value={1}>1-Raund</option>
                            <option value={2}>2-Raund</option>
                            <option value={3}>3-Raund</option>
                            <option value={4}>4-Raund</option>
                            <option value={5}>5-Raund</option>
                          </select>

                          <button
                            type="button"
                            onClick={addQuizQuestion}
                            className="ml-auto flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded bg-secondary text-primary hover:bg-secondary/70 transition-all border"
                          >
                            Savolni Qo'shish
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        onClick={() => setIsEditing(false)}
                        className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                      >
                        Bekor qilish
                      </button>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-2 shadow-sm"
                      >
                        <Save className="w-4 h-4" />
                        Saqlash
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // View Lesson Details
                <div className="space-y-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-xl font-bold">{activeLesson.title}</h3>
                      <p className="text-xs text-muted-foreground">{activeLesson.description || 'Tavsif kiritilmagan'}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">Tartib raqami: #{activeLesson.order}</p>
                    </div>
                    <button
                      onClick={startEditing}
                      className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold hover:bg-secondary text-foreground transition-all shadow-sm shrink-0"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-primary" />
                      Tahrirlash
                    </button>
                  </div>

                  {activeLesson.practice && (
                    <div className="space-y-4 border-t pt-4">
                      <span className="text-xs text-muted-foreground font-semibold uppercase block flex items-center gap-1">
                        <Code className="w-4 h-4 text-primary" />
                        Amaliyot Topshirig'i (Practice Task)
                      </span>
                      <div className="p-4 border rounded-xl bg-secondary/15 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-sm text-foreground">{activeLesson.practice.title}</span>
                          <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold">
                            {activeLesson.practice.language?.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{activeLesson.practice.description}</p>
                        
                        {activeLesson.practice.starterCode && (
                          <div className="space-y-1">
                            <span className="text-[10px] text-muted-foreground font-semibold">Starter Code:</span>
                            <pre className="p-2.5 bg-background rounded border text-xs font-mono">
                              {activeLesson.practice.starterCode}
                            </pre>
                          </div>
                        )}

                        <div className="flex flex-wrap gap-4 text-xs pt-2 border-t mt-2">
                          <div>
                            <span className="text-muted-foreground">Validation Rules: </span>
                            <span className="font-semibold text-foreground">
                              {activeLesson.practice.validationRules?.join(', ') || 'yo\'q'}
                            </span>
                          </div>
                          <div className="ml-auto flex gap-3">
                            <span className="text-primary font-bold">+{activeLesson.practice.xpReward || 50} XP</span>
                            <span className="text-amber-500 font-bold">+{activeLesson.practice.coinReward || 10} Coins</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeLesson.quiz && activeLesson.quiz.length > 0 && (
                    <div className="space-y-4 border-t pt-4">
                      <span className="text-xs text-muted-foreground font-semibold uppercase block flex items-center gap-1">
                        <ListTodo className="w-4 h-4" />
                        Quiz test savollari ({activeLesson.quiz.length} ta)
                      </span>
                      <div className="space-y-3">
                        {activeLesson.quiz.map((q: any, qIdx: number) => (
                          <div key={qIdx} className="p-4 border rounded-xl bg-secondary/15 space-y-2.5">
                            <div className="flex justify-between items-center mb-1">
                              <p className="font-semibold text-sm">{qIdx + 1}. {q.question}</p>
                              <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Raund: {q.round || 1}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {q.options.map((opt: string, optIdx: number) => (
                                <div
                                  key={optIdx}
                                  className={`p-2 border rounded-lg ${
                                    optIdx === q.correctAnswerIndex
                                      ? 'bg-green-500/10 border-green-500/30 text-green-500 font-semibold'
                                      : 'bg-card text-muted-foreground'
                                  }`}
                                >
                                  {opt} {optIdx === q.correctAnswerIndex && '✓'}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 text-muted-foreground/50 mb-3 animate-pulse" />
              <h3 className="font-semibold text-base">Hujjat ish stoli bo'sh</h3>
              <p className="text-xs max-w-sm mt-1">Darslar tarkibi va savollarni ko'rish yoki tahrirlash uchun chap tarafdan darsni bosing.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
