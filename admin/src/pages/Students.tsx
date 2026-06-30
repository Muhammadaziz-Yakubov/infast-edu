import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getStudents,
  createStudent,
  deleteStudent,
  updateStudent,
} from '../api/students';
import { getCourses } from '../api/courses';
import { getGroups } from '../api/groups';
import { checkPaymentStatuses } from '../api/payments';
import type { Student, Course, Group } from '../utils/mockDb';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Key,
  Copy,
  Check,
  UserX,
  UserCheck,
  Award,
  CircleDollarSign,
  X,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const Students: React.FC = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingPayments, setCheckingPayments] = useState(false);
  const [checkSuccess, setCheckSuccess] = useState(false);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [courseFilter, setCourseFilter] = useState('ALL');
  const [groupFilter, setGroupFilter] = useState('ALL');

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);

  // New Student state
  const [fullName, setFullName] = useState('');
  const [studentPhone, setStudentPhone] = useState('+998');
  const [parentPhone, setParentPhone] = useState('+998');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [courseId, setCourseId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [password, setPassword] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');

  // Generated Credentials output
  const [credentials, setCredentials] = useState<{ phone: string; pass: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [sList, cList, gList] = await Promise.all([
        getStudents(),
        getCourses(),
        getGroups(),
      ]);
      setStudents(sList);
      setCourses(cList);
      setGroups(gList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckPayments = async () => {
    setCheckingPayments(true);
    setCheckSuccess(false);
    try {
      await checkPaymentStatuses();
      setCheckSuccess(true);
      // Reload student list to reflect updated statuses
      await loadData();
      setTimeout(() => setCheckSuccess(false), 3000);
    } catch (e) {
      console.error(e);
      alert("To'lovlarni tekshirishda xatolik yuz berdi.");
    } finally {
      setCheckingPayments(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await createStudent({
        fullName,
        studentPhone,
        parentPhone,
        dateOfBirth,
        email: email || undefined,
        courseId: courseId || undefined,
        groupId: groupId || undefined,
        password: password || undefined,
        nextPaymentDate: nextPaymentDate || undefined,
      });

      // Show credentials
      setCredentials({
        phone: res.user.studentPhone,
        pass: res.generatedPassword,
      });

      // Reload
      await loadData();

      // Reset Form fields
      setFullName('');
      setStudentPhone('+998');
      setParentPhone('+998');
      setDateOfBirth('');
      setEmail('');
      setCourseId('');
      setGroupId('');
      setPassword('');
      setNextPaymentDate('');
    } catch (err: any) {
      const errMsg = err.response?.data?.message
        ? (Array.isArray(err.response.data.message) ? err.response.data.message.join('\n') : err.response.data.message)
        : (err.message || 'Xatolik yuz berdi');
      alert(errMsg);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    try {
      await updateStudent(editStudent._id, {
        fullName,
        studentPhone,
        parentPhone,
        dateOfBirth,
        email: email || undefined,
        courseId: courseId || undefined,
        groupId: groupId || undefined,
        nextPaymentDate: nextPaymentDate || undefined,
      });
      setEditStudent(null);
      setNextPaymentDate('');
      await loadData();
    } catch (err: any) {
      const errMsg = err.response?.data?.message
        ? (Array.isArray(err.response.data.message) ? err.response.data.message.join('\n') : err.response.data.message)
        : (err.message || 'Xatolik yuz berdi');
      alert(errMsg);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Haqiqatdan ham ushbu talabani o\'chirib tashlamoqchimisiz?')) {
      await deleteStudent(id);
      await loadData();
    }
  };

  const openEditModal = (student: Student) => {
    setEditStudent(student);
    setFullName(student.fullName);
    setStudentPhone(student.studentPhone);
    setParentPhone(student.parentPhone);
    setDateOfBirth(student.dateOfBirth);
    setEmail(student.email || '');
    setCourseId(student.courseId || '');
    setGroupId(student.groupId || '');
    setNextPaymentDate('');
  };

  const handleCopy = () => {
    if (!credentials) return;
    navigator.clipboard.writeText(`Telefon: ${credentials.phone}\nParol: ${credentials.pass}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.studentPhone.includes(search);
    const matchesStatus =
      statusFilter === 'ALL' || s.status === statusFilter;
    const matchesCourse =
      courseFilter === 'ALL' || s.courseId === courseFilter;
    const matchesGroup =
      groupFilter === 'ALL' || s.groupId === groupFilter;

    return matchesSearch && matchesStatus && matchesCourse && matchesGroup;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Talabalar CRM</h1>
          <p className="text-muted-foreground">O'quvchilar ro'yxati, to'lov va davomat statistikalari boshqaruvi.</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Check Payments button */}
          <button
            onClick={handleCheckPayments}
            disabled={checkingPayments}
            title="Barcha o'quvchilar to'lov statusini hozir tekshirish"
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border transition-all shadow-sm ${
              checkSuccess
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600'
                : 'bg-card border-border text-foreground hover:bg-secondary'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {checkingPayments ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : checkSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            ) : (
              <ShieldCheck className="w-4 h-4" />
            )}
            {checkingPayments ? 'Tekshirilmoqda...' : checkSuccess ? 'Yangilandi!' : "To'lovlarni tekshirish"}
          </button>

          <button
            onClick={() => {
              setCredentials(null);
              setCreateOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Yangi Talaba Qo'shish
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border rounded-xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ism yoki telefon orqali qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Status select */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="ALL">Barcha holatlar</option>
              <option value="ACTIVE">Faol</option>
              <option value="BLOCKED">Bloklangan</option>
            </select>
          </div>

          {/* Course filter */}
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="ALL">Barcha kurslar</option>
            {courses.map((c) => (
              <option key={c._id} value={c._id}>{c.title}</option>
            ))}
          </select>

          {/* Group filter */}
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
          >
            <option value="ALL">Barcha guruhlar</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>
        </div>

      </div>

      {/* Roster Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">
            Bunday parametrga mos keladigan talabalar topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground select-none">
                  <th className="px-6 py-4">Avatar / Ism</th>
                  <th className="px-6 py-4">Telefonlar</th>
                  <th className="px-6 py-4">Kurs / Guruh</th>
                  <th className="px-6 py-4">Statistika</th>
                  <th className="px-6 py-4 text-center">To'lov</th>
                  <th className="px-6 py-4 text-center">Holat</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredStudents.map((student) => {
                  const course = courses.find((c) => c._id === student.courseId);
                  const group = groups.find((g) => g._id === student.groupId);
                  return (
                    <tr key={student._id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${student.fullName}`}
                            alt=""
                            className="w-10 h-10 rounded-full bg-secondary"
                          />
                          <div>
                            <span className="font-semibold block text-primary hover:underline cursor-pointer" onClick={() => navigate(`/students/${student._id}`)}>
                              {student.fullName}
                            </span>
                            <span className="text-xs text-muted-foreground">{student.email || 'Email yo\'q'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="text-xs">
                          <span className="text-muted-foreground mr-1">Talaba:</span>
                          <span className="font-medium">{student.studentPhone}</span>
                        </div>
                        <div className="text-xs">
                          <span className="text-muted-foreground mr-1">Ota-ona:</span>
                          <span className="font-medium">{student.parentPhone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="font-medium max-w-[150px] truncate">{course?.title || 'Kursga biriktirilmagan'}</div>
                        <div className="text-xs text-muted-foreground">{group?.name || 'Guruhsiz'}</div>
                      </td>
                      <td className="px-6 py-4 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-amber-500 font-semibold">
                          <Award className="w-3.5 h-3.5" />
                          {student.xp} XP (Lvl {student.level})
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-yellow-600 font-semibold">
                          <CircleDollarSign className="w-3.5 h-3.5" />
                          {student.coins} Coins
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          student.paymentStatus === 'PAID'
                            ? 'bg-green-500/10 text-green-500'
                            : student.paymentStatus === 'UPCOMING'
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {student.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-medium rounded-full ${
                          student.status === 'ACTIVE'
                            ? 'bg-green-500/10 text-green-500'
                            : 'bg-red-500/10 text-red-500'
                        }`}>
                          {student.status === 'ACTIVE' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
                          {student.status === 'ACTIVE' ? 'Faol' : 'Bloklangan'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => navigate(`/students/${student._id}`)}
                            className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary transition-colors"
                            title="Ko'rish"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openEditModal(student)}
                            className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student._id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Creation Credentials Modal Screen */}
      {credentials && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="inline-flex p-3 rounded-full bg-green-500/10 text-green-500">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Talaba Muvaffaqiyatli Yaratildi!</h3>
              <p className="text-sm text-muted-foreground mt-1">Ushbu hisob ma'lumotlarini nusxalab, talabaga yuboring.</p>
            </div>
            <div className="bg-secondary rounded-lg p-4 text-left space-y-2.5">
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Telefon Raqami</span>
                <p className="font-bold text-sm">{credentials.phone}</p>
              </div>
              <div className="h-[1px] bg-border" />
              <div>
                <span className="text-xs text-muted-foreground uppercase font-semibold">Boshlang'ich Parol</span>
                <p className="font-bold text-sm text-primary flex items-center gap-1.5">
                  <Key className="w-4 h-4" />
                  {credentials.pass}
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-secondary text-primary hover:bg-secondary/70 transition-all flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Nusxalandi!' : 'Nusxalash'}
              </button>
              <button
                onClick={() => setCredentials(null)}
                className="flex-1 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Creation / Editing Modal */}
      {(createOpen || editStudent) && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-card border rounded-2xl p-6 shadow-xl space-y-6 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">
                {editStudent ? 'Talabani Tahrirlash' : 'Yangi Talaba Qo\'shish'}
              </h3>
              <button
                onClick={() => {
                  setCreateOpen(false);
                  setEditStudent(null);
                }}
                className="p-1 rounded-md text-muted-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={editStudent ? handleEditSubmit : handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Ism va Familiya</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="E.g. John Doe"
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Tug'ilgan Sana</label>
                  <input
                    type="text"
                    required
                    placeholder="Format: DD.MM.YYYY (Masalan: 27.09.2011)"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Talaba Telefon Raqami</label>
                  <input
                    type="text"
                    required
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Ota-ona Telefon Raqami</label>
                  <input
                    type="text"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Elektron Pochta (Ixtiyoriy)</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@infast.uz"
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {!editStudent && (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Tizimga Kirish Paroli</label>
                    <input
                      type="text"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Kamida 6 ta belgi"
                      className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Kursga Biriktirish</label>
                  <select
                    value={courseId}
                    onChange={(e) => setCourseId(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Biriktirmaslik</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">Guruhga Biriktirish</label>
                  <select
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">Biriktirmaslik</option>
                    {groups.map((g) => (
                      <option key={g._id} value={g._id}>{g.name}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-muted-foreground">
                    Keyingi To'lov Sanasi (Ixtiyoriy)
                  </label>
                  <input
                    type="date"
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground">Masalan: har oyning 20-sini to'lov kuni sifatida belgilash uchun</p>
                </div>
              </div>

              {!editStudent && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                  <p className="text-xs text-primary leading-relaxed">
                    <strong>Muhim:</strong> Belgilangan parol o'quvchining tizimga kirishi uchun boshlang'ich parol hisoblanadi.
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setCreateOpen(false);
                    setEditStudent(null);
                  }}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                >
                  Bekor Qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all"
                >
                  {editStudent ? 'Saqlash' : 'Yaratish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
