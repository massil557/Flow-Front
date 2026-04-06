// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import IndustrialChart from '../components/IndustrialChart';
import Button from '../components/Button';
import { Thermometer, Gauge, Droplets, Wind, Clock, Calendar, ArrowRight, X, Send, FileText } from 'lucide-react';
import { origins } from './Managment';
import { motion, AnimatePresence } from 'framer-motion';

const scrollStyles = `
  .chart-scroll::-webkit-scrollbar { display: none; }
  .chart-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
`;

const CATEGORIES = [
  { id: 'TEMP', label: 'Température',  icon: Thermometer, color: '#2D5BFF', unit: '°C',  crit: 30,  type: 'Température' },
  { id: 'PRES', label: 'Pression',     icon: Gauge,       color: '#A855F7', unit: 'Bar', crit: 4,   type: 'Pression'    },
  { id: 'HUMI', label: 'Humidité',     icon: Droplets,    color: '#0EA5E9', unit: '%',   crit: 80,  type: 'Humidité'    },
  { id: 'CO2',  label: 'Qualité Air',  icon: Wind,        color: '#22C55E', unit: 'ppm', crit: 900, type: 'Qualité Air' },
];

const QUICK_OPTIONS = [
  { label: '5 min', value: 5 / 60 },
  { label: '30 min', value: 0.5 },
  { label: '1h', value: 1 },
  { label: '2h', value: 2 },
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
        <span className="whitespace-nowrap">{category.label}</span>
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
      <span className="whitespace-nowrap">{category.label}</span>
    </button>
  );
};

