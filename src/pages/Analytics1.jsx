// src/pages/Analytics.jsx
import React, { useState, useEffect, useRef,useMemo } from 'react';
import axios from 'axios';
import { origins } from './Managment';
import { useAlerts } from '../hooks/useAlerts';
import { 
  Thermometer, Gauge, Droplets, Wind, Calendar, Download, 
  TrendingUp, AlertTriangle, Activity, RefreshCw, ArrowRight, Send, X, Check
} from 'lucide-react';
import Button from '../components/Button';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const CATEGORIES = [
  { id: 'Température', label: 'Température', icon: Thermometer, color: '#2D5BFF', unit: '°C' },
  { id: 'Pression',    label: 'Pression',    icon: Gauge,       color: '#A855F7', unit: 'Bar' },
  { id: 'Humidité',    label: 'Humidité',    icon: Droplets,    color: '#0EA5E9', unit: '%' },
  { id: 'Qualité Air', label: 'Qualité Air', icon: Wind,        color: '#22C55E', unit: 'ppm' },
];

const QUICK_OPTIONS = [
  { label: '24h', value: 24 },
  { label: '7j',  value: 24*7 },
  { label: '30j', value: 24*30 },
];

function toLocalInputValue(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function nowLocal() { return toLocalInputValue(new Date()); }
function hoursAgoLocal(h) { return toLocalInputValue(new Date(Date.now() - h * 3600000)); }

// Compact TimeRangePicker (same as before)
const TimeRangePicker = ({ mode, setMode, quickHours, setQuickHours, customStart, setCustomStart, customEnd, setCustomEnd, onApply, error }) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center bg-white rounded-lg border border-slate-200">
        {QUICK_OPTIONS.map(opt => (
          <button
            key={opt.label}
            onClick={() => { setMode('quick'); setQuickHours(opt.value); }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'quick' && quickHours === opt.value
                ? 'bg-[#17203f] text-white'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => setMode(mode === 'custom' ? 'quick' : 'custom')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
          mode === 'custom'
            ? 'bg-[#17203f] text-white border-[#17203f]'
            : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/50'
        }`}
      >
        <Calendar size={12} />
        Perso
      </button>

      {mode === 'custom' && (
        <div className="flex items-center gap-1.5 bg-white border border-[#17203f]/20 rounded-lg px-2 py-1">
          <input
            type="datetime-local"
            value={customStart}
            max={customEnd || nowLocal()}
            onChange={e => setCustomStart(e.target.value)}
            className="text-xs font-medium text-slate-700 outline-none bg-transparent cursor-pointer border border-slate-200 rounded px-2 py-0.5"
            style={{ fontSize: '11px' }}
          />
          <ArrowRight size={10} className="text-slate-300" />
          <input
            type="datetime-local"
            value={customEnd}
            min={customStart}
            max={nowLocal()}
            onChange={e => setCustomEnd(e.target.value)}
            className="text-xs font-medium text-slate-700 outline-none bg-transparent cursor-pointer border border-slate-200 rounded px-2 py-0.5"
            style={{ fontSize: '11px' }}
          />
          <Button onClick={onApply} disabled={!!error} size="xs">
            OK
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

const Analytics = () => {
  const [selectedCategory, setSelectedCategory] = useState('Température');
  const [mode, setMode] = useState('quick');
  const [quickHours, setQuickHours] = useState(24);
  const [customStart, setCustomStart] = useState(() => hoursAgoLocal(24));
  const [customEnd, setCustomEnd] = useState(() => nowLocal());
  const [rangeError, setRangeError] = useState('');
  const [loadingTimeSeries, setLoadingTimeSeries] = useState(false);
  const [loadingZoneComp, setLoadingZoneComp] = useState(false);
  const [timeseries, setTimeseries] = useState([]);
  const [zoneComparison, setZoneComparison] = useState([]);
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const { activeCount } = useAlerts();

  // State for report modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [reportCustomStart, setReportCustomStart] = useState(() => hoursAgoLocal(24));
  const [reportCustomEnd, setReportCustomEnd] = useState(() => nowLocal());
  const [reportEmail, setReportEmail] = useState('');
  const [sendingReport, setSendingReport] = useState(false);

  // Draggable sending bubble — position via DOM ref (zero React re-renders during drag)
  const [sendingBubble, setSendingBubble] = useState(false);
  const [bubbleStatus, setBubbleStatus]   = useState('sending'); // 'sending' | 'done' | 'error'
  const bubbleRef        = useRef(null);
  const bubbleDragging   = useRef(false);
  const bubbleDidDrag    = useRef(false);
  const bubbleDragOffset = useRef({ x: 0, y: 0 });
  const bubblePosRef     = useRef({ x: window.innerWidth - 80, y: window.innerHeight - 120 });
  const reportAbortCtrl  = useRef(null);

  const timeSeriesController = useRef(null);
  const zoneCompController = useRef(null);
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [zoneFetchTrigger, setZoneFetchTrigger] = useState(0);
  const [prediction, setPrediction] = useState(null);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  const fetchPrediction = async () => {
  setLoadingPrediction(true);
  try {
    const res = await axios.post(`${origins}/api/analytics/predict`, {
      category: selectedCategory,
      zone_id: selectedZone,
      horizons: [1, 6, 24]
    });
    setPrediction(res.data);
  } catch (err) {
    console.error('Prediction error:', err);
  } finally {
    setLoadingPrediction(false);
  }
};
useEffect(() => { fetchPrediction(); }, [selectedCategory, selectedZone]);

  // Fetch zones once
  useEffect(() => {
    const fetchZones = async () => {
      try {
        const res = await axios.get(`${origins}/api/zones`);
        setZones(res.data);
      } catch (err) { console.error(err); }
    };
    fetchZones();
  }, []);

  // Validate custom range for main charts
  useEffect(() => {
    if (mode !== 'custom') {
      setRangeError('');
      return;
    }
    if (!customStart || !customEnd) {
      setRangeError('Sélectionnez les deux dates.');
      return;
    }
    if (new Date(customStart) >= new Date(customEnd)) {
      setRangeError('La date de fin doit être après la date de début.');
    } else {
      setRangeError('');
    }
  }, [customStart, customEnd, mode]);

  const getRange = () => {
    if (mode === 'quick') {
      return { hours: quickHours };
    } else {
      if (!customStart || !customEnd || rangeError) return null;
      return {
        start: new Date(customStart).toISOString(),
        end: new Date(customEnd).toISOString()
      };
    }
  };

  const fetchZoneComparison = async () => {
    const range = getRange();
    if (!range) return;

    if (zoneCompController.current) zoneCompController.current.abort();
    const controller = new AbortController();
    zoneCompController.current = controller;

    setLoadingZoneComp(true);
    try {
      const payload = {
        category: selectedCategory,
        ...range,
        interval: 'hour'
      };
      const res = await axios.post(`${origins}/api/analytics/zone-comparison`, payload, { signal: controller.signal });
      if (!controller.signal.aborted) setZoneComparison(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Zone comparison fetch error:', err);
      }
    } finally {
      if (!controller.signal.aborted) setLoadingZoneComp(false);
    }
    zoneCompController.current = null;
  };

  const fetchTimeSeries = async () => {
    const range = getRange();
    if (!range) return;

    if (timeSeriesController.current) timeSeriesController.current.abort();
    const controller = new AbortController();
    timeSeriesController.current = controller;

    setLoadingTimeSeries(true);
    try {
      const payload = {
        category: selectedCategory,
        ...range,
        interval: 'hour',
        zone_id: selectedZone || undefined
      };
      const res = await axios.post(`${origins}/api/analytics/timeseries`, payload, { signal: controller.signal });
      if (!controller.signal.aborted) setTimeseries(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
        console.error('Time series fetch error:', err);
      }
    } finally {
      if (!controller.signal.aborted) setLoadingTimeSeries(false);
    }
    timeSeriesController.current = null;
  };

  useEffect(() => {
    fetchZoneComparison();
  }, [zoneFetchTrigger, selectedCategory, mode, quickHours, customStart, customEnd, rangeError]);

  useEffect(() => {
    fetchTimeSeries();
  }, [fetchTrigger, selectedCategory, mode, quickHours, customStart, customEnd, rangeError, selectedZone]);

  const handleApplyCustom = () => {
    if (rangeError) return;
    setFetchTrigger(prev => prev + 1);
    setZoneFetchTrigger(prev => prev + 1);
  };

  const handleQuickChange = (hours) => {
    setMode('quick');
    setQuickHours(hours);
    setFetchTrigger(prev => prev + 1);
    setZoneFetchTrigger(prev => prev + 1);
  };

  const toggleMode = () => {
    setMode(mode === 'custom' ? 'quick' : 'custom');
  };

  const exportCSV = () => {
    if (!timeseries.length) return;
    const headers = ['Timestamp', 'Avg Value', 'Min', 'Max', 'Count'];
    const rows = timeseries.map(p => [
      new Date(p.timestamp).toLocaleString(),
      p.avg_value.toFixed(2),
      p.min_value.toFixed(2),
      p.max_value.toFixed(2),
      p.count
    ]);
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.setAttribute('download', `analytics_${selectedCategory}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Send report
  const handleSendReport = () => {
    let payload = {
      category: selectedCategory,
      zone_id: selectedZone || undefined
    };
    if (reportPeriod === 'custom') {
      payload.start = new Date(reportCustomStart).toISOString();
      payload.end   = new Date(reportCustomEnd).toISOString();
    } else {
      payload.period = reportPeriod;
    }
    if (reportEmail.trim()) {
      payload.recipients = [reportEmail];
    }

    // Reset bubble position to bottom-right corner
    bubblePosRef.current = { x: window.innerWidth - 80, y: window.innerHeight - 120 };
    if (bubbleRef.current) {
      bubbleRef.current.style.left = (bubblePosRef.current.x - 28) + 'px';
      bubbleRef.current.style.top  = (bubblePosRef.current.y - 28) + 'px';
    }

    // Close modal immediately, show bubble
    setShowReportModal(false);
    setBubbleStatus('sending');
    setSendingBubble(true);

    // Create a new AbortController for this request
    const ctrl = new AbortController();
    reportAbortCtrl.current = ctrl;

    axios.post(`${origins}/api/reports/send`, payload, { signal: ctrl.signal })
      .then(() => { if (!ctrl.signal.aborted) setBubbleStatus('done'); })
      .catch((err) => { if (!ctrl.signal.aborted && err.name !== 'CanceledError' && err.name !== 'AbortError') setBubbleStatus('error'); });
  };

  const handleCancelReport = () => {
    // Abort the in-flight request
    if (reportAbortCtrl.current) {
      reportAbortCtrl.current.abort();
      reportAbortCtrl.current = null;
    }
    setSendingBubble(false);
    setBubbleStatus('sending');
    setShowReportModal(false);
  };

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const Icon = activeCategory?.icon;

  const totalAlerts = activeCount;
  const avgValue = timeseries.length ? (timeseries.reduce((sum, p) => sum + p.avg_value, 0) / timeseries.length).toFixed(1) : '-';
  const worstZone = zoneComparison.length ? zoneComparison.reduce((max, z) => (z.avg_value > max.avg_value ? z : max), zoneComparison[0]) : null;
  const overallTrend = timeseries.length > 1 
    ? (timeseries[timeseries.length-1].avg_value > timeseries[0].avg_value ? 'Hausse' : 'Baisse')
    : '-';



    const chartDataWithForecast = useMemo(() => {
    if (!prediction) return timeseries;
    const now = new Date();
    const forecastPoints = Object.entries(prediction.predictions).map(([h, val]) => ({
      timestamp: new Date(now.getTime() + h * 3600000).toISOString(),
      avg_value: null,
      forecast_value: val,
      isForecast: true
    }));
    return [
      ...timeseries.map(p => ({ ...p, forecast_value: null })),
      ...forecastPoints
    ];
  }, [timeseries, prediction]);

  // Bubble drag — uses global window listeners to avoid attaching to the whole page div
  const handleBubbleMouseDown = (e) => {
    bubbleDragging.current = true;
    bubbleDidDrag.current  = false;
    bubbleDragOffset.current = {
      x: e.clientX - bubblePosRef.current.x,
      y: e.clientY - bubblePosRef.current.y,
    };
    e.preventDefault();

    const onMove = (ev) => {
      if (!bubbleDragging.current) return;
      bubbleDidDrag.current = true;
      const nx = Math.min(Math.max(ev.clientX - bubbleDragOffset.current.x, 28), window.innerWidth  - 28);
      const ny = Math.min(Math.max(ev.clientY - bubbleDragOffset.current.y, 28), window.innerHeight - 28);
      bubblePosRef.current = { x: nx, y: ny };
      if (bubbleRef.current) {
        bubbleRef.current.style.left = (nx - 28) + 'px';
        bubbleRef.current.style.top  = (ny - 28) + 'px';
      }
    };
    const onUp = () => {
      bubbleDragging.current = false;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleBubbleTouchStart = (e) => {
    const t = e.touches[0];
    bubbleDragging.current = true;
    bubbleDidDrag.current  = false;
    bubbleDragOffset.current = {
      x: t.clientX - bubblePosRef.current.x,
      y: t.clientY - bubblePosRef.current.y,
    };
  };
  const handleBubbleTouchMove = (e) => {
    if (!bubbleDragging.current) return;
    bubbleDidDrag.current = true;
    const t = e.touches[0];
    const nx = Math.min(Math.max(t.clientX - bubbleDragOffset.current.x, 28), window.innerWidth  - 28);
    const ny = Math.min(Math.max(t.clientY - bubbleDragOffset.current.y, 28), window.innerHeight - 28);
    bubblePosRef.current = { x: nx, y: ny };
    if (bubbleRef.current) {
      bubbleRef.current.style.left = (nx - 28) + 'px';
      bubbleRef.current.style.top  = (ny - 28) + 'px';
    }
    e.preventDefault();
  };
  const handleBubbleTouchEnd = () => { bubbleDragging.current = false; };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-6">
      {/* Sticky header (dashboard style) */}
      <div className="sticky top-0 z-20 bg-[#F8F9FB] py-2.5 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-slate-200 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-[#17203f] tracking-tight whitespace-nowrap">Analytiques avancées</h1>
          <div className="bg-white rounded-lg border border-slate-200 px-2 py-1">
            <TimeRangePicker
              mode={mode}
              setMode={setMode}
              quickHours={quickHours}
              setQuickHours={setQuickHours}
              customStart={customStart}
              setCustomStart={setCustomStart}
              customEnd={customEnd}
              setCustomEnd={setCustomEnd}
              onApply={handleApplyCustom}
              error={rangeError}
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#17203f] text-white border-[#17203f] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/40 hover:text-[#17203f]'
                }`}
              >
                <cat.icon size={13} className="shrink-0" />
                <span className="whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          title="Alertes actives"
          value={totalAlerts}
          icon={<AlertTriangle size={20} />}
          color="bg-amber-50 text-amber-600"
        />
        <MetricCard
          title={`Valeur moyenne (${activeCategory?.unit})`}
          value={avgValue !== '-' ? `${avgValue} ${activeCategory?.unit}` : '-'}
          icon={Icon && <Icon size={20} />}
          color="bg-indigo-50 text-indigo-600"
        />
        <MetricCard
          title="Zone la plus élevée"
          value={worstZone ? worstZone.zone_name : '-'}
          subtitle={worstZone ? `${worstZone.avg_value.toFixed(1)} ${activeCategory?.unit}` : ''}
          icon={<TrendingUp size={20} />}
          color="bg-emerald-50 text-emerald-600"
        />
        <MetricCard
          title="Tendance générale"
          value={overallTrend}
          icon={<Activity size={20} />}
          color="bg-slate-100 text-slate-600"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Time Series Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#17203f]">Évolution dans le temps</h2>
              <select
                className="bg-white border border-slate-200 px-2 py-1 rounded-md text-sm font-medium text-slate-600 outline-none focus:border-[#17203f] transition-colors cursor-pointer"
                value={selectedZone || ''}
                onChange={e => setSelectedZone(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">Toutes zones</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.nom_zone}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="xs" variant="ghost" onClick={exportCSV} disabled={!timeseries.length} icon={<Download size={14} />}>
                Exporter CSV
              </Button>
              <Button size="xs" variant="primary" onClick={() => setShowReportModal(true)} icon={<Send size={14} />}>
                Envoyer rapport
              </Button>
            </div>
          </div>
          <div className="h-80" style={{ minHeight: 320 }}>
            {loadingTimeSeries ? (
              <div className="flex justify-center items-center h-full"><RefreshCw className="animate-spin text-slate-400" /></div>
            ) : timeseries.length ? (
              <div style={{ height: '100%', width: '100%', minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={chartDataWithForecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={(ts) => new Date(ts).toLocaleDateString()} />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip labelFormatter={(ts) => new Date(ts).toLocaleString()} formatter={(value) => `${value.toFixed(2)} ${activeCategory?.unit}`} />
                    <Legend />
                    <Area type="monotone" dataKey="avg_value" stroke={activeCategory?.color} fill={activeCategory?.color + '20'} name="Moyenne" />
                    <Line type="monotone" dataKey="min_value" stroke="#94a3b8" strokeDasharray="5 5" name="Min" dot={false} />
                    <Line type="monotone" dataKey="max_value" stroke="#94a3b8" strokeDasharray="5 5" name="Max" dot={false} />
                     <Line
                      type="monotone"
                      dataKey="forecast_value"
                      stroke="#EF4444"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      name="Prévision"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-full text-slate-400">
                {selectedZone ? "Aucune donnée pour cette zone" : "Aucune donnée pour cette période"}
              </div>
            )}
          </div>
        </div>

        {/* Zone Comparison Bar Chart */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <h2 className="text-lg font-bold text-[#17203f] mb-4">Comparaison par zone</h2>
          <div className="h-80" style={{ minHeight: 320 }}>
            {loadingZoneComp ? (
              <div className="flex justify-center items-center h-full"><RefreshCw className="animate-spin text-slate-400" /></div>
            ) : zoneComparison.length ? (
              <div style={{ height: '100%', width: '100%', minHeight: 320 }}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={zoneComparison} layout="vertical" margin={{ left: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={['auto', 'auto']} />
                    <YAxis type="category" dataKey="zone_name" width={80} />
                    <Tooltip formatter={(value) => `${value.toFixed(2)} ${activeCategory?.unit}`} />
                    <Legend />
                    <Bar dataKey="avg_value" fill={activeCategory?.color} name="Moyenne" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex justify-center items-center h-full text-slate-400">Aucune donnée pour cette période</div>
            )}
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-bold text-[#17203f]">Détails des mesures (moyennes par intervalle)</h2>
        </div>
        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-2 px-4 font-semibold text-slate-600">Période</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-600">Moyenne</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-600">Min</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-600">Max</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-600">Nombre de mesures</th>
              </tr>
            </thead>
            <tbody>
              {timeseries.slice().reverse().map((point, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-4 text-slate-700">{new Date(point.timestamp).toLocaleString()}</td>
                  <td className="py-2 px-4 text-slate-700">{point.avg_value.toFixed(2)} {activeCategory?.unit}</td>
                  <td className="py-2 px-4 text-slate-700">{point.min_value.toFixed(2)} {activeCategory?.unit}</td>
                  <td className="py-2 px-4 text-slate-700">{point.max_value.toFixed(2)} {activeCategory?.unit}</td>
                  <td className="py-2 px-4 text-slate-700">{point.count}</td>
                </tr>
              ))}
              {!timeseries.length && (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400">Aucune donnée</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Prediction Panel ── */}
{prediction && (
  <div className="bg-white rounded-2xl border border-slate-200 p-5 mt-4">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
        <TrendingUp size={16} className="text-blue-600" />
        Prévision de danger — {prediction.category}
      </h3>
      <button onClick={fetchPrediction} disabled={loadingPrediction}
        className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
        <RefreshCw size={12} className={loadingPrediction ? 'animate-spin' : ''} />
        Actualiser
      </button>
    </div>

    {/* Danger score badge */}
    <div className="flex items-center gap-4 mb-4">
      <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-lg ${
        prediction.danger_score >= 80 ? 'bg-red-50 text-red-600' :
        prediction.danger_score >= 50 ? 'bg-orange-50 text-orange-600' :
        'bg-green-50 text-green-600'
      }`}>
        <AlertTriangle size={18} />
        {prediction.danger_score}% risque
      </div>
      <div className="text-xs text-slate-500">
        Seuil: {prediction.threshold}{prediction.unit} — Actuel: {prediction.current_avg}{prediction.unit}
      </div>
    </div>

    {/* Predicted values by horizon */}
    <div className="grid grid-cols-3 gap-3 mb-4">
      {Object.entries(prediction.predictions).map(([h, val]) => (
        <div key={h} className="bg-slate-50 rounded-xl p-3 text-center">
          <div className="text-xs text-slate-500 mb-1">Dans {h}h</div>
          <div className={`text-base font-semibold ${
            val >= prediction.threshold ? 'text-red-600' :
            val >= prediction.threshold * 0.85 ? 'text-orange-500' :
            'text-slate-800'
          }`}>
            {val}{prediction.unit}
          </div>
          {val >= prediction.threshold && (
            <div className="text-xs text-red-500 mt-1 flex items-center gap-0.5">
              <AlertTriangle size={10} className="text-red-500" /> Seuil dépassé
            </div>
          )}
        </div>
      ))}
    </div>

    {/* Ollama narrative */}
    {prediction.narrative && (
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
        <Activity size={14} className="text-blue-500 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800 leading-relaxed">{prediction.narrative}</p>
      </div>
    )}

    {/* Integrated forecast line on existing chart */}
    {/* Merge prediction.predictions into timeseries data for dashed overlay */}
  </div>
)}

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowReportModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#17203f]">Envoyer un rapport</h2>
              <p className="text-sm text-slate-500">Choisissez la période et le destinataire</p>
            </div>

            <div className="space-y-4">
              {/* Period selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Période</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setReportPeriod('daily')}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      reportPeriod === 'daily'
                        ? 'bg-[#17203f] text-white border-[#17203f]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/50'
                    }`}
                  >
                    Quotidien
                  </button>
                  <button
                    onClick={() => setReportPeriod('weekly')}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      reportPeriod === 'weekly'
                        ? 'bg-[#17203f] text-white border-[#17203f]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/50'
                    }`}
                  >
                    Hebdomadaire
                  </button>
                  <button
                    onClick={() => setReportPeriod('monthly')}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      reportPeriod === 'monthly'
                        ? 'bg-[#17203f] text-white border-[#17203f]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/50'
                    }`}
                  >
                    Mensuel
                  </button>
                  <button
                    onClick={() => setReportPeriod('custom')}
                    className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                      reportPeriod === 'custom'
                        ? 'bg-[#17203f] text-white border-[#17203f]'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/50'
                    }`}
                  >
                    Perso
                  </button>
                </div>
              </div>

              {/* Custom date range */}
              {reportPeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Début</label>
                    <input
                      type="datetime-local"
                      value={reportCustomStart}
                      onChange={e => setReportCustomStart(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Fin</label>
                    <input
                      type="datetime-local"
                      value={reportCustomEnd}
                      onChange={e => setReportCustomEnd(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Email field */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email destinataire (optionnel)</label>
                <input
                  type="email"
                  value={reportEmail}
                  onChange={e => setReportEmail(e.target.value)}
                  placeholder="ex: manager@cevital.dz"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#17203f] transition-colors"
                />
                <p className="text-xs text-slate-400 mt-1">Si vide, le rapport sera envoyé à l'email configuré dans le système.</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="ghost"
                onClick={sendingBubble ? handleCancelReport : () => setShowReportModal(false)}
                fullWidth
              >
                Annuler
              </Button>
              <Button
                onClick={handleSendReport}
                disabled={sendingBubble}
                icon={<Send size={14} />}
                fullWidth
              >
                Envoyer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Draggable sending bubble */}
      {sendingBubble && (
        <div
          ref={bubbleRef}
          style={{
            position: 'fixed',
            left: bubblePosRef.current.x - 28,
            top:  bubblePosRef.current.y - 28,
            zIndex: 9999,
            cursor: 'grab',
            userSelect: 'none',
            touchAction: 'none',
          }}
          onMouseDown={handleBubbleMouseDown}
          onTouchStart={handleBubbleTouchStart}
          onTouchMove={handleBubbleTouchMove}
          onTouchEnd={handleBubbleTouchEnd}
          onClick={() => {
            // Ignore if the user just dragged
            if (bubbleDidDrag.current) { bubbleDidDrag.current = false; return; }
            if (bubbleStatus === 'done' || bubbleStatus === 'error') {
              setSendingBubble(false);
              setBubbleStatus('sending');
            } else {
              // Re-open the report modal
              setShowReportModal(true);
            }
          }}
          title={
            bubbleStatus === 'sending' ? 'Envoi en cours… Cliquer pour rouvrir' :
            bubbleStatus === 'done'    ? 'Rapport envoyé ! Cliquer pour fermer' :
                                         "Échec de l'envoi. Cliquer pour fermer"
          }
        >
          <div
            className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center ${
              bubbleStatus === 'sending' ? 'bg-[#17203f]' :
              bubbleStatus === 'done'    ? 'bg-emerald-500' :
                                           'bg-red-500'
            }`}
          >
            {bubbleStatus === 'sending' && (
              <RefreshCw size={22} className="text-white animate-spin" />
            )}
            {bubbleStatus === 'done' && (
              <Send size={22} className="text-white" />
            )}
            {bubbleStatus === 'error' && (
              <X size={22} className="text-white" />
            )}
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-slate-500">
            {bubbleStatus === 'sending' ? 'Envoi…' : bubbleStatus === 'done' ? <>Envoyé <Check size={10} className="inline text-green-600" /></> : <>Erreur <X size={10} className="inline text-red-500" /></>}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-[#17203f]">{value}</div>
    {subtitle && <div className="text-xs text-slate-400 mt-1">{subtitle}</div>}
  </div>
);

export default Analytics;