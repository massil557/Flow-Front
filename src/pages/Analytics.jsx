// src/pages/Analytics.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { origins } from './Managment';
import { useAlerts } from '../hooks/useAlerts';
import {
  Thermometer, Gauge, Droplets, Wind, Calendar, Download,
  TrendingUp, AlertTriangle, Activity, RefreshCw, ArrowRight, Send, X, Zap
} from 'lucide-react';
import Button from '../components/Button';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, Area, AreaChart
} from 'recharts';

import { useTranslation } from 'react-i18next';

const CATEGORIES = [
  { id: 'Température', label: 'Température', icon: Thermometer, color: '#2D5BFF', unit: '°C', labelKey: 'categories.temperature' },
  { id: 'Pression',    label: 'Pression',    icon: Gauge,       color: '#A855F7', unit: 'Bar', labelKey: 'categories.pressure' },
  { id: 'Humidité',    label: 'Humidité',    icon: Droplets,    color: '#0EA5E9', unit: '%',   labelKey: 'categories.humidity' },
  { id: 'Qualité Air', label: 'Qualité Air', icon: Wind,        color: '#22C55E', unit: 'ppm', labelKey: 'categories.air_quality' },
];

const QUICK_OPTIONS = [
  { label: '24h', value: 24, labelKey: 'time_ranges.24h' },
  { label: '7j',  value: 24 * 7, labelKey: 'time_ranges.7d' },
  { label: '30j', value: 24 * 30, labelKey: 'time_ranges.30d' },
];

