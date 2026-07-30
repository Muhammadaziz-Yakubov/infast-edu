import React, { useEffect, useState } from 'react';
import { getStudentsCoins, adjustStudentCoins, type StudentCoinInfo } from '../api/coins';
import { Coins as CoinsIcon, Plus, Minus, Search, User, Sparkles } from 'lucide-react';

export const Coins: React.FC = () => {
  const [students, setStudents] = useState<StudentCoinInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Adjust Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentCoinInfo | null>(null);
  const [actionType, setActionType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [amount, setAmount] = useState('100');
  const [reason, setReason] = useState('Darsdagi faollik uchun');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const list = await getStudentsCoins();
      setStudents(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (student: StudentCoinInfo, type: 'ADD' | 'DEDUCT') => {
    setSelectedStudent(student);
    setActionType(type);
    setAmount('100');
    setReason(type === 'ADD' ? 'Darsdagi faollik va yaxshi natija uchun' : 'Dars qoldirgani / intizom buzilgani uchun');
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setSubmitting(true);
    try {
      await adjustStudentCoins(selectedStudent._id, Number(amount), actionType, reason);
      setModalOpen(false);
      await loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const query = searchQuery.toLowerCase();
    return (
      s.fullName.toLowerCase().includes(query) ||
      (s.studentPhone && s.studentPhone.toLowerCase().includes(query)) ||
      (s.email && s.email.toLowerCase().includes(query))
    );
  });

  const totalCoinsInSystem = students.reduce((acc, curr) => acc + (curr.coins || 0), 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Coinlar (Tangalar) Boshqaruvi</h1>
          <p className="text-muted-foreground">O'quvchilar tanga balansini boshqarish va mukofot / jarimalar taqsimlash.</p>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <CoinsIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Tizimdagi Jami Tangalar</p>
            <p className="text-2xl font-black text-foreground">{totalCoinsInSystem.toLocaleString()} 🪙</p>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
            <User className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">Faol O'quvchilar Soni</p>
            <p className="text-2xl font-black text-foreground">{students.length} ta</p>
          </div>
        </div>

        <div className="bg-card border rounded-2xl p-5 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground">O'rtacha Tanga Balansi</p>
            <p className="text-2xl font-black text-foreground">
              {students.length > 0 ? Math.round(totalCoinsInSystem / students.length) : 0} 🪙
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card border rounded-xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="O'quvchi ismi yoki telefon raqami bo'yicha qidiruv..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Students Coins Table */}
      {loading ? (
        <div className="flex justify-center p-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="bg-card border rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-secondary/40 border-b text-xs font-bold text-muted-foreground uppercase">
                <tr>
                  <th className="p-4">O'quvchi</th>
                  <th className="p-4">Aloqa</th>
                  <th className="p-4">Level & XP</th>
                  <th className="p-4">Tanga (Coin) Balansi</th>
                  <th className="p-4 text-right">Harakatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground">
                      O'quvchilar topilmadi.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((s) => (
                    <tr key={s._id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={s.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${s.fullName}`}
                            alt=""
                            className="w-9 h-9 rounded-full bg-secondary shrink-0"
                          />
                          <div>
                            <p className="font-bold text-foreground">{s.fullName}</p>
                            <p className="text-[11px] text-muted-foreground">ID: {s._id.slice(-6)}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 text-xs">
                        <p className="font-medium text-foreground">{s.studentPhone || 'Telefon kiritilmagan'}</p>
                        <p className="text-muted-foreground">{s.email || ''}</p>
                      </td>

                      <td className="p-4 text-xs font-semibold">
                        <span className="text-indigo-500">Level {s.level || 1}</span>
                        <span className="text-muted-foreground ml-2">({s.xp || 0} XP)</span>
                      </td>

                      <td className="p-4">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 rounded-full font-black text-sm">
                          <CoinsIcon className="w-4 h-4" />
                          {s.coins || 0} Coins
                        </div>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(s, 'ADD')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> Coin Qo'shish
                          </button>
                          <button
                            onClick={() => handleOpenModal(s, 'DEDUCT')}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 transition-all"
                          >
                            <Minus className="w-3.5 h-3.5" /> Ayirish
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Coin Modal */}
      {modalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-card border rounded-2xl p-6 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CoinsIcon className="w-5 h-5 text-amber-500" />
                {actionType === 'ADD' ? "Coin Qo'shish" : "Coin Ayirish"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:bg-secondary"
              >
                ✕
              </button>
            </div>

            <div className="bg-secondary/40 p-3 rounded-xl flex items-center gap-3">
              <img
                src={selectedStudent.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${selectedStudent.fullName}`}
                alt=""
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="font-bold text-sm">{selectedStudent.fullName}</p>
                <p className="text-xs text-muted-foreground">Joriy balans: {selectedStudent.coins || 0} Coins</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Tangalar miqdori (Amount)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-1 focus:ring-primary font-bold text-foreground"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Sabab (Reason)</label>
                <textarea
                  required
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="E.g. Darsdagi a'lo faollik uchun..."
                  className="w-full border rounded-lg p-2.5 text-sm bg-background outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border rounded-lg text-sm font-semibold hover:bg-secondary transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 font-bold text-white rounded-lg transition-all flex items-center gap-2 shadow-sm ${
                    actionType === 'ADD' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {submitting ? 'Bajarilmoqda...' : actionType === 'ADD' ? '+ Tasdiqlash' : '- Ayirish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coins;
