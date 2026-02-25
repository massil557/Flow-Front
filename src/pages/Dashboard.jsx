import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import IndustrialChart from '../components/IndustrialChart';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
// date adapters are required when using the time scale (hour/day/etc).
// install one with: npm install chartjs-adapter-date-fns
import 'chartjs-adapter-date-fns';
import { Thermometer, Gauge, Droplets, Wind } from 'lucide-react';
import { origins } from './Managment';

// global style for hiding scrollbars on graphs
const scrollStyles = `
  .chart-scroll::-webkit-scrollbar { display: none; }
  .chart-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

ChartJS.register(CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Filler);

const CATEGORIES = [
  { id: 'TEMP', label: 'Temperature', icon: Thermometer, color: '#2D5BFF', unit: '°C' },
  { id: 'PRES', label: 'Pressure', icon: Gauge, color: '#A855F7', unit: 'Bar' },
  { id: 'HUMI', label: 'Humidity', icon: Droplets, color: '#0EA5E9', unit: '%' },
  { id: 'CO2', label: 'CO2 Level', icon: Wind, color: '#22C55E', unit: 'ppm' },
];

// Composant: Carte de Catégorie Sélectionnable
const CategoryButton = ({ category, isActive, onSelect }) => {
  const Icon = category.icon;

  return (
    <button
      onClick={() => onSelect(category.id)}
     className={`shrink-0 px-6 h-[48px] rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer flex items-center gap-3 font-bold
  ${isActive
    ? 'bg-blue-500/10 text-blue-600 border-blue-500'
    : 'bg-white text-text-main border-slate-200 hover:border-blue-400  '
  }
