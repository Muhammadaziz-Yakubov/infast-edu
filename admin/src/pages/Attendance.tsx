import React, { useEffect, useState } from 'react';
import { getGroups, getGroupSchedule } from '../api/groups';
import { getStudents } from '../api/students';
import { submitAttendance } from '../api/attendance';
import type { Group, Student } from '../utils/mockDb';
import {
  Users,
  Calendar,
  BookOpen,
  UserCheck,
  UserX,
  Save,
} from 'lucide-react';

export const Attendance: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Selector choices
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [schedule, setSchedule] = useState<any[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

  // Attendance Checklist state
  // key: studentId, value: 'PRESENT' | 'ABSENT'
  const [checklist, setChecklist] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gList, sList] = await Promise.all([
        getGroups(),
        getStudents(),
      ]);
      setGroups(gList);
      setStudents(sList);
      
      if (gList.length > 0) {
        setSelectedGroupId(gList[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // When selectedGroupId changes, load the schedule dates
  useEffect(() => {
    if (!selectedGroupId) return;
    getGroupSchedule(selectedGroupId).then((dates) => {
      setSchedule(dates);
      if (dates.length > 0) {
        // lessonId is now a plain string from the backend
        setSelectedLessonId(String(dates[0].lessonId));
      } else {
        setSelectedLessonId('');
      }
    }).catch(console.error);

    // Populate default checklist values (all PRESENT by default)
    const group = groups.find((g) => g._id === selectedGroupId);
    if (group) {
      const initial: Record<string, 'PRESENT' | 'ABSENT'> = {};
      (group.students || []).forEach((sid: any) => {
        const idStr = typeof sid === 'string' ? sid : sid?._id?.toString() || String(sid);
        initial[idStr] = 'PRESENT';
      });
      setChecklist(initial);
    }
  }, [selectedGroupId, groups]);

  const toggleStatus = (studentId: string) => {
    setChecklist((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
    }));
  };

  const handleSave = async () => {
    if (!selectedGroupId || !selectedLessonId) {
      alert('Iltimos, guruh va darsni tanlang');
      return;
    }

    setSubmitting(true);
    try {
      const records = Object.entries(checklist).map(([studentId, status]) => ({
        studentId,
        status,
      }));

      await submitAttendance({
        groupId: selectedGroupId,
        lessonId: selectedLessonId,
        date: attendanceDate,
        records,
      });

      alert('Davomat muvaffaqiyatli saqlandi va talabalarning XP/Koinlari yangilandi!');
      
      // Reload students data to reflect updated XP/Coins
      const sList = await getStudents();
      setStudents(sList);
    } catch (e: any) {
      alert(e.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedGroup = groups.find((g) => g._id === selectedGroupId);
  const activeStudents = students.filter((s) => 
    (selectedGroup?.students || []).includes(s._id) || 
    s.groupId === selectedGroupId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Davomat Tizimi</h1>
        <p className="text-muted-foreground">Darslarga qatnashganlik hisobotlarini kiritish va o'quvchilarni rag'batlantirish.</p>
      </div>

      {/* Selectors Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-card border rounded-xl shadow-sm">
        
        {/* Select Group */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            Guruh
          </label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="w-full text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
          >
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>
        </div>

        {/* Select Lesson */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            Dars mavzusi
          </label>
          <select
            value={selectedLessonId}
            onChange={(e) => setSelectedLessonId(e.target.value)}
            className="w-full text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
          >
            {schedule.map((sch) => (
              <option key={sch._id || sch.lessonId} value={sch.lessonId}>
                Dars #{sch.order}: {sch.lessonTitle}
                {sch.scheduledDate ? ` — ${new Date(sch.scheduledDate).toLocaleDateString('uz-UZ')}` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Select Date */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Sana
          </label>
          <input
            type="date"
            value={attendanceDate}
            onChange={(e) => setAttendanceDate(e.target.value)}
            className="w-full text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
          />
        </div>

      </div>

      {/* Student presence checklist list */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm space-y-4 p-6">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="font-bold text-sm">Guruh talabalari davomati</h3>
          <span className="text-xs text-muted-foreground">
            Soni: {activeStudents.length} ta o'quvchi
          </span>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeStudents.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-12">Tanlangan guruhda talabalar mavjud emas.</p>
        ) : (
          <div className="space-y-4">
            <div className="divide-y border rounded-xl overflow-hidden">
              {activeStudents.map((s) => {
                const status = checklist[s._id] || 'PRESENT';
                return (
                  <div key={s._id} className="flex justify-between items-center p-4 bg-secondary/10 hover:bg-secondary/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <img src={s.avatar} alt="" className="w-10 h-10 rounded-full bg-secondary" />
                      <div>
                        <span className="font-semibold block text-sm">{s.fullName}</span>
                        <span className="text-xs text-muted-foreground">{s.studentPhone}</span>
                      </div>
                    </div>

                    {/* Present/Absent toggle button */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleStatus(s._id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          status === 'PRESENT'
                            ? 'bg-green-500/10 text-green-500 border-green-500/20'
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                        }`}
                      >
                        {status === 'PRESENT' ? (
                          <>
                            <UserCheck className="w-3.5 h-3.5" />
                            Qatnashdi (+100 XP, +20 Coins)
                          </>
                        ) : (
                          <>
                            <UserX className="w-3.5 h-3.5 animate-pulse" />
                            Kelmagan (-200 XP, -50 Coins)
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSave}
                disabled={submitting}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {submitting ? 'Saqlanmoqda...' : 'Davomatni Tasdiqlash'}
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
