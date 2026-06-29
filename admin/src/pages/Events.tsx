import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, Users, CheckCircle, XCircle, MapPin, Loader2, Save } from 'lucide-react';
import { getEvents, createEvent, deleteEvent, submitEventAttendance } from '../api/events';

interface Participant {
  _id: string;
  fullName: string;
  avatar?: string;
  email?: string;
}

interface EventItem {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  image: string;
  participants: Participant[];
  attendance: {
    userId: string;
    attended: boolean;
    processed: boolean;
  }[];
  createdAt: string;
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [attendanceSheet, setAttendanceSheet] = useState<{ [userId: string]: boolean }>({});
  const [submittingAttendance, setSubmittingAttendance] = useState(false);

  // Creation form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [image, setImage] = useState('');

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await getEvents();
      setEvents(data);
      // Update selected event if it's currently open
      if (selectedEvent) {
        const updated = data.find((e) => e._id === selectedEvent._id);
        if (updated) handleSelectEvent(updated);
      }
    } catch (err) {
      console.error('Fetch events error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !date || !location.trim() || !image.trim()) return;

    try {
      setCreating(true);
      await createEvent({
        title: title.trim(),
        description: description.trim(),
        date,
        location: location.trim(),
        image: image.trim(),
      });
      setTitle('');
      setDescription('');
      setDate('');
      setLocation('');
      setImage('');
      await fetchEvents();
    } catch (err) {
      console.error('Create event error:', err);
      alert('Tadbir qo\'shishda xatolik yuz berdi.');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ushbu tadbirni o\'chirmoqchimisiz?')) return;
    try {
      await deleteEvent(id);
      setEvents((prev) => prev.filter((e) => e._id !== id));
      if (selectedEvent?._id === id) {
        setSelectedEvent(null);
      }
    } catch (err) {
      console.error('Delete event error:', err);
    }
  };

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    
    // Initialize attendance status from existing data
    const initialSheet: { [userId: string]: boolean } = {};
    
    // Default all registered participants to false or their current database state
    event.participants.forEach((p) => {
      const dbRecord = event.attendance?.find((a) => a.userId === p._id);
      initialSheet[p._id] = dbRecord ? dbRecord.attended : false;
    });

    setAttendanceSheet(initialSheet);
  };

  const handleToggleAttendance = (userId: string, attended: boolean) => {
    setAttendanceSheet((prev) => ({
      ...prev,
      [userId]: attended,
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!selectedEvent) return;
    try {
      setSubmittingAttendance(true);
      const payload = Object.entries(attendanceSheet).map(([userId, attended]) => ({
        userId,
        attended,
      }));

      await submitEventAttendance(selectedEvent._id, payload);
      alert('Davomat muvaffaqiyatli saqlandi! Kelganlarga +500 coin berildi, kelmaganlardan -500 coin ayrildi.');
      await fetchEvents();
    } catch (err) {
      console.error('Submit attendance error:', err);
      alert('Davomatni saqlashda xatolik yuz berdi.');
    } finally {
      setSubmittingAttendance(false);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Tadbirlar boshqaruvi</h1>
        <p className="text-muted-foreground">
          Tadbirlar (Events) yaratish, talabalar ro'yxatini ko'rish va keldi/ketdi davomatini amalga oshirish.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── CREATE EVENT FORM ── */}
        <div className="lg:col-span-1 bg-card border rounded-xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Plus className="w-4 h-4 text-primary" />
            Yangi Tadbir Yaratish
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Tadbir nomi</label>
              <input
                type="text"
                required
                placeholder="Masalan: Hackathon 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Tavsif (Description)</label>
              <textarea
                required
                rows={3}
                placeholder="Tadbir haqida batafsil ma'lumot..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Tadbir sanasi va vaqti</label>
              <input
                type="datetime-local"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Bo'lib o'tadigan joy</label>
              <input
                type="text"
                required
                placeholder="Masalan: InFast Academy, 3-xona"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Afisha (Rasm) URL</label>
              <input
                type="url"
                required
                placeholder="https://example.com/poster.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <button
              type="submit"
              disabled={creating}
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {creating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              {creating ? 'Tadbir saqlanmoqda...' : 'Tadbir Yaratish'}
            </button>
          </form>
        </div>

        {/* ── EVENTS LIST OR ATTENDANCE SHEET ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Attendance sheet display */}
          {selectedEvent ? (
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                <div>
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="text-xs text-primary font-bold hover:underline mb-1 block"
                  >
                    ← Tadbirlar ro'yxatiga qaytish
                  </button>
                  <h3 className="font-bold text-lg text-foreground uppercase tracking-wide">
                    {selectedEvent.title} — Davomat varaqasi
                  </h3>
                </div>
                <button
                  onClick={handleSubmitAttendance}
                  disabled={submittingAttendance || selectedEvent.participants.length === 0}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-500 transition-colors disabled:opacity-50"
                >
                  {submittingAttendance ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Save className="w-3.5 h-3.5" />
                  )}
                  Davomatni Saqlash
                </button>
              </div>

              {selectedEvent.participants.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">Ushbu tadbirga hech kim yozilmagan</p>
                  <p className="text-xs mt-1">Talabalar mobil ilova orqali yozilishlari kutilmoqda.</p>
                </div>
              ) : (
                <div className="divide-y max-h-[450px] overflow-y-auto pr-2">
                  {selectedEvent.participants.map((student) => {
                    const isAttended = attendanceSheet[student._id] ?? false;
                    return (
                      <div key={student._id} className="py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={student.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + student.fullName}
                            alt="Avatar"
                            className="w-9 h-9 rounded-full bg-secondary"
                          />
                          <div>
                            <p className="text-sm font-bold text-foreground">{student.fullName}</p>
                            <p className="text-xs text-muted-foreground">{student.email || 'Email yo\'q'}</p>
                          </div>
                        </div>

                        {/* Attended Toggle buttons */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(student._id, true)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              isAttended
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
                                : 'bg-background text-muted-foreground border-border hover:bg-secondary'
                            }`}
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Keldi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleAttendance(student._id, false)}
                            className={`flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              !isAttended
                                ? 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-800'
                                : 'bg-background text-muted-foreground border-border hover:bg-secondary'
                            }`}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Kelmadi
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* Events list */
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                Mavjud Tadbirlar
              </h3>

              {loading ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm">Yuklanmoqda...</span>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm font-semibold">Tadbirlar mavjud emas</p>
                  <p className="text-xs mt-1">Yangi tadbir qo'shish uchun chap tomondagi formani ishlating.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {events.map((event) => (
                    <div
                      key={event._id}
                      className="group relative flex flex-col border rounded-xl overflow-hidden bg-secondary/15 hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-36 bg-secondary">
                        <img
                          src={event.image}
                          alt={event.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://placehold.co/400x250/1E1E2E/666?text=No+Poster';
                          }}
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                          <p className="text-white text-sm font-bold uppercase tracking-wide">{event.title}</p>
                        </div>
                      </div>

                      <div className="p-3 flex-1 flex flex-col justify-between space-y-3">
                        <p className="text-xs text-muted-foreground line-clamp-2">{event.description}</p>
                        
                        <div className="space-y-1.5 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1 font-medium text-foreground">
                            <Calendar className="w-3.5 h-3.5 text-primary" />
                            {formatDate(event.date)}
                          </p>
                          <p className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                            {event.location}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t pt-2.5 mt-2">
                          <button
                            onClick={() => handleSelectEvent(event)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors"
                          >
                            <Users className="w-3.5 h-3.5" />
                            Davomat ({event.participants?.length || 0})
                          </button>
                          
                          <button
                            onClick={() => handleDelete(event._id)}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                            title="Tadbirni o'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
