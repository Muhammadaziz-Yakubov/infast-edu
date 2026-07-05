import React, { useEffect, useState } from 'react';
import { getLeads, updateLead } from '../../api/leads';
import {
  Layers,
  Phone,
  Calendar,
  CheckCircle,
  GraduationCap,
  Sparkles,
  AlertTriangle,
  User,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const STAGES = [
  { id: 'NEW_LEAD', name: 'New Lead', icon: Layers, color: 'border-t-blue-500 bg-blue-500/5 text-blue-600' },
  { id: 'CONTACTED', name: 'Contacted', icon: Phone, color: 'border-t-orange-500 bg-orange-500/5 text-orange-600' },
  { id: 'MEETING_SCHEDULED', name: 'Meeting', icon: Calendar, color: 'border-t-purple-500 bg-purple-500/5 text-purple-600' },
  { id: 'DEMO_LESSON', name: 'Demo Lesson', icon: Sparkles, color: 'border-t-yellow-500 bg-yellow-500/5 text-yellow-600' },
  { id: 'REGISTERED', name: 'Registered', icon: CheckCircle, color: 'border-t-pink-500 bg-pink-500/5 text-pink-600' },
  { id: 'CONVERTED', name: 'Converted', icon: GraduationCap, color: 'border-t-emerald-500 bg-emerald-500/5 text-emerald-600' },
  { id: 'CLOSED', name: 'Closed / Lost', icon: X, color: 'border-t-slate-500 bg-slate-500/5 text-slate-600' },
];

export const PipelineView: React.FC = () => {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [hoveredColumnId, setHoveredColumnId] = useState<string | null>(null);

  // Lost Reason Dialog state
  const [lostReasonModalOpen, setLostReasonModalOpen] = useState(false);
  const [pendingLeadId, setPendingLeadId] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState('');
  const [lostNote, setLostNote] = useState('');

  const loadLeads = async () => {
    try {
      const data = await getLeads({ limit: 100, isArchived: false });
      setLeads(data?.leads || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (hoveredColumnId !== columnId) {
      setHoveredColumnId(columnId);
    }
  };

  const handleDragLeave = () => {
    setHoveredColumnId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    setHoveredColumnId(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    // Check if dropping to CLOSED
    if (targetStatus === 'CLOSED') {
      setPendingLeadId(leadId);
      setLostReasonModalOpen(true);
      return;
    }

    try {
      // Optimistic update
      setLeads(prev => prev.map(l => l._id === leadId ? { ...l, status: targetStatus } : l));
      await updateLead(leadId, { status: targetStatus });
      loadLeads();
    } catch (err) {
      console.error('Drag update error:', err);
      loadLeads();
    } finally {
      setDraggedLeadId(null);
    }
  };

  const submitLostReason = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingLeadId || !lostReason) return;

    try {
      await updateLead(pendingLeadId, {
        status: 'CLOSED',
        lostReason,
        lostNote: lostNote || undefined,
      });
      setLostReasonModalOpen(false);
      setPendingLeadId(null);
      setLostReason('');
      setLostNote('');
      loadLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-500 bg-emerald-500/10';
    if (score >= 30) return 'text-amber-500 bg-amber-500/10';
    return 'text-rose-500 bg-rose-500/10';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Kanban Sales Pipeline</h1>
        <p className="text-muted-foreground text-sm">Leadlarni drag & drop yordamida voronka bo'ylab ko'chiring.</p>
      </div>

      {/* Board Scroll Container */}
      <div className="flex-1 overflow-x-auto pb-4 flex gap-4 items-start min-h-[600px]">
        {STAGES.map((column) => {
          const columnLeads = leads.filter(l => l.status === column.id);
          const isHovered = hoveredColumnId === column.id;

          return (
            <div
              key={column.id}
              onDragOver={(e) => handleDragOver(e, column.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
              className={`flex flex-col w-72 shrink-0 rounded-xl border bg-card/50 shadow-sm overflow-hidden h-[560px] transition-all duration-200 ${
                isHovered ? 'ring-2 ring-primary border-primary bg-secondary/30 scale-[1.01]' : ''
              }`}
            >
              {/* Column Header */}
              <div className={`p-4 border-t-4 border-b flex items-center justify-between font-bold text-sm ${column.color}`}>
                <div className="flex items-center gap-2">
                  <column.icon className="w-4 h-4" />
                  <span>{column.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-secondary text-xs">{columnLeads.length}</span>
              </div>

              {/* Column Cards List */}
              <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-secondary/10">
                {columnLeads.map((lead) => (
                  <div
                    key={lead._id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead._id)}
                    className="p-4 bg-card rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:shadow-md transition-all duration-150 space-y-3 group"
                  >
                    <div>
                      <Link
                        to={`/marketing/leads/${lead._id}`}
                        className="font-semibold text-sm hover:underline group-hover:text-primary transition-colors block truncate"
                      >
                        {lead.firstName} {lead.lastName}
                      </Link>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{lead.phone}</p>
                    </div>

                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground truncate max-w-[120px]">
                        {lead.interestedCourse?.name || 'Kurs kiritilmagan'}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${getScoreColor(lead.score)}`}>
                        {lead.score}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t pt-2 mt-2 text-[11px] text-muted-foreground">
                      <div className="flex items-center gap-1 truncate max-w-[150px]">
                        <User className="w-3 h-3 text-muted-foreground/60 shrink-0" />
                        <span className="truncate">{lead.assignedManager?.fullName || 'Biriktirilmagan'}</span>
                      </div>
                      <span>
                        {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                ))}
                {columnLeads.length === 0 && (
                  <div className="h-24 border-2 border-dashed rounded-lg flex items-center justify-center text-xs text-muted-foreground/60">
                    Lead yo'q
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* LOST REASON MODAL */}
      {lostReasonModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-md p-6 rounded-xl border shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setLostReasonModalOpen(false); setPendingLeadId(null); }}
              className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-2 flex items-center gap-2 text-rose-500">
              <AlertTriangle className="w-5 h-5" />
              Nega Rad Etildi? (Lost Reason)
            </h2>
            <p className="text-xs text-muted-foreground mb-4 leading-normal">
              Ushbu leadni 'Closed/Lost' holatiga o'tkazish uchun rad etilish sababini ko'rsatishingiz shart.
            </p>
            <form onSubmit={submitLostReason} className="space-y-4">
              <div>
                <label className="text-xs font-bold block mb-1">Rad Etish Sababi *</label>
                <select
                  required
                  value={lostReason}
                  onChange={(e) => setLostReason(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none cursor-pointer"
                >
                  <option value="">Tanlang</option>
                  <option value="EXPENSIVE">Kurs narxi juda qimmat</option>
                  <option value="WRONG_LOCATION">Manzil noqulay</option>
                  <option value="TIME_CONFLICT">Dars vaqti to'g'ri kelmadi</option>
                  <option value="NOT_INTERESTED">Qiziqish qolmadi</option>
                  <option value="ANOTHER_CENTER">Boshqa o'quv markazini tanladi</option>
                  <option value="NO_RESPONSE">Telefonni ko'tarmadi / aloqa yo'q</option>
                  <option value="OTHER">Boshqa sabab</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold block mb-1">Menejer izohi (Qo'shimcha)</label>
                <textarea
                  value={lostNote}
                  onChange={(e) => setLostNote(e.target.value)}
                  rows={3}
                  placeholder="Batafsil sababni izohlang..."
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => { setLostReasonModalOpen(false); setPendingLeadId(null); }}
                  className="px-4 py-2 border rounded text-sm hover:bg-secondary transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded hover:bg-rose-600 transition-all"
                >
                  Saqlash va Rad etish
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PipelineView;
