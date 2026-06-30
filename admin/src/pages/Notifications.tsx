import React, { useState } from 'react';
import { Bell, Send, Megaphone } from 'lucide-react';
import { broadcastNotification } from '../api/notifications';

export const Notifications: React.FC = () => {
  const [messages, setMessages] = useState([
    { id: '1', title: 'Tizim yangilanishi', body: 'InFast LMS 1.0 stabil versiyaga yangilandi.', date: 'Bugun, 09:00' },
    { id: '2', title: 'To\'lov muddati', body: 'Ushbu oydagi to\'lovlarni qabul qilish faollashtirildi.', date: 'Kecha, 18:25' },
  ]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;
    try {
      await broadcastNotification(title, body);
      setMessages([
        { id: Date.now().toString(), title, body, date: 'Hozir' },
        ...messages
      ]);
      setTitle('');
      setBody('');
      alert('E\'lon muvaffaqiyatli jo\'natildi (Barcha talabalarga)');
    } catch (err: any) {
      alert("Xatolik: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">E'lonlar Tarqatish</h1>
        <p className="text-muted-foreground">Barcha o'quvchilarga bildirishnomalar yoki tizim xabarlarini yuborish.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Broadcast Form */}
        <div className="lg:col-span-1 bg-card border rounded-xl p-6 shadow-sm space-y-4 h-fit">
          <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Megaphone className="w-4 h-4 text-primary" />
            Yangi E'lon
          </h3>
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Sarlavha</label>
              <input
                type="text"
                required
                placeholder="E.g. Dars qoldirilishi"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Xabar matni</label>
              <textarea
                required
                rows={3}
                placeholder="Talabalarga yuboriladigan matn..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full border rounded-lg p-2 text-sm bg-background outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2.5 text-sm font-semibold rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
            >
              <Send className="w-4 h-4" />
              Yuborish
            </button>
          </form>
        </div>

        {/* Previous Alarms feed */}
        <div className="lg:col-span-2 bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm border-b pb-2 flex items-center gap-1.5 uppercase tracking-wider text-muted-foreground">
            <Bell className="w-4 h-4 text-primary" />
            Yuborilgan Bildirishnomalar
          </h3>
          <div className="space-y-3">
            {messages.map((m) => (
              <div key={m.id} className="p-4 border rounded-xl bg-secondary/15 flex justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-foreground block">{m.title}</span>
                  <p className="text-xs text-muted-foreground leading-relaxed">{m.body}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0">{m.date}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
