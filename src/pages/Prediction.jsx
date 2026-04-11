// src/pages/Prediction.jsx  
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { origins } from './Managment';
import {
  Thermometer, Gauge, Droplets, Wind, Calendar,
  ArrowLeft, RefreshCw, AlertTriangle,
  TrendingUp, Activity, Zap, Clock, ShieldAlert
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';

// ── Constants ────────────────────────────────────────────────────────────────

// BUG 3 FIX — Seuils synchronisés avec le backend (analytics.py → DANGER_THRESHOLDS)
// Avant : threshold: 30 (Température), 4 (Pression), 80 (Humidité), 900 (Qualité Air)
// Après : valeurs identiques à celles du backend pour éviter tout écart de calcul
const CATEGORIES = [
  { id: 'Température', label: 'Température', icon: Thermometer, color: '#2D5BFF', unit: '°C',  threshold: 30.0   },
  { id: 'Pression',    label: 'Pression',    icon: Gauge,       color: '#A855F7', unit: 'Bar', threshold: 4.0    },
  { id: 'Humidité',    label: 'Humidité',    icon: Droplets,    color: '#0EA5E9', unit: '%',   threshold: 80.0   },
  { id: 'Qualité Air', label: 'Qualité Air', icon: Wind,        color: '#22C55E', unit: 'ppm', threshold: 900.0 },
];

const HORIZON_OPTIONS = [
  { label: '1h', value: 1 },
  { label: '2h', value: 2 },
  { label: '3h', value: 3 },
];

function toLocalInputValue(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
function nowLocal()       { return toLocalInputValue(new Date()); }
function hoursFromNow(h)  { return toLocalInputValue(new Date(Date.now() + h * 3600000)); }

// ── Danger badge ─────────────────────────────────────────────────────────────

const DangerBadge = ({ score }) => {
  if (score >= 80) return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
      <ShieldAlert size={12} /> {score}% — Critique
    </span>
  );
  if (score >= 50) return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
      <AlertTriangle size={12} /> {score}% — Modéré
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
      <Activity size={12} /> {score}% — Normal
    </span>
  );
};

// ── Custom tooltip ────────────────────────────────────────────────────────────

