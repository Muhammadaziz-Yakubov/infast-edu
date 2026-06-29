import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStudentProfile } from '../api/students';
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
} from 'lucide-react';

export const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentSummary, setPaymentSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      getStudentProfile(id),
      getStudentPayments(id),
      getStudentPaymentSummary(id),
    ]).then(([profileRes, paymentsRes, summaryRes]) => {
      setProfile(profileRes);
      setPayments(paymentsRes || []);
      setPaymentSummary(summaryRes);
      setLoading(false);
    }).catch((err) => {
      alert(err.message || 'Xatolik yuz berdi');
      navigate('/students');
    });
  }, [id, navigate]);

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

        </div>

      </div>

    </div>
  );
};
