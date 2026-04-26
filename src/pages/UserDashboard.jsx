import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { FileText, Clock, CheckCircle2, Activity, MessageSquare, AlertTriangle, MapPin, Search, Calendar, ShieldCheck, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { useReports } from '../context/ReportContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const BENGALURU_CENTER = { lat: 12.9716, lng: 77.5946 };

const DEMO_INCIDENTS = [
  {
    id: 'demo-kr-market-stampede',
    title: 'Crowd Stampede at KR Market',
    description: 'Severe crowd surge near the main entry with multiple injuries reported. Avoid the market core and follow police diversion routes.',
    priority: 'High',
    area: 'KR Market, Bengaluru',
    location: { lat: 12.9629, lng: 77.5775 }
  },
  {
    id: 'demo-majestic-fire',
    title: 'Bus Bay Fire at Majestic',
    description: 'A vehicle fire triggered panic near the bus terminal. Emergency teams are active and traffic movement is restricted.',
    priority: 'High',
    area: 'Majestic Bus Stand, Bengaluru',
    location: { lat: 12.9762, lng: 77.5729 }
  },
  {
    id: 'demo-hebbal-waterlogging',
    title: 'Heavy Waterlogging at Hebbal Flyover',
    description: 'Rainwater accumulation is causing lane closures and long delays. Commuters should use alternate routes.',
    priority: 'Medium',
    area: 'Hebbal Flyover, Bengaluru',
    location: { lat: 13.0358, lng: 77.5970 }
  },
  {
    id: 'demo-marathahalli-traffic',
    title: 'Traffic Gridlock at Marathahalli Junction',
    description: 'Signal failure has led to slow-moving traffic and crowd buildup. Exercise caution while crossing.',
    priority: 'Medium',
    area: 'Marathahalli Junction, Bengaluru',
    location: { lat: 12.9592, lng: 77.6974 }
  },
  {
    id: 'demo-jayanagar-pickpocket',
    title: 'Pickpocketing Alert in Jayanagar 4th Block',
    description: 'Multiple snatching complaints were reported in the shopping stretch. Keep valuables secure in crowded zones.',
    priority: 'Low',
    area: 'Jayanagar 4th Block, Bengaluru',
    location: { lat: 12.9250, lng: 77.5938 }
  },
  {
    id: 'demo-yeshwanthpur-calm',
    title: 'Situation Normalized at Yeshwanthpur',
    description: 'Earlier congestion has reduced and movement is currently stable with routine monitoring.',
    priority: 'Low',
    area: 'Yeshwanthpur Circle, Bengaluru',
    location: { lat: 13.0285, lng: 77.5517 }
  }
];

function MapAutoCenter({ loc }) {
  const map = useMap();
  useEffect(() => {
    if (loc) {
      map.setView([loc.lat, loc.lng], 13);
    }
  }, [loc, map]);
  return null;
}

function useTheme() {
  const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);
  return isDark;
}

