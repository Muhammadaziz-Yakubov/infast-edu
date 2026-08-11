import React, { useEffect, useState, useCallback } from 'react';
import {
  getPayments,
  confirmPayment,
  getBlockedStudents,
  checkPaymentStatuses,
} from '../api/payments';
import { getStudents } from '../api/students';
import { showSuccess, showError } from '../utils/toast';
import {
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  X,
  PlusCircle,
  ShieldOff,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Clock,
  Calendar,
} from 'lucide-react';

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatMoney(n: number): string {
  return n.toLocaleString('uz-UZ') + " so'm";
}

// ─── types ────────────────────────────────────────────────────────────────────

interface PaymentRecord {
  _id: string;
  studentId: string;
  studentName: string;
  studentLabel?: string;
  studentPhone?: string;
  amount: number;
  paymentDate: string;
  nextPaymentDate: string;
  status: string;
  transactionId?: string;
}

interface BlockedStudent {
  _id: string;
  studentName: string;
  studentPhone: string;
  studentLabel?: string;
  lastPaymentAmount: number;
  nextPaymentDate: string | null;
  daysOverdue: number;
}

// ─── tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'paid' | 'blocked';

// ─── component ────────────────────────────────────────────────────────────────

export const Payments: React.FC = () => {
  const [tab, setTab] = useState<Tab>('blocked');
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [blocked, setBlocked] = useState<BlockedStudent[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // USD exchange rate (CBU)
  const [usdRate, setUsdRate] = useState<number | null>(null);
  const [rateLoading, setRateLoading] = useState(false);

  // Search
  const [search, setSearch] = useState('');

  // Modal
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amount, setAmount] = useState('500000');
  const [transactionId, setTransactionId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // ── fetch data ──────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [pList, bList, sList] = await Promise.all([
        getPayments(),
        getBlockedStudents(),
        getStudents(),
      ]);
      setPayments(pList);
      setBlocked(bList);
      setStudents(sList);
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Maʼlumotlarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    fetchUsdRate();
  }, [loadData]);

  // ── USD rate from CBU ────────────────────────────────────────────────────────

  const fetchUsdRate = async () => {
    setRateLoading(true);
    try {
      const res = await fetch('https://cbu.uz/uz/arkhiv-kursov-valyut/json/USD/');
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        setUsdRate(parseFloat(json[0].Rate));
      }
    } catch {
      // silent fail
    } finally {
      setRateLoading(false);
    }
  };

  // ── manual status refresh ────────────────────────────────────────────────────

  const handleRefreshStatuses = async () => {
    setRefreshing(true);
    try {
      await checkPaymentStatuses();
      await loadData();
      showSuccess("Barcha toʼlov statuslari yangilandi");
    } catch (e: any) {
      showError(e?.response?.data?.message || 'Yangilashda xatolik');
    } finally {
      setRefreshing(false);
    }
  };

  // ── confirm payment ──────────────────────────────────────────────────────────

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      showError("Iltimos, talabani tanlang");
      return;
    }
    setSubmitting(true);
    try {
      await confirmPayment({
        studentId: selectedStudentId,
        amount: Number(amount),
        transactionId: transactionId || undefined,
      });
      setCreateOpen(false);
      setSelectedStudentId('');
      setTransactionId('');
      await loadData();
      showSuccess("Toʼlov muvaffaqiyatli qabul qilindi ✓");
    } catch (err: any) {
      showError(err?.response?.data?.message || err.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  // ── filtered lists ───────────────────────────────────────────────────────────

  const paidPayments = payments
    .filter((p) => p.status === 'PAID')
    .filter((p) =>
      !search ||
      p.studentName.toLowerCase().includes(search.toLowerCase()) ||
      (p.transactionId || '').toLowerCase().includes(search.toLowerCase())
    );

  const filteredBlocked = blocked.filter(
    (b) =>
      !search ||
      b.studentName.toLowerCase().includes(search.toLowerCase()) ||
      b.studentPhone.includes(search)
  );

  // ── stats ────────────────────────────────────────────────────────────────────

  const totalPaidThisMonth = payments
    .filter((p) => {
      const d = new Date(p.paymentDate);
      const now = new Date();
      return p.status === 'PAID' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((s, p) => s + p.amount, 0);

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 animate-in fade-in duration-200">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Toʼlovlar & Billing</h1>
          <p className="text-muted-foreground">Oʼquvchilar subscription toʼlovlari hisob-kitobi va monitoringi.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefreshStatuses}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border bg-card hover:bg-secondary transition-all shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Yangilash
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Toʼlov Qabul Qilish
          </button>
        </div>
      </div>

      {/* ── Stats + USD rate ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Blocked */}
        <div className="p-4 bg-card border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
            <ShieldOff className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase">Bloklangan</span>
            <p className="text-lg font-bold text-red-500">{blocked.length} ta oʼquvchi</p>
          </div>
        </div>

        {/* Paid this month */}
        <div className="p-4 bg-card border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase">Bu oy toʼlangan</span>
            <p className="text-lg font-bold">{formatMoney(totalPaidThisMonth)}</p>
          </div>
        </div>

        {/* Total paid records */}
        <div className="p-4 bg-card border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-lg">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase">Jami yozuvlar</span>
            <p className="text-lg font-bold">{payments.filter(p => p.status === 'PAID').length} ta</p>
          </div>
        </div>

        {/* USD rate */}
        <div className="p-4 bg-card border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase">
              USD kursi (CBU)
            </span>
            {rateLoading ? (
              <div className="h-4 w-24 bg-muted rounded animate-pulse mt-1" />
            ) : usdRate ? (
              <p className="text-lg font-bold text-amber-600">{usdRate.toLocaleString()} soʻm</p>
            ) : (
              <button
                onClick={fetchUsdRate}
                className="text-xs text-primary underline mt-1"
              >
                Kursni yuklash
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tabs + Search ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        {/* Tabs */}
        <div className="flex bg-card border rounded-xl p-1 gap-1">
          <button
            onClick={() => setTab('blocked')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === 'blocked'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <ShieldOff className="w-4 h-4" />
            Bloklangan ({blocked.length})
          </button>
          <button
            onClick={() => setTab('paid')}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              tab === 'paid'
                ? 'bg-green-500 text-white shadow-sm'
                : 'text-muted-foreground hover:bg-secondary'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Toʼlangan ({payments.filter(p => p.status === 'PAID').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ism, telefon yoki tranzaksiya ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border bg-card focus:ring-2 focus:ring-primary outline-none transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : tab === 'blocked' ? (
          /* ── BLOCKED TAB ── */
          filteredBlocked.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="font-semibold text-lg">Ajoyib! Hozirda bloklangan oʼquvchi yoʼq.</p>
              <p className="text-sm text-muted-foreground">Barcha oʼquvchilar faol hisobga ega.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-red-500/5 text-xs font-semibold uppercase text-muted-foreground">
                    <th className="px-6 py-4">Oʼquvchi</th>
                    <th className="px-6 py-4">Telefon</th>
                    <th className="px-6 py-4">Oxirgi summa</th>
                    <th className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Toʼlov sanasi
                      </div>
                    </th>
                    <th className="px-6 py-4 text-center">Kechikish</th>
                    <th className="px-6 py-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {filteredBlocked.map((b) => (
                    <tr key={String(b._id)} className="hover:bg-red-500/5 transition-colors">
                      <td className="px-6 py-4 font-semibold flex items-center gap-1.5">
                        {b.studentLabel && (
                          <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 rounded shrink-0">
                            {b.studentLabel}
                          </span>
                        )}
                        <span>{b.studentName}</span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground font-mono text-xs">
                        {b.studentPhone || '—'}
                      </td>
                      <td className="px-6 py-4 font-bold text-foreground">
                        {b.lastPaymentAmount ? formatMoney(b.lastPaymentAmount) : '—'}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(b.nextPaymentDate)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/10 text-red-600">
                          <Clock className="w-3 h-3" />
                          {b.daysOverdue} kun
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-500/10 text-red-500 animate-pulse">
                          <ShieldOff className="w-3 h-3" />
                          BLOKLANGAN
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          /* ── PAID TAB ── */
          paidPayments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="font-semibold">Toʼlov topilmadi</p>
              {search && (
                <p className="text-sm text-muted-foreground">
                  "<span className="font-semibold">{search}</span>" boʼyicha natija yoʼq.
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b bg-green-500/5 text-xs font-semibold uppercase text-muted-foreground">
                    <th className="px-6 py-4">Oʼquvchi</th>
                    <th className="px-6 py-4">Summa</th>
                    <th className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Toʼlov vaqti
                      </div>
                    </th>
                    <th className="px-6 py-4">Keyingi toʼlov</th>
                    <th className="px-6 py-4">Tranzaksiya ID</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {paidPayments.map((p) => (
                    <tr key={p._id} className="hover:bg-green-500/5 transition-colors">
                      <td className="px-6 py-4 font-semibold">
                        <div className="flex items-center gap-1.5">
                          {p.studentLabel && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 rounded shrink-0">
                              {p.studentLabel}
                            </span>
                          )}
                          <span>{p.studentName}</span>
                        </div>
                        {p.studentPhone && (
                          <span className="text-xs text-muted-foreground font-normal font-mono">
                            {p.studentPhone}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-bold text-green-600">
                        {formatMoney(p.amount)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        <div className="flex flex-col">
                          <span>{formatDateTime(p.paymentDate)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {formatDate(p.nextPaymentDate)}
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-muted-foreground">
                        {p.transactionId || 'Kassa orqali'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-green-500/10 text-green-600">
                          <CheckCircle className="w-3 h-3" />
                          PAID
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-3 border-t text-xs text-muted-foreground flex items-center justify-between">
                <span>{paidPayments.length} ta yozuv</span>
                <span>Jami: {formatMoney(paidPayments.reduce((s, p) => s + p.amount, 0))}</span>
              </div>
            </div>
          )
        )}
      </div>

      {/* ── Payment Modal ───────────────────────────────────────────── */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-primary" />
                Toʼlov Qabul Qilish
              </h3>
              <button
                onClick={() => setCreateOpen(false)}
                className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* USD rate banner */}
            {usdRate && (
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs font-semibold text-amber-700">
                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                Bugungi USD kursi (CBU): {usdRate.toLocaleString()} soʻm
              </div>
            )}

            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Talabani tanlang</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">— Talabani tanlang —</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} {s.studentPhone ? `(${s.studentPhone})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Summa (UZS)</label>
                <input
                  type="number"
                  required
                  min={1000}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                />
                {usdRate && Number(amount) > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    ≈ ${(Number(amount) / usdRate).toFixed(2)} USD
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tranzaksiya Chek ID (Ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="E.g. click_tx_998877"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-60"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <PlusCircle className="w-4 h-4" />
                  )}
                  Tasdiqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
