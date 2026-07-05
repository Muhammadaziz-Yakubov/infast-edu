import React, { useEffect, useState } from 'react';
import {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  archiveLead,
  restoreLead,
  mergeLeads,
  getLeadSources,
  getCampaigns,
} from '../../api/leads';
import { apiClient } from '../../api/client';
import { getCourses } from '../../api/courses';
import {
  Search,
  Plus,
  Trash2,
  Archive,
  RotateCcw,
  Merge,
  Download,
  AlertTriangle,
  X,
  Eye,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const LeadsList: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters state
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [courseId, setCourseId] = useState('');
  const [campaignId, setCampaignId] = useState('');
  const [sourceId] = useState('');
  const [isArchived, setIsArchived] = useState(false);

  // Metadata arrays
  const [courses, setCourses] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [sources, setSources] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [mergeModalOpen, setMergeModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    parentPhone: '',
    birthDate: '',
    interestedCourse: '',
    source: '',
    campaign: '',
    priority: 'MEDIUM',
  });
  const [errorMsg, setErrorMsg] = useState('');

  // Merge states
  const [primaryLeadId, setPrimaryLeadId] = useState('');
  const [secondaryLeadId, setSecondaryLeadId] = useState('');

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await getLeads({
        page,
        limit,
        search,
        status,
        priority,
        courseId,
        campaignId,
        sourceId,
        isArchived,
      });
      setLeads(data?.leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, [page, search, status, priority, courseId, campaignId, sourceId, isArchived]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [c, camp, src, uRes] = await Promise.all([
          getCourses(),
          getCampaigns(),
          getLeadSources(),
          apiClient.get('/users'),
        ]);
        setCourses(c || []);
        setCampaigns(camp || []);
        setSources(src || []);
        const u = uRes.data.data || [];
        setManagers(u.filter((usr: any) => ['MANAGER', 'SUPER_ADMIN', 'RECEPTION'].includes(usr.role)));
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      await createLead(formData);
      setCreateModalOpen(false);
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        parentPhone: '',
        birthDate: '',
        interestedCourse: '',
        source: '',
        campaign: '',
        priority: 'MEDIUM',
      });
      loadLeads();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Qo\'shishda xatolik yuz berdi');
    }
  };

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    if (!primaryLeadId || !secondaryLeadId) {
      setErrorMsg('Ikkala leadni ham tanlang');
      return;
    }
    if (primaryLeadId === secondaryLeadId) {
      setErrorMsg('Bir xil leadlarni birlashtirib bo\'lmaydi');
      return;
    }
    try {
      await mergeLeads({ primaryLeadId, secondaryLeadId });
      setMergeModalOpen(false);
      setPrimaryLeadId('');
      setSecondaryLeadId('');
      loadLeads();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Birlashtirishda xatolik yuz berdi');
    }
  };

  const handleManagerChange = async (leadId: string, assignedManager: string) => {
    try {
      await updateLead(leadId, { assignedManager: assignedManager || null });
      loadLeads();
    } catch (err) {
      console.error('Menejerni o\'zgartirishda xatolik:', err);
    }
  };

  const handleArchive = async (id: string) => {
    if (!window.confirm('Haqiqatan ham ushbu leadni arxivlamoqchimisiz?')) return;
    try {
      await archiveLead(id);
      loadLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestore = async (id: string) => {
    try {
      await restoreLead(id);
      loadLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Haqiqatan ham ushbu leadni o\'chirmoqchimisiz (Soft Delete)?')) return;
    try {
      await deleteLead(id);
      loadLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const exportToCSV = () => {
    const headers = ['Ism', 'Familiya', 'Telefon', 'Kurs', 'Status', 'Menejer', 'Sana', 'Ball'];
    const rows = leads.map(l => [
      l.firstName,
      l.lastName,
      l.phone,
      l.interestedCourse?.name || 'Kiritilmagan',
      l.status,
      l.assignedManager?.fullName || 'Biriktirilmagan',
      new Date(l.createdAt).toLocaleDateString(),
      l.score
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `leads_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (statusStr: string) => {
    const badges: any = {
      NEW_LEAD: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      CONTACTED: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
      MEETING_SCHEDULED: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
      DEMO_LESSON: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      REGISTERED: 'bg-pink-500/10 text-pink-500 border-pink-500/20',
      CONVERTED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      CLOSED: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    };
    return (
      <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${badges[statusStr] || ''}`}>
        {statusStr.replace('_', ' ')}
      </span>
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-500 bg-emerald-500/10';
    if (score >= 30) return 'text-amber-500 bg-amber-500/10';
    return 'text-rose-500 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CRM Leadlar Ro'yxati</h1>
          <p className="text-muted-foreground text-sm">Barcha ro'yxatga olingan potentsial mijozlarni boshqarish.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/95 transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            Lead Qo'shish
          </button>
          <button
            onClick={() => setMergeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary text-sm font-semibold rounded-md border hover:bg-secondary/80 transition-all"
          >
            <Merge className="w-4 h-4" />
            Leadlarni Birlashtirish
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-secondary text-primary text-sm font-semibold rounded-md border hover:bg-secondary/80 transition-all"
            title="CSV yuklab olish"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-card p-4 rounded-xl border shadow-sm grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Ism yoki telefon qidirish..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-md bg-secondary border border-transparent focus:border-border outline-none transition-all"
          />
        </div>

        {/* Status Filter */}
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm rounded-md bg-secondary border border-transparent outline-none cursor-pointer"
        >
          <option value="">Barcha Statuslar</option>
          <option value="NEW_LEAD">New Lead</option>
          <option value="CONTACTED">Contacted</option>
          <option value="MEETING_SCHEDULED">Meeting Scheduled</option>
          <option value="DEMO_LESSON">Demo Lesson</option>
          <option value="REGISTERED">Registered</option>
          <option value="CONVERTED">Converted to Student</option>
          <option value="CLOSED">Closed / Lost</option>
        </select>

        {/* Priority Filter */}
        <select
          value={priority}
          onChange={(e) => { setPriority(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm rounded-md bg-secondary border border-transparent outline-none cursor-pointer"
        >
          <option value="">Barcha Ustuvorliklar</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        {/* Course Filter */}
        <select
          value={courseId}
          onChange={(e) => { setCourseId(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm rounded-md bg-secondary border border-transparent outline-none cursor-pointer"
        >
          <option value="">Kurslar bo'yicha</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {/* Campaign Filter */}
        <select
          value={campaignId}
          onChange={(e) => { setCampaignId(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm rounded-md bg-secondary border border-transparent outline-none cursor-pointer"
        >
          <option value="">Kampaniyalar</option>
          {campaigns.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {/* Archive toggle */}
        <div className="flex items-center justify-between px-3 py-2 rounded-md bg-secondary text-sm">
          <span className="text-xs font-semibold">Arxivdagilar</span>
          <input
            type="checkbox"
            checked={isArchived}
            onChange={(e) => { setIsArchived(e.target.checked); setPage(1); }}
            className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
          />
        </div>
      </div>

      {/* Main Leads Table */}
      <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            Siz kiritgan filtrlarga mos keluvchi lead topilmadi.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b bg-secondary/50 text-xs font-bold text-muted-foreground uppercase">
                  <th className="p-4">F.I.O</th>
                  <th className="p-4">Telefon</th>
                  <th className="p-4">Qiziqqan Kursi</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Ball</th>
                  <th className="p-4">Menejer</th>
                  <th className="p-4">Yaratilgan Sana</th>
                  <th className="p-4 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y text-sm">
                {leads.map((l) => (
                  <tr key={l._id} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-4 font-semibold">
                      <Link to={`/marketing/leads/${l._id}`} className="hover:underline flex items-center gap-1.5 text-primary">
                        {l.firstName} {l.lastName}
                        <Eye className="w-3.5 h-3.5 opacity-50" />
                      </Link>
                    </td>
                    <td className="p-4 text-xs font-mono">{l.phone}</td>
                    <td className="p-4">{l.interestedCourse?.name || '-'}</td>
                    <td className="p-4">{getStatusBadge(l.status)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getScoreColor(l.score)}`}>
                        {l.score}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={l.assignedManager?._id || ''}
                        onChange={(e) => handleManagerChange(l._id, e.target.value)}
                        className="bg-transparent border-0 font-medium text-xs focus:ring-0 focus:outline-none cursor-pointer"
                      >
                        <option value="">Biriktirilmagan</option>
                        {managers.map(m => (
                          <option key={m._id} value={m._id}>{m.fullName}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {new Date(l.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right space-x-1.5">
                      {l.isArchived ? (
                        <button
                          onClick={() => handleRestore(l._id)}
                          className="p-1 text-muted-foreground hover:text-primary rounded hover:bg-secondary transition-colors"
                          title="Qayta tiklash"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleArchive(l._id)}
                          className="p-1 text-muted-foreground hover:text-amber-500 rounded hover:bg-secondary transition-colors"
                          title="Arxivlash"
                        >
                          <Archive className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(l._id)}
                        className="p-1 text-muted-foreground hover:text-destructive rounded hover:bg-secondary transition-colors"
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

        {/* Basic Pagination footer */}
        <div className="flex justify-between items-center p-4 border-t bg-secondary/10">
          <span className="text-xs text-muted-foreground">Sahifa: {page}</span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-xs font-semibold rounded border bg-card disabled:opacity-50 hover:bg-secondary transition-all"
            >
              Oldingi
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={leads.length < limit}
              className="px-3 py-1.5 text-xs font-semibold rounded border bg-card disabled:opacity-50 hover:bg-secondary transition-all"
            >
              Keyingi
            </button>
          </div>
        </div>
      </div>

      {/* CREATE LEAD MODAL */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg p-6 rounded-xl border shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setCreateModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Yangi Lead Qo'shish</h2>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-md bg-rose-500/10 text-rose-500 text-xs font-medium flex gap-2 border border-rose-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Ism *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Familiya *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Telefon raqami *</label>
                <input
                  type="text"
                  required
                  placeholder="+998991234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Ota-onasining telefoni</label>
                  <input
                    type="text"
                    value={formData.parentPhone}
                    onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Tug'ilgan sana (kun.oy.yil)</label>
                  <input
                    type="text"
                    placeholder="DD.MM.YYYY"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-bold block mb-1">Qiziqqan Kursi</label>
                  <select
                    value={formData.interestedCourse}
                    onChange={(e) => setFormData({ ...formData, interestedCourse: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none cursor-pointer"
                  >
                    <option value="">Tanlang</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold block mb-1">Manba</label>
                  <select
                    value={formData.source}
                    onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none cursor-pointer"
                  >
                    <option value="">Tanlang</option>
                    {sources.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="text-xs font-bold block mb-1">Kampaniya</label>
                  <select
                    value={formData.campaign}
                    onChange={(e) => setFormData({ ...formData, campaign: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none cursor-pointer"
                  >
                    <option value="">Tanlang</option>
                    {campaigns.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 border rounded text-sm hover:bg-secondary transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95 transition-all"
                >
                  Saqlash
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MERGE LEADS MODAL */}
      {mergeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md p-6 rounded-xl border shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setMergeModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-2">Leadlarni Birlashtirish</h2>
            <p className="text-xs text-muted-foreground mb-4 leading-normal">
              Dublikat leadlarni birlashtiring. Ikkinchi leadning barcha faolliklari (qo'ng'iroqlar, uchrashuvlar) asosiy leadga ko'chiriladi va ikkinchi lead o'chiriladi.
            </p>
            {errorMsg && (
              <div className="mb-4 p-3 rounded-md bg-rose-500/10 text-rose-500 text-xs font-medium flex gap-2 border border-rose-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}
            <form onSubmit={handleMergeSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Asosiy Lead (Saqlanib qoladigan) *</label>
                <select
                  required
                  value={primaryLeadId}
                  onChange={(e) => setPrimaryLeadId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none cursor-pointer"
                >
                  <option value="">Tanlang</option>
                  {leads.map(l => <option key={l._id} value={l._id}>{l.firstName} {l.lastName} ({l.phone})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Ikkinchi Lead (O'chirib yuboriladigan) *</label>
                <select
                  required
                  value={secondaryLeadId}
                  onChange={(e) => setSecondaryLeadId(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none cursor-pointer"
                >
                  <option value="">Tanlang</option>
                  {leads.map(l => <option key={l._id} value={l._id}>{l.firstName} {l.lastName} ({l.phone})</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setMergeModalOpen(false)}
                  className="px-4 py-2 border rounded text-sm hover:bg-secondary transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95 transition-all"
                >
                  Birlashtirish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default LeadsList;
