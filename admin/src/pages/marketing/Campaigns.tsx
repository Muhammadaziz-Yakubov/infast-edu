import React, { useEffect, useState } from 'react';
import {
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getCampaignPerformance,
} from '../../api/leads';
import {
  Plus,
  Trash2,
  Edit,
  X,
  Target,
} from 'lucide-react';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form
  const [formData, setFormData] = useState({
    name: '',
    budget: 500000,
    startDate: '',
    endDate: '',
    status: 'ACTIVE',
  });

  // Selected performance detail state
  const [selectedPerf, setSelectedPerf] = useState<any>(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await getCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await updateCampaign(editId, formData);
      } else {
        await createCampaign(formData);
      }
      setModalOpen(false);
      setEditId(null);
      setFormData({ name: '', budget: 500000, startDate: '', endDate: '', status: 'ACTIVE' });
      loadCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditClick = (c: any) => {
    setEditId(c._id);
    setFormData({
      name: c.name,
      budget: c.budget,
      startDate: c.startDate ? c.startDate.substring(0, 10) : '',
      endDate: c.endDate ? c.endDate.substring(0, 10) : '',
      status: c.status,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Kampaniyani o\'chirmoqchimisiz?')) return;
    try {
      await deleteCampaign(id);
      loadCampaigns();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewPerformance = async (id: string) => {
    try {
      const perf = await getCampaignPerformance(id);
      setSelectedPerf(perf);
    } catch (err) {
      console.error('Xatolik yuz berdi:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing Kampaniyalari (ROI Tracker)</h1>
          <p className="text-muted-foreground text-sm">Reklama byudjetlari va ulardan kelgan sotuvlar rentabelligini o'lchash.</p>
        </div>
        <button
          onClick={() => { setEditId(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Yangi Kampaniya
        </button>
      </div>

      {/* Campaigns Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {campaigns.map((c) => (
          <div key={c._id} className="bg-card rounded-xl border shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow relative group">
            <div className="absolute right-4 top-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => handleEditClick(c)}
                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(c._id)}
                className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${c.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-500/10 text-slate-500'}`}>
                {c.status}
              </span>
              <h2 className="text-lg font-bold mt-1.5">{c.name}</h2>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Byudjet:</span>
                <span className="font-bold">{c.budget.toLocaleString()} UZS</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Boshlanishi:</span>
                <span className="font-mono">{c.startDate ? new Date(c.startDate).toLocaleDateString() : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tugashi:</span>
                <span className="font-mono">{c.endDate ? new Date(c.endDate).toLocaleDateString() : '-'}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleViewPerformance(c._id)}
                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 bg-secondary text-primary rounded-md text-xs font-bold hover:bg-secondary/80 transition-colors"
              >
                <Target className="w-3.5 h-3.5" />
                Performance Tahlili
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Campaign Performance Panel */}
      {selectedPerf && (
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Kampaniya samaradorligi: <span className="text-primary">{selectedPerf.campaignName}</span>
            </h2>
            <button
              onClick={() => setSelectedPerf(null)}
              className="p-1 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-secondary/30 rounded-lg border">
              <span className="text-xs text-muted-foreground uppercase font-bold">Leadlar Soni</span>
              <p className="text-2xl font-extrabold mt-1">{selectedPerf.leadsCount}</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg border">
              <span className="text-xs text-muted-foreground uppercase font-bold">O'quvchiga aylandi</span>
              <p className="text-2xl font-extrabold mt-1">{selectedPerf.conversionsCount}</p>
            </div>
            <div className="p-4 bg-secondary/30 rounded-lg border">
              <span className="text-xs text-muted-foreground uppercase font-bold">Jalb qilish xarajati (CAC)</span>
              <p className="text-lg font-extrabold mt-1.5">{selectedPerf.cac.toLocaleString()} UZS</p>
            </div>
            <div className={`p-4 rounded-lg border ${selectedPerf.roi >= 0 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 'bg-rose-500/5 border-rose-500/20 text-rose-600'}`}>
              <span className="text-xs uppercase font-bold">Investitsiya ROI</span>
              <p className="text-lg font-extrabold mt-1.5">{selectedPerf.roi}%</p>
            </div>
          </div>

          <div className="p-4 bg-secondary/20 rounded-lg border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Kiritilgan byudjet xarajati: <span className="font-bold text-foreground">{selectedPerf.budget.toLocaleString()} UZS</span></p>
              <p className="text-xs text-muted-foreground mt-1">Hozirgacha tushgan daromad: <span className="font-bold text-foreground">{selectedPerf.revenueGenerated.toLocaleString()} UZS</span></p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${selectedPerf.roi >= 100 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
              {selectedPerf.roi >= 0 ? 'Rentabellik ijobiy' : 'Xarajat qoplanmagan'}
            </span>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md p-6 rounded-xl border shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">
              {editId ? 'Kampaniyani Tahrirlash' : 'Yangi Kampaniya Yaratish'}
            </h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Kampaniya nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Instagram Target iyul"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Byudjet (UZS) *</label>
                <input
                  type="number"
                  required
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Boshlanish sanasi</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Tugash sanasi</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Holati</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none cursor-pointer"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="PAUSED">Paused</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
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
    </div>
  );
};
export default Campaigns;
