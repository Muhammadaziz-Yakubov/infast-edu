import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { client } from '../api/client';
import {
  Tv,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Award,
  BookOpen,
  Sparkles,
  Search,
  ChevronRight,
  ShieldAlert,
  Unlock,
  Coins,
  Check,
} from 'lucide-react';

interface StudentClassroomItem {
  _id: string; // StudentProfile ID
  userId: {
    _id: string;
    fullName: string;
    avatar?: string;
    studentPhone?: string;
    parentPhone?: string;
    email?: string;
  };
  joiningDate?: string;
  nextPaymentDate?: string;
  paymentStatus: 'PAID' | 'UPCOMING' | 'OVERDUE' | 'UNPAID';
  course: {
    title: string;
    techTrack: string;
  };
  currentLesson: {
    _id?: string;
    title: string;
    order: number;
    difficulty?: string;
    videoUrl?: string;
    homeworkDescription?: string;
  };
  progressPercentage: number;
  homeworkProgress: number;
  xp: number;
  coins: number;
  rank: string;
  streakDays: number;
  todayAttendance: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | 'PENDING';
}

export const ClassroomMode: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Fetch active group schedules
  const { data: groups, isLoading: isGroupsLoading } = useQuery({
    queryKey: ['groups'],
    queryFn: async () => {
      const res = await client.get('/groups');
      return res.data?.data || res.data || [];
    },
  });

  // Default to first group once loaded
  React.useEffect(() => {
    if (groups && groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0]._id);
    }
  }, [groups, selectedGroupId]);

  // 2. Fetch classroom single-screen data for selected group
  const { data: classroomData, isLoading: isClassroomLoading, refetch } = useQuery({
    queryKey: ['classroom', selectedGroupId],
    queryFn: async () => {
      if (!selectedGroupId) return null;
      const res = await client.get(`/groups/${selectedGroupId}/classroom`);
      return res.data?.data || res.data;
    },
    enabled: !!selectedGroupId,
  });

  // 3. One-Click Attendance Mutation
  const markAttendanceMutation = useMutation({
    mutationFn: async ({ studentId, status }: { studentId: string; status: string }) => {
      await client.post('/attendance', {
        groupId: selectedGroupId,
        studentId,
        date: new Date().toISOString().split('T')[0],
        status,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', selectedGroupId] });
    },
  });

  // 4. Quick Unlock Lesson Mutation
  const unlockLessonMutation = useMutation({
    mutationFn: async ({ studentProfileId, lessonId }: { studentProfileId: string; lessonId: string }) => {
      await client.post('/lms/unlock/individual', {
        studentProfileId,
        lessonId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', selectedGroupId] });
    },
  });

  // 5. Quick Award XP/Coins Mutation
  const awardRewardMutation = useMutation({
    mutationFn: async ({ studentId, xp, coins }: { studentId: string; xp: number; coins: number }) => {
      await client.patch(`/students/${studentId}`, { xp, coins });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classroom', selectedGroupId] });
    },
  });

  const filteredStudents: StudentClassroomItem[] = (classroomData?.students || []).filter(
    (student: StudentClassroomItem) =>
      student.userId?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.course?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header & Group Schedule Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#18181B] border border-[#27272A] p-6 rounded-[20px] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5500]/10 border border-[#FF5500]/20 flex items-center justify-center text-[#FF5500] shrink-0">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20 tracking-wide uppercase">
                Single-Screen Mode
              </span>
              <span className="text-xs text-zinc-400">
                Session: {classroomData?.sessionDate || new Date().toISOString().split('T')[0]}
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight mt-0.5">
              Classroom Command Center
            </h1>
          </div>
        </div>

        {/* Group Selector Dropdown */}
        <div className="flex items-center gap-3">
          <label className="text-xs font-semibold text-zinc-400 shrink-0">Select Schedule:</label>
          <select
            value={selectedGroupId}
            onChange={(e) => setSelectedGroupId(e.target.value)}
            className="bg-[#09090B] border border-[#27272A] text-white text-sm font-medium rounded-xl px-4 py-2.5 outline-none focus:border-[#FF5500] transition-colors cursor-pointer min-w-[240px]"
          >
            {isGroupsLoading ? (
              <option>Loading schedules...</option>
            ) : (
              (groups || []).map((g: any) => (
                <option key={g._id} value={g._id}>
                  {g.name} ({g.schedule?.days?.join(', ')} @ {g.schedule?.time})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Classroom Schedule Info Strip */}
      {classroomData?.groupSchedule && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-[20px]">
            <span className="text-xs text-zinc-400 font-medium">Room Location</span>
            <p className="text-base font-bold text-white mt-1">{classroomData.groupSchedule.roomId}</p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-[20px]">
            <span className="text-xs text-zinc-400 font-medium">Teacher in Charge</span>
            <p className="text-base font-bold text-white mt-1">
              {classroomData.groupSchedule.primaryTeacher?.fullName || 'Assigned Instructor'}
            </p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-[20px]">
            <span className="text-xs text-zinc-400 font-medium">Enrolled Roster</span>
            <p className="text-base font-bold text-white mt-1">
              {classroomData.groupSchedule.activeStudentCount} / {classroomData.groupSchedule.capacity} Students
            </p>
          </div>
          <div className="bg-[#18181B] border border-[#27272A] p-4 rounded-[20px]">
            <span className="text-xs text-zinc-400 font-medium">Schedule Days</span>
            <p className="text-base font-bold text-[#FF5500] mt-1">
              {classroomData.groupSchedule.schedule?.days?.join(' • ')}
            </p>
          </div>
        </div>
      )}

      {/* Search & Roster Control Header */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search student or course track..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#18181B] border border-[#27272A] rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF5500] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Independent Learning Engine active</span>
        </div>
      </div>

      {/* Main Single-Screen Roster Command Grid */}
      {isClassroomLoading ? (
        <div className="p-12 text-center text-zinc-500 bg-[#18181B] border border-[#27272A] rounded-[20px]">
          Loading session roster...
        </div>
      ) : filteredStudents.length === 0 ? (
        <div className="p-12 text-center text-zinc-500 bg-[#18181B] border border-[#27272A] rounded-[20px]">
          No students currently enrolled in this schedule. Add students from the Students page.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredStudents.map((student) => {
            const isOverdue = student.paymentStatus === 'OVERDUE';
            const isPaid = student.paymentStatus === 'PAID';

            return (
              <div
                key={student._id}
                className={`bg-[#18181B] border rounded-[20px] p-5 transition-all hover:border-zinc-700 ${
                  isOverdue ? 'border-red-900/50 bg-red-950/10' : 'border-[#27272A]'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Student Info & Avatar */}
                  <div className="flex items-center gap-4 min-w-[240px]">
                    <img
                      src={
                        student.userId?.avatar ||
                        `https://api.dicebear.com/7.x/adventurer/svg?seed=${student.userId?.fullName || 'student'}`
                      }
                      alt="Avatar"
                      className="w-12 h-12 rounded-2xl bg-[#09090B] border border-[#27272A] shrink-0 object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">
                          {student.userId?.fullName || 'Student'}
                        </h3>
                        {isOverdue && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-500/10 text-red-400 border border-red-500/20 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> OVERDUE
                          </span>
                        )}
                        {isPaid && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <Check className="w-3 h-3" /> PAID
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 mt-0.5">
                        Track: <span className="text-white font-medium">{student.course?.title}</span> • Rank: <span className="text-[#FF5500] font-semibold">{student.rank}</span>
                      </p>
                    </div>
                  </div>

                  {/* Independent Course & Current Topic/Lesson */}
                  <div className="min-w-[260px] bg-[#09090B] border border-[#27272A] p-3 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-[#FF5500]" /> Independent Topic
                      </span>
                      <button
                        onClick={() =>
                          student.currentLesson?._id &&
                          unlockLessonMutation.mutate({
                            studentProfileId: student._id,
                            lessonId: student.currentLesson._id,
                          })
                        }
                        className="text-[10px] font-bold text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Unlock next lesson"
                      >
                        <Unlock className="w-2.5 h-2.5" /> Unlock Next
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white truncate">
                      Lesson {student.currentLesson?.order || 1}: {student.currentLesson?.title || 'Current Topic'}
                    </p>
                    <div className="w-full bg-[#18181B] h-1.5 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-[#FF5500] h-full transition-all duration-300"
                        style={{ width: `${student.progressPercentage || 25}%` }}
                      />
                    </div>
                  </div>

                  {/* One-Click Attendance Control */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() =>
                        markAttendanceMutation.mutate({
                          studentId: student._id,
                          status: 'PRESENT',
                        })
                      }
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        student.todayAttendance === 'PRESENT'
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500'
                          : 'bg-[#09090B] text-zinc-400 border-[#27272A] hover:border-emerald-500/50'
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" /> Present
                    </button>
                    <button
                      onClick={() =>
                        markAttendanceMutation.mutate({
                          studentId: student._id,
                          status: 'ABSENT',
                        })
                      }
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        student.todayAttendance === 'ABSENT'
                          ? 'bg-red-500/20 text-red-400 border-red-500'
                          : 'bg-[#09090B] text-zinc-400 border-[#27272A] hover:border-red-500/50'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" /> Absent
                    </button>
                    <button
                      onClick={() =>
                        markAttendanceMutation.mutate({
                          studentId: student._id,
                          status: 'LATE',
                        })
                      }
                      className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                        student.todayAttendance === 'LATE'
                          ? 'bg-amber-500/20 text-amber-400 border-amber-500'
                          : 'bg-[#09090B] text-zinc-400 border-[#27272A] hover:border-amber-500/50'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" /> Late
                    </button>
                  </div>

                  {/* Rewards Quick Add (+XP / +Coins) */}
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-2 hidden sm:block">
                      <div className="text-xs font-bold text-white flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-[#FF5500]" /> {student.xp} XP
                      </div>
                      <div className="text-xs font-semibold text-amber-400 flex items-center gap-1">
                        <Coins className="w-3 h-3" /> {student.coins} Coins
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        awardRewardMutation.mutate({
                          studentId: student.userId._id,
                          xp: (student.xp || 0) + 50,
                          coins: (student.coins || 0) + 10,
                        })
                      }
                      className="px-3 py-2 bg-[#FF5500] text-white text-xs font-bold rounded-xl hover:bg-[#FF5500]/90 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Reward student for active participation"
                    >
                      <Award className="w-3.5 h-3.5" /> +50 XP
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClassroomMode;
