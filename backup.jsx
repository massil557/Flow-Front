import React, { useState, useEffect } from 'react';
import axios from 'axios';
import IndustrialChart from '../components/IndustrialChart';
import { Thermometer, Gauge, Droplets, Wind, Clock, Calendar, ArrowRight } from 'lucide-react';
import { origins } from './Managment';

const scrollStyles = `
  .chart-scroll::-webkit-scrollbar { display: none; }
  .chart-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

const CATEGORIES = [
  { id: 'TEMP', label: 'Temperature', icon: Thermometer, color: '#2D5BFF', unit: '°C',  crit: 30,  type: 'Température' },
  { id: 'PRES', label: 'Pressure',    icon: Gauge,        color: '#A855F7', unit: 'Bar', crit: 4,   type: 'Pression'    },
  { id: 'HUMI', label: 'Humidity',    icon: Droplets,     color: '#0EA5E9', unit: '%',   crit: 80,  type: 'Humidité'    },
  { id: 'CO2',  label: 'CO2 Level',   icon: Wind,         color: '#22C55E', unit: 'ppm', crit: 900, type: 'Qualité Air' },
];

const QUICK_OPTIONS = [
  { label: '5 min', value: 5/60  },
  { label: '30 min', value: 0.5  },
  { label: '1h',     value: 1    },
  { label: '2h',     value: 2    },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function toLocalInputValue(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function nowLocal()        { return toLocalInputValue(new Date()); }
function hoursAgoLocal(h)  { return toLocalInputValue(new Date(Date.now() - h * 3600000)); }

// Convert local datetime-local string to ISO but keep local time offset (+01:00)
function toLocalISO(localStr) {
  // localStr is like "2026-03-04T22:00"
  // We want "2026-03-04T22:00:00+01:00" so the backend matches DB timezone
  const d = new Date(localStr);
  const offset = -d.getTimezoneOffset(); // minutes
  const sign   = offset >= 0 ? '+' : '-';
  const hh     = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const mm     = String(Math.abs(offset) % 60).padStart(2, '0');
  const pad    = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T` +
         `${pad(d.getHours())}:${pad(d.getMinutes())}:00${sign}${hh}:${mm}`;
}

// ── Category button ───────────────────────────────────────────────────────────
const CategoryButton = ({ category, isActive, onSelect }) => {
  const Icon = category.icon;
  return (
    <button
      onClick={() => onSelect(category.id)}
      className={`shrink-0 px-6 h-[48px] rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer flex items-center gap-3 font-bold
      ${isActive ? 'bg-blue-500/10 text-blue-600 border-blue-500' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'}`}
    >
      <Icon size={20} />
      <span className="whitespace-nowrap">{category.label}</span>
    </button>
  );
};