// ── Sensor card with downsampled chart and fixed pixel spacing ────────────
const SensorCard = ({ sensorKey, sensorData, categoryColor, categoryUnit, critValue }) => {
  const [loadingReport, setLoadingReport] = useState(false);
  const [sendingEmail, setSendingEmail]   = useState(false);
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
    if (!resp.ok) throw new Error('Erreur serveur');
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
      alert('Échec de la génération du rapport.');
    } finally {
      setLoadingReport(false);
    }
  };

  const handleSendEmail = () => {
    if (!emailTo.trim() || !lastBlob) return;
    setSendingEmail(true);
    const reader = new FileReader();
    reader.readAsDataURL(lastBlob);
    reader.onloadend = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const resp = await fetch(`${origins}/send-report-email`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_email: emailTo,
            sensor_name: sensorKey,
            pdf_base64: base64,
            chart_base64: lastChartImg || null,
          }),
        });
        if (!resp.ok) throw new Error();
        setEmailModal(false);
        setEmailTo('');
        alert(`Rapport envoyé à ${emailTo}`);
      } catch {
        alert("Échec de l'envoi email.");
      } finally {
        setSendingEmail(false);
      }
    };
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-2xl shadow-sm border-2 transition-colors overflow-hidden
        ${isOverThreshold ? 'border-red-200' : 'border-slate-100'}`}
    >
      <style>{scrollStyles}</style>

      {/* Card header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Capteur</span>
            <span className="text-lg font-bold text-[#17203f]">{sensorKey}</span>
          </div>
          <div className="w-px h-8 bg-slate-200" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Valeur actuelle</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-bold tabular-nums ${isOverThreshold ? 'text-red-600' : 'text-slate-900'}`}>
                {latestValue}
              </span>
              <span className="text-sm font-semibold text-slate-400">{categoryUnit}</span>
            </div>
          </div>
        </div>

        <Button
          onClick={handleGenerateReport}
          loading={loadingReport}
          icon={<FileText size={14} />}
          size="sm"
        >
          {loadingReport ? 'Analyse...' : 'Rapport IA'}
        </Button>
      </div>

      {/* Chart with fixed pixel spacing */}
      <div className="p-3">
        <div
          id={`chart-${sensorKey}`}
          className="w-full chart-scroll overflow-x-auto overflow-y-hidden rounded-lg border border-slate-100 bg-slate-50/50"
          style={{ height: '260px' }}
        >
          <div style={{ width: `${chartWidth}px`, height: '100%' }}>
            <IndustrialChart data={displayData} color={categoryColor} unit={categoryUnit} critValue={critValue} />
          </div>
        </div>
      </div>

      {/* Email modal (unchanged) */}
      {emailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">
            <button
              onClick={() => { setEmailModal(false); setEmailTo(''); }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"
            >
              <X size={20} />
            </button>
            <div className="mb-4">
              <h2 className="text-xl font-bold text-[#17203f] mb-1">Envoyer le rapport</h2>
              <p className="text-sm text-slate-500">PDF + graphique seront joints.</p>
            </div>
            <div className="mb-4">
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">Rapport_IA_{sensorKey}.pdf</span>
                {lastChartImg && <span className="px-2 py-1 bg-slate-100 rounded text-xs font-semibold">Graphique.png</span>}
              </div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Email destinataire</label>
              <input
                type="email"
                value={emailTo}
                onChange={e => setEmailTo(e.target.value)}
                placeholder="responsable@cevital.dz"
                className="w-full px-3 py-2 rounded-xl border-2 border-slate-200 bg-slate-50 text-sm outline-none focus:border-[#17203f]"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setEmailModal(false); setEmailTo(''); }} fullWidth>Annuler</Button>
              <Button onClick={handleSendEmail} loading={sendingEmail} disabled={!emailTo.trim()} icon={<Send size={14} />} fullWidth>
                Envoyer
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
  if (compact) {
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
            <Button onClick={onApply} disabled={!!error} size="xs">OK</Button>
          </div>
        )}
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
      </div>
    );
  }

  // Original non‑compact version
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
        {QUICK_OPTIONS.map(opt => (
          <button
            key={opt.label}
            onClick={() => { setMode('quick'); setQuickHours(opt.value); }}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              mode === 'quick' && quickHours === opt.value
                ? 'bg-[#17203f] text-white shadow'
                : 'text-slate-400 hover:text-slate-700'
            }`}
          >
            {opt.label}
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
        Plage personnalisée
      </button>

      {mode === 'custom' && (
        <div className="flex flex-wrap items-end gap-3 bg-white border-2 border-[#17203f]/20 rounded-xl px-5 py-3 shadow-sm w-full sm:w-auto">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Début</label>
            <input
              type="datetime-local"
              value={customStart}
              max={customEnd || nowLocal()}
              onChange={e => setCustomStart(e.target.value)}
              className="text-sm font-medium text-slate-700 outline-none bg-transparent cursor-pointer border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
          <ArrowRight size={16} className="text-slate-300 mb-2.5" />
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Fin</label>
            <input
              type="datetime-local"
              value={customEnd}
              min={customStart}
              max={nowLocal()}
              onChange={e => setCustomEnd(e.target.value)}
              className="text-sm font-medium text-slate-700 outline-none bg-transparent cursor-pointer border border-slate-200 rounded-lg px-3 py-2"
            />
          </div>
          <Button onClick={onApply} disabled={!!error} size="sm">
            Appliquer
          </Button>
          {error && <p className="w-full text-xs text-red-500 font-medium">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
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

  useEffect(() => {
    if (mode !== 'custom') { setRangeError(''); return; }
    if (!customStart || !customEnd) { setRangeError('Sélectionnez les deux dates.'); return; }
    if (new Date(customStart) >= new Date(customEnd)) {
      setRangeError('La date de fin doit être après la date de début.');
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

  const activeCat = CATEGORIES.find(c => c.id === activeCategory);
  const sensorsWithData = Object.entries(historyData)
    .filter(([_, data]) => data && data.length > 0)
    .sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="w-full mx-auto px-4 sm:px-6">
      {/* ── STICKY HEADER ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-[#F8F9FB] py-2.5 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-slate-200 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-bold text-[#17203f] tracking-tight whitespace-nowrap">Métriques système</h1>
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
            <option value="">Toutes zones</option>
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
          <div className="mt-1 text-right text-[10px] text-slate-400">
            Dernière mise à jour : {lastUpdate.toLocaleTimeString()}
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
            <p className="font-semibold text-slate-400 text-lg">Aucune donnée pour cette plage</p>
            <p className="text-slate-300 text-sm mt-1">Modifiez les filtres ou la plage temporelle</p>
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
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}