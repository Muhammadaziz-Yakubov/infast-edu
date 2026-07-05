import React, { useEffect, useState } from 'react';
import { getLeadSources, createLeadSource, deleteLeadSource } from '../../api/leads';
import { Plus, Trash2, Tag, X } from 'lucide-react';

export const LeadSources: React.FC = () => {
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');

  const loadSources = async () => {
    setLoading(true);
    try {
      const data = await getLeadSources();
      setSources(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSources();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    try {
      await createLeadSource({ name });
      setName('');
      setModalOpen(false);
      loadSources();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Ushbu manbani o\'chirmoqchimisiz?')) return;
    try {
      await deleteLeadSource(id);
      loadSources();
    } catch (err) {
      console.error(err);
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
          <h1 className="text-2xl font-bold tracking-tight">Lead Manbalari (Lead Sources)</h1>
          <p className="text-muted-foreground text-sm">Mijozlar biz haqimizda eshitgan asosiy axborot kanallari.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md hover:bg-primary/95 transition-all"
        >
          <Plus className="w-4 h-4" />
          Yangi Manba
        </button>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {sources.map((s) => (
          <div key={s._id} className="bg-card p-4 rounded-xl border shadow-sm flex items-center justify-between hover:shadow transition-shadow group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Tag className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm">{s.name}</span>
            </div>
            <button
              onClick={() => handleDelete(s._id)}
              className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-secondary opacity-0 group-hover:opacity-100 transition-all"
              title="O'chirish"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-sm p-6 rounded-xl border shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-4">Yangi Manba Qo'shish</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Manba nomi *</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Instagram, Telegram kanal, YouTube"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  Qo'shish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default LeadSources;
