import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentProfile, getStudentContract, generateStudentContract } from '../api/students';
import { getStudentPayments, getStudentPaymentSummary } from '../api/payments';
import type { Payment } from '../utils/mockDb';
import {
  ArrowLeft,
  Phone,
  Mail,
  Calendar,
  Award,
  CircleDollarSign,
  TrendingUp,
  BookOpen,
  CheckCircle,
  FileText,
  Bookmark,
  CalendarDays,
  CreditCard,
  X,
  Download,
  Eye,
  RefreshCw,
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [contract, setContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Modal & Form States
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [address, setAddress] = useState('');
  const [passportOrJshshir, setPassportOrJshshir] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState<number | ''>('');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [contractDate, setContractDate] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getStudentProfile(id),
      getStudentPayments(id),
      getStudentPaymentSummary(id),
      getStudentContract(id).catch(() => null),
    ]).then(([profileRes, paymentsRes, summaryRes, contractRes]) => {
      setProfile(profileRes);
      setPayments(paymentsRes || []);
      setPaymentSummary(summaryRes);
      setContract(contractRes);
      setLoading(false);
    }).catch((err) => {
      alert(err.message || 'Xatolik yuz berdi');
      navigate('/students');
    });
  }, [id, navigate]);

  const getAge = (dobString: string): number => {
    if (!dobString) return 18;
    let birthDate: Date;
    if (dobString.includes('.')) {
      const parts = dobString.split('.');
      birthDate = new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    } else {
      birthDate = new Date(dobString);
    }
    if (isNaN(birthDate.getTime())) return 18;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const isUnder18 = profile ? getAge(profile.dateOfBirth) < 18 : false;

  const openGenerateModal = () => {
    if (contract) {
      setAddress(contract.address || '');
      setPassportOrJshshir(contract.passportOrJshshir || '');
      setMonthlyPayment(contract.monthlyPayment || '');
      setParentName(contract.parentName || '');
      setParentPhone(contract.parentPhone || profile?.parentPhone || '');
      setContractDate(contract.contractDate ? new Date(contract.contractDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    } else {
      setAddress('');
      setPassportOrJshshir('');
      setMonthlyPayment(profile?.courseId?.price || 500000);
      setParentName('');
      setParentPhone(profile?.parentPhone || '');
      setContractDate(new Date().toISOString().split('T')[0]);
    }
    setShowModal(true);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setGenerating(true);
    try {
      const res = await generateStudentContract(id, {
        address,
        passportOrJshshir,
        monthlyPayment: monthlyPayment === '' ? undefined : Number(monthlyPayment),
        parentName,
        parentPhone,
        contractDate,
      });
      setContract(res);
      setShowModal(false);
      alert('Shartnoma muvaffaqiyatli yaratildi!');
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Xatolik yuz berdi');
    } finally {
      setGenerating(false);
    }
  };

  const getFileUrl = (path: string) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const rootUrl = baseUrl.replace(/\/api$/, '');
    return `${rootUrl}${path}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Back button & Name */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/students')}
          className="p-2 border rounded-lg hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <div className="flex items-center gap-3">
            {profile.label && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary border border-primary/20 rounded-md">
                {profile.label}
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{profile.fullName}</h1>
            <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
              profile.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {profile.status === 'ACTIVE' ? 'Faol' : 'Bloklangan'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">ID: {profile._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Personal info & Gamification */}
        <div className="space-y-6 lg:col-span-1">
          
          {/* Personal Info Card */}
          <div className="bg-card border rounded-xl p-6 space-y-4 shadow-sm">
            <div className="text-center pb-4 border-b">
              <img
                src={profile.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.fullName}`}
                alt=""
                className="w-24 h-24 rounded-full bg-secondary mx-auto border"
              />
              <h3 className="font-bold text-lg mt-3">{profile.fullName}</h3>
              <p className="text-xs text-muted-foreground">O'quvchi</p>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span className="text-foreground">{profile.studentPhone} (Talaba)</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Phone className="w-4 h-4 shrink-0" />
                <span className="text-foreground">{profile.parentPhone} (Valiy)</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Mail className="w-4 h-4 shrink-0" />
                <span className="text-foreground truncate">{profile.email || 'Kiritilmagan'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-muted-foreground">
                <Calendar className="w-4 h-4 shrink-0" />
                <span className="text-foreground">Tug'ilgan kuni: {profile.dateOfBirth}</span>
              </div>
            </div>
          </div>

          {/* Gamification Stats */}
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-primary" />
              Gamifikatsiya reytingi
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Daraja (Level)</span>
                <p className="text-xl font-bold text-primary mt-1">{profile.level}</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Reyting o'rni</span>
                <p className="text-xl font-bold text-green-500 mt-1">#{profile.rankingPosition || 3}</p>
              </div>
              <div className="p-3 bg-secondary rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Jami XP</span>
                <p className="text-xl font-bold text-amber-500 mt-1 flex items-center justify-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {profile.xp}
                </p>
              </div>
              <div className="p-3 bg-secondary rounded-lg text-center">
                <span className="text-xs text-muted-foreground">Koinlar balansi</span>
                <p className="text-xl font-bold text-yellow-600 mt-1 flex items-center justify-center gap-1">
                  <CircleDollarSign className="w-4 h-4" />
                  {profile.coins}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Learning, Attendance, Payments */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Learning Progress Card */}
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-primary" />
              O'quv ko'rsatkichlari
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-muted-foreground">Kurs:</span>
                <span className="font-semibold block text-sm mt-0.5">{profile.courseId?.title || 'Hech qanday kursga biriktirilmagan'}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Guruh:</span>
                <span className="font-semibold block text-sm mt-0.5">{profile.groupId?.name || 'Guruhsiz'}</span>
              </div>
            </div>
            
            <div className="h-[1px] bg-border my-2" />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <CheckCircle className="w-5 h-5 text-green-500 mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">Tugallangan darslar</span>
                <p className="font-bold text-sm mt-0.5">
                  {profile.completedLessonsCount || 0} / {profile.totalLessonsCount || 0}
                </p>
              </div>
              <div>
                <FileText className="w-5 h-5 text-blue-500 mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">Uy vazifalari reytingi</span>
                <p className="font-bold text-sm mt-0.5">{profile.homeworkProgress || 0}%</p>
              </div>
              <div>
                <Bookmark className="w-5 h-5 text-purple-500 mx-auto mb-1" />
                <span className="text-xs text-muted-foreground">O'rtacha test bali</span>
                <p className="font-bold text-sm mt-0.5">{profile.averageQuizScore || 0}%</p>
              </div>
            </div>
          </div>

          {/* Attendance Stats Card */}
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Davomat hisoboti
            </h3>
            <div className="flex items-center justify-around gap-4 text-center">
              <div>
                <span className="text-xs text-muted-foreground">Qatnashish darajasi</span>
                <p className="text-2xl font-bold text-primary mt-1">{profile.attendancePercentage ?? 0}%</p>
              </div>
              <div className="w-[1px] h-10 bg-border" />
              <div>
                <span className="text-xs text-muted-foreground">Darsda bo'lgan kunlar</span>
                <p className="text-2xl font-bold text-green-500 mt-1">{profile.presentCount ?? 0} kun</p>
              </div>
              <div className="w-[1px] h-10 bg-border" />
              <div>
                <span className="text-xs text-muted-foreground">Qoldirilgan darslar</span>
                <p className="text-2xl font-bold text-red-500 mt-1">{profile.absentCount ?? 0} kun</p>
              </div>
            </div>
          </div>

          {/* Payments & Subscription Ledger */}
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                To'lovlar & Billing
              </h3>
              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                (paymentSummary?.paymentStatus ?? profile.paymentStatus) === 'PAID'
                  ? 'bg-green-500/10 text-green-500'
                  : (paymentSummary?.paymentStatus ?? profile.paymentStatus) === 'UPCOMING'
                  ? 'bg-amber-500/10 text-amber-500'
                  : (paymentSummary?.paymentStatus ?? profile.paymentStatus) === 'UNPAID'
                  ? 'bg-gray-500/10 text-gray-400'
                  : 'bg-red-500/10 text-red-500'
              }`}>
                {(paymentSummary?.paymentStatus ?? profile.paymentStatus) === 'PAID' ? "To'langan" :
                 (paymentSummary?.paymentStatus ?? profile.paymentStatus) === 'UPCOMING' ? "Yaqinlashmoqda" :
                 (paymentSummary?.paymentStatus ?? profile.paymentStatus) === 'UNPAID' ? "To'lov qilinmagan" :
                 "Muddati o'tgan"}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-muted-foreground">Keyingi to'lov sanasi:</span>
              <span className="font-bold text-foreground">
                {paymentSummary?.nextPaymentDateFormatted ?? (payments.length > 0 ? payments[0].nextPaymentDate : "To'lov qilinmagan")}
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground font-semibold block uppercase">To'lovlar tarixi</span>
              {payments.length === 0 ? (
                <p className="text-xs text-muted-foreground">Hech qanday to'lov mavjud emas.</p>
              ) : (
                <div className="divide-y border rounded-lg bg-secondary/30">
                  {payments.map((p) => (
                    <div key={p._id} className="flex justify-between items-center p-3 text-sm">
                      <div>
                        <p className="font-semibold">{p.amount.toLocaleString()} so'm</p>
                        <span className="text-xs text-muted-foreground">{p.paymentDate}</span>
                      </div>
                      <span className="text-xs text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full font-semibold">
                        {p.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contract Management Card */}
          <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base border-b pb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              Shartnoma (Contract)
            </h3>
            
            {!contract ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-secondary/20 border border-dashed rounded-lg">
                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block">Holat:</span>
                  <span className="text-sm font-bold text-yellow-600 dark:text-yellow-500">Generatsiya qilinmagan</span>
                </div>
                <button
                  onClick={openGenerateModal}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  Shartnoma yaratish
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-green-500/5 border border-green-500/10 rounded-lg">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Holat:</span>
                    <span className="text-sm font-bold text-green-500 flex items-center gap-1.5 mt-0.5">
                      <CheckCircle className="w-4 h-4" />
                      Yaratilgan
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Shartnoma raqami:</span>
                    <span className="text-sm font-mono font-bold text-foreground mt-0.5 block">
                      {contract.contractNumber}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Yaratilgan sana:</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {new Date(contract.generatedDate).toLocaleDateString('uz-UZ', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Kurs / Guruh:</span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {contract.courseName} / {contract.groupName}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => window.open(getFileUrl(contract.pdfUrl), '_blank')}
                    className="px-4 py-2 border hover:bg-secondary text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Ko'rish
                  </button>
                  
                  <a
                    href={getFileUrl(contract.pdfUrl)}
                    download={`${contract.contractNumber}.pdf`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 border hover:bg-secondary text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Yuklab olish
                  </a>

                  <button
                    onClick={openGenerateModal}
                    className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Qayta yaratish (Regenerate)
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Generate Contract Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-lg">
                {contract ? 'Shartnomani qayta yaratish' : 'Yangi shartnoma yaratish'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleGenerate} className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Student F.I.SH.
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.fullName || ''}
                    className="w-full px-3 py-2 border rounded-lg bg-secondary/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Kurs nomi
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.courseId?.title || 'Kiritilmagan'}
                    className="w-full px-3 py-2 border rounded-lg bg-secondary/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Guruh nomi
                  </label>
                  <input
                    type="text"
                    disabled
                    value={profile?.groupId?.name || 'Kiritilmagan'}
                    className="w-full px-3 py-2 border rounded-lg bg-secondary/50 text-muted-foreground cursor-not-allowed"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Yashash manzili
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Toshkent sh., Chilonzor tumani..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Pasport yoki JSHSHIR
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="AA1234567 yoki 3010190..."
                    value={passportOrJshshir}
                    onChange={(e) => setPassportOrJshshir(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Oylik to'lov summasi (UZS)
                  </label>
                  <input
                    type="number"
                    required
                    value={monthlyPayment}
                    onChange={(e) => setMonthlyPayment(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-bold"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                    Shartnoma sanasi
                  </label>
                  <input
                    type="date"
                    required
                    value={contractDate}
                    onChange={(e) => setContractDate(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>

                {isUnder18 && (
                  <div className="col-span-2 border-t pt-4 mt-2 space-y-4">
                    <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 text-xs text-primary font-medium">
                      O'quvchi 18 yoshga to'lmaganligi sababli ota-ona yoki vasiy ma'lumotlari kiritilishi shart.
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                          Vasiyning to'liq ismi (F.I.SH.)
                        </label>
                        <input
                          type="text"
                          required={isUnder18}
                          placeholder="Aliyev Vali..."
                          value={parentName}
                          onChange={(e) => setParentName(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-semibold text-muted-foreground uppercase mb-1">
                          Vasiy telefoni
                        </label>
                        <input
                          type="text"
                          required={isUnder18}
                          placeholder="+998901234567"
                          value={parentPhone}
                          onChange={(e) => setParentPhone(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border hover:bg-secondary text-sm font-semibold rounded-lg transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={generating}
                  className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 text-sm font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  {generating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      Generatsiya qilinmoqda...
                    </>
                  ) : (
                    <>Shartnomani tasdiqlash</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
