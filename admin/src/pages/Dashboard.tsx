import React, { useEffect, useState } from 'react';
import { getDashboardAnalytics } from '../api/analytics';
import {
  Users,
  UserCheck,
  UserX,
  DollarSign,
  BookOpen,
  Percent,
  TrendingUp,
  Activity,
  ArrowRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from 'recharts';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardAnalytics().then((res) => {
      setData(res);
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

  const statCards = [
    { title: 'Jami Talabalar', value: data?.totalStudents ?? 0, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { title: 'Faol Talabalar', value: data?.activeStudents ?? 0, icon: UserCheck, color: 'text-green-500 bg-green-500/10' },
    { title: 'Bloklanganlar', value: data?.blockedStudents ?? 0, icon: UserX, color: 'text-red-500 bg-red-500/10' },
    { title: 'Oylik Tushum (UZS)', value: `${(data?.monthlyRevenue ?? 0).toLocaleString()} so'm`, icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' },
    { title: 'Jami Kurslar', value: data?.totalCourses ?? 0, icon: BookOpen, color: 'text-indigo-500 bg-indigo-500/10' },
    { title: 'Davomat Ko\'rsatkichi', value: `${data?.attendanceRate ?? 0}%`, icon: Percent, color: 'text-purple-500 bg-purple-500/10' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Boshqaruv Paneli</h1>
        <p className="text-muted-foreground">InFast Academy o'quv markazining umumiy hisobotlari.</p>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => (
          <div key={card.title} className="p-6 bg-card border rounded-xl flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-muted-foreground">{card.title}</span>
              <p className="text-2xl font-bold tracking-tight">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Revenue Area Chart */}
        <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base">Oylik Daromad</h3>
              <p className="text-xs text-muted-foreground">Oxirgi 6 oylik daromad o'sishi</p>
            </div>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.revenueHistory || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,100,100,0.1)" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: any) => [`${Number(value).toLocaleString()} so'm`, 'Daromad']} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Student Growth Line Chart */}
        <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base">Talabalar O'sishi</h3>
              <p className="text-xs text-muted-foreground">Platformaga yangi a'zo bo'lgan o'quvchilar soni</p>
            </div>
            <Users className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.studentGrowth || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,100,100,0.1)" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: any) => [value, 'Talabalar']} />
                <Line type="monotone" dataKey="students" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course statistics Bar Chart */}
        <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
          <div>
            <h3 className="font-semibold text-base">Kurslar Bo'yicha Statistika</h3>
            <p className="text-xs text-muted-foreground">Har bir kursdagi faol talabalar ulushi</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.courseDistribution || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,100,100,0.1)" />
                <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: any) => [value, 'Talabalar']} />
                <Bar dataKey="students" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activities Feed */}
        <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-base">Oxirgi Harakatlar</h3>
              <p className="text-xs text-muted-foreground">Tizimda bajarilgan oxirgi operatsiyalar logi</p>
            </div>
            <Activity className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="space-y-4">
            {(data?.recentActivities || []).map((act: any) => (
              <div key={act.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary transition-colors border border-transparent hover:border-border">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-sm font-medium">{act.message}</span>
                </div>
                <span className="text-xs text-muted-foreground">{act.time}</span>
              </div>
            ))}
          </div>
          <button className="w-full flex items-center justify-center gap-2 py-2 border rounded-lg text-xs font-semibold text-muted-foreground hover:text-primary hover:bg-secondary transition-all">
            Barcha faoliyatni ko'rish
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
