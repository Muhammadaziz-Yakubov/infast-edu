import React, { useEffect, useState } from 'react';
import { getGroups } from '../api/groups';
import { getStudents } from '../api/students';
import { submitAttendance, getAllAttendanceLogs, getAcademyConfig, updateAcademyConfig } from '../api/attendance';
import type { Group, Student } from '../utils/mockDb';
import {
  Users,
  Calendar,
  UserCheck,
  UserX,
  Save,
  MapPin,
  ListFilter,
  Settings,
  Navigation,
  ShieldAlert,
  Clock,
} from 'lucide-react';

export const Attendance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'MANUAL' | 'GPS_LOGS' | 'GPS_CONFIG'>('MANUAL');
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Manual checklist state
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [checklist, setChecklist] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({});
  const [submitting, setSubmitting] = useState(false);

  // GPS Logs state
  const [gpsLogs, setGpsLogs] = useState<any[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // GPS Config state
  const [config, setConfig] = useState({ latitude: 41.311081, longitude: 69.240562, radiusMeters: 200 });
  const [configSaving, setConfigSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [gList, sList, cfg] = await Promise.all([
        getGroups(),
        getStudents(),
        getAcademyConfig().catch(() => ({ latitude: 41.311081, longitude: 69.240562, radiusMeters: 200 })),
      ]);
      setGroups(gList);
      setStudents(sList);
      setConfig(cfg);
      if (gList.length > 0) {
        setSelectedGroupId(gList[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadGpsLogs = async () => {
    setLogsLoading(true);
    try {
      const logs = await getAllAttendanceLogs();
      setGpsLogs(logs);
    } catch (e) {
      console.error(e);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'GPS_LOGS') {
      loadGpsLogs();
    }
  }, [activeTab]);

  useEffect(() => {
    if (!selectedGroupId) return;
    const group = groups.find((g) => g._id === selectedGroupId);
    if (group) {
      const initial: Record<string, 'PRESENT' | 'ABSENT'> = {};
      (group.students || []).forEach((sid: any) => {
        const idStr = typeof sid === 'string' ? sid : sid?._id?.toString() || String(sid);
        initial[idStr] = 'PRESENT';
      });
      setChecklist(initial);
    }
  }, [selectedGroupId, groups]);

  const toggleStatus = (studentId: string) => {
    setChecklist((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === 'PRESENT' ? 'ABSENT' : 'PRESENT',
    }));
  };

  const handleSaveManual = async () => {
    if (!selectedGroupId) {
      alert('Iltimos, guruhni tanlang');
      return;
    }
    setSubmitting(true);
    try {
      const records = Object.entries(checklist).map(([studentId, status]) => ({
        studentId,
        status,
      }));
      await submitAttendance({
        groupId: selectedGroupId,
        date: attendanceDate,
        records,
      });
      alert("Davomat muvaffaqiyatli saqlandi!");
      const sList = await getStudents();
      setStudents(sList);
    } catch (e: any) {
      alert(e.message || 'Xatolik yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigSaving(true);
    try {
      await updateAcademyConfig(config);
      alert("Akademiya GPS koordinatalari muvaffaqiyatli yangilandi!");
    } catch (e: any) {
      alert("Xatolik: " + (e?.message || ''));
    } finally {
      setConfigSaving(false);
    }
  };

  const selectedGroup = groups.find((g) => g._id === selectedGroupId);
  const activeStudents = students.filter(
    (s) => (selectedGroup?.students || []).includes(s._id) || s.groupId === selectedGroupId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Davomat Tizimi & GPS Geofencing</h1>
          <p className="text-muted-foreground">
            O'quvchilarning mobil GPS orqali va qo'lda belgilangan davomatlarini boshqarish.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1 bg-secondary/20 rounded-lg border">
          <button
            onClick={() => setActiveTab('MANUAL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'MANUAL' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            Qo'lda davomat
          </button>

          <button
            onClick={() => setActiveTab('GPS_LOGS')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'GPS_LOGS' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            GPS Jurnali
          </button>

          <button
            onClick={() => setActiveTab('GPS_CONFIG')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
              activeTab === 'GPS_CONFIG' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            GPS Sozlamalari
          </button>
        </div>
      </div>

      {/* TAB 1: MANUAL CHECKLIST */}
      {activeTab === 'MANUAL' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-card border rounded-xl shadow-sm">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Guruh
              </label>
              <select
                value={selectedGroupId}
                onChange={(e) => setSelectedGroupId(e.target.value)}
                className="w-full text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
              >
                {groups.map((g) => (
                  <option key={g._id} value={g._id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Sana
              </label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full text-sm rounded-lg border bg-background px-3 py-1.5 focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="bg-card border rounded-xl overflow-hidden shadow-sm space-y-4 p-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm">Guruh talabalari davomati</h3>
              <span className="text-xs text-muted-foreground">Soni: {activeStudents.length} ta o'quvchi</span>
            </div>

            {loading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : activeStudents.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-12">Tanlangan guruhda talabalar mavjud emas.</p>
            ) : (
              <div className="space-y-4">
                <div className="divide-y border rounded-xl overflow-hidden">
                  {activeStudents.map((s) => {
                    const status = checklist[s._id] || 'PRESENT';
                    return (
                      <div
                        key={s._id}
                        className="flex justify-between items-center p-4 bg-secondary/10 hover:bg-secondary/20 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <img src={s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'} alt="" className="w-10 h-10 rounded-full bg-secondary object-cover" />
                          <div>
                            <span className="font-semibold flex items-center gap-1 text-sm">
                              {s.label && (
                                <span className="inline-flex items-center px-1 py-0.2 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 rounded shrink-0">
                                  {s.label}
                                </span>
                              )}
                              <span>{s.fullName}</span>
                            </span>
                            <span className="text-xs text-muted-foreground">{s.studentPhone || s.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleStatus(s._id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                              status === 'PRESENT'
                                ? 'bg-green-500/10 text-green-500 border-green-500/20'
                                : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }`}
                          >
                            {status === 'PRESENT' ? (
                              <>
                                <UserCheck className="w-3.5 h-3.5" />
                                Qatnashdi (+100 XP, +20 Coins)
                              </>
                            ) : (
                              <>
                                <UserX className="w-3.5 h-3.5" />
                                Kelmagan (-200 XP, -50 Coins)
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSaveManual}
                    disabled={submitting}
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
                  >
                    <Save className="w-4 h-4" />
                    {submitting ? 'Saqlanmoqda...' : 'Davomatni Tasdiqlash'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GPS LOGS */}
      {activeTab === 'GPS_LOGS' && (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h3 className="font-bold text-sm">Mobil GPS Davomat Jurnali</h3>
              <p className="text-xs text-muted-foreground">O'quvchilar tomonidan mobil ilovadan bajarilgan real-vaqt GPS check-inlar.</p>
            </div>
            <button onClick={loadGpsLogs} disabled={logsLoading} className="px-3 py-1.5 text-xs font-semibold bg-secondary rounded-lg border hover:bg-secondary/80">
              {logsLoading ? 'Yuklanmoqda...' : 'Yangilash'}
            </button>
          </div>

          {logsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : gpsLogs.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-12">Hali GPS orqali topshirilgan davomat yo'q.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-secondary/40 text-muted-foreground font-semibold uppercase">
                  <tr>
                    <th className="p-3">O'quvchi</th>
                    <th className="p-3">Guruh</th>
                    <th className="p-3">Sana / Vaqt</th>
                    <th className="p-3">Holat</th>
                    <th className="p-3">GPS Masofa</th>
                    <th className="p-3">Turi</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {gpsLogs.map((log: any) => {
                    const student = log.studentId || {};
                    const group = log.groupId || {};
                    const isGps = log.isGeofenced;
                    const isMock = log.isMockedLocation;

                    return (
                      <tr key={log._id} className="hover:bg-secondary/10">
                        <td className="p-3 font-semibold">{student.fullName || 'Talaba'}</td>
                        <td className="p-3">{group.name || '-'}</td>
                        <td className="p-3 text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(log.date || log.createdAt).toLocaleString('uz-UZ')}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              log.status === 'PRESENT' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}
                          >
                            {log.status === 'PRESENT' ? 'Qatnashdi' : 'Kelmagan'}
                          </span>
                        </td>
                        <td className="p-3 font-mono">
                          {log.distanceFromAcademy !== undefined ? `${log.distanceFromAcademy} metr` : '-'}
                        </td>
                        <td className="p-3">
                          {isGps ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 font-semibold">
                              <Navigation className="w-3 h-3" />
                              GPS Check-in
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Qo'lda</span>
                          )}
                          {isMock && (
                            <span className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/20 font-bold">
                              <ShieldAlert className="w-3 h-3" />
                              Mock GPS!
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GPS CONFIG */}
      {activeTab === 'GPS_CONFIG' && (
        <div className="bg-card border rounded-xl overflow-hidden shadow-sm p-6 space-y-6 max-w-2xl">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Akademiya GPS Koordinatalari Sozlamasi
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              O'quvchilar mobil ilovadan davomat qilishi uchun belgilangan Akademiya GPS joylashuvi va ruxsat berilgan radius.
            </p>
          </div>

          <form onSubmit={handleSaveConfig} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Latitude (Kenglik)</label>
                <input
                  type="number"
                  step="any"
                  value={config.latitude}
                  onChange={(e) => setConfig({ ...config, latitude: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm rounded-lg border bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Longitude (Uzunlik)</label>
                <input
                  type="number"
                  step="any"
                  value={config.longitude}
                  onChange={(e) => setConfig({ ...config, longitude: parseFloat(e.target.value) || 0 })}
                  className="w-full text-sm rounded-lg border bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Ruxsat Etilgan Radius (Metrda)</label>
              <input
                type="number"
                value={config.radiusMeters}
                onChange={(e) => setConfig({ ...config, radiusMeters: parseInt(e.target.value) || 100 })}
                className="w-full text-sm rounded-lg border bg-background px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <p className="text-[11px] text-muted-foreground">Masalan: 200 = o'quvchi akademiyadan ko'pi bilan 200 metr masofada turgandagina davomat qila oladi.</p>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={configSaving}
                className="px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2 shadow-sm"
              >
                <Save className="w-4 h-4" />
                {configSaving ? 'Saqlanmoqda...' : 'GPS Sozlamalarini Saqlash'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
