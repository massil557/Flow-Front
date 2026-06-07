// src/pages/ServerStatus.jsx
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { origins } from './Managment';
import { useTranslation } from 'react-i18next';
import {
  Server, Cpu, HardDrive, Database, Zap, Activity,
  RefreshCw, Clock, CheckCircle, XCircle, AlertTriangle,
  Wifi, WifiOff, MemoryStick
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getColorByPercent(pct) {
  if (pct >= 90) return { bar: 'bg-red-500',    text: 'text-red-600',    badge: 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400'    };
  if (pct >= 70) return { bar: 'bg-orange-400', text: 'text-orange-500', badge: 'bg-orange-50 dark:bg-orange-500/10 border-orange-200 dark:border-orange-500/30 text-orange-700 dark:text-orange-400' };
  return               { bar: 'bg-emerald-500', text: 'text-emerald-600', badge: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400' };
}

function StatusDot({ ok, label }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
      ok
        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
        : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400'
    }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
      {label}
    </span>
  );
}

// ── Gauge circulaire SVG ──────────────────────────────────────────────────────

function CircleGauge({ percent, label, sublabel, size = 120 }) {
  const colors = getColorByPercent(percent);
  const r      = 44;
  const circ   = 2 * Math.PI * r;
  const filled = (percent / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {/* Track */}
        <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" className="dark:opacity-30" strokeWidth="8" />
        {/* Fill */}
        <circle
          cx="50" cy="50" r={r}
          fill="none"
          stroke={percent >= 90 ? '#ef4444' : percent >= 70 ? '#f97316' : '#10b981'}
          strokeWidth="8"
          strokeDasharray={`${filled} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
        {/* Text */}
        <text x="50" y="46" textAnchor="middle" fontSize="18" fontWeight="bold" className="fill-slate-800 dark:fill-white">
          {percent}%
        </text>
        <text x="50" y="62" textAnchor="middle" fontSize="9" fill="#94a3b8">
          {label}
        </text>
      </svg>
        {sublabel && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium text-center">{sublabel}</p>}
    </div>
  );
}

// ── Barre de progression ──────────────────────────────────────────────────────

function ProgressBar({ percent }) {
  const colors = getColorByPercent(percent);
  return (
    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
        style={{ width: `${Math.min(percent, 100)}%` }}
      />
    </div>
  );
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, color = 'text-[#17203f] dark:text-white', bg = 'bg-white dark:bg-[#1e293b]' }) {
  return (
    <div className={`${bg} rounded-2xl border border-slate-200 dark:border-slate-700 p-4`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{label}</p>
        <Icon size={16} className="text-slate-300 dark:text-slate-600" />
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{sub}</p>}
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function ServerStatus() {
  const { t } = useTranslation();
  const [data,     setData]     = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [lastFetch, setLastFetch] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetch = useCallback(async () => {
    try {
      const res = await axios.get(`${origins}/api/server-status`);
      setData(res.data);
      setLastFetch(new Date());
      setError(null);
    } catch (err) {
      setError(t('server_status.connection_error'));
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial + polling 10s
  useEffect(() => {
    fetch();
    if (!autoRefresh) return;
    const id = setInterval(fetch, 10000);
    return () => clearInterval(id);
  }, [fetch, autoRefresh]);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#17203f] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
      <XCircle size={48} className="text-red-400" />
      <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{t('server_status.unreachable')}</p>
      <p className="text-sm text-slate-400 dark:text-slate-500">{error}</p>
      <button onClick={fetch} className="px-5 py-2 bg-[#17203f] text-white rounded-xl text-sm font-semibold">
        {t('server_status.retry')}
      </button>
    </div>
  );

  const { cpu, ram, disk, database, ollama, opcua, data: stats, uptime, timestamp } = data;

  const dbOk     = database.status === 'ok';
  const ollamaOk = ollama.status === 'online';
  const opcuaOk  = opcua.status === 'active';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#17203f] dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
              <Server className="text-indigo-600 dark:text-indigo-400" size={20} />
            </div>
            {t('server_status.title')}
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1 flex items-center gap-2">
            <Clock size={13} />
            {t('server_status.last_update')} {lastFetch?.toLocaleTimeString() ?? '—'}
            <span className="text-slate-300 dark:text-slate-600">·</span>
            {t('server_status.uptime')} <span className="font-semibold text-slate-600 dark:text-slate-300">{uptime}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-refresh toggle */}
          <button
            onClick={() => setAutoRefresh(v => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold transition-all ${
              autoRefresh
                ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                : 'bg-slate-50 dark:bg-[#334155] border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            {autoRefresh ? t('server_status.auto_refresh') : t('server_status.manual_refresh')}
          </button>

          <button
            onClick={fetch}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl hover:border-[#17203f]/40 transition-all"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            {t('server_status.refresh')}
          </button>
        </div>
      </div>

      {/* ── Statuts des services ── */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-5 mb-6">
        <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-4">{t('server_status.services')}</p>
        <div className="flex flex-wrap gap-4 items-center">

          <div className="flex items-center gap-3">
            <Database size={18} className={dbOk ? 'text-emerald-500' : 'text-red-500'} />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('server_status.postgresql')}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusDot ok={dbOk} label={dbOk ? t('server_status.connected') : t('server_status.error')} />
                {dbOk && database.latency_ms !== null && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">{database.latency_ms} ms</span>
                )}
              </div>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-100 dark:bg-slate-700" />

          <div className="flex items-center gap-3">
            <Zap size={18} className={ollamaOk ? 'text-violet-500' : 'text-slate-400 dark:text-slate-600'} />
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('server_status.ollama')}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusDot ok={ollamaOk} label={ollamaOk ? t('server_status.online') : t('server_status.offline')} />
                {ollamaOk && ollama.model && (
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-mono">{ollama.model}</span>
                )}
              </div>
            </div>
          </div>

          <div className="w-px h-10 bg-slate-100 dark:bg-slate-700" />

          <div className="flex items-center gap-3">
            {opcuaOk ? <Wifi size={18} className="text-blue-500" /> : <WifiOff size={18} className="text-slate-400 dark:text-slate-600" />}
            <div>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('server_status.opcua')}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusDot ok={opcuaOk} label={
                  opcua.status === 'active'  ? t('server_status.active')   :
                  opcua.status === 'waiting' ? t('server_status.pending') : t('server_status.unknown')
                } />
                {opcuaOk && (
                  <span className="text-xs text-slate-400 dark:text-slate-500">{t('server_status.active_feeds', { count: opcua.active_feeds })}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DB version */}
        {database.version && (
          <p className="text-xs text-slate-300 dark:text-slate-600 mt-4 font-mono">{database.version}</p>
        )}
      </div>

      {/* ── Jauges CPU / RAM / Disque ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">

        {/* CPU */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 self-start">
            <Cpu size={16} className="text-slate-400 dark:text-slate-500" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('server_status.processor')}</p>
          </div>
          <CircleGauge
            percent={cpu.percent}
            label={t('server_status.cpu_label')}
            sublabel={cpu.freq_mhz ? t('server_status.cpu_detail', { cores: cpu.cores, freq: cpu.freq_mhz }) : t('server_status.cpu_detail', { cores: cpu.cores, freq: '' }).replace(' ·  MHz', '')}
          />
          <ProgressBar percent={cpu.percent} />
          <p className={`text-lg font-bold ${getColorByPercent(cpu.percent).text}`}>
            {t('server_status.usage_percent', { percent: cpu.percent })}
          </p>
        </div>

        {/* RAM */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 self-start">
            <MemoryStick size={16} className="text-slate-400 dark:text-slate-500" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('server_status.memory_ram')}</p>
          </div>
          <CircleGauge
            percent={ram.percent}
            label={t('server_status.ram_label')}
            sublabel={t('server_status.ram_detail', { used: ram.used_gb, total: ram.total_gb })}
          />
          <ProgressBar percent={ram.percent} />
          <p className={`text-lg font-bold ${getColorByPercent(ram.percent).text}`}>
            {t('server_status.usage_percent', { percent: ram.percent })}
          </p>
        </div>

        {/* Disque */}
        <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 self-start">
            <HardDrive size={16} className="text-slate-400 dark:text-slate-500" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{t('server_status.disk_caption')}</p>
          </div>
          <CircleGauge
            percent={disk.percent}
            label={t('server_status.disk_label')}
            sublabel={t('server_status.disk_detail', { used: disk.used_gb, total: disk.total_gb })}
          />
          <ProgressBar percent={disk.percent} />
          <p className={`text-lg font-bold ${getColorByPercent(disk.percent).text}`}>
            {t('server_status.usage_percent', { percent: disk.percent })}
          </p>
        </div>
      </div>

      {/* ── Compteurs BDD ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard
          icon={Activity}
          label={t('server_status.total_sensors')}
          value={stats.sensors_total}
          color="text-[#17203f]"
        />
        <KpiCard
          icon={CheckCircle}
          label={t('server_status.active_sensors')}
          value={stats.sensors_active}
          color="text-emerald-600"
          bg="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <KpiCard
          icon={Database}
          label={t('server_status.total_measurements')}
          value={stats.measures_total?.toLocaleString()}
          color="text-blue-600"
        />
        <KpiCard
          icon={AlertTriangle}
          label={t('server_status.active_alerts')}
          value={stats.alerts_active}
          color={stats.alerts_active > 0 ? 'text-red-600' : 'text-emerald-600'}
          bg={stats.alerts_active > 0 ? 'bg-red-50 dark:bg-red-500/10' : 'bg-white dark:bg-[#1e293b]'}
        />
        <KpiCard
          icon={Clock}
          label={t('server_status.last_measurement')}
          value={stats.last_measure_at ? stats.last_measure_at.split(' ')[1] : '—'}
          sub={stats.last_measure_at ? stats.last_measure_at.split(' ')[0] : t('server_status.no_data')}
          color="text-slate-700 dark:text-slate-200"
        />
      </div>

    </div>
  );
}