`}

    >
      <Icon size={20} />
      <span className="whitespace-nowrap">{category.label}</span>
    </button>
  );
};

// Composant: Carte d'un Capteur Individuel
const SensorCard = ({ sensorKey, sensorData, categoryColor, categoryUnit, critMin, critMax }) => {
  if (!sensorData || sensorData.length === 0) return null;

  const latestValue = sensorData[sensorData.length - 1]?.v?.toFixed(1) || '0';

  // Convert to {x:Date, y:value} for chart - ensure proper types
  const chartData = sensorData.map(p => {
    const dateObj = p.t instanceof Date ? p.t : new Date(p.t);
    const numValue = typeof p.v === 'number' ? p.v : parseFloat(p.v);
    return { x: dateObj, y: numValue };
  });
  
  console.log(`🖼️ ${sensorKey}:`, chartData.length, 'points ready for chart');

  return (
    <div className="bg-white rounded-[2.5rem] p-6 shadow-fintech border border-slate-50 hover:shadow-fintech-lg transition-all duration-300">
      <style>{scrollStyles}</style>
      
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-text-main font-bold text-lg tracking-tight">{sensorKey}</h3>
        <div className="flex items-baseline gap-1 mt-2">
          <span className="text-3xl font-bold text-text-main">{latestValue}</span>
          <span className="text-sm text-text-sub font-medium">{categoryUnit}</span>
        </div>
      </div>

      {/* Graphique - FIXED HEIGHT */}
      <div className="w-full chart-scroll overflow-x-auto" style={{ height: '350px', background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
        <div style={{ width: `${Math.max(sensorData.length * 10, 600)}px`, height: '100%', display: 'block' }}>
          <IndustrialChart data={chartData} color={categoryColor} unit={categoryUnit} />
        </div>
      </div>
    </div>
  );
};

// Component Principal
export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('TEMP');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // metadata from backend
  const [sensorsMeta, setSensorsMeta] = useState([]);
  const [zones, setZones] = useState([]);
  const [zoneFilter, setZoneFilter] = useState(null);
  // 0 = all data, otherwise number of past hours to fetch
  // will convert from minutes selector below
  const [timeHours, setTimeHours] = useState(0);
  const [historyData, setHistoryData] = useState({});

  // critical bounds
  const CRIT_MIN = 0;
  const CRIT_MAX = 80; // could be tied to threshold

  // load sensor metadata and zone list once
  useEffect(() => {
    const loadMeta = async () => {
      try {
        const [sres, zres] = await Promise.all([
          axios.get(`${origins}/api/sensors`),
          axios.get(`${origins}/api/zones`),
        ]);
        setSensorsMeta(sres.data);
        setZones(zres.data);
      } catch (e) {
        console.error('Erreur chargement meta:', e);
      }
    };
    loadMeta();
  }, []);

  // fetch historical data whenever filters change
  useEffect(() => {
    const loadHistory = async () => {
      const filtered = sensorsMeta
        .filter(s => s.is_activated) // ignore deactivated sensors
        .filter(s =>
          s.code_unique.startsWith(activeCategory) &&
          (!zoneFilter || s.zone_id === zoneFilter)
        );
      console.log('loadHistory filtered sensors', filtered.map(s=>s.code_unique));
      const data = {};
      await Promise.all(
        filtered.map(async s => {
          try {
            let url = `${origins}/api/history/${s.id}`;
            if (timeHours > 0) {
              url += `?hours=${timeHours}`;
            }
            const res = await axios.get(url);
            console.log(`📊 API response for ${s.code_unique}:`, res.data.length, 'points');
            if (res.data[0]) console.log('First point:', res.data[0]);
            // convert time strings to Date objects for chartjs time scale
            let arr = res.data.map(p => ({
              t: new Date(p.time),
              v: p.valeur,
            }));
            console.log(`✅ Converted ${s.code_unique}:`, arr.length, 'points');
            // keep only most recent 500 points
            if (arr.length > 500) arr = arr.slice(-500);
            data[s.code_unique] = arr;
          } catch (err) {
            console.error('err history', err);
          }
        })
      );
      setHistoryData(data);
    };

    if (sensorsMeta.length) loadHistory();
  }, [activeCategory, zoneFilter, timeHours, sensorsMeta]);

  // Gestion du resize pour responsive
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Obtenir l'objet de catégorie actif
  const activeCategoryObj = CATEGORIES.find(c => c.id === activeCategory);

  // Filtrer les capteurs en fonction des métadonnées
  const filteredSensors = useMemo(() => {
    return Object.entries(historyData)
      .sort((a, b) => {
        const numA = parseInt(a[0].split('_')[1]) || 0;
        const numB = parseInt(b[0].split('_')[1]) || 0;
        return numA - numB;
      });
  }, [historyData]);

  return (
    <div className="space-y-8 pb-20 md:pb-0">
      {/* ===== HEADER & TITLE ===== */}
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-text-main mb-2">Sensor Dashboard</h1>
        <p className="text-text-sub font-medium">Historical data viewer</p>
      </div>
      {/* filters: category, zone, time range */}
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar md:pb-0 md:gap-4">
          {CATEGORIES.map(category => (
            <CategoryButton
              key={category.id}
              category={category}
              isActive={activeCategory === category.id}
              onSelect={setActiveCategory}
            />
          ))}
        </div>
        <select
          className="border p-2 rounded"
          value={zoneFilter || ''}
          onChange={e => setZoneFilter(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">Toutes les zones</option>
          {zones.map(z => (
            <option key={z.id} value={z.id}>{z.nom_zone}</option>
          ))}
        </select>
        <select
          className="border p-2 rounded"
          value={timeHours}
          onChange={e => setTimeHours(parseFloat(e.target.value))}
        >
          <option value={0}>All</option>
          {[5,10,30].map(min => (
            <option key={min} value={min/60}>{min} min</option>
          ))}
        </select>
      </div>

      {/* ===== SENSORS GRID - one per line ===== */}
      {filteredSensors.length > 0 ? (
        <div className="space-y-6">
          {filteredSensors.map(([sensorKey, sensorData]) => (
            <SensorCard
              key={sensorKey}
              sensorKey={sensorKey}
              sensorData={sensorData}
              categoryColor={activeCategoryObj.color}
              categoryUnit={activeCategoryObj.unit}
              critMin={CRIT_MIN}
              critMax={CRIT_MAX}
            />
          ))}
        </div>
      ) : (
        <div className="col-span-full bg-white rounded-[2.5rem] p-12 shadow-fintech border border-slate-50 text-center">
          <p className="text-text-sub text-lg font-medium">No sensor data available for {activeCategoryObj.label}</p>
        </div>
      )}

      {/* ===== STATS SUMMARY ===== */}
      {filteredSensors.length > 0 && (
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-fintech border border-slate-50">
          <h2 className="text-xl font-bold text-text-main mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const values = filteredSensors.map(([, data]) => data[data.length - 1]?.v || 0);
              const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
              const min = Math.min(...values).toFixed(1);
              const max = Math.max(...values).toFixed(1);

              return [
                { label: 'Average', value: avg },
                { label: 'Minimum', value: min },
                { label: 'Maximum', value: max },
                { label: 'Sensors', value: filteredSensors.length },
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 text-center"
                >
                  <p className="text-text-sub text-sm font-bold mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-main">{stat.value}</p>
                </div>
              ));
            })()}
          </div>
        </div>
      )}
    </div>
  );
}