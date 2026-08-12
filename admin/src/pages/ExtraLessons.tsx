import React, { useEffect, useState } from 'react';
import {
  getExtraLessonSlots,
  createExtraLessonSlot,
  deleteExtraLessonSlot,
  updateExtraLessonAttendance,
  type ExtraLessonSlotItem,
} from '../api/extraLessons';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  BookOpen,
  Filter,
  UserCheck,
  UserX,
} from 'lucide-react';

export const ExtraLessons: React.FC = () => {
  const [slots, setSlots] = useState<ExtraLessonSlotItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // New slot form state
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('16:00');
  const [title, setTitle] = useState("Qo'shimcha dars");
  const [note, setNote] = useState('');
  const [creating, setCreating] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    loadSlots();
  }, [filterDate]);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const data = await getExtraLessonSlots(filterDate || undefined);
      setSlots(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !startTime) {
      alert("Iltimos, sana va soatni kiriting!");
      return;
    }

    setCreating(true);
    try {
      await createExtraLessonSlot({
        date,
        startTime,
        title,
        note,
      });
      alert("Bo'sh vaqt muvaffaqiyatli qo'shildi!");
      setNote('');
      loadSlots();
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Xatolik yuz berdi');
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (!window.confirm("Ushbu bo'sh vaqtni o'chirishni tasdiqlaysizmi?")) return;
    try {
      await deleteExtraLessonSlot(id);
      setSlots((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      alert(err?.response?.data?.message || 'O\'chirishda xatolik');
    }
  };

  const handleMarkAttendance = async (id: string, attendanceStatus: 'ATTENDED' | 'ABSENT') => {
    const actionLabel = attendanceStatus === 'ATTENDED' ? "Keldi (+100 coin, +50 XP)" : "Kelmadi (-200 coin)";
    if (!window.confirm(`O'quvchini "${actionLabel}" deb belgilashni tasdiqlaysizmi?`)) return;

    setActionLoadingId(id);
    try {
      const updated = await updateExtraLessonAttendance(id, attendanceStatus);
      setSlots((prev) => prev.map((s) => (s._id === id ? updated : s)));
      alert(`Muvaffaqiyatli saqlandi: ${actionLabel}`);
    } catch (err: any) {
      alert(err?.response?.data?.message || err?.message || 'Xatolik yuz berdi');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filteredSlots = slots.filter((slot) => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'AVAILABLE') return slot.status === 'AVAILABLE';
    if (filterStatus === 'BOOKED') return slot.status === 'BOOKED' && slot.attendanceStatus === 'PENDING';
    if (filterStatus === 'COMPLETED') return slot.attendanceStatus !== 'PENDING';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <BookOpen className="w-8 h-8 text-primary" />
            Qo'shimcha Darslar Boshqaruvi
          </h1>
          <p className="text-muted-foreground text-sm">
            O'qituvchilar/Adminlar bo'sh vaqtlarini e'lon qiladilar va o'quvchilar ushbu vaqtga yozilishadi.
          </p>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Create Available Slot Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-primary font-bold text-lg border-b pb-3">
              <Plus className="w-5 h-5" />
              Bo'sh Vaqt Qo'shish
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Sana
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm rounded-xl border bg-background px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Bo'sh Vaqt (Soat)
                </label>
                <input
                  type="text"
                  placeholder="Masalan: 16:00 yoki 18:30"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full text-sm rounded-xl border bg-background px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Mavzu / Sarlavha</label>
                <input
                  type="text"
                  placeholder="Masalan: Qo'shimcha mashg'ulot"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-sm rounded-xl border bg-background px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Qo'shimcha Izoh (Xona, O'qituvchi)</label>
                <input
                  type="text"
                  placeholder="Masalan: 301-xona, Ustoz: Muhammad"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-sm rounded-xl border bg-background px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                {creating ? 'Qo\'shilmoqda...' : 'Bo\'sh Vaqtni E\'lon Qilish'}
              </button>
            </form>
          </div>

          {/* Rules Banner Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Rag'batlantirish va Jarima Tizimi
            </h4>
            <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
              <p className="flex items-center gap-2 text-emerald-600 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
                O'quvchi kelganda: <strong className="text-foreground">+100 Coin</strong> va <strong className="text-foreground">+50 XP</strong> beriladi.
              </p>
              <p className="flex items-center gap-2 text-red-600 font-medium">
                <XCircle className="w-4 h-4 shrink-0 text-red-500" />
                O'quvchi kelmaganda: <strong className="text-foreground">-200 Coin</strong> jarima ayriladi.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: List of Slots & Bookings */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-card border rounded-2xl shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-bold text-muted-foreground uppercase">Filtr:</span>
              <div className="flex gap-1 bg-secondary/30 p-1 rounded-xl">
                {[
                  { key: 'ALL', label: 'Barchasi' },
                  { key: 'AVAILABLE', label: "Bo'sh vaqtlar" },
                  { key: 'BOOKED', label: 'Yozilinganlar' },
                  { key: 'COMPLETED', label: 'Yakunlangan' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setFilterStatus(item.key)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      filterStatus === item.key
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="text-xs rounded-lg border bg-background px-3 py-1.5 outline-none"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="text-xs text-primary font-semibold hover:underline"
                >
                  Tozalash
                </button>
              )}
            </div>
          </div>

          {/* Slots List */}
          {loading ? (
            <div className="flex justify-center py-16 bg-card border rounded-2xl">
              <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredSlots.length === 0 ? (
            <div className="text-center py-16 bg-card border rounded-2xl space-y-2">
              <AlertCircle className="w-10 h-10 text-muted-foreground mx-auto opacity-50" />
              <p className="text-sm font-semibold text-muted-foreground">
                Hozircha hech qanday bo'sh vaqt topilmadi.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSlots.map((slot) => {
                const isBooked = slot.status === 'BOOKED' || slot.bookedBy;
                const student = slot.bookedBy;

                return (
                  <div
                    key={slot._id}
                    className={`bg-card border rounded-2xl p-5 shadow-sm transition-all space-y-4 ${
                      slot.attendanceStatus === 'ATTENDED'
                        ? 'border-emerald-500/30 bg-emerald-500/5'
                        : slot.attendanceStatus === 'ABSENT'
                        ? 'border-red-500/30 bg-red-500/5'
                        : isBooked
                        ? 'border-blue-500/30 bg-blue-500/5'
                        : ''
                    }`}
                  >
                    {/* Top Row: Date, Time & Status Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3">
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-xl font-extrabold text-sm flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {slot.startTime}
                        </div>
                        <div>
                          <div className="font-bold text-sm flex items-center gap-2">
                            <span>{slot.title}</span>
                            <span className="text-xs text-muted-foreground font-normal">
                              ({slot.date})
                            </span>
                          </div>
                          {slot.note && (
                            <p className="text-xs text-muted-foreground">{slot.note}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Badges */}
                        {!isBooked ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Bo'sh (Kutilmoqda)
                          </span>
                        ) : slot.attendanceStatus === 'ATTENDED' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Keldi (+100 coin, +50 XP)
                          </span>
                        ) : slot.attendanceStatus === 'ABSENT' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-600 border border-red-500/30 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" />
                            Kelmadi (-200 coin)
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-600 border border-blue-500/30 animate-pulse">
                            O'quvchi yozildi (Kutilmoqda)
                          </span>
                        )}

                        {!isBooked && (
                          <button
                            onClick={() => handleDeleteSlot(slot._id)}
                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Student Info & Reason section */}
                    {isBooked && student ? (
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-background/60 p-4 rounded-xl border">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${student.fullName}`}
                            alt=""
                            className="w-11 h-11 rounded-full bg-secondary object-cover border"
                          />
                          <div>
                            <p className="font-bold text-sm">{student.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              {student.studentPhone || student.phone || student.email || "Telefon kiritilmagan"}
                            </p>
                            {slot.reason && (
                              <p className="text-xs text-primary font-medium mt-1 italic">
                                "{slot.reason}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleMarkAttendance(slot._id, 'ATTENDED')}
                            disabled={actionLoadingId === slot._id}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                              slot.attendanceStatus === 'ATTENDED'
                                ? 'bg-emerald-500 text-white border-emerald-600 shadow-sm'
                                : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                            }`}
                          >
                            <UserCheck className="w-4 h-4" />
                            Keldi (+100)
                          </button>

                          <button
                            onClick={() => handleMarkAttendance(slot._id, 'ABSENT')}
                            disabled={actionLoadingId === slot._id}
                            className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                              slot.attendanceStatus === 'ABSENT'
                                ? 'bg-red-500 text-white border-red-600 shadow-sm'
                                : 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500 hover:text-white'
                            }`}
                          >
                            <UserX className="w-4 h-4" />
                            Kelmadi (-200)
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground italic">
                        Ushbu bo'sh vaqtga hali hech qaysi o'quvchi yozilmagan.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExtraLessons;
