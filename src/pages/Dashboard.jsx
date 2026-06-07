// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import IndustrialChart from '../components/IndustrialChart';
import Button from '../components/Button';
import { Thermometer, Gauge, Droplets, Wind, Clock, Calendar, ArrowRight, X, Send, FileText, RefreshCw } from 'lucide-react';
import { origins } from './Managment';
import { useLiveSensorNumber, startLivePolling } from '../stores/liveSensorStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
const scrollStyles = `
  .chart-scroll::-webkit-scrollbar { display: none; }
  .chart-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const CATEGORIES = [
  { id: 'TEMP', label: 'Température',  icon: Thermometer, color: '#2D5BFF', unit: '°C',  crit: 30,  type: 'Température', labelKey: 'categories.temperature' },
  { id: 'PRES', label: 'Pression',     icon: Gauge,       color: '#A855F7', unit: 'Bar', crit: 4,   type: 'Pression',    labelKey: 'categories.pressure' },
  { id: 'HUMI', label: 'Humidité',     icon: Droplets,    color: '#0EA5E9', unit: '%',   crit: 80,  type: 'Humidité',    labelKey: 'categories.humidity' },
  { id: 'CO2',  label: 'Qualité Air',  icon: Wind,        color: '#22C55E', unit: 'ppm', crit: 900, type: 'Qualité Air', labelKey: 'categories.air_quality' },
];

const QUICK_OPTIONS = [
  { label: '5 min', value: 5 / 60, labelKey: 'time_ranges.5min' },
  { label: '30 min', value: 0.5, labelKey: 'time_ranges.30min' },
  { label: '1h', value: 1, labelKey: 'time_ranges.1h' },
  { label: '2h', value: 2, labelKey: 'time_ranges.2h' },
];

function toLocalInputValue(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function nowLocal() { return toLocalInputValue(new Date()); }
function hoursAgoLocal(h) { return toLocalInputValue(new Date(Date.now() - h * 3600000)); }

function toLocalISO(localStr) {
  const d = new Date(localStr);
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const hh = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const mm = String(Math.abs(offset) % 60).padStart(2, '0');
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${hh}:${mm}`;
}

