// src/pages/Zone.jsx
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import Sensor from '../components/sensor';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { origins } from './Managment';
import { Activity, AlertTriangle, Plus, X, Check } from 'lucide-react';

const Zone = () => {
  const { t } = useTranslation();
  const [sensores, setSensores] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [zoneStats, setZoneStats] = useState(null);
  const [newSensor, setNewSensor] = useState({
    code_unique: '',
    type_grandeur: '',
    unite: '',
    adresse_ip: ''
  });

  const location = useLocation();
  const data = location.state;

  // Listes d'options pour les selects
  const typesOptions = ["Température", "Humidité", "Pression", "Qualité Air"];
  const unitesOptions = ["°C", "%", "bar", "ppm"];

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const response = await axios.get(`${origins}/api/sensors/zone/${data?.id}`);
        // Deduplicate by id to prevent React duplicate-key warnings
        const seen = new Set();
        const unique = response.data.filter(s => {
          if (seen.has(s.id)) return false;
          seen.add(s.id);
          return true;
        });
        setSensores(unique);
      } catch (error) {
        console.error('Erreur lors de la récupération des capteurs :', error);
      }
    }
    if (data?.id) fetchSensors();
  }, [data?.id]);

  // Fetch zone statistics
  useEffect(() => {
    const fetchZoneStats = async () => {
      if (!data?.id) return;
      try {
        const res = await axios.get(`${origins}/api/zones/${data.id}/stats`);
        setZoneStats(res.data);
      } catch (err) {
        console.error('Error fetching zone stats:', err);
      }
    };
    fetchZoneStats();
  }, [data?.id]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newSensor, zone_id: data.id };
      const res = await axios.post(`${origins}/api/sensors`, payload);
      setSensores(prev => [...prev, res.data]);
      setShowForm(false);
      setNewSensor({ code_unique: '', type_grandeur: '', unite: '', adresse_ip: '' });
      // Refresh zone stats after adding sensor
      const statsRes = await axios.get(`${origins}/api/zones/${data.id}/stats`);
      setZoneStats(statsRes.data);
    } catch (err) {
      console.error('Erreur création capteur', err);
    }
  };

  return (
    <div className="p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{t('zone.title', { name: data?.name })}</h1>
          <div className="flex gap-4 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                <Activity size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('zone.sensors')}</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{zoneStats?.sensor_count || 0}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">{t('zone.active_alerts')}</p>
                <p className={`text-sm font-bold ${zoneStats?.active_alerts > 0 ? 'text-amber-500' : 'text-green-500'}`}>
                  {zoneStats?.active_alerts || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          className="bg-blue-600 text-white px-5 py-2 rounded-xl hover:bg-blue-700 transition shadow-lg font-semibold flex items-center gap-2"
          onClick={() => setShowForm(true)}
        >
          <Plus size={16} />
          {t('zone.add_sensor')}
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-8 p-6 bg-slate-50 dark:bg-[#1e293b] border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm animate-in fade-in zoom-in duration-200">
          <h2 className="text-lg font-bold text-slate-700 dark:text-white mb-4">{t('zone.new_sensor')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <input
              required
              placeholder={t('zone.code_placeholder')}
              value={newSensor.code_unique}
              onChange={e => setNewSensor({ ...newSensor, code_unique: e.target.value })}
              className="border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg bg-white dark:bg-[#334155] dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />

            {/* SELECT POUR LE TYPE */}
            <select
              required
              value={newSensor.type_grandeur}
              onChange={e => setNewSensor({ ...newSensor, type_grandeur: e.target.value })}
              className="border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg bg-white dark:bg-[#334155] dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">{t('zone.type_label')}</option>
              {typesOptions.map(opt => <option key={opt} value={opt}>{t('categories.' + opt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '_'))}</option>)}
            </select>

            {/* SELECT POUR L'UNITÉ */}
            <select
              required
              value={newSensor.unite}
              onChange={e => setNewSensor({ ...newSensor, unite: e.target.value })}
              className="border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg bg-white dark:bg-[#334155] dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="">{t('zone.unit_label')}</option>
              {unitesOptions.map(opt => <option key={opt} value={opt}>{t('units.' + opt.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '_'))}</option>)}
            </select>

            <input
              required
              placeholder={t('zone.ip_placeholder')}
              value={newSensor.adresse_ip}
              onChange={e => setNewSensor({ ...newSensor, adresse_ip: e.target.value })}
              className="border border-slate-300 dark:border-slate-600 p-2.5 rounded-lg bg-white dark:bg-[#334155] dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="mt-6 flex gap-3">
            <button type="submit" className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-600 transition shadow-md flex items-center gap-2">
              <Check size={16} />
              {t('zone.create_sensor')}
            </button>
            <button
              type="button"
              className="bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-2 rounded-lg font-bold hover:bg-slate-300 dark:hover:bg-slate-600 transition flex items-center gap-2"
              onClick={() => setShowForm(false)}
            >
              <X size={16} />
              {t('zone.cancel')}
            </button>
          </div>
        </form>
      )}

      <div className='w-full overflow-hidden'>
        <div className='flex flex-wrap gap-6'>
          {sensores.map(sensor => (
            <Sensor 
              key={sensor.id} 
              sensor={sensor} 
              onToggle={async (updated) => {
                setSensores(prev => prev.map(s => s.id === updated.id ? updated : s));
                // Refresh zone stats after toggling sensor
                const statsRes = await axios.get(`${origins}/api/zones/${data.id}/stats`);
                setZoneStats(statsRes.data);
              }} 
            />
          ))}
          
          {sensores.length === 0 && (
            <div className="w-full text-center py-20 bg-slate-50 dark:bg-[#1e293b] border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl">
              <p className="text-slate-400 dark:text-slate-500 font-medium">{t('zone.empty')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Zone;