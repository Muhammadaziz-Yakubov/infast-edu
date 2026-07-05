import React, { useEffect, useState } from 'react';
import { getGroups, getGroupProgress } from '../api/groups';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Award,
  ChevronRight,
  Search,
  Layers,
  HelpCircle,
  Flame,
} from 'lucide-react';

interface Group {
  _id: string;
  name: string;
  courseId: any;
}

export const LmsCheck: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [progressData, setProgressData] = useState<any>(null);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter tabs
  const [activeTab, setActiveTab] = useState<'matrix' | 'errors' | 'uncompleted'>('matrix');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoadingGroups(true);
    try {
      const list = await getGroups();
      setGroups(list);
      if (list.length > 0) {
        setSelectedGroupId(list[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGroups(false);
    }
  };

  useEffect(() => {
    if (selectedGroupId) {
      loadGroupProgress(selectedGroupId);
    }
  }, [selectedGroupId]);

  const loadGroupProgress = async (id: string) => {
    setLoadingProgress(true);
    try {
      const data = await getGroupProgress(id);
      setProgressData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProgress(false);
    }
  };

  const filteredStudents = progressData?.students?.filter((s: any) =>
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];


  // Statistics
  const stats = React.useMemo(() => {
    if (!progressData?.students || !progressData?.lessons || progressData.students.length === 0) {
      return { avgCompletion: 0, avgQuizScore: 0, practiceRate: 0 };
    }
    const totalStudents = progressData.students.length;
    const totalLessons = progressData.lessons.length;
    const totalPossiblePoints = totalStudents * totalLessons;

    if (totalPossiblePoints === 0) return { avgCompletion: 0, avgQuizScore: 0, practiceRate: 0 };

    let completedCount = 0;
    let practiceCompletedCount = 0;
    let quizScoreSum = 0;
    let quizTakenCount = 0;

    progressData.students.forEach((student: any) => {
      student.progress.forEach((p: any) => {
        if (p.completed) completedCount++;
        if (p.practiceCompleted) practiceCompletedCount++;
        if (p.testCompleted) {
          quizScoreSum += p.score || 0;
          quizTakenCount++;
        }
      });
    });

    return {
      avgCompletion: Math.round((completedCount / totalPossiblePoints) * 100),
      avgQuizScore: quizTakenCount > 0 ? Math.round(quizScoreSum / quizTakenCount) : 0,
      practiceRate: Math.round((practiceCompletedCount / totalPossiblePoints) * 100),
    };
  }, [progressData]);

  // Error Analysis
  const quizErrors = React.useMemo(() => {
    if (!progressData?.lessons || !progressData?.students) return [];

    const errorsList: any[] = [];

    progressData.lessons.forEach((lesson: any) => {
      if (!lesson.quiz || lesson.quiz.length === 0) return;

      lesson.quiz.forEach((questionObj: any, qIdx: number) => {
        let wrongCount = 0;
        let answeredCount = 0;

        progressData.students.forEach((student: any) => {
          const lp = student.progress.find((p: any) => p.lessonId === lesson._id);
          if (lp && lp.quizAnswers && lp.quizAnswers.length > qIdx) {
            answeredCount++;
            const studentAns = lp.quizAnswers[qIdx];
            if (studentAns !== questionObj.correctAnswerIndex) {
              wrongCount++;
            }
          }
        });

        if (answeredCount > 0) {
          errorsList.push({
            lessonId: lesson._id,
            lessonTitle: lesson.title,
            lessonOrder: lesson.order,
            questionText: questionObj.question,
            options: questionObj.options,
            correctAnswerIndex: questionObj.correctAnswerIndex,
            correctAnswerText: questionObj.options[questionObj.correctAnswerIndex],
            wrongCount,
            answeredCount,
            errorPercentage: Math.round((wrongCount / answeredCount) * 100),
          });
        }
      });
    });

    return errorsList.sort((a, b) => b.errorPercentage - a.errorPercentage);
  }, [progressData]);

  // Uncompleted Tasks
  const uncompletedTasks = React.useMemo(() => {
    if (!progressData?.lessons || !progressData?.students) return [];

    const list: any[] = [];
    progressData.lessons.forEach((lesson: any) => {
      const incompleteStudents: any[] = [];

      progressData.students.forEach((student: any) => {
        const lp = student.progress.find((p: any) => p.lessonId === lesson._id);
        const hasQuiz = lesson.quiz && lesson.quiz.length > 0;
        
        const isCompleted = lp?.completed;
        const practiceDone = lp?.practiceCompleted;
        const testDone = lp?.testCompleted;

        if (!isCompleted) {
          incompleteStudents.push({
            _id: student._id,
            fullName: student.fullName,
            practiceDone: !!practiceDone,
            testDone: !!testDone,
            hasQuiz,
          });
        }
      });

      if (incompleteStudents.length > 0) {
        list.push({
          lessonId: lesson._id,
          lessonTitle: lesson.title,
          lessonOrder: lesson.order,
          students: incompleteStudents,
        });
      }
    });

    return list.sort((a, b) => a.lessonOrder - b.lessonOrder);
  }, [progressData]);

  if (loadingGroups) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">LMS Check</h1>
        <p className="text-muted-foreground">Guruhlar bo'yicha talabalar progressi va quiz xatoliklar tahlili.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Group list */}
        <div className="lg:col-span-1 bg-card border rounded-xl p-4 space-y-4 shadow-sm h-fit">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Layers className="w-4 h-4 text-primary" /> Guruhlar ({groups.length})
          </h2>
          <div className="space-y-1 max-h-[400px] overflow-y-auto pr-1">
            {groups.map((group) => {
              const isSelected = group._id === selectedGroupId;
              return (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroupId(group._id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold'
                      : 'hover:bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="truncate">
                    <p className="text-sm font-medium truncate">{group.name}</p>
                    <p className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                      {group.courseId?.name || 'Kurs nomi mavjud emas'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 shrink-0" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Main progress metrics and analytical tabs */}
        <div className="lg:col-span-3 space-y-6">
          {loadingProgress ? (
            <div className="flex items-center justify-center min-h-[300px] bg-card border rounded-xl">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : progressData ? (
            <>
              {/* Top Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-card border rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">O'rtacha Progress</p>
                    <p className="text-2xl font-black mt-1 text-primary">{stats.avgCompletion}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Flame className="w-6 h-6 text-primary" />
                  </div>
                </div>

                <div className="p-5 bg-card border rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">Homework (Practice) topshirilishi</p>
                    <p className="text-2xl font-black mt-1 text-emerald-500">{stats.practiceRate}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-emerald-500/10">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                  </div>
                </div>

                <div className="p-5 bg-card border rounded-xl flex items-center justify-between shadow-sm">
                  <div>
                    <p className="text-xs text-muted-foreground font-semibold">O'rtacha Quiz Balli</p>
                    <p className="text-2xl font-black mt-1 text-amber-500">{stats.avgQuizScore}%</p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-500/10">
                    <Award className="w-6 h-6 text-amber-500" />
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="border-b px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex gap-2 p-1 bg-secondary rounded-lg w-fit">
                    <button
                      onClick={() => setActiveTab('matrix')}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                        activeTab === 'matrix' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Progress Jadvali
                    </button>
                    <button
                      onClick={() => setActiveTab('errors')}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                        activeTab === 'errors' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Quiz Xatoliklar Tahlili
                    </button>
                    <button
                      onClick={() => setActiveTab('uncompleted')}
                      className={`px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                        activeTab === 'uncompleted' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      Bajarmaganlar Ro'yxati
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="O'quvchini qidirish..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 pr-4 py-1.5 text-xs rounded-lg bg-secondary border border-transparent focus:border-border outline-none transition-all w-48"
                      />
                    </div>
                  </div>
                </div>

                {/* Tab Content: Progress Matrix */}
                {activeTab === 'matrix' && (
                  <div className="p-6 overflow-x-auto">
                    {progressData.lessons.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">Kursda darslar mavjud emas.</div>
                    ) : filteredStudents.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">Talabalar topilmadi.</div>
                    ) : (
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b text-xs text-muted-foreground">
                            <th className="text-left py-3 px-4 font-semibold min-w-[200px]">Talaba ismi</th>
                            {progressData.lessons.map((les: any) => (
                              <th key={les._id} className="text-center py-3 px-2 font-semibold min-w-[80px]" title={les.title}>
                                Dars {les.order}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredStudents.map((student: any) => (
                            <tr key={student._id} className="border-b hover:bg-secondary/40 transition-colors">
                              <td className="py-3 px-4 flex items-center gap-3">
                                <img
                                  src={student.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${student.fullName}`}
                                  alt=""
                                  className="w-8 h-8 rounded-full bg-secondary shrink-0"
                                />
                                <span className="text-sm font-semibold text-foreground truncate flex items-center gap-1">
                                  {student.label && (
                                    <span className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 rounded shrink-0">
                                      {student.label}
                                    </span>
                                  )}
                                  <span className="truncate">{student.fullName}</span>
                                </span>
                              </td>
                              {progressData.lessons.map((les: any) => {
                                const lp = student.progress.find((p: any) => p.lessonId === les._id);
                                const isCompleted = lp?.completed;
                                const practiceDone = lp?.practiceCompleted;
                                const testDone = lp?.testCompleted;

                                return (
                                  <td key={les._id} className="py-3 px-2 text-center">
                                    <div className="inline-flex flex-col items-center justify-center gap-1">
                                      <div className="flex gap-1">
                                        {/* Homework/Practice Step Icon */}
                                        <span
                                          title={`Practice: ${practiceDone ? "Topshirilgan" : "Topshirilmagan"}`}
                                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                            practiceDone ? 'bg-emerald-500 text-white' : 'bg-secondary border text-muted-foreground'
                                          }`}
                                        >
                                          P
                                        </span>
                                        {/* Test/Quiz Step Icon */}
                                        {les.quiz && les.quiz.length > 0 && (
                                          <span
                                            title={`Quiz: ${testDone ? `O'tgan (${lp.score}%)` : "O'tmagan/Topshirilmagan"}`}
                                            className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                                              testDone ? 'bg-amber-500 text-white' : 'bg-secondary border text-muted-foreground'
                                            }`}
                                          >
                                            Q
                                          </span>
                                        )}
                                      </div>
                                      {/* Complete Label or Score */}
                                      {isCompleted ? (
                                        <span className="text-[10px] font-semibold text-emerald-500">100%</span>
                                      ) : lp?.score > 0 ? (
                                        <span className="text-[10px] font-semibold text-amber-500">{lp.score}%</span>
                                      ) : (
                                        <span className="text-[10px] text-muted-foreground">-</span>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                {/* Tab Content: Quiz Error Analysis */}
                {activeTab === 'errors' && (
                  <div className="p-6 space-y-6">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-500" /> Tez-tez xato qilinadigan quiz savollari
                    </h3>
                    {quizErrors.length === 0 ? (
                      <div className="text-center py-10 text-muted-foreground">Ushbu guruh bo'yicha quiz natijalari mavjud emas.</div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {quizErrors.map((err: any, idx: number) => (
                          <div key={idx} className="border rounded-xl p-5 bg-card hover:shadow-md transition-shadow space-y-3 relative overflow-hidden">
                            <div className="absolute right-0 top-0 bg-amber-500/10 text-amber-600 px-3 py-1.5 rounded-bl-xl text-xs font-bold">
                              Xatolik: {err.errorPercentage}%
                            </div>
                            <div className="space-y-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                                Dars {err.lessonOrder}: {err.lessonTitle}
                              </span>
                              <h4 className="font-bold text-sm text-foreground pr-16">{err.questionText}</h4>
                            </div>
                            <div className="space-y-2 text-xs">
                              {err.options.map((opt: string, oIdx: number) => {
                                const isCorrect = oIdx === err.correctAnswerIndex;
                                return (
                                  <div
                                    key={oIdx}
                                    className={`p-2.5 rounded-lg flex items-center gap-2 border ${
                                      isCorrect
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 font-semibold'
                                        : 'bg-secondary/40 border-transparent text-muted-foreground'
                                    }`}
                                  >
                                    <span className="w-5 h-5 rounded-full bg-background border flex items-center justify-center font-bold text-[10px]">
                                      {String.fromCharCode(65 + oIdx)}
                                    </span>
                                    <span>{opt}</span>
                                    {isCorrect && <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-500" />}
                                  </div>
                                );
                              })}
                            </div>
                            <div className="text-xs text-muted-foreground flex justify-between pt-2 border-t">
                              <span>Xato javoblar soni: <b>{err.wrongCount}</b> ta</span>
                              <span>Jami urinishlar: <b>{err.answeredCount}</b> ta</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Tab Content: Uncompleted students list */}
                {activeTab === 'uncompleted' && (
                  <div className="p-6 space-y-6">
                    <h3 className="font-semibold text-base flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-primary" /> Topshiriq/Quizlarni yakunlamaganlar ro'yxati
                    </h3>
                    {uncompletedTasks.length === 0 ? (
                      <div className="text-center py-10 text-emerald-500 font-semibold flex flex-col items-center gap-2">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500" /> Barcha talabalar hamma topshiriqlarni yakunlagan!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {uncompletedTasks.map((task: any) => (
                          <div key={task.lessonId} className="border rounded-xl overflow-hidden bg-card/40">
                            <div className="bg-secondary px-5 py-3 border-b flex justify-between items-center">
                              <span className="font-bold text-sm text-foreground">
                                Dars {task.lessonOrder}: {task.lessonTitle}
                              </span>
                              <span className="text-xs bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                                {task.students.length} kishi bajarmagan
                              </span>
                            </div>
                            <div className="divide-y">
                              {task.students.map((student: any) => (
                                <div key={student._id} className="px-5 py-3 flex items-center justify-between hover:bg-secondary/20 transition-colors">
                                  <span className="text-sm font-medium text-foreground flex items-center gap-1">
                                    {student.label && (
                                      <span className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 rounded shrink-0">
                                        {student.label}
                                      </span>
                                    )}
                                    <span>{student.fullName}</span>
                                  </span>
                                  <div className="flex gap-4">
                                    <span className="flex items-center gap-1.5 text-xs">
                                      Practice: {student.practiceDone ? (
                                        <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3.5 h-3.5" /> Bajarilgan</span>
                                      ) : (
                                        <span className="text-red-500 flex items-center gap-0.5"><XCircle className="w-3.5 h-3.5" /> Bajarilmagan</span>
                                      )}
                                    </span>
                                    {student.hasQuiz && (
                                      <span className="flex items-center gap-1.5 text-xs">
                                        Quiz: {student.testDone ? (
                                          <span className="text-emerald-500 flex items-center gap-0.5"><CheckCircle2 className="w-3.5 h-3.5" /> Bajarilgan</span>
                                        ) : (
                                          <span className="text-red-500 flex items-center gap-0.5"><XCircle className="w-3.5 h-3.5" /> Bajarilmagan</span>
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-card border rounded-xl text-muted-foreground shadow-sm">
              Iltimos, progress ma'lumotlarini ko'rish uchun chap tomondan guruh tanlang.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
