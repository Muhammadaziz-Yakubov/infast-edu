import React, { useEffect, useState } from 'react';
import { getAiAdvisorDashboard } from '../api/ai-advisor';
import {
  Brain,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  HelpCircle,
  Layers,
  Percent,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AiAdvisor: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'risks' | 'teachers' | 'finance_marketing'>('overview');

  useEffect(() => {
    getAiAdvisorDashboard()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load AI Advisor data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-muted-foreground animate-pulse">Ma'lumotlar tahlil qilinmoqda...</p>
      </div>
    );
  }

  // Gracefully handle missing data
  const healthScore = data?.healthScore ?? "Insufficient data";
  const aiSummary = data?.aiSummary ?? "Insufficient data";
  const criticalAlerts = data?.criticalAlerts ?? [];
  const warnings = data?.warnings ?? [];
  const opportunities = data?.opportunities ?? [];
  const potentialRevenueLoss = data?.potentialRevenueLoss ?? "Insufficient data";
  const studentRisks = data?.studentRisks ?? [];
  const groupRisks = data?.groupRisks ?? [];
  const teacherInsights = data?.teacherInsights ?? [];
  const financeInsights = data?.financeInsights ?? null;
  const marketingInsights = data?.marketingInsights ?? null;
  const trendAnalysis = data?.trendAnalysis ?? [];
  const recommendedActions = data?.recommendedActions ?? [];

  // Helper to render "Insufficient data"
  const renderInsufficientData = (message = "Insufficient data") => (
    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-xl bg-muted/20">
      <HelpCircle className="w-8 h-8 text-muted-foreground mb-2" />
      <span className="text-sm font-medium text-muted-foreground">{message}</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="w-8 h-8 text-primary" />
            AI Biznes Maslahatchi
          </h1>
          <p className="text-muted-foreground">
            O'quv markazining o'quv, marketing va moliyaviy ko'rsatkichlarini sun'iy intellekt yordamida tahlil qilish.
          </p>
        </div>
        <div className="text-xs text-muted-foreground border bg-card px-3 py-1.5 rounded-lg flex items-center gap-2 self-start md:self-auto">
          <Activity className="w-3.5 h-3.5 text-green-500 animate-pulse" />
          Tahlil vaqti: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Health score and Summary cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Center Health Score */}
        <div className="p-6 bg-card border rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Markaz Salomatligi</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-4xl font-extrabold tracking-tight">
                {typeof healthScore === 'number' ? `${healthScore}%` : healthScore}
              </span>
              {typeof healthScore === 'number' && (
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  healthScore >= 80 ? 'bg-green-500/10 text-green-500' :
                  healthScore >= 50 ? 'bg-amber-500/10 text-amber-500' :
                  'bg-red-500/10 text-red-500'
                }`}>
                  {healthScore >= 80 ? 'A' : healthScore >= 50 ? 'B' : 'C'} Daraja
                </span>
              )}
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            {typeof healthScore === 'number' ? (
              <div className="w-full bg-secondary h-2.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    healthScore >= 80 ? 'bg-green-500' :
                    healthScore >= 50 ? 'bg-amber-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground italic">Kamida 2 ta asosiy ko'rsatkich yetarli emas.</span>
            )}
          </div>
        </div>

        {/* Potential Revenue Loss */}
        <div className="p-6 bg-card border rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Kutilayotgan Moliyaviy Yo'qotish (Qarzlar)</span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-3xl font-extrabold tracking-tight text-red-500">
                {typeof potentialRevenueLoss === 'number' ? `${potentialRevenueLoss.toLocaleString()} UZS` : potentialRevenueLoss}
              </span>
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            To'lov muddati o'tib ketgan o'quvchilar qarzlarining jami summasi.
          </div>
        </div>

        {/* AI summary banner */}
        <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              AI Xulosa
            </span>
            <p className="text-sm font-medium mt-2 leading-relaxed text-foreground/90">
              {aiSummary}
            </p>
          </div>
          <div className="text-[11px] text-muted-foreground mt-4 italic">
            *Tavsiyalar har kuni real vaqtda yangilanadi.
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="border-b flex gap-4 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Tavsiyalar va Alerts ({criticalAlerts.length + warnings.length + opportunities.length})
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'risks'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Talabalar va Guruhlar ({studentRisks.length + groupRisks.length})
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'teachers'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          O'qituvchilar Tahlili
        </button>
        <button
          onClick={() => setActiveTab('finance_marketing')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'finance_marketing'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          Moliya va Marketing
        </button>
      </div>

      {/* TAB CONTENT: OVERVIEW (Recommendations, Alerts, Trends, Actions) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Col: Alerts Lists */}
            <div className="xl:col-span-2 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-1.5">
                <AlertCircle className="w-5 h-5 text-primary" />
                Dinamik Tavsiyalar Tizimi
              </h2>

              {criticalAlerts.length === 0 && warnings.length === 0 && opportunities.length === 0 && (
                renderInsufficientData("Hech qanday AI tavsiyalari shakllanmadi (Ma'lumotlar yetarli emas).")
              )}

              {/* Critical Alerts */}
              {criticalAlerts.map((alert: any, idx: number) => (
                <div key={idx} className="p-5 border border-red-500/20 bg-red-500/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Kritik Muammo • {alert.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(alert.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-base text-foreground">{alert.problem}</h3>
                  <div className="text-sm space-y-1.5 text-muted-foreground">
                    <p><strong className="text-foreground">Kelib chiqish sababi:</strong> {alert.rootCause}</p>
                    <p><strong className="text-foreground">Biznes ta'siri:</strong> {alert.businessImpact}</p>
                    <p><strong className="text-foreground">Tavsiya:</strong> {alert.recommendation}</p>
                  </div>
                  <div className="pt-2 border-t border-red-500/10 space-y-1">
                    <span className="text-xs font-bold text-foreground">Tavsiya etilgan amallar:</span>
                    <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
                      {alert.suggestedActions.map((action: string, i: number) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {/* Warnings */}
              {warnings.map((alert: any, idx: number) => (
                <div key={idx} className="p-5 border border-amber-500/20 bg-amber-500/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Ogohlantirish • {alert.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(alert.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-base text-foreground">{alert.problem}</h3>
                  <div className="text-sm space-y-1.5 text-muted-foreground">
                    <p><strong className="text-foreground">Kelib chiqish sababi:</strong> {alert.rootCause}</p>
                    <p><strong className="text-foreground">Biznes ta'siri:</strong> {alert.businessImpact}</p>
                    <p><strong className="text-foreground">Tavsiya:</strong> {alert.recommendation}</p>
                  </div>
                  <div className="pt-2 border-t border-amber-500/10 space-y-1">
                    <span className="text-xs font-bold text-foreground">Tavsiya etilgan amallar:</span>
                    <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
                      {alert.suggestedActions.map((action: string, i: number) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}

              {/* Opportunities */}
              {opportunities.map((alert: any, idx: number) => (
                <div key={idx} className="p-5 border border-primary/20 bg-primary/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Imkoniyat • {alert.category}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{new Date(alert.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-base text-foreground">{alert.problem}</h3>
                  <div className="text-sm space-y-1.5 text-muted-foreground">
                    <p><strong className="text-foreground">Kelib chiqish sababi:</strong> {alert.rootCause}</p>
                    <p><strong className="text-foreground">Biznes ta'siri:</strong> {alert.businessImpact}</p>
                    <p><strong className="text-foreground">Tavsiya:</strong> {alert.recommendation}</p>
                  </div>
                  <div className="pt-2 border-t border-primary/10 space-y-1">
                    <span className="text-xs font-bold text-foreground">Tavsiya etilgan amallar:</span>
                    <ul className="list-disc pl-5 text-xs space-y-1 text-muted-foreground">
                      {alert.suggestedActions.map((action: string, i: number) => (
                        <li key={i}>{action}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Col: Actions & Trends */}
            <div className="space-y-6">
              {/* Recommended Actions */}
              <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-1.5 border-b pb-2">
                  <CheckCircle2 className="w-4.5 h-4.5 text-primary" />
                  Amaliyotlar Ro'yxati (To-Do)
                </h3>
                {recommendedActions.length === 0 ? (
                  <span className="text-xs text-muted-foreground italic">Faol harakatlar yo'q.</span>
                ) : (
                  <div className="space-y-2">
                    {recommendedActions.map((action: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2 hover:bg-muted/30 rounded-lg transition-colors">
                        <input type="checkbox" className="mt-1 rounded border-muted" />
                        <span className="text-xs leading-relaxed">{action}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trend Analysis Chart */}
              <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
                <h3 className="font-bold text-sm flex items-center gap-1.5 border-b pb-2">
                  <TrendingUp className="w-4.5 h-4.5 text-primary" />
                  Ro'yxatdan o'tishlar o'sishi (Oylik)
                </h3>
                {trendAnalysis.length === 0 || trendAnalysis[0]?.message ? (
                  renderInsufficientData("Not enough historical information")
                ) : (
                  <div className="h-44">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendAnalysis}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(100,100,100,0.1)" />
                        <XAxis dataKey="label" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip />
                        <defs>
                          <linearGradient id="colorAdvisor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="signups" stroke="hsl(var(--primary))" fill="url(#colorAdvisor)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: RISKS (Student & Group Risks Details) */}
      {activeTab === 'risks' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Risks */}
          <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-1.5 border-b pb-2">
              <Users className="w-5 h-5 text-primary" />
              Chiqib ketish xavfi ostidagi talabalar
            </h3>

            {studentRisks.length === 0 || studentRisks[0]?.message ? (
              renderInsufficientData("Xavf ostida bo'lgan faol talabalar aniqlanmadi (yoki ma'lumotlar kam).")
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {studentRisks.map((stud: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg hover:border-primary/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{stud.studentName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        stud.riskLevel === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                        stud.riskLevel === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-blue-500/10 text-blue-500'
                      }`}>
                        {stud.riskLevel === 'CRITICAL' ? 'Kritik xavf' : stud.riskLevel === 'WARNING' ? "O'rtacha xavf" : 'Past xavf'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <strong>Guruh:</strong> {stud.groupName}
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {stud.reasons.map((r: string, i: number) => (
                        <span key={i} className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-md">
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Group occupancy and attendance risks */}
          <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-1.5 border-b pb-2">
              <Layers className="w-5 h-5 text-primary" />
              Guruhlar yuklamasi va davomat tahlili
            </h3>

            {groupRisks.length === 0 || groupRisks[0]?.message ? (
              renderInsufficientData()
            ) : (
              <div className="space-y-3 max-h-[450px] overflow-y-auto pr-1">
                {groupRisks.map((group: any, idx: number) => (
                  <div key={idx} className="p-4 border rounded-lg hover:border-primary/30 transition-all space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-foreground">{group.groupName}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        group.status === 'CRITICAL' ? 'bg-red-500/10 text-red-500' :
                        group.status === 'WARNING' ? 'bg-amber-500/10 text-amber-500' :
                        'bg-green-500/10 text-green-500'
                      }`}>
                        {group.status === 'CRITICAL' ? 'Kritik (Kam o\'quvchi)' : group.status === 'WARNING' ? 'Suboptimal' : 'Norma'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground flex justify-between">
                      <span><strong>O'quvchilar soni:</strong> {group.studentCount} ta</span>
                    </div>
                    <p className="text-xs text-muted-foreground italic mt-1 leading-relaxed">
                      <strong>AI tavsiyasi:</strong> {group.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: TEACHERS (Teacher Performance & Meetings Statistics) */}
      {activeTab === 'teachers' && (
        <div className="p-6 bg-card border rounded-xl shadow-sm space-y-6">
          <div>
            <h3 className="font-bold text-base border-b pb-2">O'qituvchilar ish faoliyati va konversiya darajasi</h3>
            <p className="text-xs text-muted-foreground mt-1">O'qituvchilarning sinov darslari (demo) va uchrashuvlarni tashkil qilish ko'rsatkichlari.</p>
          </div>

          {teacherInsights.length === 0 || teacherInsights[0]?.message ? (
            renderInsufficientData("Not enough historical information")
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground uppercase font-mono">
                    <th className="py-3 px-4">O'qituvchi</th>
                    <th className="py-3 px-4">Uchrashuvlar (Completed)</th>
                    <th className="py-3 px-4">Demo Konversiya</th>
                    <th className="py-3 px-4">Homework Speed</th>
                    <th className="py-3 px-4">Talabalar Saqlanishi</th>
                    <th className="py-3 px-4">Quiz Ko'rsatkichlari</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-sm">
                  {teacherInsights.map((t: any, idx: number) => (
                    <tr key={idx} className="hover:bg-muted/10">
                      <td className="py-4 px-4 font-semibold">{t.teacherName}</td>
                      <td className="py-4 px-4">{t.metrics.meetingsCompleted}</td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 font-bold">
                          {t.metrics.demoConversionRate}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-red-500/80 italic">{t.metrics.homeworkSpeed}</td>
                      <td className="py-4 px-4 text-xs text-red-500/80 italic">{t.metrics.studentRetention}</td>
                      <td className="py-4 px-4 text-xs text-red-500/80 italic">{t.metrics.quizPerformance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: FINANCE & MARKETING (Invoices, Conversion, Budget Sources) */}
      {activeTab === 'finance_marketing' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Finance Insights */}
          <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-1.5 border-b pb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              Moliyaviy Ko'rsatkichlar & Qarzlar
            </h3>

            {!financeInsights || financeInsights.paidRevenue === "Insufficient data" ? (
              renderInsufficientData("Not enough financial historical data")
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl border bg-muted/10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Tushgan Summa</span>
                  <p className="text-lg font-bold mt-1 text-green-500">
                    {financeInsights.paidRevenue.toLocaleString()} UZS
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Qarzlar (Overdue)</span>
                  <p className="text-lg font-bold mt-1 text-red-500">
                    {financeInsights.overdueDebt.toLocaleString()} UZS
                  </p>
                </div>
                <div className="p-4 rounded-xl border bg-muted/10">
                  <span className="text-xs font-semibold text-muted-foreground uppercase">Kutilayotgan (Upcoming)</span>
                  <p className="text-lg font-bold mt-1 text-primary">
                    {financeInsights.upcomingExpected.toLocaleString()} UZS
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Marketing Insights */}
          <div className="p-6 bg-card border rounded-xl shadow-sm space-y-4">
            <h3 className="font-bold text-base flex items-center gap-1.5 border-b pb-2">
              <Percent className="w-5 h-5 text-primary" />
              Marketing & Lids Konversiyasi
            </h3>

            {!marketingInsights || marketingInsights.leadConversionRate === "Insufficient data" ? (
              renderInsufficientData()
            ) : (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-sm font-semibold">Lidlardan Talabalikka O'tish Darajasi (CR):</span>
                  <span className="text-lg font-bold text-primary">{marketingInsights.leadConversionRate}</span>
                </div>

                {/* Best Sources */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Eng Yaxshi Trafik Manbalari (Top 3)</span>
                  {!Array.isArray(marketingInsights.bestTrafficSources) || marketingInsights.bestTrafficSources.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">Etarli marketing ma'lumoti yo'q.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {marketingInsights.bestTrafficSources.map((src: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 border rounded-lg bg-muted/10">
                          <span className="font-semibold">{src.source}</span>
                          <span className="text-muted-foreground">
                            Konversiya: <strong>{src.converted} ta</strong> ({src.rate}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Campaigns Performance */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-muted-foreground uppercase">Kampaniya Natijalari</span>
                  {!Array.isArray(marketingInsights.campaignPerformance) || marketingInsights.campaignPerformance.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">Faol kampaniyalar topilmadi.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {marketingInsights.campaignPerformance.map((camp: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center text-xs p-2 border rounded-lg bg-muted/10">
                          <span className="font-semibold">{camp.campaign}</span>
                          <span className="text-muted-foreground">
                            Arizalar: {camp.count} • Konversiya: <strong>{camp.rate}%</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
