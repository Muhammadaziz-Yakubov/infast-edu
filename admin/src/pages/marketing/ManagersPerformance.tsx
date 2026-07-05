import React, { useEffect, useState } from 'react';
import { getCrmManagersPerformance } from '../../api/leads';
import {
  Award,
  Phone,
  Calendar,
  GraduationCap,
  DollarSign,
  Clock,
} from 'lucide-react';

export const ManagersPerformance: React.FC = () => {
  const [performances, setPerformances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getCrmManagersPerformance();
        setPerformances(data || []);
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

  // Sort by conversionsCount descending to find the MVP
  const sortedPerformances = [...performances].sort((a, b) => b.conversionsCount - a.conversionsCount);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sotuv Menejerlari Leaderboardi</h1>
        <p className="text-muted-foreground text-sm">Menejerlar faolligi, konversiya darajasi va keltirilgan umumiy daromadlar.</p>
      </div>

      {/* Top MVP Banner Card */}
      {sortedPerformances.length > 0 && (
        <div className="bg-gradient-to-r from-primary to-indigo-600 text-primary-foreground p-6 rounded-xl border shadow-lg flex flex-col sm:flex-row justify-between items-center gap-6 animate-in slide-in-from-top-4 duration-300">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/10 rounded-full border border-white/20 text-yellow-300">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider font-bold opacity-80">Oyning Eng Yaxshi Menejeri (MVP)</span>
              <h2 className="text-xl font-bold mt-1">{sortedPerformances[0].managerName}</h2>
              <p className="text-xs opacity-90 mt-1">
                {sortedPerformances[0].conversionsCount} ta muvaffaqiyatli konversiya • {sortedPerformances[0].conversionRate}% yopish darajasi
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs opacity-80 font-bold block uppercase">Keltirgan Daromadi</span>
            <span className="text-2xl font-extrabold">{sortedPerformances[0].revenue.toLocaleString()} UZS</span>
          </div>
        </div>
      )}

      {/* Grid of managers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedPerformances.map((m, index) => (
          <div key={m.managerName} className="bg-card rounded-xl border shadow-sm p-6 space-y-4 hover:shadow-md transition-shadow relative">
            {index === 0 && (
              <span className="absolute top-4 right-4 text-xs font-bold bg-yellow-400 text-yellow-950 px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                <Award className="w-3.5 h-3.5" />
                MVP
              </span>
            )}

            {/* Manager profile summary */}
            <div className="flex items-center gap-4">
              <img
                src={m.avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=Manager'}
                alt="Manager"
                className="w-12 h-12 rounded-full bg-secondary shrink-0"
              />
              <div>
                <h3 className="font-bold text-base">{m.managerName}</h3>
                <p className="text-xs text-muted-foreground">Sotuv va Jalb qilish mas'uli</p>
              </div>
            </div>

            <div className="h-[1px] bg-border" />

            {/* Grid of details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Phone className="w-3.5 h-3.5" />
                  <span>Qo'ng'iroqlar:</span>
                </div>
                <p className="font-bold">{m.callsCount} marta</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Uchrashuv/Demo:</span>
                </div>
                <p className="font-bold">{m.meetingsCount} / {m.demosCount}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GraduationCap className="w-3.5 h-3.5" />
                  <span>Konversiyalar:</span>
                </div>
                <p className="font-bold text-emerald-500">{m.conversionsCount} ta o'quvchi</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>O'rtacha yopish vaqti:</span>
                </div>
                <p className="font-bold">{m.avgClosingTimeDays} kun</p>
              </div>
            </div>

            {/* Conversion bar progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Konversiya darajasi:</span>
                <span className="text-primary">{m.conversionRate}%</span>
              </div>
              <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${m.conversionRate}%` }}
                />
              </div>
            </div>

            {/* Financial ROI output */}
            <div className="p-3 bg-secondary/30 rounded-lg border flex justify-between items-center text-xs">
              <div className="flex items-center gap-1.5 text-muted-foreground font-semibold">
                <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                <span>Keltirgan daromadi:</span>
              </div>
              <span className="font-extrabold text-foreground">{m.revenue.toLocaleString()} UZS</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default ManagersPerformance;
