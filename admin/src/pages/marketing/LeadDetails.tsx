import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  getLead,
  getActivities,
  getCallLogs,
  createCallLog,
  getMeetings,
  createMeeting,
  updateMeetingStatus,
  getDemoLessons,
  createDemoLesson,
  getNotes,
  createNote,
  deleteNote,
  getTasks,
  createTask,
  updateTaskStatus,
  getFollowUps,
  createFollowUp,
  updateFollowUpStatus,
  getAttachments,
  createAttachment,
  deleteAttachment,
  convertLead,
} from '../../api/leads';
import { apiClient } from '../../api/client';
import { getCourses } from '../../api/courses';
import {
  ArrowLeft,
  Phone,
  Calendar,
  Sparkles,
  ClipboardList,
  Clock,
  Paperclip,
  FileText,
  Trash2,
  CheckCircle,
  AlertTriangle,
  User,
  Activity,
  ChevronRight,
  UserCheck,
  X,
} from 'lucide-react';

export const LeadDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'calls' | 'meetings' | 'demos' | 'notes' | 'tasks' | 'followups' | 'attachments'>('timeline');

  // Metadata
  const [teachers, setTeachers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);

  // Tab Data Lists
  const [timeline, setTimeline] = useState<any[]>([]);
  const [calls, setCalls] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [demos, setDemos] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [followups, setFollowups] = useState<any[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);

  // Modals
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [credentials, setCredentials] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Call form
  const [callForm, setCallForm] = useState({ duration: 30, result: 'ANSWERED', notes: '' });
  // Meeting form
  const [meetingForm, setMeetingForm] = useState({ date: '', time: '', teacher: '', location: '', meetingType: 'Introduction' });
  // Demo form
  const [demoForm, setDemoForm] = useState({ course: '', teacher: '', date: '', attendance: true, feedback: '', result: 'THINKING' });
  // Task form
  const [taskForm, setTaskForm] = useState({ title: '', description: '', dueDate: '', priority: 'MEDIUM', reminder: false });
  // Follow Up form
  const [followupForm, setFollowupForm] = useState({ date: '', time: '', reason: '', assignedManager: '' });
  // Attachment form
  const [attachmentForm, setAttachmentForm] = useState({ name: '', url: '', type: 'PASSPORT' });
  // Note text
  const [noteContent, setNoteContent] = useState('');

  // Conversion form
  const [convertForm, setConvertForm] = useState({ courseId: '', groupId: '', amount: 0, nextPaymentDate: '' });

  const loadAll = async () => {
    if (!id) return;
    try {
      const data = await getLead(id);
      setLead(data);
      loadTabData();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    if (!id) return;
    try {
      switch (activeTab) {
        case 'timeline':
          const t = await getActivities(id);
          setTimeline(t || []);
          break;
        case 'calls':
          const c = await getCallLogs(id);
          setCalls(c || []);
          break;
        case 'meetings':
          const m = await getMeetings(id);
          setMeetings(m || []);
          break;
        case 'demos':
          const d = await getDemoLessons(id);
          setDemos(d || []);
          break;
        case 'notes':
          const n = await getNotes(id);
          setNotes(n || []);
          break;
        case 'tasks':
          const tsk = await getTasks(id);
          setTasks(tsk || []);
          break;
        case 'followups':
          const fu = await getFollowUps(id);
          setFollowups(fu || []);
          break;
        case 'attachments':
          const att = await getAttachments(id);
          setAttachments(att || []);
          break;
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id, activeTab]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [c, uRes] = await Promise.all([
          getCourses(),
          apiClient.get('/users'),
        ]);
        setCourses(c || []);
        const u = uRes.data.data || [];
        setTeachers(u.filter((usr: any) => usr.role === 'TEACHER'));
        setManagers(u.filter((usr: any) => ['MANAGER', 'SUPER_ADMIN', 'RECEPTION'].includes(usr.role)));

        const groupsRes = await apiClient.get('/groups');
        setGroups(groupsRes.data.data || []);
      } catch (err) {
        console.error(err);
      }
    }
    loadMeta();
  }, []);

  const handleLogCall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await createCallLog({ leadId: id, ...callForm });
      setCallForm({ duration: 30, result: 'ANSWERED', notes: '' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await createMeeting({ leadId: id, ...meetingForm });
      setMeetingForm({ date: '', time: '', teacher: '', location: '', meetingType: 'Introduction' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogDemo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await createDemoLesson({ leadId: id, ...demoForm });
      setDemoForm({ course: '', teacher: '', date: '', attendance: true, feedback: '', result: 'THINKING' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !noteContent) return;
    try {
      await createNote(id, noteContent);
      setNoteContent('');
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!window.confirm('Eslatmani o\'chirmoqchimisiz?')) return;
    try {
      await deleteNote(noteId);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await createTask({ leadId: id, ...taskForm });
      setTaskForm({ title: '', description: '', dueDate: '', priority: 'MEDIUM', reminder: false });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (taskId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    try {
      await updateTaskStatus(taskId, nextStatus);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await createFollowUp({ leadId: id, ...followupForm });
      setFollowupForm({ date: '', time: '', reason: '', assignedManager: '' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCompleteFollowup = async (fuId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PENDING' ? 'COMPLETED' : 'PENDING';
    try {
      await updateFollowUpStatus(fuId, nextStatus);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAttachFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await createAttachment({ leadId: id, ...attachmentForm });
      setAttachmentForm({ name: '', url: '', type: 'PASSPORT' });
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAttachment = async (attId: string) => {
    if (!window.confirm('Faylni o\'chirmoqchimisiz?')) return;
    try {
      await deleteAttachment(attId);
      loadAll();
    } catch (err) {
      console.error(err);
    }
  };

  const handleConvertLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setErrorMsg('');
    try {
      const res = await convertLead(id, convertForm);
      setCredentials(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Aylantirishda xatolik yuz berdi');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!lead) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-muted-foreground">Lead topilmadi</p>
        <Link to="/marketing/leads" className="inline-flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" />
          Leadlar ro'yxatiga qaytish
        </Link>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 30) return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center gap-4">
        <Link to="/marketing/leads" className="p-2 rounded-md hover:bg-secondary text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground text-sm">Marketing</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-semibold text-sm">{lead.firstName} {lead.lastName}</span>
        </div>
      </div>

      {/* Summary Profile Header Card */}
      <div className="bg-card p-6 rounded-xl border shadow-sm grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Name and Basic Contact */}
        <div className="lg:col-span-2 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold">{lead.firstName} {lead.lastName}</h1>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border bg-primary/10 text-primary border-primary/20`}>
              {lead.status.replace('_', ' ')}
            </span>
            <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full border ${getScoreColor(lead.score)}`}>
              Score: {lead.score}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm pt-2">
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Telefon raqam</p>
              <p className="font-mono mt-0.5">{lead.phone}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Ota-onasi telefoni</p>
              <p className="font-mono mt-0.5">{lead.parentPhone || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Tug'ilgan kuni</p>
              <p className="mt-0.5">{lead.birthDate || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-semibold uppercase">Qiziqqan kursi</p>
              <p className="mt-0.5 font-semibold text-primary">{lead.interestedCourse?.name || '-'}</p>
            </div>
          </div>
        </div>

        {/* Lead Source, Campaign and Assignment */}
        <div className="space-y-3 text-sm border-l pl-6">
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase">Menejer</p>
            <p className="mt-0.5 font-medium">{lead.assignedManager?.fullName || 'Biriktirilmagan'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase">Kampaniya / Manba</p>
            <p className="mt-0.5 text-xs">
              {lead.campaign?.name || 'Yo\'q'} / {lead.source?.name || 'Yo\'q'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-semibold uppercase">Oxirgi aloqa / Harakat</p>
            <p className="mt-0.5 text-xs font-mono">
              {lead.lastContactAt ? new Date(lead.lastContactAt).toLocaleString() : 'Bog\'lanilmagan'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2 lg:border-l lg:pl-6 h-full flex flex-col justify-center">
          {lead.status !== 'CONVERTED' ? (
            <button
              onClick={() => setConvertModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 text-white font-bold rounded-lg shadow-md hover:bg-emerald-600 transition-all text-sm"
            >
              <UserCheck className="w-4 h-4" />
              Talabaga Aylantirish
            </button>
          ) : (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-lg text-center font-bold text-xs flex items-center justify-center gap-2">
              <CheckCircle className="w-4.5 h-4.5" />
              Talabaga Aylantirilgan
            </div>
          )}
        </div>
      </div>

      {/* Tabs list & content layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left Tab selection list */}
        <div className="bg-card rounded-xl border shadow-sm p-2 space-y-1">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'timeline' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <Activity className="w-4 h-4" />
            Faoliyat tarixi (Timeline)
          </button>
          <button
            onClick={() => setActiveTab('calls')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'calls' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <Phone className="w-4 h-4" />
            Qo'ng'iroqlar
          </button>
          <button
            onClick={() => setActiveTab('meetings')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'meetings' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Uchrashuvlar
          </button>
          <button
            onClick={() => setActiveTab('demos')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'demos' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Demo Darslar
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'notes' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Menejer Izohlari
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'tasks' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            Vazifalar
          </button>
          <button
            onClick={() => setActiveTab('followups')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'followups' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <Clock className="w-4 h-4" />
            Follow Up rejalar
          </button>
          <button
            onClick={() => setActiveTab('attachments')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-semibold rounded-lg transition-all ${
              activeTab === 'attachments' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            Hujjatlar (Fayllar)
          </button>
        </div>

        {/* Right Active Tab Content Box */}
        <div className="lg:col-span-3 bg-card rounded-xl border shadow-sm p-6">
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Mijoz Faoliyati Xronologiyasi
              </h3>
              <div className="relative border-l pl-6 space-y-6 ml-3">
                {timeline.map((act) => (
                  <div key={act._id} className="relative">
                    <div className="absolute -left-[30px] top-1 w-4 h-4 rounded-full bg-primary border-4 border-card" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-primary">{act.action.replace('_', ' ')}</span>
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {new Date(act.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mt-1 font-medium">{act.description}</p>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                        <User className="w-3.5 h-3.5" />
                        <span>Menejer: {act.user?.fullName || 'Tizim'}</span>
                      </div>
                    </div>
                  </div>
                ))}
                {timeline.length === 0 && (
                  <p className="text-center py-6 text-sm text-muted-foreground">Ushbu lead bo'yicha hech qanday faoliyat logi yo'q.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'calls' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold">Qo'ng'iroqlar Logi</h3>
              </div>
              {/* Log Call Form */}
              <form onSubmit={handleLogCall} className="p-4 bg-secondary/30 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold block mb-1">Natija</label>
                  <select
                    value={callForm.result}
                    onChange={(e) => setCallForm({ ...callForm, result: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  >
                    <option value="ANSWERED">Javob berdi</option>
                    <option value="NO_ANSWER">Ko'tarmadi</option>
                    <option value="BUSY">Band</option>
                    <option value="WRONG_NUMBER">Noto'g'ri raqam</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Davomiyligi (soniya)</label>
                  <input
                    type="number"
                    value={callForm.duration}
                    onChange={(e) => setCallForm({ ...callForm, duration: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <button type="submit" className="w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95 transition-all">
                    Qayd Etish
                  </button>
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-bold block mb-1">Batafsil izoh</label>
                  <input
                    type="text"
                    placeholder="Suhbat tafsilotlarini yozing..."
                    value={callForm.notes}
                    onChange={(e) => setCallForm({ ...callForm, notes: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
              </form>

              {/* Calls list */}
              <div className="space-y-3">
                {calls.map(c => {
                  const resultLabels: any = {
                    ANSWERED: "Javob berdi",
                    INTERESTED: "Qiziqdi",
                    NOT_INTERESTED: "Qiziqmadi",
                    BUSY: "Band",
                    NO_ANSWER: "Javob bermadi",
                    WRONG_NUMBER: "Noto'g'ri raqam",
                    CALL_BACK_LATER: "Keyinroq bog'lanish",
                  };
                  return (
                    <div key={c._id} className="p-3 border rounded-lg hover:bg-secondary/10 flex justify-between items-center text-sm">
                      <div>
                        <div className="flex items-center gap-2 font-semibold">
                          <span>{resultLabels[c.result] || c.result}</span>
                          <span className="text-xs text-muted-foreground font-normal">{c.duration}s</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{c.notes || 'Izoh yozilmagan'}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-1">Bog'landi: {c.manager?.fullName || 'Menejer'} • {new Date(c.date).toLocaleString()}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'meetings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold">Uchrashuv va Intervyular</h3>
              </div>
              {/* Schedule form */}
              <form onSubmit={handleScheduleMeeting} className="p-4 bg-secondary/30 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold block mb-1">Sana</label>
                  <input
                    type="date"
                    required
                    value={meetingForm.date}
                    onChange={(e) => setMeetingForm({ ...meetingForm, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Soat</label>
                  <input
                    type="text"
                    required
                    placeholder="15:00"
                    value={meetingForm.time}
                    onChange={(e) => setMeetingForm({ ...meetingForm, time: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">O'qituvchi / Intervyuer</label>
                  <select
                    value={meetingForm.teacher}
                    required
                    onChange={(e) => setMeetingForm({ ...meetingForm, teacher: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  >
                    <option value="">Tanlang</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Joylashuv</label>
                  <input
                    type="text"
                    required
                    placeholder="Zoom yoki Xona #"
                    value={meetingForm.location}
                    onChange={(e) => setMeetingForm({ ...meetingForm, location: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Uchrashuv turi</label>
                  <input
                    type="text"
                    required
                    value={meetingForm.meetingType}
                    onChange={(e) => setMeetingForm({ ...meetingForm, meetingType: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <button type="submit" className="w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95 transition-all">
                    Rejalashtirish
                  </button>
                </div>
              </form>

              {/* Meetings List */}
              <div className="space-y-3">
                {meetings.map(m => (
                  <div key={m._id} className="p-4 border rounded-lg hover:bg-secondary/10 flex justify-between items-center text-sm">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">{m.meetingType}</span>
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded bg-secondary`}>
                          {m.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Sana: {new Date(m.date).toLocaleDateString()} {m.time} • Joyi: {m.location}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">O'qituvchi: {m.teacher?.fullName || 'Biriktirilmagan'}</p>
                    </div>
                    {m.status === 'SCHEDULED' && (
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => updateMeetingStatus(m._id, 'COMPLETED').then(loadAll)}
                          className="px-2.5 py-1 bg-emerald-500/10 text-emerald-500 rounded text-xs font-semibold hover:bg-emerald-500/20"
                        >
                          Bajarildi
                        </button>
                        <button
                          onClick={() => updateMeetingStatus(m._id, 'CANCELLED').then(loadAll)}
                          className="px-2.5 py-1 bg-rose-500/10 text-rose-500 rounded text-xs font-semibold hover:bg-rose-500/20"
                        >
                          Bekor qilish
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'demos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b pb-2">
                <h3 className="text-lg font-bold">Demo Dars Qatnashuvlari</h3>
              </div>
              {/* Demo log form */}
              <form onSubmit={handleLogDemo} className="p-4 bg-secondary/30 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold block mb-1">Kurs</label>
                  <select
                    value={demoForm.course}
                    required
                    onChange={(e) => setDemoForm({ ...demoForm, course: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  >
                    <option value="">Tanlang</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">O'qituvchi</label>
                  <select
                    value={demoForm.teacher}
                    required
                    onChange={(e) => setDemoForm({ ...demoForm, teacher: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  >
                    <option value="">Tanlang</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.fullName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Dars Sanasi</label>
                  <input
                    type="date"
                    required
                    value={demoForm.date}
                    onChange={(e) => setDemoForm({ ...demoForm, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Natija</label>
                  <select
                    value={demoForm.result}
                    onChange={(e) => setDemoForm({ ...demoForm, result: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  >
                    <option value="THINKING">O'ylayapti</option>
                    <option value="WILL_REGISTER">Ro'yxatdan o'tadi</option>
                    <option value="PASSED">Dars yoqdi</option>
                    <option value="NOT_INTERESTED">Rad etdi</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    checked={demoForm.attendance}
                    onChange={(e) => setDemoForm({ ...demoForm, attendance: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-bold">Darsga qatnashdi (Attendance)</span>
                </div>
                <div>
                  <button type="submit" className="w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95 transition-all">
                    Qayd Etish
                  </button>
                </div>
                <div className="md:col-span-3">
                  <label className="text-xs font-bold block mb-1">Fikr va Mulohazalar</label>
                  <input
                    type="text"
                    placeholder="Mijozning demo dars bo'yicha fikrini yozing..."
                    value={demoForm.feedback}
                    onChange={(e) => setDemoForm({ ...demoForm, feedback: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
              </form>

              {/* Demo lessons list */}
              <div className="space-y-3">
                {demos.map(d => (
                  <div key={d._id} className="p-3 border rounded-lg hover:bg-secondary/10 flex justify-between items-center text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{d.course?.name || 'Kurs'}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${d.attendance ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                          {d.attendance ? 'Qatnashdi' : 'Qatnashmadi'}
                        </span>
                        <span className="text-xs bg-secondary px-1.5 py-0.5 rounded">{d.result}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">Fikr: {d.feedback || 'izoh yo\'q'}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">O'qituvchi: {d.teacher?.fullName} • {new Date(d.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Menejer Izohlari (Notes)</h3>
              <form onSubmit={handleAddNote} className="space-y-3">
                <textarea
                  required
                  rows={3}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Lead haqida muhim eslatma yoki ma'lumotlarni yozing..."
                  className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent focus:border-border outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95 transition-all">
                    Izohni Saqlash
                  </button>
                </div>
              </form>

              {/* Notes list */}
              <div className="space-y-4">
                {notes.map(n => (
                  <div key={n._id} className="p-4 border rounded-xl hover:bg-secondary/10 relative group">
                    <button
                      onClick={() => handleDeleteNote(n._id)}
                      className="absolute right-4 top-4 p-1 rounded hover:bg-secondary text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                    <p className="text-sm font-medium pr-8">{n.content}</p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-2">Mualif: {n.author?.fullName} • {new Date(n.date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Menejer Topshiriqlari</h3>
              {/* Task Form */}
              <form onSubmit={handleCreateTask} className="p-4 bg-secondary/30 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold block mb-1">Vazifa nomi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Qayta aloqaga chiqish"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Muddati (Due Date)</label>
                  <input
                    type="datetime-local"
                    required
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Ustuvorlik</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 py-2">
                  <input
                    type="checkbox"
                    checked={taskForm.reminder}
                    onChange={(e) => setTaskForm({ ...taskForm, reminder: e.target.checked })}
                    className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-xs font-bold">Alert ogohlantirish</span>
                </div>
                <div>
                  <button type="submit" className="w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95 transition-all">
                    Vazifa Yaratish
                  </button>
                </div>
              </form>

              {/* Tasks List */}
              <div className="space-y-3">
                {tasks.map(t => (
                  <div key={t._id} className="p-3 border rounded-lg hover:bg-secondary/10 flex justify-between items-center text-sm">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={t.status === 'COMPLETED'}
                        onChange={() => handleToggleTask(t._id, t.status)}
                        className="w-4.5 h-4.5 rounded border text-primary mt-0.5 cursor-pointer"
                      />
                      <div>
                        <span className={`font-semibold ${t.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                          {t.title}
                        </span>
                        <p className="text-xs text-muted-foreground mt-0.5">Muddati: {new Date(t.dueDate).toLocaleString()} • Ustuvorlik: {t.priority}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'followups' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Menejer Follow Up Rejalari</h3>
              {/* Followup form */}
              <form onSubmit={handleScheduleFollowup} className="p-4 bg-secondary/30 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold block mb-1">Sana</label>
                  <input
                    type="date"
                    required
                    value={followupForm.date}
                    onChange={(e) => setFollowupForm({ ...followupForm, date: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Soat</label>
                  <input
                    type="text"
                    required
                    placeholder="12:30"
                    value={followupForm.time}
                    onChange={(e) => setFollowupForm({ ...followupForm, time: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Biriktirilgan Menejer</label>
                  <select
                    value={followupForm.assignedManager}
                    required
                    onChange={(e) => setFollowupForm({ ...followupForm, assignedManager: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  >
                    <option value="">Tanlang</option>
                    {managers.map(m => <option key={m._id} value={m._id}>{m.fullName}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold block mb-1">Bog'lanish sababi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Kompyuter bor yo'qligini tekshirish"
                    value={followupForm.reason}
                    onChange={(e) => setFollowupForm({ ...followupForm, reason: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <button type="submit" className="w-full px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95 transition-all">
                    Rejalashtirish
                  </button>
                </div>
              </form>

              {/* Followups list */}
              <div className="space-y-3">
                {followups.map(f => (
                  <div key={f._id} className="p-3 border rounded-lg hover:bg-secondary/10 flex justify-between items-center text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${f.status === 'COMPLETED' ? 'line-through text-muted-foreground' : ''}`}>
                          {f.reason}
                        </span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded ${f.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                          {f.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Sana: {new Date(f.date).toLocaleDateString()} {f.time} • Mas'ul: {f.assignedManager?.fullName}</p>
                    </div>
                    {f.status === 'PENDING' && (
                      <button
                        onClick={() => handleCompleteFollowup(f._id, f.status)}
                        className="px-3 py-1.5 bg-emerald-500 text-white rounded text-xs font-bold hover:bg-emerald-600"
                      >
                        Bajarildi
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'attachments' && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold border-b pb-2">Mijoz Hujjatlari & Shartnomalari</h3>
              {/* Attachment Form */}
              <form onSubmit={handleAttachFile} className="p-4 bg-secondary/30 rounded-lg border grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="text-xs font-bold block mb-1">Fayl Nomi</label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Passport scan"
                    value={attachmentForm.name}
                    onChange={(e) => setAttachmentForm({ ...attachmentForm, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Fayl turi (Format)</label>
                  <select
                    value={attachmentForm.type}
                    onChange={(e) => setAttachmentForm({ ...attachmentForm, type: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  >
                    <option value="PASSPORT">Passport Scan</option>
                    <option value="CONTRACT">Shartnoma (Contract)</option>
                    <option value="RECEIPT">To'lov Kvitansiyasi (Receipt)</option>
                    <option value="PDF">Boshqa PDF</option>
                    <option value="IMAGE">Rasm (Image)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold block mb-1">Fayl havolasi (URL)</label>
                  <input
                    type="text"
                    required
                    placeholder="https://storage.com/fail.pdf"
                    value={attachmentForm.url}
                    onChange={(e) => setAttachmentForm({ ...attachmentForm, url: e.target.value })}
                    className="w-full px-3 py-1.5 text-sm bg-card border rounded outline-none"
                  />
                </div>
                <div className="md:col-span-3 flex justify-end">
                  <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95 transition-all">
                    Faylni biriktirish
                  </button>
                </div>
              </form>

              {/* Attachments List */}
              <div className="space-y-3">
                {attachments.map(a => (
                  <div key={a._id} className="p-3 border rounded-lg hover:bg-secondary/10 flex justify-between items-center text-sm">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-primary" />
                      <div>
                        <a href={a.url} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                          {a.name}
                        </a>
                        <p className="text-xs text-muted-foreground mt-0.5">Turi: {a.type} • Yuklandi: {new Date(a.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteAttachment(a._id)}
                      className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CONVERT TO STUDENT MODAL */}
      {convertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="bg-card w-full max-w-lg p-6 rounded-xl border shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => { setConvertModalOpen(false); setCredentials(null); }}
              className="absolute right-4 top-4 p-1 rounded-md text-muted-foreground hover:bg-secondary"
            >
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold mb-2 text-emerald-500">Talabaga Aylantirish (Convert Wizard)</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Ushbu leadni rasmiy o'quvchiga aylantirish. Bu jarayonda avtomatik ravishda unga login/parol yaratiladi va LMS guruhiga qo'shiladi.
            </p>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-md bg-rose-500/10 text-rose-500 text-xs font-medium flex gap-2 border border-rose-500/20">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {errorMsg}
              </div>
            )}

            {credentials ? (
              // Success credentials panel
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="font-bold text-emerald-600">Muvaffaqiyatli Talabaga Aylantirildi!</p>
                  <p className="text-xs text-muted-foreground mt-1">Ushbu login ma'lumotlarini o'quvchiga taqdim eting.</p>
                </div>
                <div className="p-4 bg-secondary rounded-lg border space-y-2.5 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Login (Telefon):</span>
                    <span className="font-bold">{credentials.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Parol (Dastlabki):</span>
                    <span className="font-bold text-primary">{credentials.password}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Guruh:</span>
                    <span className="font-bold">{credentials.groupName}</span>
                  </div>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => { setConvertModalOpen(false); setCredentials(null); loadAll(); }}
                    className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded hover:bg-primary/95"
                  >
                    Yopish
                  </button>
                </div>
              </div>
            ) : (
              // Selection Form
              <form onSubmit={handleConvertLead} className="space-y-4">
                <div>
                  <label className="text-xs font-bold block mb-1">Kurs *</label>
                  <select
                    required
                    value={convertForm.courseId}
                    onChange={(e) => setConvertForm({ ...convertForm, courseId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none cursor-pointer"
                  >
                    <option value="">Kursni tanlang</option>
                    {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold block mb-1">Guruh (LMS Group) *</label>
                  <select
                    required
                    value={convertForm.groupId}
                    onChange={(e) => setConvertForm({ ...convertForm, groupId: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none cursor-pointer"
                  >
                    <option value="">Guruhni tanlang</option>
                    {groups
                      .filter(g => !convertForm.courseId || g.courseId?._id === convertForm.courseId || g.courseId === convertForm.courseId)
                      .map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold block mb-1">Birlamchi to'lov summasi (UZS)</label>
                    <input
                      type="number"
                      value={convertForm.amount}
                      onChange={(e) => setConvertForm({ ...convertForm, amount: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold block mb-1">Keyingi to'lov sanasi</label>
                    <input
                      type="date"
                      value={convertForm.nextPaymentDate}
                      onChange={(e) => setConvertForm({ ...convertForm, nextPaymentDate: e.target.value })}
                      className="w-full px-3 py-2 text-sm rounded bg-secondary border border-transparent outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setConvertModalOpen(false)}
                    className="px-4 py-2 border rounded text-sm hover:bg-secondary transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 text-white text-sm font-semibold rounded hover:bg-emerald-600 transition-all"
                  >
                    Rasmiylashtirish
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default LeadDetails;
