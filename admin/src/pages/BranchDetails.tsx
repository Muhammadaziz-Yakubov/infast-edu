import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getBranch } from '../api/branches';
import { getStudents } from '../api/students';
import { getGroups } from '../api/groups';
import { getDashboardAnalytics } from '../api/analytics';
import {
  ArrowLeft,
  Building,
  MapPin,
  Phone,
  User,
  Mail,
  Users,
  FolderKanban,
  CreditCard,
  Percent,
  Calendar,
  Shield,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';

export const BranchDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [branch, setBranch] = useState<any | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'groups' | 'students' | 'admin'>('overview');

  useEffect(() => {
    if (id) {
      loadBranchData(id);
    }
  }, [id]);

  const loadBranchData = async (branchId: string) => {
    setLoading(true);
    setError(null);
    try {
      // Load branch details
      const branchData = await getBranch(branchId);
      setBranch(branchData);

      // Load branch students
      const studentsData = await getStudents({ branchId });
      setStudents(studentsData || []);

      // Load branch groups
      const groupsData = await getGroups({ branchId });
      setGroups(groupsData || []);

      // Load branch analytics
      const analyticsData = await getDashboardAnalytics({ branchId });
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Filial ma\'lumotlarini yuklashda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-muted-foreground text-sm font-medium">Filial ma'lumotlari yuklanmoqda...</p>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="p-6 max-w-lg mx-auto bg-card border rounded-2xl shadow-sm text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-lg font-semibold text-primary">Yuklashda xatolik yuz berdi</h2>
        <p className="text-muted-foreground text-sm">{error || 'Filial topilmadi.'}</p>
        <button
          onClick={() => navigate('/branches')}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90"
        >
          <ArrowLeft className="w-4 h-4" />
          Filiallar ro'yxatiga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Back Button & Title */}
      <div className="flex flex-col gap-4">
        <button
          onClick={() => navigate('/branches')}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Filiallar ro'yxatiga qaytish
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary">{branch.name}</h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    branch.status === 'ACTIVE'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {branch.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                </span>
              </div>
              <p className="text-muted-foreground text-sm flex items-center gap-2 mt-1">
                <MapPin className="w-4 h-4" />
                {branch.region}, {branch.district}, {branch.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-border gap-6 select-none overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-primary'
          }`}
        >
          Umumiy ko'rinish
        </button>
        <button
          onClick={() => setActiveTab('groups')}
          className={`py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'groups'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-primary'
          }`}
        >
          Guruhlar ({groups.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'students'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-primary'
          }`}
        >
          O'quvchilar ({students.length})
        </button>
        <button
          onClick={() => setActiveTab('admin')}
          className={`py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'admin'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-primary'
          }`}
        >
          Administrator
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            {/* Total Students */}
            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase">O'quvchilar</span>
                <div className="p-2 bg-indigo-500/10 text-indigo-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{analytics?.totalStudents || 0}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  <span className="text-emerald-600 font-semibold">{analytics?.activeStudents || 0} faol</span> | {analytics?.blockedStudents || 0} bloklangan
                </p>
              </div>
            </div>

            {/* Total Groups */}
            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Guruhlar</span>
                <div className="p-2 bg-amber-500/10 text-amber-600 rounded-lg">
                  <FolderKanban className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{groups.length}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Filialdagi guruhlar soni</p>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Tushum (30 kun)</span>
                <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{(analytics?.monthlyRevenue || 0).toLocaleString()} UZS</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Muvaffaqiyatli to'lovlar</p>
              </div>
            </div>

            {/* Attendance Rate */}
            <div className="p-4 bg-card border rounded-2xl shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Davomat ko'rsatkichi</span>
                <div className="p-2 bg-rose-500/10 text-rose-600 rounded-lg">
                  <Percent className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold">{analytics?.attendanceRate || 0}%</h3>
                <p className="text-xs text-muted-foreground mt-0.5">O'rtacha darsga qatnashish</p>
              </div>
            </div>

          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Branch Card Details */}
            <div className="md:col-span-2 bg-card border rounded-2xl shadow-sm p-6 space-y-6">
              <h3 className="text-lg font-semibold text-primary">Filial haqida ma'lumot</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <Building className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Filial nomi</div>
                      <div className="text-sm font-semibold">{branch.name}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Telefon</div>
                      <div className="text-sm font-semibold">{branch.phone}</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Viloyat / Tuman</div>
                      <div className="text-sm font-semibold">{branch.region} / {branch.district}</div>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-muted-foreground">Yaratilgan sana</div>
                      <div className="text-sm font-semibold">
                        {branch.createdAt ? new Date(branch.createdAt).toLocaleDateString('uz-UZ') : ''}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Admin Card */}
            <div className="bg-card border rounded-2xl shadow-sm p-6 space-y-4">
              <h3 className="text-lg font-semibold text-primary">Filial Administratori</h3>
              {branch.adminId ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center font-bold text-lg text-primary uppercase">
                      {branch.adminId.fullName ? branch.adminId.fullName.charAt(0) : <User />}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">{branch.adminId.fullName}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Shield className="w-3.5 h-3.5" />
                        BRANCH_ADMIN
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t text-sm">
                    <div className="flex gap-2 text-muted-foreground">
                      <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="truncate" title={branch.adminId.email}>{branch.adminId.email}</span>
                    </div>
                    {branch.adminId.phone && (
                      <div className="flex gap-2 text-muted-foreground">
                        <Phone className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>{branch.adminId.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-muted-foreground text-sm">
                  Administrator biriktirilmagan.
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: GROUPS */}
      {activeTab === 'groups' && (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          {groups.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground text-sm">
              Ushbu filialda guruhlar mavjud emas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground select-none">
                    <th className="px-6 py-4">Guruh Nomi</th>
                    <th className="px-6 py-4">Kurs</th>
                    <th className="px-6 py-4">O'quvchilar soni</th>
                    <th className="px-6 py-4">Dars kunlari</th>
                    <th className="px-6 py-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {groups.map((g) => (
                    <tr key={g._id} className="hover:bg-muted/10 transition-colors">
                      <td className="px-6 py-4 font-semibold text-primary">
                        <Link to={`/groups/${g._id}`} className="hover:underline">
                          {g.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {g.courseId?.title || 'Yuklanmagan'}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-indigo-500/10 text-indigo-600 rounded-full">
                          {g.students?.length || 0} nafar
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                        {g.schedule?.days?.join(', ') || ''} | {g.schedule?.time || ''}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          to={`/groups/${g._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border hover:bg-secondary transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Ko'rish
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: STUDENTS */}
      {activeTab === 'students' && (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          {students.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground text-sm">
              Ushbu filialda o'quvchilar mavjud emas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground select-none">
                    <th className="px-6 py-4">F.I.SH.</th>
                    <th className="px-6 py-4">Telefon</th>
                    <th className="px-6 py-4">Guruh</th>
                    <th className="px-6 py-4 text-center">To'lov holati</th>
                    <th className="px-6 py-4 text-center">Tizim holati</th>
                    <th className="px-6 py-4 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {students.map((s) => {
                    const group = groups.find(g => g._id === s.groupId);
                    return (
                      <tr key={s._id} className="hover:bg-muted/10 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-primary">
                            <Link to={`/students/${s._id}`} className="hover:underline">
                              {s.fullName || 'Noma\'lum Talaba'}
                            </Link>
                          </div>
                          <div className="text-xs text-muted-foreground">{s.email || ''}</div>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          {s.studentPhone || ''}
                        </td>
                        <td className="px-6 py-4">
                          {s.groupId ? (
                            <Link to={`/groups/${s.groupId}`} className="hover:underline font-medium text-primary">
                              {group?.name || 'Guruh'}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground text-xs">Biriktirilmagan</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              s.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : s.paymentStatus === 'UPCOMING'
                                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {s.paymentStatus === 'PAID' ? "To'langan" : s.paymentStatus === 'UPCOMING' ? 'Yaqinda' : "To'lanmagan"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              s.status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/10 text-red-600 dark:text-red-400'
                            }`}
                          >
                            {s.status === 'ACTIVE' ? 'Faol' : 'Bloklangan'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/students/${s._id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-md border hover:bg-secondary transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Profil
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: ADMIN */}
      {activeTab === 'admin' && (
        <div className="bg-card border rounded-2xl shadow-sm p-6 max-w-xl">
          <h3 className="text-lg font-semibold text-primary mb-4">Filial Administratori tafsilotlari</h3>
          {branch.adminId ? (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-2xl uppercase">
                  {branch.adminId.fullName ? branch.adminId.fullName.charAt(0) : <User />}
                </div>
                <div>
                  <h4 className="text-lg font-bold">{branch.adminId.fullName}</h4>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Shield className="w-4 h-4 text-primary" />
                    Filial Administratori (BRANCH_ADMIN)
                  </p>
                </div>
              </div>

              <div className="space-y-4 border-t pt-4 text-sm">
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase mt-0.5">Email (Login):</span>
                  <span className="col-span-2 font-semibold text-primary">{branch.adminId.email}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase mt-0.5">Telefon:</span>
                  <span className="col-span-2 font-medium">{branch.adminId.phone || 'Kiritilmagan'}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase mt-0.5">Yaratilgan sana:</span>
                  <span className="col-span-2 font-medium">
                    {branch.adminId.createdAt ? new Date(branch.adminId.createdAt).toLocaleDateString('uz-UZ') : ''}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Filialga administrator biriktirilmagan.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
export default BranchDetails;
