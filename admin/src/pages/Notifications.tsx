import React, { useState } from 'react';
import { Bell, Send, Megaphone, Smartphone, Sparkles } from 'lucide-react';
import { broadcastNotification } from '../api/notifications';

export const Notifications: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: '1', title: 'Tizim yangilanishi', body: 'InFast LMS 1.0 stabil versiyaga yangilandi.', date: 'Bugun, 09:00' },
    { id: '2', title: 'To\'lov muddati', body: 'Ushbu oydagi to\'lovlarni qabul qilish faollashtirildi.', date: 'Kecha, 18:25' },
  ]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    setSending(true);
    try {
      await broadcastNotification(title, body);
      setMessages([
        { id: Date.now().toString(), title, body, date: 'Hozir' },
        ...messages
      ]);
      setTitle('');
      setBody('');
      alert('⚡ Xabar va Push Notification muvaffaqiyatli jo\'natildi!');
    } catch (err: any) {
      alert("Xatolik: " + (err.response?.data?.message || err.message));
    } finally {
      setSending(false);
    }
  };

  const handleQuickFill = (presetTitle: string, presetBody: string) => {
    setTitle(presetTitle);
    setBody(presetBody);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
          <Bell className="w-8 h-8 text-primary" />
          Smart Push Bildirishnomalar
        </h1>
        <p className="text-muted-foreground text-sm">
          Mobil ilovaga ega barcha o'quvchilar telefoniga push-xabarnoma va bildirishnoma yuborish.
        </p>
      </div>

      {/* Push Notification Info Card */}
      <div className="bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div className="p-3 bg-primary text-primary-foreground rounded-xl">
          <Smartphone className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
            Offline & Background Push Yuborish Aktivlashtirilgan
            <span className="px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold bg-emerald-500 text-white rounded-full">
              LIVE
            </span>
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Admin paneldan yuborilgan har bir xabar o'quvchi ilovada bo'lmaganda ham (telefon ekrani yopiq bo'lsa ham) ularning mobil qurilmalariga real-vaqt rejimida borib tushadi.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form & Presets */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm border-b pb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
              <Megaphone className="w-4 h-4 text-primary" />
              Yangi Push Xabarnoma
            </h3>
            
            <form onSubmit={handleBroadcast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Xabar Sarlavhasi</label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Dars boshlanishi eslatmasi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded-xl p-3 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Xabar Matni</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Mobil ilovada va telefon ekranida ko'rinadigan matn..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full border rounded-xl p-3 text-sm bg-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 text-sm font-semibold rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Send className="w-4 h-4" />
                {sending ? 'Yuborilmoqda...' : 'Push Notification Yuborish'}
              </button>
            </form>
          </div>

          {/* Quick Presets */}
          <div className="bg-card border rounded-2xl p-5 space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              Tezkor Shabloni Tanlash
            </h4>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleQuickFill("🔔 To'lov Muddati Eslatmasi", "Hurmatli o'quvchi, ushbu oy uchun o'quv to'lovini amalga oshirish muddati keldi.")}
                className="w-full text-left p-3 rounded-xl border bg-secondary/20 hover:bg-secondary/40 transition-all text-xs font-medium space-y-1"
              >
                <div className="font-bold text-foreground">💳 To'lov muddati eslatmasi</div>
                <div className="text-muted-foreground truncate">Hurmatli o'quvchi, ushbu oy uchun o'quv to'lovini...</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("📅 Qo'shimcha Dars Eslatmasi", "Eslatib o'tamiz, bugun soat 16:00 da Qo'shimcha darsingiz bor. O'z vaqtida keling!")}
                className="w-full text-left p-3 rounded-xl border bg-secondary/20 hover:bg-secondary/40 transition-all text-xs font-medium space-y-1"
              >
                <div className="font-bold text-foreground">📚 Qo'shimcha dars eslatmasi</div>
                <div className="text-muted-foreground truncate">Eslatib o'tamiz, bugun soat 16:00 da Qo'shimcha darsingiz...</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill("🥳 Yangi Event e'lon qilindi!", "Markazimizda yangi tadbir o'tkaziladi. Mobile ilovada ro'yxatdan o'ting!")}
                className="w-full text-left p-3 rounded-xl border bg-secondary/20 hover:bg-secondary/40 transition-all text-xs font-medium space-y-1"
              >
                <div className="font-bold text-foreground">🥳 Yangi Event bildirishnomasi</div>
                <div className="text-muted-foreground truncate">Markazimizda yangi tadbir o'tkaziladi. Mobile ilovada...</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: History */}
        <div className="lg:col-span-2 bg-card border rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm border-b pb-3 flex items-center gap-2 uppercase tracking-wider text-muted-foreground">
            <Bell className="w-4 h-4 text-primary" />
            Yuborilgan Bildirishnomalar Tarixi
          </h3>
          
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="p-4 border rounded-2xl bg-secondary/10 hover:bg-secondary/20 transition-all flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{m.title}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold bg-primary/10 text-primary border border-primary/20 rounded-md">
                      Push & App
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.body}</p>
                </div>
                <span className="text-[11px] text-muted-foreground font-medium shrink-0 bg-background px-2.5 py-1 rounded-lg border">
                  {m.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