// ── Category tab (compact style) ──────────────────────────────────────────
const CategoryTab = ({ category, isActive, onSelect, compact = false }) => {
  const { t } = useTranslation();
  const Icon = category.icon;
  if (compact) {
    return (
      <button
        onClick={() => onSelect(category.id)}
        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-semibold text-xs transition-all duration-200 cursor-pointer
          ${isActive
            ? 'bg-[#17203f] text-white border-[#17203f] shadow-sm'
            : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/40 hover:text-[#17203f]'
          }`}
      >
        <Icon size={13} className="shrink-0" />
        <span className="whitespace-nowrap">{t(category.labelKey)}</span>
      </button>
    );
  }
  return (
    <button
      onClick={() => onSelect(category.id)}
      className={`shrink-0 flex items-center gap-2.5 px-5 py-3 rounded-xl border-2 font-semibold text-sm transition-all duration-200 cursor-pointer
        ${isActive
          ? 'bg-[#17203f] text-white border-[#17203f] shadow-md'
          : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/40 hover:text-[#17203f]'
        }`}
    >
      <Icon size={17} className="shrink-0" />
      <span className="whitespace-nowrap">{t(category.labelKey)}</span>
    </button>
  );
};

// ── Live numeric value — only this re-renders on 2s tick, card stays static ──
function SensorCardLiveValue({ sensorKey, fallbackValue, unit, critValue }) {
  const liveVal = useLiveSensorNumber(sensorKey);
  const hasLive = liveVal !== null && liveVal !== undefined;
  const displayVal = hasLive ? Number(liveVal).toFixed(2) : fallbackValue;
  const isOver = parseFloat(displayVal) >= critValue;

  return (
    <div className="flex items-baseline gap-1">
      <span className={`text-2xl font-bold tabular-nums ${isOver ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
        {displayVal}
      </span>
      <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">{unit}</span>
    </div>
  );
}

// ── Sensor card with downsampled chart and fixed pixel spacing ────────────
const SensorCard = ({ sensorKey, sensorData, categoryColor, categoryUnit, critValue, onBubbleStart }) => {
  const { t } = useTranslation();
  const [loadingReport, setLoadingReport] = useState(false);
  const [emailModal, setEmailModal]       = useState(false);
  const [emailTo, setEmailTo]             = useState('');
  const [lastBlob, setLastBlob]           = useState(null);
  const [lastChartImg, setLastChartImg]   = useState(null);

  if (!sensorData || sensorData.length === 0) return null;

  const latestValue = sensorData[sensorData.length - 1]?.v?.toFixed(2) ?? '—';
  const isOverThreshold = parseFloat(latestValue) >= critValue;

  // Prepare chart data
  let chartData = sensorData.map(p => ({
    x: p.t instanceof Date ? p.t : new Date(p.t),
    y: typeof p.v === 'number' ? p.v : parseFloat(p.v),
  }));

  // Downsample to max 500 points for performance (keeps chart responsive)
  const MAX_POINTS = 500;
  let displayData = chartData;
  if (chartData.length > MAX_POINTS) {
    const step = chartData.length / MAX_POINTS;
    displayData = chartData.filter((_, i) => Math.floor(i % step) === 0);
  }

  // Fixed spacing: 20px per point (approx 0.5 cm at 96 DPI)
  const PIXELS_PER_POINT = 20;
  let chartWidth = displayData.length * PIXELS_PER_POINT;
  chartWidth = Math.max(chartWidth, 500); // minimum width

  const generatePdf = async () => {
    const resp = await fetch(`${origins}/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sensor_name: sensorKey,
        threshold: critValue,
        data: chartData.map(d => ({ x: d.x.toISOString(), y: d.y })),
      }),
    });
    if (!resp.ok) throw new Error(t('dashboard.server_error'));
    return await resp.blob();
  };

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      const blob = await generatePdf();
      setLastBlob(blob);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Rapport_IA_${sensorKey}.pdf`;
      a.click();
      const container = document.getElementById(`chart-${sensorKey}`);
      const canvas = container?.querySelector('canvas');
      if (canvas) setLastChartImg(canvas.toDataURL('image/png').split(',')[1]);
      setEmailModal(true);
    } catch (e) {
      console.error(e);
      alert(t('dashboard.report_failed'));
    } finally {
      setLoadingReport(false);
    }
  };

  // ── SEUL CHANGEMENT : envoi asynchrone avec bulle — modal se ferme immédiatement ──
  const handleSendEmail = () => {
    if (!emailTo.trim() || !lastBlob) return;
    const reader = new FileReader();
    reader.readAsDataURL(lastBlob);
    reader.onloadend = () => {
      const base64 = reader.result.split(',')[1];
      // Fermer le modal tout de suite
      setEmailModal(false);
      setEmailTo('');
      // Passer la Promise fetch au parent pour démarrer la bulle
      onBubbleStart(
        fetch(`${origins}/send-report-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_email: emailTo,
            sensor_name: sensorKey,
            pdf_base64: base64,
            chart_base64: lastChartImg || null,
          }),
        })
      );
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-sm border-2 transition-colors overflow-hidden
        ${isOverThreshold ? 'border-red-200' : 'border-slate-100 dark:border-slate-700'}`}
    >
      <style>{scrollStyles}</style>

      {/* Card header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 pb-2 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{t('dashboard.sensor')}</span>
            <span className="text-lg font-bold text-[#17203f] dark:text-white">{sensorKey}</span>
          </div>
          <div className="w-px h-8 bg-slate-200 dark:bg-slate-600" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">{t('dashboard.current_value')}</span>
            <SensorCardLiveValue
              sensorKey={sensorKey}
              fallbackValue={latestValue}
              unit={categoryUnit}
              critValue={critValue}
            />
          </div>
        </div>

        <Button
          onClick={handleGenerateReport}
          loading={loadingReport}
          icon={<FileText size={14} />}
          size="sm"
        >
          {loadingReport ? t('dashboard.analyzing') : t('dashboard.report_ia')}
        </Button>
      </div>

      {/* Chart with fixed pixel spacing */}
      <div className="p-3">
        <div
          id={`chart-${sensorKey}`}
          className="w-full chart-scroll overflow-x-auto overflow-y-hidden rounded-lg border border-slate-100 dark:border-slate-600 bg-slate-50/50 dark:bg-slate-700/50"
          style={{ height: '260px' }}
        >
          <div style={{ width: `${chartWidth}px`, height: '100%' }}>
            <IndustrialChart data={displayData} color={categoryColor} unit={categoryUnit} critValue={critValue} />
          </div>
        </div>
      </div>

      {/* Email modal */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => { setEmailModal(false); setEmailTo(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#17203f] dark:text-white mb-1">{t('dashboard.send_report')}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{t('dashboard.report_desc')}</p>
            </div>
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold dark:text-white">{t('dashboard.report_pdf', { key: sensorKey })}</span>
                {lastChartImg && <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-semibold dark:text-white">{t('dashboard.chart_png')}</span>}
              </div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">{t('dashboard.email_recipient')}</label>
              <input
                type="email"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                placeholder={t('dashboard.email_placeholder')}
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-sm outline-none focus:border-[#17203f] dark:text-white"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setEmailModal(false); setEmailTo(''); }} fullWidth>{t('common.cancel')}</Button>
              <Button onClick={handleSendEmail} disabled={!emailTo.trim()} icon={<Send size={14} />} fullWidth>
                {t('common.send')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

// ── TimeRangePicker (compact + original non‑compact) ─────────────────────
function TimeRangePicker({ mode, setMode, quickHours, setQuickHours, customStart, setCustomStart, customEnd, setCustomEnd, onApply, error, compact = false }) {
  const { t } = useTranslation();
  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <div className="flex items-center bg-white rounded-lg border border-slate-200">
          {QUICK_OPTIONS.map(opt => (
            <button
              key={t(opt.labelKey)}
              onClick={() => { setMode('quick'); setQuickHours(opt.value); }}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                mode === 'quick' && quickHours === opt.value
                  ? 'bg-[#17203f] text-white'
                  : 'text-slate-500 hover:text-slate-700'
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
              : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/50'
          }`}
        >
          <Calendar size={12} />
          {t('dashboard.custom')}
        </button>
        {mode === 'custom' && (
          <div className="flex items-center gap-1.5 bg-white dark:bg-slate-800 border border-[#17203f]/20 dark:border-slate-600 rounded-lg px-2 py-1">
            <input
              type="datetime-local"
              value={customStart}
              max={customEnd || nowLocal()}
              onChange={e => setCustomStart(e.target.value)}
              className="text-xs font-medium text-slate-700 dark:text-white outline-none bg-transparent cursor-pointer border border-slate-200 dark:border-slate-600 rounded px-2 py-0.5"
              style={{ fontSize: '11px' }}
            />
            <ArrowRight size={10} className="text-slate-300" />
            <input
              type="datetime-local"
              value={customEnd}
              min={customStart}
              max={nowLocal()}
              onChange={e => setCustomEnd(e.target.value)}
              className="text-xs font-medium text-slate-700 dark:text-white outline-none bg-transparent cursor-pointer border border-slate-200 dark:border-slate-600 rounded px-2 py-0.5"
              style={{ fontSize: '11px' }}
            />
            <Button onClick={onApply} disabled={!!error} size="xs">{t('common.ok')}</Button>
          </div>
        )}
        {error && <p className="text-xs text-red-500 dark:text-red-400 font-medium">{error}</p>}
      </div>
    );
  }

  // Original non‑compact version
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
        {QUICK_OPTIONS.map(opt => (
          <button
            key={t(opt.labelKey)}
            onClick={() => { setMode('quick'); setQuickHours(opt.value); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'quick' && quickHours === opt.value
                ? 'bg-[#17203f] text-white shadow'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {t(opt.labelKey)}
          </button>
        ))}
      </div>

      <button
        onClick={() => setMode(mode === 'custom' ? 'quick' : 'custom')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all ${
          mode === 'custom'
            ? 'bg-[#17203f] text-white border-[#17203f]'
            : 'bg-white text-slate-600 border-slate-200 hover:border-[#17203f]/50 hover:text-[#17203f]'
        }`}
      >
        <Calendar size={15} />
        {t('dashboard.custom_range')}
      </button>

      {mode === 'custom' && (
        <div className="flex flex-wrap items-end gap-3 bg-white dark:bg-slate-800 border-2 border-[#17203f]/20 rounded-xl px-5 py-3 shadow-sm w-full sm:w-auto">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t('dashboard.start')}</label>
            <input
              type="datetime-local"
              value={customStart}
              max={customEnd || nowLocal()}
              onChange={e => setCustomStart(e.target.value)}
              className="text-sm font-medium text-slate-700 dark:text-white outline-none bg-transparent cursor-pointer border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
            />
          </div>
          <ArrowRight size={16} className="text-slate-300 mb-2.5" />
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">{t('dashboard.end')}</label>
            <input
              type="datetime-local"
              value={customEnd}
              min={customStart}
              max={nowLocal()}
              onChange={e => setCustomEnd(e.target.value)}
              className="text-sm font-medium text-slate-700 dark:text-white outline-none bg-transparent cursor-pointer border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2"
            />
          </div>
          <Button onClick={onApply} disabled={!!error} size="sm">
            {t('common.apply')}
          </Button>
          {error && <p className="w-full text-xs text-red-500 font-medium">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('TEMP');
  const [sensorsMeta, setSensorsMeta]       = useState([]);
  const [zones, setZones]                   = useState([]);
  const [zoneFilter, setZoneFilter]         = useState(null);
  const [historyData, setHistoryData]       = useState({});
  const [mode, setMode]                     = useState('quick');
  const [quickHours, setQuickHours]         = useState(1);
  const [customStart, setCustomStart]       = useState(() => hoursAgoLocal(1));
  const [customEnd, setCustomEnd]           = useState(() => nowLocal());
  const [appliedRange, setAppliedRange]     = useState(null);
  const [rangeError, setRangeError]         = useState('');
  const [loading, setLoading]               = useState(true);
  const [lastUpdate, setLastUpdate]         = useState(null);

  // ── Bulle d'envoi draggable (identique à Analytics) ──────────────────────
  const [sendingBubble, setSendingBubble]   = useState(false);
  const [bubbleStatus, setBubbleStatus]     = useState('sending');
  const bubbleRef        = useRef(null);
  const bubbleDragging   = useRef(false);
  const bubbleDidDrag    = useRef(false);
  const bubbleDragOffset = useRef({ x: 0, y: 0 });
  const bubblePosRef     = useRef({ x: window.innerWidth - 80, y: window.innerHeight - 120 });

  const handleBubbleStart = (fetchPromise) => {
    bubblePosRef.current = { x: window.innerWidth - 80, y: window.innerHeight - 120 };
    if (bubbleRef.current) {
      bubbleRef.current.style.left = (bubblePosRef.current.x - 28) + 'px';
      bubbleRef.current.style.top  = (bubblePosRef.current.y - 28) + 'px';
    }
    setBubbleStatus('sending');
    setSendingBubble(true);
    fetchPromise
      .then(r => { if (!r.ok) throw new Error(); setBubbleStatus('done'); })
      .catch(() => setBubbleStatus('error'));
  };

  const handleBubbleMouseDown = (e) => {
    bubbleDragging.current  = true;
    bubbleDidDrag.current   = false;
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

  useEffect(() => {
    if (mode !== 'custom') { setRangeError(''); return; }
    if (!customStart || !customEnd) { setRangeError(t('dashboard.error_dates')); return; }
    if (new Date(customStart) >= new Date(customEnd)) {
      setRangeError(t('dashboard.error_date_order'));
    } else {
      setRangeError('');
    }
  }, [customStart, customEnd, mode]);

  const handleApplyCustom = () => {
    if (rangeError || !customStart || !customEnd) return;
    setAppliedRange({ start: toLocalISO(customStart), end: toLocalISO(customEnd) });
  };

  useEffect(() => { if (mode === 'quick') setAppliedRange(null); }, [mode]);

  // Load sensors and zones
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [sres, zres] = await Promise.all([
          axios.get(`${origins}/api/sensors`),
          axios.get(`${origins}/api/zones`),
        ]);
        setSensorsMeta(sres.data);
        setZones(zres.data);
      } catch (e) { console.error(e); }
    };
    loadMeta();
  }, []);

  // Load history when filters change
  useEffect(() => {
    if (sensorsMeta.length === 0) return;
    const loadHistory = async () => {
      setLoading(true);
      const cat = CATEGORIES.find(c => c.id === activeCategory);
      const filtered = sensorsMeta.filter(s =>
        (s.type_grandeur === cat.type || s.code_unique.startsWith(activeCategory)) &&
        (!zoneFilter || s.zone_id === zoneFilter)
      );
      const data = {};
      await Promise.all(filtered.map(async s => {
        try {
          const url = mode === 'custom' && appliedRange
            ? `${origins}/api/history/${s.id}?start=${encodeURIComponent(appliedRange.start)}&end=${encodeURIComponent(appliedRange.end)}`
            : `${origins}/api/history/${s.id}?hours=${quickHours}`;
          const res = await axios.get(url);
          data[s.code_unique] = res.data.map(p => ({ t: new Date(p.time), v: p.valeur }));
        } catch (err) { console.error(err); }
      }));
      setHistoryData(data);
      setLastUpdate(new Date());
      setLoading(false);
    };
    loadHistory();
    // Polling only in quick mode
    let interval;
    if (mode === 'quick') {
      interval = setInterval(loadHistory, 300000);
    }
    return () => clearInterval(interval);
  }, [activeCategory, zoneFilter, quickHours, appliedRange, sensorsMeta, mode]);

  // Start live sensor polling once (shared single interval)
  useEffect(() => { startLivePolling(); }, []);

  const activeCat = CATEGORIES.find(c => c.id === activeCategory);
  const sensorsWithData = Object.entries(historyData)
    .filter(([_, data]) => data && data.length > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="w-full mx-auto px-4 sm:px-6">
      {/* ── STICKY HEADER ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#F8F9FB] dark:bg-[#0f172a] py-2.5 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-slate-200 dark:border-slate-700 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-[#17203f] dark:text-white tracking-tight whitespace-nowrap">{t('dashboard.title')}</h1>
          <div className="bg-white rounded-lg border border-slate-200 px-2 py-1">
            <TimeRangePicker
              mode={mode} setMode={setMode}
              quickHours={quickHours} setQuickHours={setQuickHours}
              customStart={customStart} setCustomStart={setCustomStart}
              customEnd={customEnd} setCustomEnd={setCustomEnd}
              onApply={handleApplyCustom}
              error={rangeError}
              compact={true}
            />
          </div>
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <CategoryTab key={cat.id} category={cat} isActive={activeCategory === cat.id} onSelect={setActiveCategory} compact />
            ))}
          </div>
          <select
            className="bg-white border border-slate-200 px-3 py-1 rounded-lg text-sm font-medium text-slate-600 outline-none focus:border-[#17203f] ml-auto"
            value={zoneFilter || ''}
            onChange={e => setZoneFilter(e.target.value ? parseInt(e.target.value) : null)}
          >
            <option value="">{t('dashboard.all_zones')}</option>
            {zones.map(z => <option key={z.id} value={z.id}>{z.nom_zone}</option>)}
          </select>
        </div>
        {mode === 'custom' && appliedRange && (
          <div className="mt-2 flex items-center gap-1 text-xs text-[#17203f] bg-white/50 px-2 py-1 rounded">
            <Clock size={11} />
            <span>{new Date(appliedRange.start).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
            <span>-</span>
            <span>{new Date(appliedRange.end).toLocaleTimeString('fr-FR', {hour:'2-digit', minute:'2-digit'})}</span>
          </div>
        )}
        {lastUpdate && (
          <div className="mt-1 text-right text-[10px] text-slate-400 dark:text-slate-500">
            {t('dashboard.last_update')} {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Sensor cards in a 2‑column grid */}
      <div className="pb-8">
        {loading && sensorsWithData.length === 0 ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#17203f] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : sensorsWithData.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-slate-300">
            <Clock size={52} strokeWidth={1} className="mb-4" />
            <p className="font-semibold text-slate-400 dark:text-slate-300 text-lg">{t('dashboard.empty_title')}</p>
            <p className="text-slate-300 dark:text-slate-400 text-sm mt-1">{t('dashboard.empty_hint')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AnimatePresence>
              {sensorsWithData.map(([key, data]) => (
                <SensorCard
                  key={key}
                  sensorKey={key}
                  sensorData={data}
                  categoryColor={activeCat.color}
                  categoryUnit={activeCat.unit}
                  critValue={activeCat.crit}
                  onBubbleStart={handleBubbleStart}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* ── Bulle d'envoi draggable (identique à Analytics) ── */}
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
          }}
        >
          <div className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center ${
            bubbleStatus === 'sending' ? 'bg-[#17203f]' : bubbleStatus === 'done' ? 'bg-emerald-500' : 'bg-red-500'
          }`}>
            {bubbleStatus === 'sending' && <RefreshCw size={22} className="text-white animate-spin" />}
            {bubbleStatus === 'done'    && <Send size={22} className="text-white" />}
            {bubbleStatus === 'error'   && <X size={22} className="text-white" />}
          </div>
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold text-slate-500">
            {bubbleStatus === 'sending' ? t('dashboard.sending') : bubbleStatus === 'done' ? t('dashboard.sent') : t('dashboard.error_sending')}
          </div>
        </div>
      )}
    </div>
  );
}
