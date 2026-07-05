import React, { useEffect, useState } from 'react';
import {
  getCrmLostReasons,
  getCrmCourseAnalytics,
} from '../../api/leads';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';
import {
  AlertTriangle,
  BookOpen,
  BarChart3,
} from 'lucide-react';

export const MarketingAnalytics: React.FC = () => {
  const [lostReasons, setLostReasons] = useState<any[]>([]);
  const [courseAnalytics, setCourseAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [reasons, courses] = await Promise.all([
          getCrmLostReasons(),
          getCrmCourseAnalytics(),
        ]);
        setLostReasons(reasons || []);
        setCourseAnalytics(courses || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#6b7280'];

  const formattedLost = lostReasons.map((r, i) => ({
    name: r._id || 'Noma\'lum',
    value: r.count,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Marketing va Sotuv Analitikasi</h1>
        <p className="text-muted-foreground text-sm">Sotuv voronkasi tahlili, kurslar bo'yicha qiziqish va yo'qotilgan mijozlar hisoboti.</p>
      </div>

      {/* Grid: Left - Course interest & conversion. Right - Lost reasons chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Course Conversion Metrics */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Kurslar bo'yicha Konversiya Tahlili
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-secondary/50 text-xs font-bold text-muted-foreground uppercase">
                  <th className="p-3">Kurs Nomi</th>
                  <th className="p-3 text-center">Leadlar</th>
                  <th className="p-3 text-center">O'quvchi bo'ldi</th>
                  <th className="p-3 text-right">Konversiya %</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {courseAnalytics.map((c) => (
                  <tr key={c.courseName} className="hover:bg-secondary/20 transition-colors">
                    <td className="p-3 font-semibold text-foreground">{c.courseName}</td>
                    <td className="p-3 text-center">{c.leadsCount}</td>
                    <td className="p-3 text-center font-bold text-emerald-500">{c.convertedCount}</td>
                    <td className="p-3 text-right font-bold">
                      <div className="flex items-center justify-end gap-2">
                        <span>{c.conversionRate}%</span>
                        <div className="w-12 bg-secondary h-1.5 rounded-full overflow-hidden hidden sm:block">
                          <div className="bg-emerald-500 h-full" style={{ width: `${c.conversionRate}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Lost Reasons Distribution */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4 flex flex-col">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Rad etish sabablari tahlili (Lost Reasons)
          </h2>
          <div className="flex-1 h-[260px] flex items-center justify-center">
            {lostReasons.length === 0 ? (
              <p className="text-sm text-muted-foreground">Hozircha rad etilgan mijozlar ma'lumotlari mavjud emas.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedLost}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {formattedLost.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#1f2937', color: '#fff', borderRadius: '8px' }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} fontSize={11} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Course leads counts bar chart */}
      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary" />
          Kurslarga Bo'lgan Qiziqishlar Soni
        </h2>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={courseAnalytics} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="courseName" fontSize={11} stroke="#888888" tickLine={false} />
              <YAxis fontSize={11} stroke="#888888" tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', color: '#fff', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              />
              <Bar dataKey="leadsCount" fill="#3b82f6" name="Leadlar Soni" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default MarketingAnalytics;
