import React, { useEffect, useState, useRef, useMemo } from 'react';
import { getLiveLocations } from '../api/students';
import { getAcademyConfig } from '../api/attendance';
import { getGroups } from '../api/groups';
import { getAvatarUrl } from '../utils/avatar';
import {
  RefreshCw,
  Users,
  Search,
  ShieldCheck,
  AlertTriangle,
  Navigation,
  Globe,
  Radio,
  Clock,
  Phone,
} from 'lucide-react';

interface StudentLocation {
  _id: string;
  userId: string;
  fullName: string;
  avatar: string;
  phone: string;
  status: string;
  groupName: string;
  latitude: number;
  longitude: number;
  updatedAt: string;
  isMocked: boolean;
  xp: number;
  coins: number;
}

// Distance helper function in meters (Haversine Formula)
function getDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export const LiveMap: React.FC = () => {
  const [locations, setLocations] = useState<StudentLocation[]>([]);
  const [academyConfig, setAcademyConfig] = useState<{ latitude: number; longitude: number; radiusMeters: number }>({
    latitude: 41.311081,
    longitude: 69.240562,
    radiusMeters: 200,
  });
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<StudentLocation | null>(null);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const studentMarkersMapRef = useRef<Map<string, any>>(new Map());
  const academyMarkerRef = useRef<any>(null);
  const circleRef = useRef<any>(null);

  // Load Data
  const loadData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [locs, config, grps] = await Promise.all([
        getLiveLocations(),
        getAcademyConfig(),
        getGroups(),
      ]);
      setLocations(locs || []);

      if (config?.latitude && config?.longitude) {
        setAcademyConfig({
          latitude: config.latitude,
          longitude: config.longitude,
          radiusMeters: config.radiusMeters || 200,
        });

        // Pan map center to real academy coordinates if configured
        if (mapInstanceRef.current) {
          if (academyMarkerRef.current) {
            academyMarkerRef.current.setLatLng([config.latitude, config.longitude]);
          }
          if (circleRef.current) {
            circleRef.current.setLatLng([config.latitude, config.longitude]);
            circleRef.current.setRadius(config.radiusMeters || 200);
          }
        }
      }

      setGroups(grps || []);
    } catch (err) {
      console.error("Xarita ma'lumotlarini yuklashda xatolik:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Auto Refresh Interval (every 5 seconds for smooth live movement)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      loadData();
    }, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Load Leaflet Script and CSS dynamically
  const [leafletReady, setLeafletReady] = useState(false);
  useEffect(() => {
    if ((window as any).L) {
      setLeafletReady(true);
      return;
    }

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => {
      setLeafletReady(true);
    };
    document.head.appendChild(script);
  }, []);

  // Filtered Students
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      const matchesGroup = selectedGroup === 'ALL' || loc.groupName === selectedGroup;
      const matchesSearch =
        loc.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        loc.phone.includes(searchQuery) ||
        loc.groupName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGroup && matchesSearch;
    });
  }, [locations, selectedGroup, searchQuery]);

  // Render / Update Leaflet Map
  useEffect(() => {
    if (!leafletReady || !mapContainerRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    // Initialize Map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView(
        [academyConfig.latitude, academyConfig.longitude],
        16
      );

      // CartoDB Voyager tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Academy Pin (Create or Update)
    if (!academyMarkerRef.current) {
      const academyIcon = L.divIcon({
        className: 'custom-academy-pin',
        html: `
          <div style="
            background: #4f46e5;
            color: white;
            width: 44px;
            height: 44px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid white;
            box-shadow: 0 10px 25px rgba(79, 70, 229, 0.5);
            font-size: 22px;
          ">
            🏫
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      academyMarkerRef.current = L.marker([academyConfig.latitude, academyConfig.longitude], {
        icon: academyIcon,
      }).addTo(map);

      academyMarkerRef.current.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <h4 style="margin: 0 0 4px 0; font-weight: bold; color: #4f46e5;">InFast Academy</h4>
          <p style="margin: 0; font-size: 12px; color: #6b7280;">Geofence Radiusi: <b>${academyConfig.radiusMeters}m</b></p>
        </div>
      `);
    } else {
      academyMarkerRef.current.setLatLng([academyConfig.latitude, academyConfig.longitude]);
    }

    // Geofence Radius Circle (Create or Update)
    if (!circleRef.current) {
      circleRef.current = L.circle([academyConfig.latitude, academyConfig.longitude], {
        color: '#4f46e5',
        fillColor: '#818cf8',
        fillOpacity: 0.15,
        radius: academyConfig.radiusMeters,
      }).addTo(map);
    } else {
      circleRef.current.setLatLng([academyConfig.latitude, academyConfig.longitude]);
      circleRef.current.setRadius(academyConfig.radiusMeters);
    }

    // Smooth Student Markers Update / Animation
    const currentStudentIds = new Set(filteredLocations.map((l) => l._id));

    // Remove markers that are no longer in filtered locations
    studentMarkersMapRef.current.forEach((marker, id) => {
      if (!currentStudentIds.has(id)) {
        marker.remove();
        studentMarkersMapRef.current.delete(id);
      }
    });

    filteredLocations.forEach((loc) => {
      const distance = getDistanceMeters(
        loc.latitude,
        loc.longitude,
        academyConfig.latitude,
        academyConfig.longitude
      );

      const isInside = distance <= academyConfig.radiusMeters;
      const avatarUrl = getAvatarUrl(loc.avatar, loc.fullName);

      const markerHtml = `
        <div style="
          position: relative;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: ${loc.isMocked ? '#ef4444' : isInside ? '#22c55e' : '#3b82f6'};
          padding: 3px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
          cursor: pointer;
          transition: transform 0.2s;
        ">
          <img src="${avatarUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; background: white;" />
          ${
            loc.isMocked
              ? `<span style="position: absolute; top: -4px; right: -4px; background: #ef4444; color: white; border-radius: 50%; width: 16px; height: 16px; font-size: 10px; display: flex; align-items: center; justify-content: center; border: 1px solid white;">⚠️</span>`
              : ''
          }
        </div>
      `;

      const studentIcon = L.divIcon({
        className: 'custom-student-pin',
        html: markerHtml,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      if (studentMarkersMapRef.current.has(loc._id)) {
        // Smooth position update (Live Movement)
        const marker = studentMarkersMapRef.current.get(loc._id);
        marker.setLatLng([loc.latitude, loc.longitude]);
        marker.setIcon(studentIcon);
      } else {
        // Create new marker
        const marker = L.marker([loc.latitude, loc.longitude], { icon: studentIcon }).addTo(map);
        marker.on('click', () => {
          setSelectedStudent(loc);
          map.setView([loc.latitude, loc.longitude], 17);
        });
        studentMarkersMapRef.current.set(loc._id, marker);
      }
    });

    // Keep selectedStudent state fresh if updated
    if (selectedStudent) {
      const updatedSel = locations.find((l) => l._id === selectedStudent._id);
      if (updatedSel) setSelectedStudent(updatedSel);
    }
  }, [leafletReady, filteredLocations, academyConfig]);

  // Center Map to Academy
  const handleRecenterAcademy = () => {
    if (mapInstanceRef.current && academyConfig.latitude && academyConfig.longitude) {
      mapInstanceRef.current.setView([academyConfig.latitude, academyConfig.longitude], 16);
    }
  };

  // Statistics
  const totalOnMap = filteredLocations.length;
  const insideGeofenceCount = filteredLocations.filter(
    (loc) =>
      getDistanceMeters(loc.latitude, loc.longitude, academyConfig.latitude, academyConfig.longitude) <=
      academyConfig.radiusMeters
  ).length;
  const mockGpsCount = filteredLocations.filter((loc) => loc.isMocked).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-6 rounded-2xl border shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">O'quvchilar Live Xaritasi</h1>
              <p className="text-sm text-muted-foreground">
                O'quvchilarning real vaqtdagi GPS joylashuvi va jonli harakatini kuzatib boring.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Recenter Academy Button */}
          <button
            onClick={handleRecenterAcademy}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border bg-secondary hover:bg-secondary/80 transition-all"
            title="Akademiyani xarita markaziga keltirish"
          >
            <Navigation className="w-3.5 h-3.5 text-primary" />
            <span>Akademiya Markazi</span>
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all ${
              autoRefresh
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-secondary text-muted-foreground'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-500' : ''}`} />
            <span>{autoRefresh ? 'Live Yangilanish (5s): Yoqilgan' : 'Live Yangilanish: O\'chirilgan'}</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground font-semibold text-xs rounded-xl hover:opacity-90 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Yangilash</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card p-5 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Xaritadagi O'quvchilar</p>
            <h3 className="text-2xl font-extrabold">{totalOnMap} ta</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Akademiya Ichida (Geofenced)</p>
            <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {insideGeofenceCount} ta
            </h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-card p-5 rounded-2xl border shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-1">Soxta GPS (Mock Location)</p>
            <h3
              className={`text-2xl font-extrabold ${
                mockGpsCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'
              }`}
            >
              {mockGpsCount} ta
            </h3>
          </div>
          <div
            className={`p-3 rounded-xl ${
              mockGpsCount > 0 ? 'bg-amber-500/10 text-amber-500' : 'bg-secondary text-muted-foreground'
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Map View & Sidebar Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Side: Map Render Area */}
        <div className="lg:col-span-3 bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[650px] relative">
          <div ref={mapContainerRef} className="w-full h-full z-0" />

          {/* Map Overlay Selected Student Floating Card */}
          {selectedStudent && (
            <div className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:w-96 bg-card/95 backdrop-blur-md border p-5 rounded-2xl shadow-2xl z-10 animate-in slide-in-from-bottom-3 duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={getAvatarUrl(selectedStudent.avatar, selectedStudent.fullName)}
                    alt={selectedStudent.fullName}
                    className="w-12 h-12 rounded-full object-cover border-2 border-primary bg-secondary"
                  />
                  <div>
                    <h4 className="font-bold text-base leading-tight">{selectedStudent.fullName}</h4>
                    <p className="text-xs text-muted-foreground">{selectedStudent.groupName}</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-xs text-muted-foreground hover:text-foreground p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Navigation className="w-3.5 h-3.5" /> Akademiyagacha masofa:
                  </span>
                  <span className="font-bold">
                    {getDistanceMeters(
                      selectedStudent.latitude,
                      selectedStudent.longitude,
                      academyConfig.latitude,
                      academyConfig.longitude
                    )}{' '}
                    metr
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> Oxirgi yangilanish:
                  </span>
                  <span className="font-semibold">
                    {selectedStudent.updatedAt
                      ? new Date(selectedStudent.updatedAt).toLocaleTimeString('uz-UZ')
                      : 'Noma\'lum'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> Telefon:
                  </span>
                  <span className="font-semibold">{selectedStudent.phone || 'Kiritilmagan'}</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-muted-foreground">GPS Ishonchliligi:</span>
                  {selectedStudent.isMocked ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-destructive/10 text-destructive text-[11px] font-bold rounded-md">
                      <AlertTriangle className="w-3 h-3" /> Soxta GPS Aniqlandi!
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold rounded-md">
                      <ShieldCheck className="w-3 h-3" /> Real GPS Joylashuv
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Roster & Filters */}
        <div className="bg-card border rounded-2xl p-5 shadow-sm flex flex-col h-[650px]">
          <h3 className="font-bold text-base mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            <span>O'quvchilar Ro'yxati</span>
            <span className="ml-auto text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-semibold">
              {filteredLocations.length}
            </span>
          </h3>

          {/* Search Input */}
          <div className="relative mb-3">
            <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
            <input
              type="text"
              placeholder="O'quvchi ismi yoki guruh..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border rounded-xl bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Group Filter */}
          <div className="mb-4">
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-3 py-2 text-xs border rounded-xl bg-background font-medium focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="ALL">Barcha Guruhlar</option>
              {groups.map((g) => (
                <option key={g._id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Students Scrollable List */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loading ? (
              <div className="text-center py-12 text-xs text-muted-foreground animate-pulse">
                Ma'lumotlar yuklanmoqda...
              </div>
            ) : filteredLocations.length === 0 ? (
              <div className="text-center py-12 text-xs text-muted-foreground">
                Xaritada o'quvchilar topilmadi.
              </div>
            ) : (
              filteredLocations.map((loc) => {
                const distance = getDistanceMeters(
                  loc.latitude,
                  loc.longitude,
                  academyConfig.latitude,
                  academyConfig.longitude
                );
                const isInside = distance <= academyConfig.radiusMeters;
                const isSelected = selectedStudent?._id === loc._id;
                const avatarUrl = getAvatarUrl(loc.avatar, loc.fullName);

                return (
                  <div
                    key={loc._id}
                    onClick={() => {
                      setSelectedStudent(loc);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.setView([loc.latitude, loc.longitude], 17);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border/60 hover:bg-secondary/40'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={avatarUrl}
                          alt={loc.fullName}
                          className="w-9 h-9 rounded-full object-cover bg-secondary border"
                        />
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card ${
                            loc.isMocked ? 'bg-amber-500' : isInside ? 'bg-emerald-500' : 'bg-blue-500'
                          }`}
                        />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate leading-snug">{loc.fullName}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{loc.groupName}</p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isInside
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {distance}m
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveMap;
