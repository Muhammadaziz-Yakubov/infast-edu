import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  User,
  Trash2,
  Gift,
  RefreshCw,
  Search,
} from 'lucide-react';
import { referralsApi } from '../api/referrals';

type ReferralStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

interface Referral {
  _id: string;
  referrerId: {
    _id: string;
    fullName: string;
    studentPhone: string;
    avatar?: string;
  } | null;
  friendName: string;
  friendPhone: string;
  status: ReferralStatus;
  coinsAwarded: boolean;
  createdAt: string;
}

const statusConfig: Record<ReferralStatus, { label: string; color: string; bg: string; icon: React.FC<any> }> = {
  PENDING: { label: 'Kutilmoqda', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700', icon: Clock },
  APPROVED: { label: 'Qabul qilindi', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700', icon: CheckCircle },
  REJECTED: { label: 'Rad etildi', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700', icon: XCircle },
};

export const Referrals: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<ReferralStatus | 'ALL'>('ALL');

  const { data: referrals = [], isLoading, refetch } = useQuery<Referral[]>({
    queryKey: ['referrals'],
    queryFn: referralsApi.getAll,
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => referralsApi.approve(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => referralsApi.reject(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => referralsApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['referrals'] }),
  });

  const filtered = referrals.filter((r) => {
    const matchStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const query = searchQuery.toLowerCase();
    const matchSearch =
      !query ||
      r.friendName.toLowerCase().includes(query) ||
      r.friendPhone.includes(query) ||
      (r.referrerId?.fullName || '').toLowerCase().includes(query);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: referrals.length,
    pending: referrals.filter((r) => r.status === 'PENDING').length,
    approved: referrals.filter((r) => r.status === 'APPROVED').length,
    rejected: referrals.filter((r) => r.status === 'REJECTED').length,
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Referral Takliflar</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Talabalar yuborgan do'st takliflarini boshqaring. Tasdiqlash — talabaga +2000 coin!
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-card hover:bg-secondary text-sm font-medium transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Yangilash
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Jami", value: stats.total, color: "text-primary", icon: Users },
          { label: "Kutilmoqda", value: stats.pending, color: "text-amber-500", icon: Clock },
          { label: "Tasdiqlangan", value: stats.approved, color: "text-emerald-500", icon: CheckCircle },
          { label: "Rad etilgan", value: stats.rejected, color: "text-red-500", icon: XCircle },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-secondary ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-card border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ism yoki telefon bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-secondary border border-transparent focus:border-border text-sm outline-none"
          />
        </div>

        {/* Status Filter */}
        <div className="flex gap-2 flex-wrap">
          {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                filterStatus === s
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-secondary border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {s === 'ALL' ? 'Barchasi' : statusConfig[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Yuklanmoqda...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
            <Gift className="w-12 h-12 opacity-30" />
            <p className="font-medium">Referral topilmadi</p>
            <p className="text-sm text-center max-w-xs">Hozircha hech qanday taklif yuborilmagan yoki filtr bo'yicha natija yo'q.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-secondary/50">
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Taklif qiluvchi</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Do'st ismi</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Do'st raqami</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Holat</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Sana</th>
                  <th className="px-4 py-3 text-left font-semibold text-muted-foreground">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((referral) => {
                  const cfg = statusConfig[referral.status];
                  const StatusIcon = cfg.icon;
                  const isPending = referral.status === 'PENDING';
                  const isProcessing =
                    approveMutation.isPending || rejectMutation.isPending || deleteMutation.isPending;

                  return (
                    <tr key={referral._id} className="hover:bg-secondary/30 transition-colors">
                      {/* Referrer */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            {referral.referrerId?.avatar ? (
                              <img
                                src={referral.referrerId.avatar}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="w-4 h-4 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium leading-none">
                              {referral.referrerId?.fullName || 'Noma\'lum'}
                            </p>
                            {referral.referrerId?.studentPhone && (
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {referral.referrerId.studentPhone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Friend name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="font-medium">{referral.friendName}</span>
                        </div>
                      </td>

                      {/* Friend phone */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
                          <a
                            href={`tel:${referral.friendPhone}`}
                            className="text-primary hover:underline"
                          >
                            {referral.friendPhone}
                          </a>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {cfg.label}
                          {referral.status === 'APPROVED' && referral.coinsAwarded && (
                            <span className="ml-1 text-amber-500">+2000 🪙</span>
                          )}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {formatDate(referral.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {isPending && (
                            <>
                              {/* Approve */}
                              <button
                                disabled={isProcessing}
                                onClick={() => approveMutation.mutate(referral._id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                                title="Qabul qilish (+2000 coin)"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Qabul
                              </button>

                              {/* Reject */}
                              <button
                                disabled={isProcessing}
                                onClick={() => rejectMutation.mutate(referral._id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                                title="Rad etish"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Rad
                              </button>
                            </>
                          )}

                          {/* Delete */}
                          <button
                            disabled={isProcessing}
                            onClick={() => {
                              if (confirm('Bu referralni o\'chirishni tasdiqlaysizmi?')) {
                                deleteMutation.mutate(referral._id);
                              }
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors disabled:opacity-50"
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

      {/* Info tip */}
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl p-4 flex gap-3 items-start">
        <Gift className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Referral tizimi haqida</p>
          <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
            Talaba do'stini taklif qiladi → Admin tasdiqlaganda taklif qilgan talabaga <strong>+2000 coin</strong> beriladi.
            Rad etilganda hech qanday coin berilmaydi. Har bir telefon raqam faqat bir marta taklif qilinishi mumkin.
          </p>
        </div>
      </div>
    </div>
  );
};