export function UserDashboard() {
  const { reports, confirmResolution, reopenReport } = useReports();
  const { currentUser } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const userId = currentUser?.uid || 'user_1';
  
  const [selectedReportIdForConfirm, setSelectedReportIdForConfirm] = useState(null);
  const [expandedReportId, setExpandedReportId] = useState(null);

  const isDark = useTheme();
  // --- Hotspot & Location State ---
  const [userLoc, setUserLoc] = useState(null);
  const [locError, setLocError] = useState(false);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [highRiskAlert, setHighRiskAlert] = useState(false);

  // Distance helper in km
  const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocError(false);
        },
        (err) => {
          console.error("Location access denied", err);
          setLocError(true);
        }
      );
    } else {
      setLocError(true);
    }

    const interval = setInterval(() => {
      // Periodic ping if needed, reports context updates live
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!reports) return;

    const nearby = reports.filter(r => {
      if (!r.location || !userLoc) return false;
      const dist = getDistance(userLoc.lat, userLoc.lng, r.location.lat, r.location.lng);
      return dist < 5 && r.status !== 'completed';
    }).map(r => ({
      id: r.id,
      title: r.title,
      description: r.description,
      priority: r.priority,
      area: r.location_label || 'Nearby Area',
      location: r.location
    }));
    setNearbyReports(nearby);

    const allActiveIncidents = [...DEMO_INCIDENTS, ...nearby];
    const clusters = {};
    allActiveIncidents.forEach(r => {
      const area = r.area || "Nearby Area";
      if (!clusters[area]) clusters[area] = { count: 0, highCount: 0, recentCount: 0, reports: [] };
      clusters[area].count += 1;
      clusters[area].reports.push(r);
      if (r.priority === 'High') clusters[area].highCount += 1;
      if (r.priority !== 'Low') clusters[area].recentCount += 1;
    });

    let hasHighRiskAlert = false;
    const detectedHotspots = Object.keys(clusters).map(area => {
      const c = clusters[area];
      let riskLevel = 'Low';
      if (c.highCount >= 2 || (c.count >= 3 && c.recentCount >= 2)) {
        riskLevel = 'High';
        hasHighRiskAlert = true;
      } else if (c.highCount === 1 || c.count >= 2) {
        riskLevel = 'Medium';
      }
      return {
        area,
        count: c.count,
        riskLevel,
        reports: c.reports,
        topIncident: c.reports[0],
        location: c.reports[0]?.location
      };
    });

    setHotspots(detectedHotspots.sort((a,b) => {
      const w = { 'High': 3, 'Medium': 2, 'Low': 1 };
      return w[b.riskLevel] - w[a.riskLevel];
    }));
    setHighRiskAlert(hasHighRiskAlert);

  }, [userLoc, reports]);

  const mapIncidents = [...DEMO_INCIDENTS, ...nearbyReports];

  // Filter reports personalized to this user
  const userReports = reports.filter(r => r.userId === userId);

  const pendingCount = userReports.filter(r => r.status === 'pending' || r.status === 'urgent' || r.status === 'in_progress').length;

  const PriorityTag = ({ priority }) => {
    const colors = {
      High: 'bg-red-500/20 text-red-400 border-red-500/30',
      Medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      Low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    };
    return (
      <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase", colors[priority])}>
        {priority}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed': return <Badge variant="success">{t('closed', 'Closed')}</Badge>;
      case 'resolved_by_moderator': return <Badge variant="outline" className="text-amber-400 border-amber-500/30 bg-amber-500/10 animate-pulse text-[10px]">{t('awaitingConfirmation', 'Awaiting Confirmation')}</Badge>;
      case 'in_progress': return <Badge variant="outline" className="text-primary-400 border-primary-500/30 bg-primary-500/10 text-[10px]">{t('inProgress', 'In Progress')}</Badge>;
      case 'reopened': return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px]">{t('reopened', 'Reopened')}</Badge>;
      default: return <Badge variant="secondary" className="text-[10px]">{t('pending', 'Pending')}</Badge>;
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto">
      {/* HERO SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-white dark:bg-white dark:bg-dark-800/40 p-8 rounded-3xl border border-slate-200 dark:border-white/5 backdrop-blur-xl">
        <div className="space-y-2">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">{t('userDashboard', 'User Dashboard')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">Real-time localized safety monitoring.</p>
        </div>
        <div className="flex gap-4">
          <Card className="px-6 py-4 bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/5">
            <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest mb-1">My Reports</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{userReports.length}</h3>
          </Card>
          <Card className="px-6 py-4 bg-primary-500/10 border-primary-500/10">
            <p className="text-[10px] uppercase font-bold text-primary-400 tracking-widest mb-1">Active</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{pendingCount}</h3>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: PERSONAL HISTORY */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-400" /> {t('myIncidentHistory', 'My Incident History')}
            </h2>
          </div>
          
          {userReports.length === 0 ? (
            <Card className="p-16 text-center bg-white dark:bg-white dark:bg-dark-800/20 border-dashed border-slate-300 dark:border-white/10 rounded-3xl">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-4" />
              <p className="text-slate-500">You haven't filed any reports yet.</p>
              <Button variant="gradient" className="mt-6" onClick={() => navigate('/dashboard/report')}>Report Incident</Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {userReports.map((report) => (
                <Card key={report.id} className="p-6 bg-white dark:bg-white dark:bg-dark-800/40 border-slate-200 dark:border-white/5 hover:border-primary-500/20 transition-all group">
                  <div className="flex flex-col sm:flex-row justify-between gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded border border-primary-500/20">
                          {report.displayId || "ID-NEW"}
                        </span>
                        <h3 className="font-bold text-slate-900 dark:text-white text-lg">{report.title}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-[10px] text-slate-500 uppercase font-bold">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary-400" /> {report.location_label}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-primary-400" /> Published: {new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      {expandedReportId === report.id && (
                        <>
                          <p className="text-sm text-slate-700 dark:text-slate-300">{report.description}</p>
                          {report.moderatorResponse && (
                            <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-sm text-slate-700 dark:text-slate-300">
                              <p className="text-[10px] font-black text-primary-400 uppercase mb-1">Moderator Note</p>
                              {report.moderatorResponse}
                            </div>
                          )}
                          {report.location && (
                            <a
                              href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-semibold text-blue-500 hover:text-blue-400 underline inline-flex items-center gap-1"
                            >
                              <MapPin className="w-3 h-3" /> {t('openInGoogleMaps', 'Open in Google Maps')}
                            </a>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-3 min-w-[120px]">
                      <PriorityTag priority={report.priority} />
                      {getStatusBadge(report.status)}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                      >
                        {expandedReportId === report.id ? t('hideIncident', 'Hide Incident') : t('viewIncident', 'View Incident')}
                      </Button>
                      {report.status === 'resolved_by_moderator' && (
                        <Button size="sm" variant="gradient" onClick={() => setSelectedReportIdForConfirm(report.id)}>{t('verify', 'Verify')}</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: NEARBY HOTSPOTS & MAP */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 group">
              <MapPin className="w-5 h-5 text-accent-green group-hover:rotate-12 transition-transform" /> 
              {t('liveNearbyIncidents', 'Live Nearby Incidents')}
            </h2>
            {highRiskAlert && (
              <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
                <div>
                  <h3 className="text-red-500 font-bold text-sm">⚠️ High-Risk Activity Detected</h3>
                  <p className="text-red-400/80 text-xs mt-1">There are severe incidents reported near your current location. Please stay alert and avoid marked hotspot zones.</p>
                </div>
              </div>
            )}
          </div>

          <Card className="flex flex-col bg-white dark:bg-white dark:bg-dark-800/20 backdrop-blur-3xl border-slate-200 dark:border-white/5 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden rounded-3xl">
            {/* Interactive Map */}
            <div className="h-64 w-full relative bg-slate-50 dark:bg-dark-900 border-b border-slate-200 dark:border-white/5">
              {!userLoc && !locError && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80 dark:bg-slate-50 dark:bg-dark-900/80 backdrop-blur-sm">
                  <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse flex items-center gap-2"><MapPin className="w-4 h-4" /> Locating you...</p>
                </div>
              )}
              {locError && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-50 dark:bg-dark-900/80 backdrop-blur-sm p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mb-2" />
                  <p className="text-slate-900 dark:text-white font-bold text-sm">Location Access Denied</p>
                  <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">Please enable location services to view nearby hotspots. You can still file reports manually.</p>
                </div>
              )}
              <MapContainer 
                center={[userLoc?.lat || BENGALURU_CENTER.lat, userLoc?.lng || BENGALURU_CENTER.lng]} 
                zoom={12} 
                style={{ height: '100%', width: '100%', background: isDark ? '#0f172a' : '#f8fafc' }}
                zoomControl={false}
                className="z-0"
              >
                <TileLayer
                  key={isDark ? 'dark' : 'light'}
                  url={isDark 
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"}
                  attribution='&copy; <a href="https://carto.com/">CARTO</a>'
                />
                {/* User Marker */}
                {userLoc && (
                  <CircleMarker 
                    center={[userLoc.lat, userLoc.lng]}
                    pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.8, weight: 2 }}
                    radius={6}
                  >
                    <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent>
                      <span className="font-bold text-blue-500">You</span>
                    </Tooltip>
                  </CircleMarker>
                )}

                {/* Incident Markers */}
                {mapIncidents.map((report) => (
                  <CircleMarker 
                    key={report.id} 
                    center={[report.location.lat, report.location.lng]}
                    pathOptions={{ 
                      color: report.priority === 'High' ? '#ef4444' : report.priority === 'Medium' ? '#f59e0b' : '#10b981',
                      fillColor: report.priority === 'High' ? '#ef4444' : report.priority === 'Medium' ? '#f59e0b' : '#10b981',
                      fillOpacity: 0.8,
                      weight: 2
                    }}
                    radius={9}
                    eventHandlers={{
                      mouseover: (e) => e.target.openPopup(),
                      mouseout: (e) => e.target.closePopup()
                    }}
                  >
                    <Popup className="custom-popup">
                      <div className="p-2 min-w-[220px] bg-white dark:bg-dark-900 text-slate-900 dark:text-white rounded-lg">
                        <h4 className="text-xs font-bold mb-1">{report.title}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-1">{report.area}</p>
                        <Badge variant={report.priority === 'High' ? 'destructive' : 'secondary'} className="text-[9px] mb-2">
                          {report.priority} Risk
                        </Badge>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-2">"{report.description}"</p>
                        <a
                          href={`https://www.google.com/maps?q=${report.location.lat},${report.location.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] font-semibold text-blue-500 hover:text-blue-400 underline"
                        >
                          {t('openInGoogleMaps', 'Open in Google Maps')}
                        </a>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
                <MapAutoCenter loc={userLoc || BENGALURU_CENTER} />
              </MapContainer>
            </div>

            <CardHeader className="bg-gradient-to-r from-white/5 to-transparent border-b border-slate-200 dark:border-white/5 px-6 py-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-accent-green flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 animate-pulse" /> Hotspot Zones
                </span>
                <Badge variant="outline" className="text-[10px] bg-accent-green/10 border-accent-green/20 text-accent-green">
                  {hotspots.length} Zones
                </Badge>
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-0 overflow-y-auto max-h-[300px] custom-scrollbar">
              {hotspots.length === 0 ? (
                <div className="p-10 text-center animate-in fade-in zoom-in duration-500">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <p className="text-slate-900 dark:text-white font-bold mb-1">No incidents nearby. You're safe.</p>
                  <p className="text-slate-500 text-xs">There are no active reports within your vicinity.</p>
                </div>
              ) : (
                <div className="flex flex-col divide-y divide-slate-200 dark:divide-white/5">
                  {hotspots.map((spot, idx) => (
                    <div key={idx} className="group p-5 hover:bg-white/[0.02] transition-colors flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-accent-green transition-colors flex items-center gap-2">
                          {spot.area}
                        </h4>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Activity className="w-3 h-3" /> {spot.count} active incident{spot.count > 1 ? 's' : ''}
                        </p>
                        {spot.topIncident && (
                          <>
                            <p className="text-xs text-slate-500 line-clamp-2">{spot.topIncident.title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-2">{spot.topIncident.description}</p>
                            {spot.location && (
                              <a
                                href={`https://www.google.com/maps?q=${spot.location.lat},${spot.location.lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[11px] font-semibold text-blue-500 hover:text-blue-400 underline"
                              >
                                View on Google Maps
                              </a>
                            )}
                          </>
                        )}
                      </div>
                      <Badge className={cn(
                        "text-[10px] font-bold uppercase tracking-wider px-3",
                        spot.riskLevel === 'High' ? "bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse" :
                        spot.riskLevel === 'Medium' ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                        "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      )}>
                        {spot.riskLevel} Risk
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* RESOLUTION MODAL */}
      {selectedReportIdForConfirm && (() => {
        const reportToConfirm = reports.find(r => r.id === selectedReportIdForConfirm);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-200/80 dark:bg-white dark:bg-dark-950/80 backdrop-blur-2xl transition-all duration-500">
            {/* Ambient Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-accent-green/5 via-transparent to-primary-500/5" />
            
            <Card className="relative w-full max-w-lg max-h-[90vh] bg-white/90 dark:bg-slate-50 dark:bg-dark-900/90 border border-slate-300 dark:border-white/10 shadow-[0_0_80px_rgba(0,0,0,0.8)] rounded-[2rem] overflow-y-auto animate-in zoom-in-95 fade-in duration-500">
              <button
                type="button"
                onClick={() => setSelectedReportIdForConfirm(null)}
                className="absolute right-4 top-4 z-20 p-2 rounded-full border border-slate-300 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10"
                aria-label="Close verify modal"
              >
                <X className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              </button>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent-green to-transparent opacity-50" />
              
              <CardHeader className="pt-10 pb-6 text-center relative z-10">
                <div className="relative w-24 h-24 mx-auto mb-6 group">
                  <div className="absolute inset-0 bg-accent-green/20 rounded-full blur-xl animate-pulse" />
                  <div className="relative w-full h-full bg-white dark:bg-dark-800 border border-accent-green/30 rounded-full flex items-center justify-center shadow-inner">
                    <ShieldCheck className="w-12 h-12 text-accent-green drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                  {t('verify', 'Verify')}
                </CardTitle>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 px-6 leading-relaxed">
                  The area safety responder has marked this incident as resolved. Please review the evidence and verify your safety.
                </p>
              </CardHeader>
              
              <CardContent className="px-8 pb-10 space-y-8 relative z-10">
                <div className="space-y-4">
                  {reportToConfirm?.moderatorProofUrl && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-300 dark:border-white/10 group shadow-2xl">
                      <img src={reportToConfirm.moderatorProofUrl} alt="Resolution Proof" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                        <Badge className="bg-accent-green/90 text-slate-900 dark:text-white border-none text-[10px] font-bold tracking-widest px-3 py-1 shadow-lg backdrop-blur-md">
                          OFFICIAL PROOF
                        </Badge>
                        <span className="text-slate-900 dark:text-white/70 text-[10px] font-mono tracking-widest">
                          {reportToConfirm.displayId}
                        </span>
                      </div>
                    </div>
                  )}

                  {reportToConfirm?.moderatorResponse && (
                    <div className="relative p-5 bg-slate-50 dark:bg-white dark:bg-dark-800/50 rounded-2xl border border-slate-200 dark:border-white/5 backdrop-blur-sm">
                      <p className="text-[10px] font-bold text-accent-green uppercase tracking-widest mb-2 flex items-center gap-2">
                        <MessageSquare className="w-3 h-3" /> Responder Notes
                      </p>
                      <p className="italic text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        "{reportToConfirm.moderatorResponse}"
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1 h-14 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-300 transition-all duration-300 font-bold tracking-wide" 
                    onClick={() => { reopenReport(selectedReportIdForConfirm); setSelectedReportIdForConfirm(null); }}
                  >
                    {t('issuePending', 'ISSUE PENDING')}
                  </Button>
                  <Button 
                    className="flex-1 h-14 rounded-xl bg-accent-green hover:bg-emerald-400 text-dark-950 font-black tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all duration-300" 
                    onClick={() => { confirmResolution(selectedReportIdForConfirm); setSelectedReportIdForConfirm(null); }}
                  >
                    {t('issueResolved', 'ISSUE RESOLVED')}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      })()}
    </div>
  );
}