function toLocalInputValue(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function nowLocal() { return toLocalInputValue(new Date()); }
function hoursAgoLocal(h) { return toLocalInputValue(new Date(Date.now() - h * 3600000)); }

const TimeRangePicker = ({ mode, setMode, quickHours, setQuickHours, customStart, setCustomStart, customEnd, setCustomEnd, onApply, error }) => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700">
        {QUICK_OPTIONS.map(opt => (
          <button
            key={opt.label}
            onClick={() => { setMode('quick'); setQuickHours(opt.value); }}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              mode === 'quick' && quickHours === opt.value
                ? 'bg-[#17203f] text-white'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>

      <button
        onClick={() => setMode(mode === 'custom' ? 'quick' : 'custom')}
        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
          mode === 'custom'
            ? 'bg-[#17203f] text-white border-[#17203f]'
            : 'bg-white dark:bg-[#1e293b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#17203f]/50'
        }`}
      >
        <Calendar size={12} />
        {t('analytics.custom_label')}
      </button>

      {mode === 'custom' && (
        <div className="flex items-center gap-1.5 bg-white dark:bg-[#1e293b] border border-[#17203f]/20 rounded-lg px-2 py-1">
          <input
            type="datetime-local"
            value={customStart}
            max={customEnd || nowLocal()}
            onChange={e => setCustomStart(e.target.value)}
            className="text-xs font-medium text-slate-700 dark:text-slate-200 outline-none bg-transparent cursor-pointer border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5"
            style={{ fontSize: '11px' }}
          />
          <ArrowRight size={10} className="text-slate-300 dark:text-slate-600" />
          <input
            type="datetime-local"
            value={customEnd}
            min={customStart}
            max={nowLocal()}
            onChange={e => setCustomEnd(e.target.value)}
            className="text-xs font-medium text-slate-700 dark:text-slate-200 outline-none bg-transparent cursor-pointer border border-slate-200 dark:border-slate-700 rounded px-2 py-0.5"
            style={{ fontSize: '11px' }}
          />
          <Button onClick={onApply} disabled={!!error} size="xs">
            {t('analytics.ok')}
          </Button>
        </div>
      )}
      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
};

const Analytics = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

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

  // Report modal state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPeriod, setReportPeriod] = useState('daily');
  const [reportCustomStart, setReportCustomStart] = useState(() => hoursAgoLocal(24));
  const [reportCustomEnd, setReportCustomEnd] = useState(() => nowLocal());
  const [reportEmail, setReportEmail] = useState('');
  const [sendingReport, setSendingReport] = useState(false);

  // Draggable sending bubble
  const [sendingBubble, setSendingBubble] = useState(false);
  const [bubbleStatus, setBubbleStatus] = useState('sending');
  const bubbleRef        = useRef(null);
  const bubbleDragging   = useRef(false);
  const bubbleDidDrag    = useRef(false);
  const bubbleDragOffset = useRef({ x: 0, y: 0 });
  const bubblePosRef     = useRef({ x: window.innerWidth - 80, y: window.innerHeight - 120 });
  const reportAbortCtrl  = useRef(null);

  const timeSeriesController = useRef(null);
  const zoneCompController   = useRef(null);
  const [fetchTrigger, setFetchTrigger]         = useState(0);
  const [zoneFetchTrigger, setZoneFetchTrigger] = useState(0);

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

  // Validate custom range
  useEffect(() => {
    if (mode !== 'custom') { setRangeError(''); return; }
    if (!customStart || !customEnd) { setRangeError(t('analytics.error_dates')); return; }
    if (new Date(customStart) >= new Date(customEnd)) {
      setRangeError(t('analytics.error_date_order'));
    } else {
      setRangeError('');
    }
  }, [customStart, customEnd, mode]);

  const getRange = () => {
    if (mode === 'quick') return { hours: quickHours };
    if (!customStart || !customEnd || rangeError) return null;
    return {
      start: new Date(customStart).toISOString(),
      end:   new Date(customEnd).toISOString()
    };
  };

  const fetchZoneComparison = async () => {
    const range = getRange();
    if (!range) return;
    if (zoneCompController.current) zoneCompController.current.abort();
    const controller = new AbortController();
    zoneCompController.current = controller;
    setLoadingZoneComp(true);
    try {
      const res = await axios.post(`${origins}/api/analytics/zone-comparison`, {
        category: selectedCategory, ...range, interval: 'hour'
      }, { signal: controller.signal });
      if (!controller.signal.aborted) setZoneComparison(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') console.error(err);
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
      const res = await axios.post(`${origins}/api/analytics/timeseries`, {
        category: selectedCategory, ...range, interval: 'hour',
        zone_id: selectedZone || undefined
      }, { signal: controller.signal });
      if (!controller.signal.aborted) setTimeseries(res.data);
    } catch (err) {
      if (err.name !== 'CanceledError' && err.name !== 'AbortError') console.error(err);
    } finally {
      if (!controller.signal.aborted) setLoadingTimeSeries(false);
    }
    timeSeriesController.current = null;
  };

  useEffect(() => { fetchZoneComparison(); }, [zoneFetchTrigger, selectedCategory, mode, quickHours, customStart, customEnd, rangeError]);
  useEffect(() => { fetchTimeSeries(); },     [fetchTrigger, selectedCategory, mode, quickHours, customStart, customEnd, rangeError, selectedZone]);

  const handleApplyCustom = () => {
    if (rangeError) return;
    setFetchTrigger(p => p + 1);
    setZoneFetchTrigger(p => p + 1);
  };

  const exportCSV = () => {
    if (!timeseries.length) return;
    const headers = ['Timestamp', 'Avg Value', 'Min', 'Max', 'Count'];
    const rows = timeseries.map(p => [
      new Date(p.timestamp).toLocaleString(),
      p.avg_value.toFixed(2), p.min_value.toFixed(2), p.max_value.toFixed(2), p.count
    ]);
    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `analytics_${selectedCategory}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendReport = () => {
    let payload = { category: selectedCategory, zone_id: selectedZone || undefined };
    if (reportPeriod === 'custom') {
      payload.start = new Date(reportCustomStart).toISOString();
      payload.end   = new Date(reportCustomEnd).toISOString();
    } else {
      payload.period = reportPeriod;
    }
    if (reportEmail.trim()) payload.recipients = [reportEmail];

    bubblePosRef.current = { x: window.innerWidth - 80, y: window.innerHeight - 120 };
    if (bubbleRef.current) {
      bubbleRef.current.style.left = (bubblePosRef.current.x - 28) + 'px';
      bubbleRef.current.style.top  = (bubblePosRef.current.y - 28) + 'px';
    }
    setShowReportModal(false);
    setBubbleStatus('sending');
    setSendingBubble(true);

    const ctrl = new AbortController();
    reportAbortCtrl.current = ctrl;
    axios.post(`${origins}/api/reports/send`, payload, { signal: ctrl.signal })
      .then(() => { if (!ctrl.signal.aborted) setBubbleStatus('done'); })
      .catch(err => { if (!ctrl.signal.aborted && err.name !== 'CanceledError' && err.name !== 'AbortError') setBubbleStatus('error'); });
  };

  const handleCancelReport = () => {
    if (reportAbortCtrl.current) { reportAbortCtrl.current.abort(); reportAbortCtrl.current = null; }
    setSendingBubble(false);
    setBubbleStatus('sending');
    setShowReportModal(false);
  };

  // Bubble drag handlers
  const handleBubbleMouseDown = (e) => {
    bubbleDragging.current = true;
    bubbleDidDrag.current  = false;
    bubbleDragOffset.current = { x: e.clientX - bubblePosRef.current.x, y: e.clientY - bubblePosRef.current.y };
    e.preventDefault();
    const onMove = (ev) => {
      if (!bubbleDragging.current) return;
      bubbleDidDrag.current = true;
      const nx = Math.min(Math.max(ev.clientX - bubbleDragOffset.current.x, 28), window.innerWidth  - 28);
      const ny = Math.min(Math.max(ev.clientY - bubbleDragOffset.current.y, 28), window.innerHeight - 28);
      bubblePosRef.current = { x: nx, y: ny };
      if (bubbleRef.current) { bubbleRef.current.style.left = (nx - 28) + 'px'; bubbleRef.current.style.top = (ny - 28) + 'px'; }
    };
    const onUp = () => { bubbleDragging.current = false; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };
  const handleBubbleTouchStart = (e) => {
    const t = e.touches[0];
    bubbleDragging.current = true; bubbleDidDrag.current = false;
    bubbleDragOffset.current = { x: t.clientX - bubblePosRef.current.x, y: t.clientY - bubblePosRef.current.y };
  };
  const handleBubbleTouchMove = (e) => {
    if (!bubbleDragging.current) return;
    bubbleDidDrag.current = true;
    const t = e.touches[0];
    const nx = Math.min(Math.max(t.clientX - bubbleDragOffset.current.x, 28), window.innerWidth  - 28);
    const ny = Math.min(Math.max(t.clientY - bubbleDragOffset.current.y, 28), window.innerHeight - 28);
    bubblePosRef.current = { x: nx, y: ny };
    if (bubbleRef.current) { bubbleRef.current.style.left = (nx - 28) + 'px'; bubbleRef.current.style.top = (ny - 28) + 'px'; }
    e.preventDefault();
  };
  const handleBubbleTouchEnd = () => { bubbleDragging.current = false; };

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const Icon = activeCategory?.icon;
  const totalAlerts  = activeCount;
  const avgValue     = timeseries.length ? (timeseries.reduce((s, p) => s + p.avg_value, 0) / timeseries.length).toFixed(1) : '-';
  const worstZone    = zoneComparison.length ? zoneComparison.reduce((mx, z) => z.avg_value > mx.avg_value ? z : mx, zoneComparison[0]) : null;
  const overallTrend = timeseries.length > 1 ? (timeseries[timeseries.length - 1].avg_value > timeseries[0].avg_value ? t('analytics.trend_up') : t('analytics.trend_down')) : '-';

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-6">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-[#F8F9FB] dark:bg-[#0f172a] py-2.5 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-[#17203f] dark:text-white tracking-tight whitespace-nowrap">{t('analytics.title')}</h1>

          <div className="bg-white dark:bg-[#1e293b] rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1">
            <TimeRangePicker
              mode={mode} setMode={setMode}
              quickHours={quickHours} setQuickHours={setQuickHours}
              customStart={customStart} setCustomStart={setCustomStart}
              customEnd={customEnd} setCustomEnd={setCustomEnd}
              onApply={handleApplyCustom} error={rangeError}
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
                    : 'bg-white dark:bg-[#1e293b] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#17203f]/40 hover:text-[#17203f] dark:hover:text-[#4B7AFF]'
                }`}
              >
                <cat.icon size={13} className="shrink-0" />
                <span className="whitespace-nowrap">{t(cat.labelKey)}</span>
              </button>
            ))}
          </div>

          {/* ── Prediction button — right side ── */}
          <div className="ml-auto shrink-0">
            <button
              onClick={() => navigate('/mainlayout/prediction')}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-2 border-violet-500 bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold text-xs hover:bg-violet-100 dark:hover:bg-violet-500/20 transition-all shadow-sm whitespace-nowrap"
            >
              <Zap size={13} />
              {t('analytics.prediction_link')}
            </button>
          </div>
        </div>
      </div>

      {/* ── Metric Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard title={t('analytics.active_alerts')}     value={totalAlerts}  icon={<AlertTriangle size={20} />} color="bg-amber-50 text-amber-600" />
        <MetricCard title={t('analytics.avg_value', { unit: activeCategory?.unit })} value={avgValue !== '-' ? `${avgValue} ${activeCategory?.unit}` : '-'} icon={Icon && <Icon size={20} />} color="bg-indigo-50 text-indigo-600" />
        <MetricCard title={t('analytics.highest_zone')} value={worstZone ? worstZone.zone_name : '-'} subtitle={worstZone ? `${worstZone.avg_value.toFixed(1)} ${activeCategory?.unit}` : ''} icon={<TrendingUp size={20} />} color="bg-emerald-50 text-emerald-600" />
        <MetricCard title={t('analytics.general_trend')}   value={overallTrend} icon={<Activity size={20} />} color="bg-slate-100 text-slate-600" />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

        {/* Time Series */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-[#17203f] dark:text-white">{t('analytics.time_evolution')}</h2>
              <select
                className="bg-white dark:bg-[#334155] border border-slate-200 dark:border-slate-600 px-2 py-1 rounded-md text-sm font-medium text-slate-600 dark:text-slate-200 outline-none focus:border-[#17203f] transition-colors cursor-pointer"
                value={selectedZone || ''}
                onChange={e => setSelectedZone(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">{t('analytics.all_zones')}</option>
                {zones.map(z => <option key={z.id} value={z.id}>{z.nom_zone}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <Button size="xs" variant="ghost" onClick={exportCSV} disabled={!timeseries.length} icon={<Download size={14} />}>
                {t('analytics.export_csv')}
              </Button>
              <Button size="xs" variant="primary" onClick={() => setShowReportModal(true)} icon={<Send size={14} />}>
                {t('analytics.send_report')}
              </Button>
            </div>
          </div>
          <div className="h-80" style={{ minHeight: 320 }}>
            {loadingTimeSeries ? (
              <div className="flex justify-center items-center h-full"><RefreshCw className="animate-spin text-slate-400 dark:text-slate-500" /></div>
            ) : timeseries.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={timeseries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="timestamp" tickFormatter={ts => new Date(ts).toLocaleDateString()} tick={{ fill: '#94a3b8' }} />
                  <YAxis domain={['auto', 'auto']} tick={{ fill: '#94a3b8' }} />
                  <Tooltip labelFormatter={ts => new Date(ts).toLocaleString()} formatter={v => `${v.toFixed(2)} ${activeCategory?.unit}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Area type="monotone" dataKey="avg_value" stroke={activeCategory?.color} fill={activeCategory?.color + '20'} name={t('analytics.average')} />
                  <Line type="monotone" dataKey="min_value" stroke="#64748b" strokeDasharray="5 5" name={t('analytics.min')} dot={false} />
                  <Line type="monotone" dataKey="max_value" stroke="#64748b" strokeDasharray="5 5" name={t('analytics.max')} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-slate-400 dark:text-slate-500">
                {selectedZone ? t('analytics.no_data_zone') : t('analytics.no_data_period')}
              </div>
            )}
          </div>
        </div>

        {/* Zone Comparison */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
          <h2 className="text-lg font-bold text-[#17203f] dark:text-white mb-4">{t('analytics.zone_comparison')}</h2>
          <div className="h-80" style={{ minHeight: 320 }}>
            {loadingZoneComp ? (
              <div className="flex justify-center items-center h-full"><RefreshCw className="animate-spin text-slate-400 dark:text-slate-500" /></div>
            ) : zoneComparison.length ? (
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={zoneComparison} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis type="number" domain={['auto', 'auto']} tick={{ fill: '#94a3b8' }} />
                  <YAxis type="category" dataKey="zone_name" width={80} tick={{ fill: '#94a3b8' }} />
                  <Tooltip formatter={v => `${v.toFixed(2)} ${activeCategory?.unit}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#e2e8f0' }} />
                  <Legend wrapperStyle={{ color: '#94a3b8' }} />
                  <Bar dataKey="avg_value" fill={activeCategory?.color} name={t('analytics.average')} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex justify-center items-center h-full text-slate-400 dark:text-slate-500">{t('analytics.no_data_period')}</div>
            )}
          </div>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-[#334155]">
          <h2 className="text-sm font-bold text-[#17203f] dark:text-white">{t('analytics.measure_details')}</h2>
        </div>
        <div className="overflow-x-auto max-h-64">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-[#334155] border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="text-left py-2 px-4 font-semibold text-slate-600 dark:text-slate-300">{t('analytics.table_period')}</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-600 dark:text-slate-300">{t('analytics.table_avg')}</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-600 dark:text-slate-300">{t('analytics.table_min')}</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-600 dark:text-slate-300">{t('analytics.table_max')}</th>
                <th className="text-left py-2 px-4 font-semibold text-slate-600 dark:text-slate-300">{t('analytics.table_count')}</th>
              </tr>
            </thead>
            <tbody>
              {timeseries.slice().reverse().map((point, idx) => (
                <tr key={`${point.timestamp}-${idx}`} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#334155]">
                  <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{new Date(point.timestamp).toLocaleString()}</td>
                  <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{point.avg_value.toFixed(2)} {activeCategory?.unit}</td>
                  <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{point.min_value.toFixed(2)} {activeCategory?.unit}</td>
                  <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{point.max_value.toFixed(2)} {activeCategory?.unit}</td>
                  <td className="py-2 px-4 text-slate-700 dark:text-slate-300">{point.count}</td>
                </tr>
              ))}
              {!timeseries.length && (
                <tr><td colSpan="5" className="py-8 text-center text-slate-400 dark:text-slate-500">{t('analytics.no_data')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Report Modal ── */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button onClick={() => setShowReportModal(false)} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <X size={20} />
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#17203f] dark:text-white">{t('analytics.report_modal_title')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('analytics.report_modal_desc')}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('analytics.period')}</label>
                <div className="flex gap-2">
                  {['daily', 'weekly', 'monthly', 'custom'].map(p => (
                    <button key={p} onClick={() => setReportPeriod(p)}
                      className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        reportPeriod === p ? 'bg-[#17203f] text-white border-[#17203f]' : 'bg-white dark:bg-[#334155] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-[#17203f]/50'
                      }`}>
                      {{ daily: t('analytics.daily'), weekly: t('analytics.weekly'), monthly: t('analytics.monthly'), custom: t('analytics.custom_label') }[p]}
                    </button>
                  ))}
                </div>
              </div>
              {reportPeriod === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('analytics.start')}</label>
                    <input type="datetime-local" value={reportCustomStart} onChange={e => setReportCustomStart(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-[#334155] dark:text-slate-200" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('analytics.end')}</label>
                    <input type="datetime-local" value={reportCustomEnd} onChange={e => setReportCustomEnd(e.target.value)} className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm dark:bg-[#334155] dark:text-slate-200" />
                  </div>
                </div>
              )}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('analytics.email_optional')}</label>
                <input type="email" value={reportEmail} onChange={e => setReportEmail(e.target.value)} placeholder={t('analytics.email_placeholder')}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#334155] text-sm dark:text-slate-200 outline-none focus:border-[#17203f] transition-colors" />
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('analytics.email_helper')}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="ghost" onClick={sendingBubble ? handleCancelReport : () => setShowReportModal(false)} fullWidth>{t('analytics.cancel')}</Button>
              <Button onClick={handleSendReport} disabled={sendingBubble} icon={<Send size={14} />} fullWidth>{t('analytics.send')}</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Draggable sending bubble ── */}
      {sendingBubble && (
        <div
          ref={bubbleRef}
          style={{ position: 'fixed', left: bubblePosRef.current.x - 28, top: bubblePosRef.current.y - 28, zIndex: 9999, cursor: 'grab', userSelect: 'none', touchAction: 'none' }}
          onMouseDown={handleBubbleMouseDown}
          onTouchStart={handleBubbleTouchStart}
          onTouchMove={handleBubbleTouchMove}
          onTouchEnd={handleBubbleTouchEnd}
          onClick={() => {
            if (bubbleDidDrag.current) { bubbleDidDrag.current = false; return; }
            if (bubbleStatus === 'done' || bubbleStatus === 'error') { setSendingBubble(false); setBubbleStatus('sending'); }
            else setShowReportModal(true);
          }}
        >
          <div className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center ${
            bubbleStatus === 'sending' ? 'bg-[#17203f]' : bubbleStatus === 'done' ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
            {bubbleStatus === 'sending' && <RefreshCw size={22} className="text-white animate-spin" />}
            {bubbleStatus === 'done'    && <Send size={22} className="text-white" />}
            {bubbleStatus === 'error'   && <X size={22} className="text-white" />}
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-slate-500 dark:text-slate-400">
            {bubbleStatus === 'sending' ? t('analytics.sending') : bubbleStatus === 'done' ? t('analytics.sent') : t('analytics.error_sending')}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white dark:bg-[#1e293b] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{title}</span>
      <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
    </div>
    <div className="text-2xl font-bold text-[#17203f] dark:text-white">{value}</div>
    {subtitle && <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">{subtitle}</div>}
  </div>
);

export default Analytics;
