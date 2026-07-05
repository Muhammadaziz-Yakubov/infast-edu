import React, { useEffect, useState } from 'react';
import { getPayments, confirmPayment } from '../api/payments';
import { getStudents } from '../api/students';
import type { Payment, Student } from '../utils/mockDb';
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  PlusCircle,
} from 'lucide-react';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');

  // Confirmation Modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [amount, setAmount] = useState('500000');
  const [transactionId, setTransactionId] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pList, sList] = await Promise.all([
        getPayments(),
        getStudents(),
      ]);
      setPayments(pList);
      setStudents(sList);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId) {
      alert('Iltimos, talabani tanlang');
      return;
    }
    try {
      await confirmPayment({
        studentId: selectedStudentId,
        amount: Number(amount),
        transactionId,
      });
      setCreateOpen(false);
      setSelectedStudentId('');
      setTransactionId('');
      await loadData();
      alert('To\'lov muvaffaqiyatli qabul qilindi');
    } catch (err: any) {
      alert(err.message || 'Xatolik yuz berdi');
    }
  };

  // Filter payments
  const filteredPayments = payments.filter((p) => {
    const matchesSearch = p.studentName.toLowerCase().includes(search.toLowerCase());
    return p.status === 'PAID' && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">To'lovlar & Billing</h1>
          <p className="text-muted-foreground">O'quvchilar subscription to'lovlari hisob-kitobi va monitoringi.</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi To'lov Qabul Qilish
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-4 bg-card border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-lg">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase">Jami To'langanlar</span>
            <p className="text-lg font-bold">{payments.filter(p => p.status === 'PAID').length} ta talaba</p>
          </div>
        </div>
        <div className="p-4 bg-card border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 text-amber-500 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase">Yaqinda to'lashi kerak</span>
            <p className="text-lg font-bold">{payments.filter(p => p.status === 'UPCOMING').length} ta talaba</p>
          </div>
        </div>
        <div className="p-4 bg-card border rounded-xl shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-lg">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-xs text-muted-foreground block font-semibold uppercase">Muddati O'tganlar (Qarzlar)</span>
            <p className="text-lg font-bold">{payments.filter(p => p.status === 'OVERDUE').length} ta talaba</p>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border rounded-xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="O'quvchi ismi orqali qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        {/* Filter status is removed to only show PAID payments in the list */}

      </div>

      {/* Payments Ledger table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredPayments.length === 0 ? (
          <p className="text-sm text-muted-foreground p-12 text-center">To'lovlar topilmadi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground select-none">
                  <th className="px-6 py-4">O'quvchi</th>
                  <th className="px-6 py-4">Summa (UZS)</th>
                  <th className="px-6 py-4">To'lov Sanasi</th>
                  <th className="px-6 py-4">Keyingi To'lov Sanasi</th>
                  <th className="px-6 py-4 text-center">Tranzaksiya ID</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {filteredPayments.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-semibold flex items-center gap-1">
                      {p.studentLabel && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 rounded shrink-0">
                          {p.studentLabel}
                        </span>
                      )}
                      <span>{p.studentName}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-primary">
                      {p.amount.toLocaleString()} so'm
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{p.paymentDate}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{p.nextPaymentDate}</td>
                    <td className="px-6 py-4 text-center text-xs font-mono text-muted-foreground">
                      {p.transactionId || 'Kassa orqali'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                        p.status === 'PAID'
                          ? 'bg-green-500/10 text-green-500'
                          : p.status === 'UPCOMING'
                          ? 'bg-amber-500/10 text-amber-500'
                          : 'bg-red-500/10 text-red-500 animate-pulse'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirm Payment Modal dialog */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold">To'lov Qabul Qilish</h3>
              <button onClick={() => setCreateOpen(false)} className="p-1 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirm} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Talabani tanlang</label>
                <select
                  required
                  value={selectedStudentId}
                  onChange={(e) => setSelectedStudentId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Talabani tanlang</option>
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.fullName} ({s.studentPhone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Summa (UZS)</label>
                <input
                  type="number"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Tranzaksiya Chek ID (Ixtiyoriy)</label>
                <input
                  type="text"
                  placeholder="E.g. click_tx_998877"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
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
                  className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
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