const PredictionTooltip = ({ active, payload, label, unit, threshold }) => {
  if (!active || !payload?.length) return null;
  const isForecast = payload.some(p => p.dataKey === 'forecast' && p.value !== null);
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-semibold text-slate-700 mb-1">{new Date(label).toLocaleString()}</p>
      {payload.map((p, i) => p.value !== null && (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(2) : p.value} {unit}
        </p>
      ))}
      {isForecast && threshold && (
        <p className="text-slate-400 mt-1 border-t border-slate-100 pt-1">Seuil: {threshold} {unit}</p>
      )}
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const Prediction = () => {
  const navigate = useNavigate();

  // Controls
  const [selectedCategory, setSelectedCategory] = useState('Température');
  const [selectedZone, setSelectedZone]         = useState(null);
  const [zones, setZones]                       = useState([]);
  const [horizonMode, setHorizonMode]           = useState('quick');
  const [quickHorizon, setQuickHorizon]         = useState(1);
  const [customEnd, setCustomEnd]               = useState(() => hoursFromNow(1));
  const [customError, setCustomError]           = useState('');

  // Data
  const [prediction, setPrediction]             = useState(null);
  const [history, setHistory]                   = useState([]);
  const [loading, setLoading]                   = useState(false);
  const [lastRefresh, setLastRefresh]           = useState(null);

  // Refs for abort controllers
  const predAbortRef    = useRef(null);
  const historyAbortRef = useRef(null);
  const intervalRef     = useRef(null);

  // ── Fetch zones ────────────────────────────────────────────────────────────
  useEffect(() => {
    axios.get(`${origins}/api/zones`)
      .then(r => setZones(r.data))
      .catch(console.error);
  }, []);

  // ── Validate custom end ────────────────────────────────────────────────────
  useEffect(() => {
    if (horizonMode !== 'custom') { setCustomError(''); return; }
    if (!customEnd) { setCustomError('Choisissez une date future.'); return; }
    if (new Date(customEnd) <= new Date()) {
      setCustomError('La date doit être dans le futur.');
    } else {
      setCustomError('');
    }
  }, [customEnd, horizonMode]);

  // ── Compute horizon hours (pure function, no useCallback needed) ──────────
  // BUG 1 FIX (partiel) — getHorizonHours est maintenant une fonction pure
  // appelée directement dans les fetch, évitant les dépendances stale de useCallback
  const getHorizonHours = () => {
    if (horizonMode === 'quick') return quickHorizon;
    if (!customEnd || customError) return null;
    const diff = (new Date(customEnd) - new Date()) / 3600000;
    return Math.max(0.5, Math.round(diff * 2) / 2);
  };

  // ── Fetch historical context ───────────────────────────────────────────────
  // BUG 2 FIX — AbortController pour annuler les requêtes en vol
  const fetchHistory = useCallback(async (category, zone) => {
    // Annule la requête précédente si encore en cours
    if (historyAbortRef.current) historyAbortRef.current.abort();
    historyAbortRef.current = new AbortController();

    try {
      const res = await axios.post(
        `${origins}/api/analytics/timeseries`,
        { category, hours: 12, interval: 'hour', zone_id: zone || undefined },
        { signal: historyAbortRef.current.signal }
      );
      setHistory(res.data);
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError') return; // requête annulée, on ignore
      console.error('History fetch error:', err);
    }
  }, []);

  // ── Fetch prediction ───────────────────────────────────────────────────────
  // BUG 1 FIX — La fonction reçoit les paramètres directement (pas de closure stale)
  // BUG 2 FIX — AbortController + reset d'état AVANT le fetch
  const fetchPrediction = useCallback(async (category, zone, horizonHours) => {
    if (!horizonHours) return;

    // Annule la requête précédente si encore en cours
    if (predAbortRef.current) predAbortRef.current.abort();
    predAbortRef.current = new AbortController();

    // BUG 2 FIX — Réinitialisation immédiate avant le fetch
    setPrediction(null);
    setLoading(true);

    try {
      const horizons = horizonHours <= 1 ? [1] : horizonHours <= 2 ? [1, 2] : [1, 2, 3];
      const res = await axios.post(
        `${origins}/api/analytics/predict`,
        { category, zone_id: zone || undefined, horizons },
        { signal: predAbortRef.current.signal }
      );
      setPrediction(res.data);
      setLastRefresh(new Date());
    } catch (err) {
      if (axios.isCancel(err) || err.name === 'CanceledError') return;
      console.error('Prediction fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── BUG 1 FIX — useEffect principal corrigé ───────────────────────────────
  // Avant : fetchPrediction et fetchHistory dans les deps → versions stale au 1er rendu
  // Après : on appelle les fonctions avec les paramètres courants explicitement,
  //         et on recalcule getHorizonHours() à l'intérieur de l'effet (pas de closure stale)
  useEffect(() => {
    const h = getHorizonHours();
    fetchHistory(selectedCategory, selectedZone);
    fetchPrediction(selectedCategory, selectedZone, h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedZone, quickHorizon, horizonMode]);
  // Note : fetchHistory et fetchPrediction sont stables (useCallback sans deps variables),
  //        getHorizonHours() est recalculé à chaque exécution de l'effet — pas de stale data.

  // ── Auto-refresh every 5 min ───────────────────────────────────────────────
  useEffect(() => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      const h = getHorizonHours();
      fetchHistory(selectedCategory, selectedZone);
      fetchPrediction(selectedCategory, selectedZone, h);
    }, 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedZone, quickHorizon, horizonMode, fetchHistory, fetchPrediction]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      predAbortRef.current?.abort();
      historyAbortRef.current?.abort();
      clearInterval(intervalRef.current);
    };
  }, []);

  // ── Build merged chart data ────────────────────────────────────────────────
  const chartData = React.useMemo(() => {
    const now = new Date();
    const histPoints = history.map(p => ({
      time:     p.timestamp,
      actual:   p.avg_value,
      forecast: null,
    }));

    if (!prediction?.predictions) return histPoints;

    const forecastPoints = Object.entries(prediction.predictions).map(([h, val]) => ({
      time:     new Date(now.getTime() + Number(h) * 3600000).toISOString(),
      actual:   null,
      forecast: val,
    }));

    if (histPoints.length > 0 && forecastPoints.length > 0) {
      const last = histPoints[histPoints.length - 1];
      forecastPoints.unshift({ time: last.time, actual: null, forecast: last.actual });
    }

    return [...histPoints, ...forecastPoints];
  }, [history, prediction]);

  const activeCategory = CATEGORIES.find(c => c.id === selectedCategory);
  const dangerScore    = prediction?.danger_score ?? 0;
  const currentAvg     = prediction?.current_avg ?? null;

  // BUG 3 FIX — On utilise le threshold retourné par le backend en priorité
  // pour que l'affichage frontend soit 100% cohérent avec le calcul du score
  const threshold      = prediction?.threshold ?? activeCategory?.threshold;
  const horizonHours   = getHorizonHours();
  const thresholdColor = dangerScore >= 80 ? '#EF4444' : dangerScore >= 50 ? '#F97316' : '#22C55E';

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleManualRefresh = () => {
    const h = getHorizonHours();
    fetchHistory(selectedCategory, selectedZone);
    fetchPrediction(selectedCategory, selectedZone, h);
  };

  const handleCategoryChange = (catId) => {
    // BUG 2 FIX — Reset immédiat de l'état avant que le useEffect ne se déclenche
    setHistory([]);
    setPrediction(null);
    setSelectedCategory(catId);
  };

  const handleZoneChange = (zoneId) => {
    // BUG 2 FIX — Même pattern pour le changement de zone
    setHistory([]);
    setPrediction(null);
    setSelectedZone(zoneId ? parseInt(zoneId) : null);
  };

  return (
    <div className="w-full mx-auto px-4 sm:px-6 py-6">

      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-20 bg-[#F8F9FB] py-2.5 -mx-4 sm:-mx-6 px-4 sm:px-6 border-b border-slate-200 shadow-sm mb-6">
        <div className="flex flex-wrap items-center gap-3">

          <button
            onClick={() => navigate('/mainlayout/analytics')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 font-semibold text-xs hover:border-[#17203f]/40 hover:text-[#17203f] transition-all"
          >
            <ArrowLeft size={13} />
            Analytiques
          </button>

          <div className="flex items-center gap-2">
            <Zap size={16} className="text-violet-600" />
            <h1 className="text-lg font-bold text-[#17203f] tracking-tight whitespace-nowrap">Prévision IA</h1>
          </div>

          {/* Horizon picker */}
          <div className="flex items-center gap-1.5 bg-white rounded-lg border border-slate-200 px-1 py-0.5">
            {HORIZON_OPTIONS.map(opt => (
              <button
                key={opt.label}
                onClick={() => { setHorizonMode('quick'); setQuickHorizon(opt.value); }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                  horizonMode === 'quick' && quickHorizon === opt.value
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
            <button
              onClick={() => setHorizonMode(horizonMode === 'custom' ? 'quick' : 'custom')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                horizonMode === 'custom'
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'text-slate-600 border-slate-200 hover:border-violet-400'
              }`}
            >
              <Calendar size={12} />
              Perso
            </button>
          </div>

          {/* Custom date input */}
          {horizonMode === 'custom' && (
            <div className="flex items-center gap-2 bg-white border border-violet-200 rounded-lg px-2 py-1">
              <span className="text-xs text-slate-500 whitespace-nowrap">Jusqu'à</span>
              <input
                type="datetime-local"
                value={customEnd}
                min={nowLocal()}
                onChange={e => setCustomEnd(e.target.value)}
                className="text-xs font-medium text-slate-700 outline-none bg-transparent cursor-pointer border border-slate-200 rounded px-2 py-0.5"
                style={{ fontSize: '11px' }}
              />
              <button
                onClick={() => { if (!customError) handleManualRefresh(); }}
                disabled={!!customError}
                className="px-2 py-0.5 bg-violet-600 text-white text-xs rounded-md font-medium disabled:opacity-40"
              >
                OK
              </button>
              {customError && <span className="text-xs text-red-500">{customError}</span>}
            </div>
          )}

          {/* Category selector — utilise handleCategoryChange (BUG 2 FIX) */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
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

          {/* Zone selector — utilise handleZoneChange (BUG 2 FIX) */}
          {zones.length > 0 && (
            <select
              className="bg-white border border-slate-200 px-2 py-1.5 rounded-lg text-xs font-medium text-slate-600 outline-none focus:border-violet-400 cursor-pointer"
              value={selectedZone || ''}
              onChange={e => handleZoneChange(e.target.value)}
            >
              <option value="" disabled>Choisir une zone</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.nom_zone}</option>)}
            </select>
          )}

          {/* Refresh + last refresh time */}
          <div className="ml-auto flex items-center gap-2">
            {lastRefresh && (
              <span className="text-xs text-slate-400 whitespace-nowrap">
                <Clock size={11} className="inline mr-1" />
                {lastRefresh.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={handleManualRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 text-xs font-medium hover:border-violet-400 hover:text-violet-600 transition-all"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
              Actualiser
            </button>
          </div>
        </div>
      </div>

      {/* ── KPI row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className={`rounded-2xl border p-4 ${
          dangerScore >= 80 ? 'bg-red-50 border-red-200' :
          dangerScore >= 50 ? 'bg-orange-50 border-orange-200' :
          'bg-emerald-50 border-emerald-200'
        }`}>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Score de danger</p>
          <p className={`text-3xl font-bold ${dangerScore >= 80 ? 'text-red-600' : dangerScore >= 50 ? 'text-orange-500' : 'text-emerald-600'}`}>
            {dangerScore}%
          </p>
          <DangerBadge score={dangerScore} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Valeur actuelle</p>
          <p className="text-3xl font-bold text-[#17203f]">
            {currentAvg !== null ? `${currentAvg}` : '—'}
            <span className="text-base font-medium text-slate-400 ml-1">{activeCategory?.unit}</span>
          </p>
          {/* BUG 3 FIX — Affiche le threshold du backend, pas la constante locale */}
          <p className="text-xs text-slate-400 mt-1">Seuil: {threshold} {activeCategory?.unit}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Horizon prédit</p>
          <p className="text-3xl font-bold text-violet-600">
            {horizonHours ? `${horizonHours}h` : '—'}
          </p>
          <p className="text-xs text-slate-400 mt-1">dans le futur</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pic prévu</p>
          {prediction?.predictions ? (() => {
            const vals   = Object.values(prediction.predictions);
            const peak   = Math.max(...vals);
            const isOver = peak >= threshold;
            return (
              <>
                <p className={`text-3xl font-bold ${isOver ? 'text-red-600' : 'text-[#17203f]'}`}>
                  {peak.toFixed(1)}
                  <span className="text-base font-medium text-slate-400 ml-1">{activeCategory?.unit}</span>
                </p>
                {isOver && <p className="text-xs text-red-500 mt-1 font-semibold">⚠ Dépasse le seuil</p>}
              </>
            );
          })() : <p className="text-3xl font-bold text-slate-300">—</p>}
        </div>
      </div>

      {/* ── Prediction chart ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="text-lg font-bold text-[#17203f]">
              Courbe historique + prévision — {selectedCategory}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Ligne pleine = données réelles · Ligne pointillée = prévision ML
            </p>
          </div>
          {prediction?.method === 'statistical_fallback' && (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 rounded-full px-3 py-1 font-medium">
              Mode statistique — précision limitée
            </span>
          )}
        </div>

        <div style={{ height: 360 }}>
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <RefreshCw className="animate-spin text-violet-400" size={28} />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="time"
                  tickFormatter={t => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  tick={{ fontSize: 11, fill: '#94a3b8' }}
                />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip content={<PredictionTooltip unit={activeCategory?.unit} threshold={threshold} />} />
                <Legend />
                {threshold && (
                  <ReferenceLine
                    y={threshold}
                    stroke={thresholdColor}
                    strokeDasharray="8 4"
                    strokeWidth={1.5}
                    label={{ value: `Seuil ${threshold}${activeCategory?.unit}`, position: 'insideTopRight', fontSize: 11, fill: thresholdColor }}
                  />
                )}
                <Line type="monotone" dataKey="actual"   stroke={activeCategory?.color} strokeWidth={2}   dot={false} connectNulls={false} name="Historique" />
                <Line type="monotone" dataKey="forecast" stroke="#7C3AED"               strokeWidth={2.5} strokeDasharray="6 3" dot={{ r: 4, fill: '#7C3AED', strokeWidth: 0 }} connectNulls={false} name="Prévision" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-2">
              <TrendingUp size={32} className="opacity-30" />
              <p className="text-sm">Aucune donnée disponible</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Forecast breakdown ── */}
      {prediction?.predictions && (
        <div className="mb-6">
          <h3 className="text-sm font-bold text-[#17203f] mb-3">Détail des prévisions par horizon</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Object.entries(prediction.predictions).map(([h, val]) => {
              const isOver    = val >= threshold;
              const isWarning = !isOver && val >= threshold * 0.85;
              return (
                <div key={h} className={`rounded-2xl border p-4 ${
                  isOver    ? 'bg-red-50 border-red-200' :
                  isWarning ? 'bg-orange-50 border-orange-200' :
                              'bg-white border-slate-200'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <Clock size={11} className="inline mr-1" />Dans {h}h
                    </span>
                    {isOver    && <AlertTriangle size={14} className="text-red-500" />}
                    {isWarning && <AlertTriangle size={14} className="text-orange-400" />}
                  </div>
                  <p className={`text-2xl font-bold ${isOver ? 'text-red-600' : isWarning ? 'text-orange-500' : 'text-[#17203f]'}`}>
                    {val.toFixed(2)}
                    <span className="text-sm font-medium text-slate-400 ml-1">{activeCategory?.unit}</span>
                  </p>
                  {isOver && <p className="text-xs text-red-600 font-semibold mt-1">+{(val - threshold).toFixed(2)}{activeCategory?.unit} au-dessus du seuil</p>}
                  {isWarning && <p className="text-xs text-orange-500 font-semibold mt-1">Approche du seuil ({Math.round((val / threshold) * 100)}%)</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── AI narrative ── */}
      {prediction?.narrative && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-violet-100 rounded-xl shrink-0">
              <Zap size={16} className="text-violet-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-violet-700 uppercase tracking-wider mb-1">Analyse IA — Ollama</p>
              <p className="text-sm text-slate-700 leading-relaxed">{prediction.narrative}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 text-right">
            Mise à jour: {lastRefresh ? lastRefresh.toLocaleTimeString() : '—'} · Actualisation auto toutes les 5 min
          </p>
        </div>
      )}
    </div>
  );
};

export default Prediction;
