import React, { useEffect, useState } from 'react';
import { getCrmDashboard, getCrmFunnel } from '../../api/leads';
import {
  TrendingUp,
  Phone,
  Calendar,
  Layers,
  UserCheck,
  AlertCircle,
  Clock,
  DollarSign,
  Plus,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Link } from 'react-router-dom';

export const MarketingDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashStats, funnel] = await Promise.all([
          getCrmDashboard(),
          getCrmFunnel(),
        ]);
        setStats(dashStats);
        setFunnelData(funnel);
      } catch (err) {
        console.error('Xatolik yuz berdi:', err);
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6b7280'];

  const formattedFunnel = funnelData.map((f, i) => ({
    name: f.stage.replace('_', ' '),
    leads: f.count,
    fill: COLORS[i % COLORS.length],
  }));

  const cardHover = 'hover:scale-[1.02] hover:shadow-xl transition-all duration-300';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Marketing CRM Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            IT Academy marketing va sotuv ko'rsatkichlari, leadlar oqimi hamda konversiya tahlillari.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/marketing/leads"
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-md shadow-lg hover:bg-primary/95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Yangi Lead
          </Link>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Leads */}
        <div className={`bg-card p-6 rounded-xl border shadow-sm ${cardHover}`}>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Jami Leadlar</span>
            <Layers className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold">{stats?.totalLeads || 0}</span>
            <span className="text-xs font-semibold text-emerald-500 flex items-center bg-emerald-500/10 px-2 py-0.5 rounded">
              +{stats?.newLeadsToday || 0} bugun
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Ro'yxatdagi barcha qiziqqanlar</div>
        </div>

        {/* Conversion Rate */}
        <div className={`bg-card p-6 rounded-xl border shadow-sm ${cardHover}`}>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Konversiya darajasi</span>
            <UserCheck className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold">{stats?.conversionRate || 0}%</span>
            <span className="text-xs text-emerald-500 flex items-center font-bold">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              Faol
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {stats?.convertedStudents || 0} ta o'quvchiga aylandi
          </div>
        </div>

        {/* Lead Velocity Rate */}
        <div className={`bg-card p-6 rounded-xl border shadow-sm ${cardHover}`}>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Lead Velocity (LVR)</span>
            <TrendingUp className="w-5 h-5 text-violet-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold">
              {stats?.lvr > 0 ? `+${stats?.lvr}` : stats?.lvr}%
            </span>
            <span className="text-xs font-semibold bg-violet-500/10 text-violet-500 px-2 py-0.5 rounded">
              MoM o'sish
            </span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">O'tgan oyga nisbatan leadlar o'sishi</div>
        </div>

        {/* Customer Acquisition Cost */}
        <div className={`bg-card p-6 rounded-xl border shadow-sm ${cardHover}`}>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-xs font-bold uppercase tracking-wider">Mijoz Tannarxi (CAC)</span>
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-4 flex items-baseline gap-1">
            <span className="text-3xl font-extrabold">
              {stats?.cac ? stats.cac.toLocaleString() : 0}
            </span>
            <span className="text-xs text-muted-foreground">so'm</span>
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Bitta o'quvchini jalb qilish xarajati
          </div>
        </div>
      </div>

      {/* Operational Task Grid (Today's counts & Outstanding alerts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Operational Pipeline */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold">Bugungi Tezkor Operatsiyalar</h2>
          <div className="divide-y">
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Qo'ng'iroqlar</p>
                  <p className="text-xs text-muted-foreground">Bajarilgan qo'ng'iroqlar soni</p>
                </div>
              </div>
              <span className="text-lg font-bold">{stats?.todaysCalls || 0}</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Uchrashuvlar</p>
                  <p className="text-xs text-muted-foreground">Bugunga rejalashtirilgan intervyular</p>
                </div>
              </div>
              <span className="text-lg font-bold">{stats?.todaysMeetings || 0}</span>
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Demo Darslar</p>
                  <p className="text-xs text-muted-foreground">Bugungi ochiq dars qatnashchilari</p>
                </div>
              </div>
              <span className="text-lg font-bold">{stats?.todaysDemos || 0}</span>
            </div>
          </div>
        </div>

        {/* Middle: Reminders list & Cold Alert */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold">Ogohlantirish & Eslatmalar</h2>
          <div className="space-y-3">
            {stats?.pendingFollowUps > 0 && (
              <div className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/5 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Kechikayotgan Follow-Up</p>
                  <p className="text-xs text-muted-foreground">
                    Bugun bog'lanish kerak bo'lgan {stats.pendingFollowUps} ta lead kutilmoqda.
                  </p>
                </div>
              </div>
            )}

            {stats?.overdueTasks > 0 && (
              <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/5 flex gap-3">
                <Clock className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Muddati o'tgan vazifalar</p>
                  <p className="text-xs text-muted-foreground">
                    Bajarilmagan {stats.overdueTasks} ta menejer topshiriqlari mavjud.
                  </p>
                </div>
              </div>
            )}

            {stats?.coldLeads > 0 && (
              <div className="p-3 rounded-lg border border-blue-500/30 bg-blue-500/5 flex gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">Muzlagan Leadlar (Cold Leads)</p>
                  <p className="text-xs text-muted-foreground">
                    14 kundan beri harakatsiz {stats.coldLeads} ta muzlagan lead qaqlab qolgan.
                  </p>
                </div>
              </div>
            )}

            {stats?.pendingFollowUps === 0 && stats?.overdueTasks === 0 && stats?.coldLeads === 0 && (
              <div className="text-center py-6 text-muted-foreground text-sm">
                Barcha operatsiyalar o'z vaqtida bajarilmoqda. Tizim toza!
              </div>
            )}
          </div>
        </div>

        {/* Right: Campaign Performance & CAC/CLV ratio */}
        <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
          <h2 className="text-lg font-bold">Marketing ROI Ko'rsatkichlari</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Eng yaxshi reklama kampaniyasi:</span>
                <span className="text-primary">{stats?.topCampaign}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span>Asosiy leadlar manbasi:</span>
                <span className="text-primary">{stats?.topSource}</span>
              </div>
            </div>

            <div className="p-4 bg-secondary/50 rounded-xl border space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span>Talabaning Umrbod Qiymati (CLV):</span>
                <span className="font-bold">{stats?.clv ? stats.clv.toLocaleString() : 0} UZS</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span>Jalb qilish tannarxi (CAC):</span>
                <span className="font-bold">{stats?.cac ? stats.cac.toLocaleString() : 0} UZS</span>
              </div>
              <div className="h-[1px] bg-border my-2" />
              <div className="flex justify-between items-center text-sm font-bold text-emerald-500">
                <span>CLV : CAC Nisbati</span>
                <span>
                  {stats?.cac > 0 ? Math.round((stats.clv / stats.cac) * 10) / 10 : 0}x
                </span>
              </div>
              <p className="text-[10px] text-muted-foreground leading-normal mt-1">
                Sog'lom IT Academy uchun CLV : CAC nisbati kamida 3.0x dan yuqori bo'lishi tavsiya etiladi.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Pipeline Funnel Dropoff Chart */}
      <div className="bg-card p-6 rounded-xl border shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold">Pipeline Konversiya Funneli (Sales Funnel)</h2>
            <p className="text-xs text-muted-foreground">Sotuv voronkasi bosqichlaridagi faol leadlar taqsimoti.</p>
          </div>
        </div>

        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formattedFunnel} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="name" fontSize={11} stroke="#888888" tickLine={false} />
              <YAxis fontSize={11} stroke="#888888" tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#1f2937', color: '#fff', borderRadius: '8px' }}
                cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              />
              <Bar dataKey="leads" radius={[4, 4, 0, 0]} barSize={40}>
                {formattedFunnel.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
export default MarketingDashboard;
