import React, { useEffect, useState } from 'react';
import {
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
} from '../api/branches';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  X,
  Building,
  MapPin,
  Phone,
  User,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export const Branches: React.FC = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');

  // Modals state
  const [createOpen, setCreateOpen] = useState(false);
  const [editBranch, setEditBranch] = useState<any | null>(null);
  const [viewBranch, setViewBranch] = useState<any | null>(null);

  // Form states (Create)
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('+998');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Form states (Edit)
  const [editName, setEditName] = useState('');
  const [editRegion, setEditRegion] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [editAdminFullName, setEditAdminFullName] = useState('');
  const [editAdminEmail, setEditAdminEmail] = useState('');
  const [editAdminPassword, setEditAdminPassword] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [page, search, statusFilter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getBranches({
        page,
        limit,
        search,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setBranches(data.branches || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await createBranch({
        name,
        region,
        district,
        address,
        phone,
        status,
        adminFullName,
        adminEmail,
        adminPassword,
      });

      // Reset
      setName('');
      setRegion('');
      setDistrict('');
      setAddress('');
      setPhone('+998');
      setStatus('ACTIVE');
      setAdminFullName('');
      setAdminEmail('');
      setAdminPassword('');
      setCreateOpen(false);

      // Reload
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message
        ? (Array.isArray(err.response.data.message) ? err.response.data.message.join('\n') : err.response.data.message)
        : (err.message || 'Xatolik yuz berdi');
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBranch) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await updateBranch(editBranch._id, {
        name: editName,
        region: editRegion,
        district: editDistrict,
        address: editAddress,
        phone: editPhone,
        status: editStatus,
        adminFullName: editAdminFullName || undefined,
        adminEmail: editAdminEmail || undefined,
        adminPassword: editAdminPassword || undefined,
      });

      setEditBranch(null);
      await loadData();
    } catch (err: any) {
      const msg = err.response?.data?.message
        ? (Array.isArray(err.response.data.message) ? err.response.data.message.join('\n') : err.response.data.message)
        : (err.message || 'Xatolik yuz berdi');
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Haqiqatdan ham ushbu filialni va uning administratorini o\'chirib tashlamoqchimisiz?')) {
      try {
        await deleteBranch(id);
        await loadData();
      } catch (err: any) {
        alert(err.message || 'Filialni o\'chirishda xatolik yuz berdi');
      }
    }
  };

  const openEditModal = (branch: any) => {
    setEditBranch(branch);
    setEditName(branch.name);
    setEditRegion(branch.region);
    setEditDistrict(branch.district);
    setEditAddress(branch.address);
    setEditPhone(branch.phone);
    setEditStatus(branch.status);
    setEditAdminFullName(branch.adminId?.fullName || '');
    setEditAdminEmail(branch.adminId?.email || '');
    setEditAdminPassword('');
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Filiallar Boshqaruvi</h1>
          <p className="text-muted-foreground">O'quv markazining filiallari va ularning administratorlarini boshqarish.</p>
        </div>
        <button
          onClick={() => {
            setErrorMsg(null);
            setCreateOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Yangi Filial Qo'shish
        </button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-card border rounded-xl shadow-sm">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Nomi, viloyat, tuman yoki telefon orqali qidirish..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Status select */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
            >
              <option value="ALL">Barcha holatlar</option>
              <option value="ACTIVE">Faol</option>
              <option value="INACTIVE">Nofaol</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center p-12 text-muted-foreground">
            Siz qidirgan parametrlarga mos keladigan filiallar topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/40 text-xs font-semibold uppercase text-muted-foreground select-none">
                  <th className="px-6 py-4">Filial Nomi</th>
                  <th className="px-6 py-4">Viloyat / Tuman</th>
                  <th className="px-6 py-4">Manzil</th>
                  <th className="px-6 py-4">Telefon</th>
                  <th className="px-6 py-4">Admin</th>
                  <th className="px-6 py-4 text-center">Holat</th>
                  <th className="px-6 py-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {branches.map((b) => (
                  <tr key={b._id} className="hover:bg-muted/10 transition-colors">
                    <td className="px-6 py-4 font-semibold text-primary">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-muted-foreground" />
                        {b.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium">{b.region}</div>
                      <div className="text-xs text-muted-foreground">{b.district}</div>
                    </td>
                    <td className="px-6 py-4 truncate max-w-[200px]" title={b.address}>
                      {b.address}
                    </td>
                    <td className="px-6 py-4 font-medium">{b.phone}</td>
                    <td className="px-6 py-4">
                      <div className="font-semibold">{b.adminId?.fullName || "Biriktirilmagan"}</div>
                      <div className="text-xs text-muted-foreground">{b.adminId?.email || ""}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          b.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-red-500/10 text-red-600 dark:text-red-400'
                        }`}
                      >
                        {b.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => setViewBranch(b)}
                        className="p-1.5 text-muted-foreground hover:text-primary rounded-md hover:bg-secondary transition-colors"
                        title="Batafsil ko'rish"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(b)}
                        className="p-1.5 text-muted-foreground hover:text-amber-600 rounded-md hover:bg-secondary transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(b._id)}
                        className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-secondary transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="flex justify-between items-center p-4 border-t bg-secondary/10 select-none">
          <span className="text-xs text-muted-foreground">
            Jami: {total} | Sahifa: {page}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded border bg-card disabled:opacity-50 hover:bg-secondary transition-all cursor-pointer"
            >
              Oldingi
            </button>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page * limit >= total}
              className="px-3 py-1.5 text-xs font-semibold rounded border bg-card disabled:opacity-50 hover:bg-secondary transition-all cursor-pointer"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      {/* CREATE MODAL */}
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl p-6 rounded-2xl border shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreateOpen(false)}
              className="absolute right-4 top-4 p-1.5 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
              <Building className="w-5 h-5 text-primary" />
              Yangi Filial Qo'shish
            </h2>

            {errorMsg && (
              <div className="flex items-center gap-3 p-3 mb-4 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-medium whitespace-pre-line">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-6">
              {/* Branch Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  Filial Ma'lumotlari
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Filial Nomi</label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Chilonzor Filiali"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Telefon Raqami</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="+998901234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Viloyat / Shahar</label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Toshkent"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Tuman</label>
                    <input
                      type="text"
                      required
                      placeholder="Masalan: Chilonzor tumani"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">To'liq Manzil</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <textarea
                        required
                        rows={2}
                        placeholder="Qatortol ko'chasi, 24-uy"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="ACTIVE">Faol</option>
                      <option value="INACTIVE">Nofaol</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Branch Admin Information */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  Filial Administratori
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">To'liq Ism (F.I.SH.)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        placeholder="Valiyev Ali"
                        value={adminFullName}
                        onChange={(e) => setAdminFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Email Manzili (Login uchun)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        required
                        placeholder="ali@infast.uz"
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Parol (Kamida 6 belgi)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="••••••••"
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border hover:bg-secondary transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Yaratish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-2xl p-6 rounded-2xl border shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setEditBranch(null)}
              className="absolute right-4 top-4 p-1.5 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-primary">
              <Building className="w-5 h-5 text-primary" />
              Filialni Tahrirlash
            </h2>

            {errorMsg && (
              <div className="flex items-center gap-3 p-3 mb-4 text-sm rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <p className="font-medium whitespace-pre-line">{errorMsg}</p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              {/* Branch Information */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  Filial Ma'lumotlari
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Filial Nomi</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Telefon Raqami</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        required
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Viloyat / Shahar</label>
                    <input
                      type="text"
                      required
                      value={editRegion}
                      onChange={(e) => setEditRegion(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Tuman</label>
                    <input
                      type="text"
                      required
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="text-xs font-semibold text-muted-foreground">To'liq Manzil</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <textarea
                        required
                        rows={2}
                        value={editAddress}
                        onChange={(e) => setEditAddress(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="ACTIVE">Faol</option>
                      <option value="INACTIVE">Nofaol</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Branch Admin Information */}
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1">
                  Filial Administratori (Tahrirlash)
                </h3>
                <p className="text-xs text-muted-foreground">Administrator ma'lumotlarini o'zgartirish ixtiyoriy. Parolni o'zgartirmaslik uchun bo'sh qoldiring.</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">To'liq Ism (F.I.SH.)</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Valiyev Ali"
                        value={editAdminFullName}
                        onChange={(e) => setEditAdminFullName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Email Manzili</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="email"
                        placeholder="ali@infast.uz"
                        value={editAdminEmail}
                        onChange={(e) => setEditAdminEmail(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Yangi Parol (Bo'sh qoldirilsa o'zgarmaydi)</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={editAdminPassword}
                        onChange={(e) => setEditAdminPassword(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border bg-background focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 border-t pt-4">
                <button
                  type="button"
                  onClick={() => setEditBranch(null)}
                  className="px-4 py-2 text-sm font-semibold rounded-lg border hover:bg-secondary transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all shadow-sm"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-card w-full max-w-lg p-6 rounded-2xl border shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewBranch(null)}
              className="absolute right-4 top-4 p-1.5 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-primary border-b pb-2">
              <Building className="w-5 h-5 text-primary" />
              Filial Ma'lumotlari
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Filial nomi:</span>
                <span className="col-span-2 text-sm font-semibold">{viewBranch.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Telefon:</span>
                <span className="col-span-2 text-sm font-semibold">{viewBranch.phone}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Viloyat:</span>
                <span className="col-span-2 text-sm font-medium">{viewBranch.region}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Tuman:</span>
                <span className="col-span-2 text-sm font-medium">{viewBranch.district}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Manzil:</span>
                <span className="col-span-2 text-sm text-muted-foreground">{viewBranch.address}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Status:</span>
                <span className="col-span-2 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      viewBranch.status === 'ACTIVE'
                        ? 'bg-emerald-500/10 text-emerald-600'
                        : 'bg-red-500/10 text-red-600'
                    }`}
                  >
                    {viewBranch.status === 'ACTIVE' ? 'Faol' : 'Nofaol'}
                  </span>
                </span>
              </div>

              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground border-b pb-1 pt-4">
                Administrator
              </h3>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">F.I.SH.:</span>
                <span className="col-span-2 text-sm font-semibold">{viewBranch.adminId?.fullName || "Noma'lum"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Email:</span>
                <span className="col-span-2 text-sm text-primary font-medium">{viewBranch.adminId?.email || "Noma'lum"}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-xs font-semibold text-muted-foreground">Telefon:</span>
                <span className="col-span-2 text-sm font-medium">{viewBranch.adminId?.phone || "Noma'lum"}</span>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t mt-6">
              <button
                type="button"
                onClick={() => setViewBranch(null)}
                className="px-5 py-2 text-sm font-semibold rounded-lg bg-secondary text-primary hover:bg-secondary/80 transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default Branches;
