import React, { useEffect, useState } from 'react';
import { getGroups, createGroup, updateGroup, enrollStudent, removeStudent, getGroupSchedule } from '../api/groups';
import { getCourses } from '../api/courses';
import { getStudents, updateStudent } from '../api/students';
import type { Group, Course, Student } from '../utils/mockDb';
import {
  Plus,
  Calendar,
  Clock,
  Users,
  UserPlus,
  ChevronRight,
  CalendarDays,
  X,
  UserMinus,
  Edit2,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

export const Groups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Selected Group details
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [schedule, setSchedule] = useState<any[]>([]);
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);

  // Form states (Create / Edit Group)
  const [name, setName] = useState('');
  const [courseId, setCourseId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [scheduleDays, setScheduleDays] = useState<string[]>([]);
  const [lessonTime, setLessonTime] = useState('18:30 - 20:00');

  // Student course assignment modal / state
  const [changingStudentCourseId, setChangingStudentCourseId] = useState<string | null>(null);
  const [selectedStudentCourse, setSelectedStudentCourse] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gList, cList, sList] = await Promise.all([
        getGroups(),
        getCourses(),
        getStudents(),
      ]);
      setGroups(gList);
      setCourses(cList);
      setStudents(sList);
      
      // Auto select first group or retain selected
      if (gList.length > 0) {
        if (!selectedGroup) {
          handleSelectGroup(gList[0]);
        } else {
          const fresh = gList.find(g => g._id === selectedGroup._id);
          if (fresh) setSelectedGroup(fresh);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGroup = async (group: Group) => {
    setSelectedGroup(group);
    setScheduleLoading(true);
    try {
      const dates = await getGroupSchedule(group._id);
      setSchedule(dates);
    } catch (e) {
      console.error(e);
    } finally {
      setScheduleLoading(false);
    }
  };

  const openCreateModal = () => {
    setName('');
    setCourseId(courses[0]?._id || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    setScheduleDays(['Monday', 'Wednesday', 'Friday']);
    setLessonTime('18:30 - 20:00');
    setCreateOpen(true);
  };

  const openEditModal = () => {
    if (!selectedGroup) return;
    setName(selectedGroup.name);
    setCourseId(selectedGroup.courseId || '');
    setStartDate(selectedGroup.startDate || '');
    setScheduleDays(selectedGroup.schedule?.days || []);
    setLessonTime(selectedGroup.schedule?.time || '18:30 - 20:00');
    setEditOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || scheduleDays.length === 0) {
      alert('Iltimos, barcha maydonlarni to\'ldiring va dars kunlarini tanlang');
      return;
    }

    try {
      await createGroup({
        name,
        courseId,
        startDate,
        schedule: {
          days: scheduleDays,
          time: lessonTime,
        },
      });
      setCreateOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !courseId || scheduleDays.length === 0) {
      alert('Iltimos, barcha maydonlarni to\'ldiring');
      return;
    }

    try {
      await updateGroup(selectedGroup._id, {
        name,
        courseId,
        startDate,
        schedule: {
          days: scheduleDays,
          time: lessonTime,
        },
      });
      setEditOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Guruhni tahrirlashda xatolik');
    }
  };

  const handleEnroll = async (studentId: string) => {
    if (!selectedGroup) return;
    try {
      await enrollStudent(selectedGroup._id, studentId);
      setEnrollOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  const handleUnenroll = async (studentId: string) => {
    if (!selectedGroup) return;
    if (window.confirm('Talabani ushbu guruhdan o\'chirmoqchimisiz?')) {
      try {
        await removeStudent(selectedGroup._id, studentId);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Xatolik yuz berdi');
      }
    }
  };

  const handleChangeStudentCourse = async (studentId: string, newCourseId: string) => {
    try {
      await updateStudent(studentId, { courseId: newCourseId });
      setChangingStudentCourseId(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Talaba kursini biriktirishda xatolik');
    }
  };

  const toggleDay = (day: string) => {
    setScheduleDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Guruhlar Boshqaruvi</h1>
          <p className="text-muted-foreground">O'quv guruhlarini shakllantirish, guruh kursini o'zgartirish va individual talabalarga maxsus kurs biriktirish.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Yangi Guruh Yaratish
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Groups list */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider">Guruhlar ro'yxati</h3>
          {loading ? (
            <div className="flex justify-center p-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : groups.length === 0 ? (
            <p className="text-sm text-muted-foreground">Hech qanday guruh yaratilmagan.</p>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => {
                const isSelected = selectedGroup?._id === group._id;
                const course = courses.find((c) => c._id === (group.courseId?._id || group.courseId));
                return (
                  <div
                    key={group._id}
                    onClick={() => handleSelectGroup(group)}
                    className={`p-4 bg-card border rounded-xl shadow-sm cursor-pointer hover:border-primary/50 transition-all flex items-center justify-between ${
                      isSelected ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02]' : ''
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-sm truncate">{group.name}</h4>
                      <p className="text-xs text-primary font-medium truncate flex items-center gap-1">
                        <BookOpen className="w-3 h-3 shrink-0" />
                        {course?.title || 'Kurs biriktirilmagan'}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          {group.students?.length || 0} o'quvchi
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Selected Group Workspace */}
        <div className="lg:col-span-2 space-y-6">
          {selectedGroup ? (
            <div className="space-y-6">
              
              {/* Group Overview details header */}
              <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">{selectedGroup.name}</h2>
                    <p className="text-sm text-primary font-semibold flex items-center gap-1.5 mt-1">
                      <BookOpen className="w-4 h-4" />
                      Guruh Asosiy Kursi: {courses.find((c) => c._id === (selectedGroup.courseId?._id || selectedGroup.courseId))?.title || 'Belgilanmagan'}
                    </p>
                  </div>
                  <button
                    onClick={openEditModal}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border bg-background hover:bg-secondary transition-all cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-primary" />
                    Guruhni Tahrirlash
                  </button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm bg-secondary/30 p-4 rounded-lg">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Boshlanish sanasi</span>
                      <span className="font-semibold text-foreground">{selectedGroup.startDate || '—'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <CalendarDays className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Dars kunlari</span>
                      <span className="font-semibold text-foreground truncate block max-w-[150px]">
                        {selectedGroup.schedule?.days?.join(', ') || '—'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Clock className="w-4 h-4 text-primary shrink-0" />
                    <div>
                      <span className="text-xs text-muted-foreground block">Dars vaqti</span>
                      <span className="font-semibold text-foreground">{selectedGroup.schedule?.time || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Roster & Schedule tabs */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Students list in group with Course Override controls */}
                <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h3 className="font-bold text-sm">Guruh Talabalari ({selectedGroup.students?.length || 0})</h3>
                      <p className="text-[11px] text-muted-foreground">Talabalarga individual kurs biriktirish mumkin</p>
                    </div>
                    <button
                      onClick={() => setEnrollOpen(true)}
                      className="p-1.5 text-primary hover:bg-secondary rounded-md transition-colors cursor-pointer"
                      title="Talaba qo'shish"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                  </div>

                  {(!selectedGroup.students || selectedGroup.students.length === 0) ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">Guruhda hech qanday talaba yo'q.</p>
                  ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {selectedGroup.students.map((sid: any) => {
                        const studentIdStr = typeof sid === 'object' ? sid._id : sid;
                        const s = students.find((item) => item._id === studentIdStr);
                        if (!s) return null;

                        const groupCourseIdStr = selectedGroup.courseId?._id || selectedGroup.courseId;
                        const studentCourseIdStr = s.courseId;
                        const hasCustomCourse = studentCourseIdStr && studentCourseIdStr !== groupCourseIdStr;
                        const activeCourse = courses.find((c) => c._id === (studentCourseIdStr || groupCourseIdStr));

                        return (
                          <div key={s._id} className="p-3 bg-secondary/20 hover:bg-secondary/40 rounded-xl transition-all border border-border/50 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img src={s.avatar} alt="" className="w-8 h-8 rounded-full bg-secondary shrink-0" />
                                <div className="min-w-0">
                                  <span className="text-sm font-semibold truncate block">{s.fullName}</span>
                                  <span className="text-xs text-muted-foreground truncate block">{s.studentPhone}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleUnenroll(s._id)}
                                className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-secondary rounded-md transition-colors"
                                title="Guruhdan o'chirish"
                              >
                                <UserMinus className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Active Course Badge & Selector */}
                            <div className="flex items-center justify-between text-xs pt-1 border-t border-border/30">
                              <span className="text-muted-foreground">O'qiyotgan kursi:</span>
                              
                              {changingStudentCourseId === s._id ? (
                                <div className="flex items-center gap-1">
                                  <select
                                    value={selectedStudentCourse}
                                    onChange={(e) => setSelectedStudentCourse(e.target.value)}
                                    className="text-xs border rounded px-1.5 py-0.5 bg-background"
                                  >
                                    <option value="">Guruh Kursi ({courses.find(c => c._id === groupCourseIdStr)?.title})</option>
                                    {courses.map(c => (
                                      <option key={c._id} value={c._id}>{c.title}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleChangeStudentCourse(s._id, selectedStudentCourse)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                    title="Saqlash"
                                  >
                                    <CheckCircle2 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setChangingStudentCourseId(null)}
                                    className="p-1 text-muted-foreground hover:bg-secondary rounded"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setChangingStudentCourseId(s._id);
                                    setSelectedStudentCourse(s.courseId || '');
                                  }}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium transition-all text-[11px] cursor-pointer ${
                                    hasCustomCourse
                                      ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30 hover:bg-amber-500/20'
                                      : 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20'
                                  }`}
                                  title="Kursni almashtirish uchun bosing"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>{activeCourse?.title || 'Guruh Kursi'}</span>
                                  {hasCustomCourse && <span className="font-bold text-[9px] uppercase tracking-wider bg-amber-500 text-white px-1 rounded ml-1">Individual</span>}
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Calculated Auto Schedule Dates */}
                <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
                  <h3 className="font-bold text-sm border-b pb-3 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-primary" />
                    Darslar jadvali (Avtomatik)
                  </h3>

                  {scheduleLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : schedule.length === 0 ? (
                    <p className="text-xs text-muted-foreground py-6 text-center">Kurs dasturida darslar topilmadi.</p>
                  ) : (
                    <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                      {schedule.map((item) => (
                        <div key={item.order} className="flex justify-between items-center p-2.5 bg-secondary/35 rounded-lg border text-xs">
                          <div className="min-w-0 pr-2">
                            <span className="font-semibold block text-xs">Dars #{item.order}</span>
                            <span className="text-muted-foreground truncate block">{item.lessonTitle}</span>
                          </div>
                          <span className="font-bold text-foreground bg-background px-2 py-1 border rounded-md shrink-0">
                            {item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString('uz-UZ') : '—'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center min-h-[300px] border border-dashed rounded-xl bg-card">
              <p className="text-muted-foreground">Tafsilotlarni ko'rish uchun chapdan guruhni tanlang.</p>
            </div>
          )}
        </div>

      </div>

      {/* Enroll Student Modal */}
      {enrollOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">Talabani Guruhga Qo'shish</h3>
              <button onClick={() => setEnrollOpen(false)} className="p-1 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {students
                .filter((s) => !selectedGroup.students?.map((sid: any) => typeof sid === 'object' ? sid._id : sid).includes(s._id))
                .map((s) => (
                  <div key={s._id} className="flex items-center justify-between p-2.5 hover:bg-secondary rounded-lg border transition-all">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img src={s.avatar} alt="" className="w-8 h-8 rounded-full bg-secondary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{s.fullName}</p>
                        <span className="text-xs text-muted-foreground truncate block">{s.studentPhone}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleEnroll(s._id)}
                      className="px-2.5 py-1.5 text-xs font-semibold rounded bg-primary text-primary-foreground hover:opacity-90 transition-all shrink-0 cursor-pointer"
                    >
                      Qo'shish
                    </button>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">Yangi Guruh Yaratish</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Guruh nomi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Frontend Developer #1"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Guruh Asosiy Kursi</label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Kursni tanlang</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Boshlanish sanasi</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Dars kunlari</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {daysOfWeek.map((day) => {
                    const isSelected = scheduleDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary font-semibold'
                            : 'bg-background hover:bg-secondary text-muted-foreground'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Dars vaqti</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: 18:30 - 20:00"
                  value={lessonTime}
                  onChange={(e) => setLessonTime(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all cursor-pointer"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Group Modal */}
      {editOpen && selectedGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">Guruhni Tahrirlash</h3>
              <button onClick={() => setEditOpen(false)} className="p-1 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Guruh nomi</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Guruh Asosiy Kursini O'zgartirish</label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary font-medium"
                >
                  <option value="">Kursni tanlang</option>
                  {courses.map((c) => (
                    <option key={c._id} value={c._id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Boshlanish sanasi</label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Dars kunlari</label>
                <div className="flex flex-wrap gap-2 pt-1">
                  {daysOfWeek.map((day) => {
                    const isSelected = scheduleDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`px-3 py-1.5 text-xs rounded-full border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-primary text-primary-foreground border-primary font-semibold'
                            : 'bg-background hover:bg-secondary text-muted-foreground'
                        }`}
                      >
                        {day.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Dars vaqti</label>
                <input
                  type="text"
                  required
                  value={lessonTime}
                  onChange={(e) => setLessonTime(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all cursor-pointer"
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

export default Groups;