// ── Sensor card ───────────────────────────────────────────────────────────────
const SensorCard = ({ sensorKey, sensorData, categoryColor, categoryUnit, critValue }) => {
  const [loadingReport, setLoadingReport] = useState(false);
  if (!sensorData || sensorData.length === 0) return null;

  const latestValue = sensorData[sensorData.length - 1]?.v?.toFixed(1) || '0';
  const chartData   = sensorData.map(p => ({
    x: p.t instanceof Date ? p.t : new Date(p.t),
    y: typeof p.v === 'number' ? p.v : parseFloat(p.v),
  }));

  const handleGenerateReport = async () => {
    setLoadingReport(true);
    try {
      const payload = {
        sensor_name: sensorKey,
        threshold:   critValue,
        data: chartData.map(d => ({ x: d.x.toISOString(), y: d.y })),
      };
      const resp = await fetch(`${origins}/generate-report`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error('Erreur serveur');
      const blob = await resp.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `Rapport_IA_${sensorKey}.pdf`;
      a.click();
    } catch (e) {
      console.error(e);
      alert("Échec de la génération du rapport.");
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-slate-50 relative overflow-hidden mb-6">
      <style>{scrollStyles}</style>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-50 rounded-2xl">
            <h3 className="text-slate-800 font-bold text-lg">{sensorKey}</h3>
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{latestValue}</span>
            <span className="text-xs text-slate-400 font-medium ml-1">{categoryUnit}</span>
          </div>
        </div>
        <button
          onClick={handleGenerateReport}
          disabled={loadingReport}
          className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 disabled:bg-slate-300 transition-all flex items-center gap-2"
        >
          {loadingReport ? 'Analyzing...' : 'AI Report'}
        </button>
      </div>
      <div className="w-full chart-scroll overflow-x-auto overflow-y-hidden rounded-3xl border border-slate-100 bg-slate-50/30" style={{ height: '350px' }}>
        <div style={{ width: `${Math.max(sensorData.length * 10, 800)}px`, height: '100%' }}>
          <IndustrialChart data={chartData} color={categoryColor} unit={categoryUnit} critValue={critValue} />
        </div>
      </div>
    </div>
  );
};

// ── Time range picker ─────────────────────────────────────────────────────────
function TimeRangePicker({ mode, setMode, quickHours, setQuickHours, customStart, setCustomStart, customEnd, setCustomEnd, onApply, error }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Quick presets */}
      <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
        {QUICK_OPTIONS.map(opt => (
          <button
            key={opt.label}
            onClick={() => { setMode('quick'); setQuickHours(opt.value); }}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
              mode === 'quick' && quickHours === opt.value
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Custom range toggle */}
      <button
        onClick={() => setMode(mode === 'custom' ? 'quick' : 'custom')}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 font-bold text-sm transition-all ${
          mode === 'custom'
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'
        }`}
      >
        <Calendar size={16} />
        Custom Range
      </button>

      {/* Custom date inputs */}
      {mode === 'custom' && (
        <div className="flex flex-wrap items-center gap-2 bg-white border-2 border-blue-100 rounded-2xl px-4 py-2 shadow-sm">
          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">From</label>
            <input
              type="datetime-local"
              value={customStart}
              max={customEnd || nowLocal()}
              onChange={e => setCustomStart(e.target.value)}
              className="text-sm font-medium text-slate-700 outline-none bg-transparent cursor-pointer"
            />
          </div>

          <ArrowRight size={16} className="text-slate-300 mt-3" />

          <div className="flex flex-col">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">To</label>
            <input
              type="datetime-local"
              value={customEnd}
              min={customStart}
              max={nowLocal()}
              onChange={e => setCustomEnd(e.target.value)}
              className="text-sm font-medium text-slate-700 outline-none bg-transparent cursor-pointer"
            />
          </div>

          <button
            onClick={onApply}
            disabled={!!error}
            className="ml-2 mt-3 px-4 py-1.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-all"
          >
            Apply
          </button>

          {error && <p className="w-full text-xs text-red-500 font-medium mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('TEMP');
  const [sensorsMeta,    setSensorsMeta]    = useState([]);
  const [zones,          setZones]          = useState([]);
  const [zoneFilter,     setZoneFilter]     = useState(null);
  const [historyData,    setHistoryData]    = useState({});

  const [mode,         setMode]         = useState('quick');
  const [quickHours,   setQuickHours]   = useState(1);
  const [customStart,  setCustomStart]  = useState(() => hoursAgoLocal(1));
  const [customEnd,    setCustomEnd]    = useState(() => nowLocal());
  const [appliedRange, setAppliedRange] = useState(null);
  const [rangeError,   setRangeError]   = useState('');

  // Validate custom range
  useEffect(() => {
    if (mode !== 'custom') { setRangeError(''); return; }
    if (!customStart || !customEnd) { setRangeError('Please select both dates.'); return; }
    if (new Date(customStart) >= new Date(customEnd)) {
      setRangeError('"To" date must be after "From" date.');
    } else {
      setRangeError('');
    }
  }, [customStart, customEnd, mode]);

  const handleApplyCustom = () => {
    if (rangeError || !customStart || !customEnd) return;
    // Send timezone-aware ISO strings so backend matches +01 stored timestamps
    setAppliedRange({
      start: toLocalISO(customStart),
      end:   toLocalISO(customEnd),
    });
  };

  useEffect(() => {
    if (mode === 'quick') setAppliedRange(null);
  }, [mode]);

  // Load metadata
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

  // Load history
  useEffect(() => {
    const loadHistory = async () => {
      const activeCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
      const filtered = sensorsMeta.filter(s =>
        (s.type_grandeur === activeCategoryObj.type || s.code_unique.startsWith(activeCategory)) &&
        (!zoneFilter || s.zone_id === zoneFilter)
      );
      const data = {};
      await Promise.all(filtered.map(async s => {
        try {
          let url;
          if (mode === 'custom' && appliedRange) {
            url = `${origins}/api/history/${s.id}?start=${encodeURIComponent(appliedRange.start)}&end=${encodeURIComponent(appliedRange.end)}`;
          } else {
            url = `${origins}/api/history/${s.id}?hours=${quickHours}`;
          }
          const res = await axios.get(url);
          data[s.code_unique] = res.data.map(p => ({ t: new Date(p.time), v: p.valeur }));
        } catch (err) { console.error(err); }
      }));
      setHistoryData(data);
    };
    if (sensorsMeta.length) loadHistory();
  }, [activeCategory, zoneFilter, quickHours, appliedRange, sensorsMeta, mode]);

  const activeCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
  const filteredSensors   = Object.entries(historyData).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Metrics</h1>
          <p className="text-slate-500 font-medium">Real-time industrial monitoring</p>
        </div>
        <TimeRangePicker
          mode={mode} setMode={setMode}
          quickHours={quickHours} setQuickHours={setQuickHours}
          customStart={customStart} setCustomStart={setCustomStart}
          customEnd={customEnd} setCustomEnd={setCustomEnd}
          onApply={handleApplyCustom}
          error={rangeError}
        />
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-10">
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(category => (
            <CategoryButton key={category.id} category={category} isActive={activeCategory === category.id} onSelect={setActiveCategory} />
          ))}
        </div>
        <select
          className="bg-white border-2 border-slate-100 p-2.5 px-4 rounded-2xl font-bold text-slate-600 outline-none focus:border-blue-500 transition-all cursor-pointer"
          value={zoneFilter || ''}
          onChange={e => setZoneFilter(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">All Zones</option>
          {zones.map(z => <option key={z.id} value={z.id}>{z.nom_zone}</option>)}
        </select>

        {mode === 'custom' && appliedRange && (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-2xl text-xs font-bold text-blue-700">
            <Clock size={13} />
            {new Date(appliedRange.start).toLocaleString()} → {new Date(appliedRange.end).toLocaleString()}
          </div>
        )}
      </div>

      <div className="space-y-4">
        {filteredSensors.length === 0 ? (
          <div className="text-center py-20 text-slate-300">
            <Clock size={48} strokeWidth={1} className="mx-auto mb-3" />
            <p className="font-medium text-slate-400">No data for selected range</p>
          </div>
        ) : (
          filteredSensors.map(([key, data]) => (
            <SensorCard
              key={key} sensorKey={key} sensorData={data}
              categoryColor={activeCategoryObj.color}
              categoryUnit={activeCategoryObj.unit}
              critValue={activeCategoryObj.crit}
            />
          ))
        )}
      </div>
    </div>
  );
}
