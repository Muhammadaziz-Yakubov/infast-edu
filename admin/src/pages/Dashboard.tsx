import React, { useEffect, useState } from 'react';
import { getDashboardAnalytics } from '../api/analytics';
import { getGroups } from '../api/groups';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  CreditCard,
  CheckSquare,
  Activity,
  Sparkles,
  Send,
  Clock,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // AI Widget Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([
    { role: 'assistant', text: "Salom! Men tizimli AI yordamchiman. O'quv markazining davomati, to'lovlari yoki guruhlari bo'yicha qanday ma'lumot kerak?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const chatEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  useEffect(() => {
    Promise.all([getDashboardAnalytics(), getGroups()])
      .then(([analyticsRes, groupsRes]) => {
        setData(analyticsRes);
        setGroups(groupsRes || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load dashboard data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Helper to determine today's lessons
  const getTodayLessons = () => {
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = daysOfWeek[new Date().getDay()];
    
    // Filter groups meeting today
    const activeToday = groups.filter(g => 
      g.schedule && 
      Array.isArray(g.schedule.days) && 
      g.schedule.days.some((d: string) => d.toLowerCase() === todayName.toLowerCase())
    );

    if (activeToday.length > 0) return activeToday;

    // Fallback static upcoming/today lessons if no live groups meet today
    return [
      {
        _id: 'l-mock-1',
        name: 'Frontend Beginner #1',
        schedule: { time: '18:30 - 20:00' },
        courseTitle: 'Fullstack JS Development',
      },
      {
        _id: 'l-mock-2',
        name: 'Python AI Core #2',
        schedule: { time: '16:00 - 17:30' },
        courseTitle: 'Python for AI & Data Science',
      }
    ];
  };

  const todayLessons = getTodayLessons();

  const submitMessage = async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    setIsTyping(true);

    const updatedMessages = [...chatMessages, { role: 'user' as const, text: userText }];
    const withPlaceholder = [...updatedMessages, { role: 'assistant' as const, text: '' }];
    setChatMessages(withPlaceholder);

    try {
      const token = localStorage.getItem('admin_access_token');
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      const response = await fetch(`${API_URL}/ai/dashboard-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: userText,
          history: chatMessages.map(m => ({ role: m.role, content: m.text })),
          systemContext: `Total students: ${data?.totalStudents || 0}, Active students: ${data?.activeStudents || 0}, Monthly revenue: ${data?.monthlyRevenue || 0} UZS, Attendance rate: ${data?.attendanceRate || 0}%`
        }),
      });

      if (!response.ok) {
        throw new Error("Aloqa xatosi");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      if (!reader) throw new Error("Stream read error");

      let accumulated = '';
      let buffer = '';
      setIsTyping(false);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith('data: ')) {
            const dataStr = trimmed.slice(6);
            if (dataStr === '[DONE]') continue;
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.content) {
                accumulated += parsed.content;
                setChatMessages(prev => {
                  const copy = [...prev];
                  if (copy.length > 0) {
                    copy[copy.length - 1] = { role: 'assistant', text: accumulated };
                  }
                  return copy;
                });
              }
            } catch (err) {
              // Ignore partial chunk parse error
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
      setChatMessages(prev => {
        const copy = [...prev];
        if (copy.length > 0 && copy[copy.length - 1].role === 'assistant' && copy[copy.length - 1].text === '') {
          copy[copy.length - 1] = { role: 'assistant', text: "Kechirasiz, Groq AI tizimi bilan bog'lanishda xatolik yuz berdi." };
        }
        return copy;
      });
    }
  };

  const handleAskAI = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userText = chatInput;
    setChatInput('');
    submitMessage(userText);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-200">
      
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Boshqaruv Paneli</h1>
        <p className="text-sm text-muted-foreground">InFast Academy o'quv markazining joriy holati va tezkor hisobotlari.</p>
      </div>

      {/* Main minimal cards: Students, Payments, Attendance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Students Card */}
        <div 
          onClick={() => navigate('/students')}
          className="p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">O'quvchilar Boshqaruvi</span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <Users className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{data?.totalStudents ?? 0} nafar</p>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>{data?.activeStudents ?? 0} faol o'quvchi</span>
            </div>
          </div>
        </div>

        {/* Payments Card */}
        <div 
          onClick={() => navigate('/payments')}
          className="p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">To'lovlar & Tushumlar</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <CreditCard className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{(data?.monthlyRevenue ?? 0).toLocaleString()} UZS</p>
            <span className="text-xs text-muted-foreground mt-1 block">Joriy oy uchun umumiy tushum</span>
          </div>
        </div>

        {/* Attendance Card */}
        <div 
          onClick={() => navigate('/attendance')}
          className="p-5 bg-card border rounded-xl shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Akademik Davomat</span>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <CheckSquare className="w-4.5 h-4.5" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold tracking-tight">{data?.attendanceRate ?? 0}%</p>
            <span className="text-xs text-muted-foreground mt-1 block">O'rtacha darsga qatnashish foizi</span>
          </div>
        </div>

      </div>

      {/* Grid: Left Column (Today's Lessons + AI Widget) & Right Column (Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Span 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Lessons */}
          <div className="p-5 bg-card border rounded-xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Clock className="w-4.5 h-4.5 text-primary" />
                Bugungi Darslar Jadvali
              </h3>
              <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-md font-medium capitalize">
                {new Date().toLocaleDateString('uz-UZ', { weekday: 'long', day: 'numeric', month: 'short' })}
              </span>
            </div>

            <div className="space-y-3">
              {todayLessons.map((lesson: any) => (
                <div 
                  key={lesson._id} 
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 border rounded-lg hover:border-primary/30 hover:bg-secondary/10 transition-all gap-2"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="p-2 rounded bg-primary/10 text-primary shrink-0 mt-0.5">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{lesson.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{lesson.courseTitle || 'Kurs nomi mavjud emas'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground bg-secondary/60 px-3 py-1.5 rounded-md self-start sm:self-auto">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {lesson.schedule?.time || '18:30 - 20:00'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Assistant Widget */}
          <div className="p-5 bg-card border rounded-xl shadow-sm flex flex-col justify-between space-y-4 min-h-[350px]">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-semibold text-base flex items-center gap-2">
                <Sparkles className="w-4.5 h-4.5 text-primary animate-pulse" />
                InFast AI Assistant
              </h3>
              <button 
                onClick={() => navigate('/ai-advisor')}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                AI Advisor
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

             {/* Chat Body */}
            <div className="flex-1 overflow-y-auto max-h-56 space-y-3 pr-1 text-xs">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-xl px-3 py-2 leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-primary text-primary-foreground font-semibold rounded-br-none' 
                      : 'bg-secondary/60 text-foreground border rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-secondary/60 text-muted-foreground border rounded-xl rounded-tl-none px-3 py-2 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-100"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Chips */}
            <div className="flex flex-wrap gap-2 pt-2 border-t text-[10px] font-semibold text-muted-foreground select-none">
              <span className="self-center">Tezkor savollar:</span>
              <button 
                type="button"
                onClick={() => submitMessage("Bugungi davomat ko'rsatkichlari qanday?")}
                className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 hover:text-foreground transition-colors cursor-pointer"
              >
                📊 Davomat tahlili
              </button>
              <button 
                type="button"
                onClick={() => submitMessage("Oylik tushumlar hisoboti qanday?")}
                className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 hover:text-foreground transition-colors cursor-pointer"
              >
                💰 Oylik tushum
              </button>
              <button 
                type="button"
                onClick={() => submitMessage("O'quvchilar soni va ularning joriy holati qanday?")}
                className="px-2.5 py-1 rounded bg-secondary hover:bg-secondary/80 hover:text-foreground transition-colors cursor-pointer"
              >
                👥 Talabalar statistikasi
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleAskAI} className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Markaz ko'rsatkichlari bo'yicha savol bering..."
                className="flex-1 border rounded-lg px-3 py-2 text-xs bg-background outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="px-3.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Right Column: Recent Activity */}
        <div className="p-5 bg-card border rounded-xl shadow-sm space-y-4 h-fit">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold text-base flex items-center gap-2">
              <Activity className="w-4.5 h-4.5 text-primary animate-pulse" />
              Oxirgi Harakatlar Logi
            </h3>
          </div>

          <div className="space-y-4">
            {(data?.recentActivities || []).map((act: any) => (
              <div 
                key={act.id || act._id} 
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-secondary/40 border border-transparent hover:border-border transition-colors text-xs"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                <div className="flex-1 space-y-0.5">
                  <p className="font-medium text-foreground">{act.message}</p>
                  <p className="text-[10px] text-muted-foreground">{act.time}</p>
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={() => navigate('/analytics')}
            className="w-full flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-secondary/50 transition-all"
          >
            Tizim faoliyatini to'liq ko'rish
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
