import { AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, Activity, Wifi, Pencil, X, Check } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { origins } from '../pages/Managment';
import { useLiveSensorNumber } from '../stores/liveSensorStore';

// ── Edit Modal ────────────────────────────────────────────────────────────────
const TYPES   = ["Température", "Humidité", "Pression", "Qualité Air"];
const TYPE_KEYS = { "Température": "type_temperature", "Humidité": "type_humidity", "Pression": "type_pressure", "Qualité Air": "type_air_quality" };
const UNITES  = ["°C", "%", "bar", "ppm"];

function EditModal({ sensor, onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    code_unique:   sensor.code_unique,
    type_grandeur: sensor.type_grandeur,
    unite:         sensor.unite,
    adresse_ip:    sensor.adresse_ip,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async () => {
    if (!form.code_unique.trim() || !form.adresse_ip.trim()) {
      setError(t('sensor.error_required'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      const detail = e.response?.data?.detail;
setError(
    Array.isArray(detail)
        ? detail.map(d => d.msg).join(', ')
        : detail || t('sensor.error_save')
);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
            <Pencil className="text-blue-600 dark:text-blue-400" size={18} />
          </div>
          <div>
            <h2 className="text-base font-black text-slate-800 dark:text-white">{t('sensor.edit_sensor')}</h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">{sensor.code_unique}</p>
          </div>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sensor.unique_code')}</label>
            <input
              type="text"
              value={form.code_unique}
              onChange={e => setForm({ ...form, code_unique: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#334155] outline-none focus:ring-2 focus:ring-blue-400 text-sm font-mono dark:text-slate-200"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sensor.measurement_type')}</label>
            <select
              value={form.type_grandeur}
              onChange={e => setForm({ ...form, type_grandeur: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#334155] outline-none focus:ring-2 focus:ring-blue-400 text-sm cursor-pointer dark:text-slate-200"
            >
              {TYPES.map(type => <option key={type} value={type}>{t(TYPE_KEYS[type])}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sensor.unit')}</label>
            <select
              value={form.unite}
              onChange={e => setForm({ ...form, unite: e.target.value })}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#334155] outline-none focus:ring-2 focus:ring-blue-400 text-sm cursor-pointer dark:text-slate-200"
            >
              {UNITES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('sensor.ip_address')}</label>
            <input
              type="text"
              value={form.adresse_ip}
              onChange={e => setForm({ ...form, adresse_ip: e.target.value })}
              placeholder={t('sensor.ip_placeholder')}
              className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#334155] outline-none focus:ring-2 focus:ring-blue-400 text-sm font-mono dark:text-slate-200"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            {t('sensor.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
          >
            {saving
              ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <><Check size={14} /> {t('sensor.save')}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Live numeric value — only this tiny block re-renders on each 2s tick ──
function LiveSensorValue({ sensorCode, unit, seuilDanger, isActive, fallbackValue, fallbackPrevValue }) {
  const liveVal = useLiveSensorNumber(sensorCode);
  const prevLiveRef = useRef(null);
  const hasLive = liveVal !== null && liveVal !== undefined;

  useEffect(() => {
    if (hasLive) {
      prevLiveRef.current = liveVal;
    }
  }, [liveVal, hasLive]);

  const displayVal = hasLive ? liveVal : fallbackValue;
  const displayPrev = hasLive ? (prevLiveRef.current ?? displayVal) : fallbackPrevValue;
  const isDangerLive = isActive && displayVal >= seuilDanger;
  const isTrendingUp = displayVal >= displayPrev;
  const textColor = isDangerLive ? 'text-red-600' : 'text-slate-900 dark:text-white';

  return (
    <div className="flex items-baseline gap-1">
      <span className={`text-4xl font-bold font-mono tracking-tighter ${textColor}`}>
        {displayVal.toFixed(1)}
      </span>
      <span className="text-xs text-slate-500 font-semibold">{unit}</span>
      <span className={`ml-auto flex items-center text-xs font-bold ${isTrendingUp ? 'text-emerald-500' : 'text-blue-500'}`}>
        {isTrendingUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {Math.abs(displayVal - displayPrev).toFixed(1)}
      </span>
    </div>
  );
}

// ── Sensor Card ───────────────────────────────────────────────────────────────
const Sensor = ({ sensor: initialSensor, onToggle }) => {
  const [sensor, setSensor]           = useState(initialSensor);
  const { t } = useTranslation();
  const [lastTwo, setLastTwo]         = useState([]);
  const [menuOpen, setMenuOpen]       = useState(false);
  const [editOpen, setEditOpen]       = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState(0);

  // Sync if parent passes new sensor data
  useEffect(() => { setSensor(initialSensor); }, [initialSensor]);

  const getDynamicThreshold = (code) => {
    if (code.startsWith('TEMP')) return 30;
    if (code.startsWith('PRES')) return 4;
    if (code.startsWith('HUMI')) return 80;
    if (code.startsWith('CO2'))  return 900;
    return 50;
  };

  const seuilDanger = getDynamicThreshold(sensor.code_unique);
  const isActive    = sensor.is_activated;

  // Live data polling
  useEffect(() => {
    if (!isActive) { setLastTwo([]); return; }
    const fetchLastTwo = async () => {
      try {
        const res  = await axios.get(`${origins}/api/last-two/${sensor.code_unique}`);
        const data = res.data[sensor.code_unique] || [];
        setLastTwo(data);
      } catch (err) { console.error('Erreur fetch sensor data:', err); }
    };
    fetchLastTwo();
    const interval = setInterval(fetchLastTwo, 1000);
    return () => clearInterval(interval);
  }, [sensor.code_unique, isActive]);

  const currentValue  = lastTwo.length > 0 ? lastTwo[lastTwo.length - 1] : 0;
  const previousValue = lastTwo.length > 1 ? lastTwo[lastTwo.length - 2] : currentValue;
  const isDanger      = currentValue >= seuilDanger;
  const isTrendingUp  = currentValue >= previousValue;

  // Alert trigger
  useEffect(() => {
    const now = Date.now();
    if (isActive && isDanger && now - lastAlertTime > 10000) {
      const triggerAlert = async () => {
        if (isNaN(currentValue) || currentValue === null) return;
        try {
          await axios.post(`${origins}/api/alerts/trigger`, {
            capteur_code:  String(sensor.code_unique),
            valeur:        Number(currentValue.toFixed(1)),
            seuil_depasse: Number(seuilDanger),
            message:       t('sensor.alert_message', { type: sensor.type_grandeur, value: currentValue.toFixed(1), unit: sensor.unite }),
          });
          setLastAlertTime(Date.now());
        } catch (err) { console.error('Erreur alerte:', err.response?.data); }
      };
      triggerAlert();
    }
  }, [currentValue, isActive, isDanger, sensor, lastAlertTime, seuilDanger]);

  // Toggle activate/deactivate
  const handleToggle = async () => {
    try {
      await axios.patch(`${origins}/api/sensors/${sensor.id}/activate?activate=${!isActive}`);
      const updated = { ...sensor, is_activated: !isActive };
      setSensor(updated);
      onToggle(updated);
    } catch (err) { console.error(err); }
    setMenuOpen(false);
  };

  // Save edit
const handleSave = async (form) => {
    await axios.put(`${origins}/api/sensors/${sensor.id}`, {
        ...form,
        zone_id: sensor.zone_id,  // keep the existing zone
    });
    const updated = { ...sensor, ...form };
    setSensor(updated);
    onToggle(updated);
};
  const statusColors = isDanger
    ? { border: 'border-red-500', bg: 'bg-red-50/30 dark:bg-red-500/5', text: 'text-red-600', icon: 'text-red-500' }
    : { border: 'border-blue-500', bg: 'bg-white dark:bg-[#1e293b]',    text: 'text-slate-900 dark:text-white', icon: 'text-emerald-500' };

  return (
    <>
      <div className={`relative p-5 rounded-xl border-l-4 shadow-sm w-[220px] transition-all duration-300 hover:shadow-md
          ${statusColors.border} ${statusColors.bg} ${isActive ? '' : 'opacity-50 grayscale'}`}>

        {/* HEADER */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1 text-left">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight flex items-center gap-2">
              <Activity size={14} className="text-slate-400 dark:text-slate-500" />
              {sensor.type_grandeur}
            </h3>
            <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 mt-1">{sensor.code_unique}</p>
          </div>

          <div className="flex items-center gap-1">
            <div className={`${isDanger && isActive ? 'animate-pulse' : ''}`}>
              {isDanger
                ? <AlertTriangle size={18} className={statusColors.icon} />
                : <CheckCircle2  size={18} className={statusColors.icon} />
              }
            </div>

            {/* MENU */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-1 hover:bg-slate-200/50 dark:hover:bg-slate-700 rounded-full transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-20 overflow-hidden">
                    {/* Activate / Deactivate */}
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border-b border-slate-100 dark:border-slate-700 dark:text-slate-200"
                      onClick={handleToggle}
                    >
                      <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-400' : 'bg-emerald-400'}`} />
                      {isActive ? t('sensor.deactivate') : t('sensor.activate')}
                    </button>

                    {/* Modifier */}
                    <button
                      className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-xs font-semibold hover:bg-blue-50 dark:hover:bg-blue-500/10 text-blue-600 dark:text-blue-400 transition-colors"
                      onClick={() => { setMenuOpen(false); setEditOpen(true); }}
                    >
                      <Pencil size={12} />
                      {t('sensor.edit')}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* IP */}
        <div className="flex items-center gap-2 mb-4">
          <span className="flex items-center gap-1 text-[9px] bg-slate-100 dark:bg-[#334155] px-2 py-0.5 rounded text-slate-500 dark:text-slate-400 font-mono border border-slate-200 dark:border-slate-700">
            <Wifi size={10} />
            {sensor.adresse_ip}
          </span>
        </div>

        {/* VALUE — only this block re-renders on live data tick */}
        <LiveSensorValue
          sensorCode={sensor.code_unique}
          unit={sensor.unite}
          seuilDanger={seuilDanger}
          isActive={isActive}
          fallbackValue={lastTwo.length > 0 ? lastTwo[lastTwo.length - 1] : 0}
          fallbackPrevValue={previousValue}
        />

        {/* FOOTER */}
        <div className="mt-4 pt-3 border-t border-slate-100/50 dark:border-slate-700 flex justify-between items-center">
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{t('sensor.live')}</span>
          {isDanger && isActive && (
            <span className="text-[9px] font-black text-red-500 uppercase animate-bounce">
              {t('sensor.threshold', { seuil: seuilDanger, unit: sensor.unite })}
            </span>
          )}
        </div>
      </div>

      {/* EDIT MODAL */}
      {editOpen && (
        <EditModal
          sensor={sensor}
          onClose={() => setEditOpen(false)}
          onSave={handleSave}
        />
      )}
    </>
  );
};

export default Sensor;
