import React, { useEffect, useState } from 'react';
import { getDashboardAnalytics } from '../api/analytics';
import { Users, DollarSign, Percent, BookOpen } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export const Analytics: React.FC = () => {
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

  const revenueHistory = data?.revenueHistory || [];
  const studentGrowth = data?.studentGrowth || [];
  const totalRevenue = revenueHistory.reduce((sum: number, item: any) => sum + (item.revenue || 0), 0);

  const summaryCards = [
    { label: 'Jami Talabalar', value: data?.totalStudents ?? 0, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Oylik Daromad', value: `${(data?.monthlyRevenue ?? 0).toLocaleString()} so'm`, icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' },
    { label: 'Jami Kurslar', value: data?.totalCourses ?? 0, icon: BookOpen, color: 'text-indigo-500 bg-indigo-500/10' },
    { label: 'Davomat', value: `${data?.attendanceRate ?? 0}%`, icon: Percent, color: 'text-green-500 bg-green-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Tahliliy Ma'lumotlar</h1>
        <p className="text-muted-foreground">O'quv markazining o'sish dinamikasi va darslarda qatnashish foizlari.</p>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <div key={card.label} className="p-5 bg-card border rounded-xl flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-muted-foreground font-semibold">{card.label}</p>
              <p className="text-xl font-bold tracking-tight mt-0.5">{card.value}</p>
            </div>
            <div className={`p-3 rounded-lg ${card.color}`}>
              <card.icon className="w-5 h-5" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income Chart */}
        <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="font-bold text-sm flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-primary" />
                Daromadlar Dinamikasi (UZS)
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                6 oylik jami: <span className="font-bold text-foreground">{totalRevenue.toLocaleString()} so'm</span>
              </p>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,100,100,0.1)" />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val: any) => [`${Number(val).toLocaleString()} so'm`, 'Daromad']} />
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" fill="url(#colorRev)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Growth Chart */}
        <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <Users className="w-4 h-4 text-primary" />
              Talabalar Sonining O'sishi
            </h3>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={studentGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,100,100,0.1)" />
                <XAxis dataKey="month" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(val: any) => [val, 'Talabalar']} />
                <Bar dataKey="students" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Course Distribution */}
        {data?.courseDistribution && data.courseDistribution.length > 0 && (
          <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4 lg:col-span-2">
            <h3 className="font-bold text-sm border-b pb-2">Kurslar Bo'yicha Talabalar Taqsimoti</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.courseDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(100,100,100,0.1)" />
                  <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" fontSize={11} tickLine={false} axisLine={false} width={160} />
                  <Tooltip formatter={(val: any) => [val, 'Talabalar']} />
                  <Bar dataKey="students" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
