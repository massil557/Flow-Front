
// // import React, { useState, useEffect, useMemo } from 'react';
// // import axios from 'axios';
// // import IndustrialChart from '../components/IndustrialChart';
// // import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
// // import 'chartjs-adapter-date-fns';
// // import { Thermometer, Gauge, Droplets, Wind } from 'lucide-react';
// // import { origins } from './Managment';

// // const scrollStyles = `
// //   .chart-scroll::-webkit-scrollbar { display: none; }
// //   .chart-scroll { -ms-overflow-style: none; scrollbar-width: none; }
// // `;

// // // Added 'crit' values for the constant function line
// // const CATEGORIES = [
// //   { id: 'TEMP', label: 'Temperature', icon: Thermometer, color: '#2D5BFF', unit: '°C', crit: 30 },
// //   { id: 'PRES', label: 'Pressure', icon: Gauge, color: '#A855F7', unit: 'Bar', crit: 4 },
// //   { id: 'HUMI', label: 'Humidity', icon: Droplets, color: '#0EA5E9', unit: '%', crit: 80 },
// //   { id: 'CO2', label: 'CO2 Level', icon: Wind, color: '#22C55E', unit: 'ppm', crit: 900 },
// // ];

// // const CategoryButton = ({ category, isActive, onSelect }) => {
// //   const Icon = category.icon;
// //   return (
// //     <button
// //       onClick={() => onSelect(category.id)}
// //       className={`shrink-0 px-6 h-[48px] rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer flex items-center gap-3 font-bold
// //       ${isActive ? 'bg-blue-500/10 text-blue-600 border-blue-500' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'}`}
// //     >
// //       <Icon size={20} />
// //       <span className="whitespace-nowrap">{category.label}</span>
// //     </button>
// //   );
// // };

// // const SensorCard = ({ sensorKey, sensorData, categoryColor, categoryUnit, critValue }) => {
// //   const [loadingReport, setLoadingReport] = useState(false);
// //   if (!sensorData || sensorData.length === 0) return null;

// //   const latestValue = sensorData[sensorData.length - 1]?.v?.toFixed(1) || '0';
// //   const chartData = sensorData.map(p => ({
// //     x: p.t instanceof Date ? p.t : new Date(p.t),
// //     y: typeof p.v === 'number' ? p.v : parseFloat(p.v)
// //   }));

// //   const handleGenerateReport = async () => {
// //     setLoadingReport(true);
// //     try {
// //       const payload = chartData.map(d => ({ x: d.x.toISOString(), y: d.y }));
// //       const resp = await fetch(`${origins}/generate-report`, {
// //         method: 'POST',
// //         headers: { 'Content-Type': 'application/json' },
// //         body: JSON.stringify({ data: payload, sensor: sensorKey }),
// //       });
// //       const blob = await resp.blob();
// //       const url = window.URL.createObjectURL(blob);
// //       const a = document.createElement('a');
// //       a.href = url;
// //       a.download = `${sensorKey}_Report.pdf`;
// //       a.click();
      
// //       // 1. Professional Message for Outlook
// //       setTimeout(() => {
// //         const subject = encodeURIComponent(`Industrial Monitoring Report: ${sensorKey}`);
// //         const body = encodeURIComponent(
// //           `Dear Team,\n\nPlease find the system-generated analytical report for Sensor ${sensorKey} attached.\n\n` +
// //           `Summary:\n` +
// //           `• Current Value: ${latestValue}${categoryUnit}\n` +
// //           `• Threshold Limit: ${critValue}${categoryUnit}\n` +
// //           `• Timestamp: ${new Date().toLocaleString()}\n\n` +
// //           `Note: Please manually attach the downloaded PDF to this email.\n\n` +
// //           `Best Regards,\nOperations Monitoring System`
// //         );
// //         window.location.href = `mailto:?subject=${subject}&body=${body}`;
// //       }, 1000);

// //     } catch (e) {
// //       alert('Report failed');
// //     } finally {
// //       setLoadingReport(false);
// //     }
// //   };

// //   return (
// //     <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-slate-50 relative overflow-hidden">
// //       <style>{scrollStyles}</style>
// //       <div className="flex items-center gap-6 mb-6">
// //         <button
// //           onClick={handleGenerateReport}
// //           disabled={loadingReport}
// //           className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow hover:bg-blue-700 disabled:bg-slate-300 transition-all shrink-0"
// //         >
// //           {loadingReport ? '...' : 'Generate Report'}
// //         </button>
// //         <div>
// //           <h3 className="text-slate-800 font-bold text-lg leading-tight">{sensorKey}</h3>
// //           <div className="flex items-baseline gap-1">
// //             <span className="text-2xl font-bold text-slate-900">{latestValue}</span>
// //             <span className="text-xs text-slate-400 font-medium">{categoryUnit}</span>
// //           </div>
// //         </div>
// //       </div>

// //       <div className="w-full chart-scroll overflow-x-auto overflow-y-hidden" style={{ height: '350px', background: '#fafafa', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
// //         <div style={{ width: `${Math.max(sensorData.length * 10, 800)}px`, height: '100%' }}>
// //           <IndustrialChart 
// //             data={chartData} 
// //             color={categoryColor} 
// //             unit={categoryUnit} 
// //             critValue={critValue} 
// //           />
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // export default function Dashboard() {
// //   const [activeCategory, setActiveCategory] = useState('TEMP');
// //   const [sensorsMeta, setSensorsMeta] = useState([]);
// //   const [zones, setZones] = useState([]);
// //   const [zoneFilter, setZoneFilter] = useState(null);
// //   const [timeHours, setTimeHours] = useState(0);
// //   const [historyData, setHistoryData] = useState({});

// //   useEffect(() => {
// //     const loadMeta = async () => {
// //       try {
// //         const [sres, zres] = await Promise.all([
// //           axios.get(`${origins}/api/sensors`),
// //           axios.get(`${origins}/api/zones`),
// //         ]);
// //         setSensorsMeta(sres.data);
// //         setZones(zres.data);
// //       } catch (e) { console.error(e); }
// //     };
// //     loadMeta();
// //   }, []);

// //   useEffect(() => {
// //     const loadHistory = async () => {
// //       const filtered = sensorsMeta.filter(s => 
// //         s.is_activated && s.code_unique.startsWith(activeCategory) && (!zoneFilter || s.zone_id === zoneFilter)
// //       );
// //       const data = {};
// //       await Promise.all(filtered.map(async s => {
// //         try {
// //           const res = await axios.get(`${origins}/api/history/${s.id}${timeHours > 0 ? `?hours=${timeHours}` : ''}`);
// //           data[s.code_unique] = res.data.map(p => ({ t: new Date(p.time), v: p.valeur })).slice(-500);
// //         } catch (err) { console.error(err); }
// //       }));
// //       setHistoryData(data);
// //     };
// //     if (sensorsMeta.length) loadHistory();
// //   }, [activeCategory, zoneFilter, timeHours, sensorsMeta]);

// //   const activeCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
// //   const filteredSensors = useMemo(() => Object.entries(historyData).sort((a,b) => a[0].localeCompare(b[0])), [historyData]);

// //   return (
// //     <div className="space-y-8 p-6">
// //       <h1 className="text-3xl font-bold text-slate-900 mb-2">Sensor Dashboard</h1>

// //       <div className="flex flex-wrap items-center gap-4 mb-4">
// //         <div className="flex gap-3 overflow-x-auto no-scrollbar">
// //           {CATEGORIES.map(category => (
// //             <CategoryButton key={category.id} category={category} isActive={activeCategory === category.id} onSelect={setActiveCategory} />
// //           ))}
// //         </div>
        
// //         <select className="border p-2 rounded bg-white" value={zoneFilter || ''} onChange={e => setZoneFilter(e.target.value ? parseInt(e.target.value) : null)}>
// //           <option value="">Toutes les zones</option>
// //           {zones.map(z => <option key={z.id} value={z.id}>{z.nom_zone}</option>)}
// //         </select>

// //         <select className="border p-2 rounded bg-white" value={timeHours} onChange={e => setTimeHours(parseFloat(e.target.value))}>
// //           <option value={0}>All</option>
// //           <option value={5/60}>5 min</option>
// //           <option value={10/60}>10 min</option>
// //           <option value={30/60}>30 min</option>
// //         </select>
// //       </div>

// //       <div className="space-y-6">
// //         {filteredSensors.map(([key, data]) => (
// //           <SensorCard 
// //             key={key} 
// //             sensorKey={key} 
// //             sensorData={data} 
// //             categoryColor={activeCategoryObj.color} 
// //             categoryUnit={activeCategoryObj.unit}
// //             critValue={activeCategoryObj.crit}
// //           />
// //         ))}
// //       </div>
// //     </div>
// //   );
// // }








// import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
// import IndustrialChart from '../components/IndustrialChart';
// import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
// import 'chartjs-adapter-date-fns';
// import { Thermometer, Gauge, Droplets, Wind, Clock } from 'lucide-react';
// import { origins } from './Managment';

// const scrollStyles = `
//   .chart-scroll::-webkit-scrollbar { display: none; }
//   .chart-scroll { -ms-overflow-style: none; scrollbar-width: none; }
// `;

// const CATEGORIES = [
//   { id: 'TEMP', label: 'Temperature', icon: Thermometer, color: '#2D5BFF', unit: '°C', crit: 30 },
//   { id: 'PRES', label: 'Pressure', icon: Gauge, color: '#A855F7', unit: 'Bar', crit: 4 },
//   { id: 'HUMI', label: 'Humidity', icon: Droplets, color: '#0EA5E9', unit: '%', crit: 80 },
//   { id: 'CO2', label: 'CO2 Level', icon: Wind, color: '#22C55E', unit: 'ppm', crit: 900 },
// ];

// const TIME_OPTIONS = [
//   { label: '5 min', value: 5/60 },
//   { label: '30 min', value: 0.5 },
//   { label: '1h', value: 1 },
//   { label: '24h', value: 24 },
// ];

// const CategoryButton = ({ category, isActive, onSelect }) => {
//   const Icon = category.icon;
//   return (
//     <button
//       onClick={() => onSelect(category.id)}
//       className={`shrink-0 px-6 h-[48px] rounded-[2.5rem] border-2 transition-all duration-300 cursor-pointer flex items-center gap-3 font-bold
//       ${isActive ? 'bg-blue-500/10 text-blue-600 border-blue-500' : 'bg-white text-slate-700 border-slate-200 hover:border-blue-400'}`}
//     >
//       <Icon size={20} />
//       <span className="whitespace-nowrap">{category.label}</span>
//     </button>
//   );
// };

// const SensorCard = ({ sensorKey, sensorData, categoryColor, categoryUnit, critValue }) => {
//   const [loadingReport, setLoadingReport] = useState(false);
//   if (!sensorData || sensorData.length === 0) return null;

//   const latestValue = sensorData[sensorData.length - 1]?.v?.toFixed(1) || '0';
//   const chartData = sensorData.map(p => ({
//     x: p.t instanceof Date ? p.t : new Date(p.t),
//     y: typeof p.v === 'number' ? p.v : parseFloat(p.v)
//   }));

//   const handleGenerateReport = async () => {
//   setLoadingReport(true);
//   try {
//     // Construction du payload dynamique selon ton modèle Pydantic
//     const payload = {
//       sensor_name: sensorKey,
//       threshold: critValue, // Envoie 30 pour TEMP, 4 pour PRES, etc.
//       data: chartData.map(d => ({ 
//         x: d.x.toISOString(), 
//         y: d.y 
//       }))
//     };

//     const resp = await fetch(`${origins}/generate-report`, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });

//     if (!resp.ok) throw new Error('Erreur serveur');

//     const blob = await resp.blob();
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `Rapport_IA_${sensorKey}.pdf`;
//     a.click();
    
//     // Notification mail (Outlook) avec les données dynamiques
//     setTimeout(() => {
//       const subject = encodeURIComponent(`Rapport Industriel : ${sensorKey}`);
//       const body = encodeURIComponent(
//         `Bonjour,\n\nVoici l'analyse IA pour le capteur ${sensorKey}.\n\n` +
//         `Dernière valeur : ${latestValue}${categoryUnit}\n` +
//         `Seuil critique : ${critValue}${categoryUnit}\n\n` +
//         `Cordialement,\nSystème de Monitoring IoT`
//       );
//       window.location.href = `mailto:?subject=${subject}&body=${body}`;
//     }, 1000);

//   } catch (e) {
//     console.error(e);
//     alert("Échec de la génération du rapport dynamique.");
//   } finally {
//     setLoadingReport(false);
//   }
// };

//   return (
//     <div className="bg-white rounded-[2.5rem] p-6 shadow-md border border-slate-50 relative overflow-hidden mb-6">
//       <style>{scrollStyles}</style>
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-4">
//           <div className="p-3 bg-slate-50 rounded-2xl">
//             <h3 className="text-slate-800 font-bold text-lg">{sensorKey}</h3>
//           </div>
//           <div>
//             <span className="text-2xl font-bold text-slate-900">{latestValue}</span>
//             <span className="text-xs text-slate-400 font-medium ml-1">{categoryUnit}</span>
//           </div>
//         </div>
        
//         <button
//           onClick={handleGenerateReport}
//           disabled={loadingReport}
//           className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-blue-600 disabled:bg-slate-300 transition-all flex items-center gap-2"
//         >
//           {loadingReport ? 'Analyzing...' : 'AI Report & Email'}
//         </button>
//       </div>

//       <div className="w-full chart-scroll overflow-x-auto overflow-y-hidden rounded-3xl border border-slate-100 bg-slate-50/30" style={{ height: '350px' }}>
//         <div style={{ width: `${Math.max(sensorData.length * 10, 800)}px`, height: '100%' }}>
//           <IndustrialChart 
//             data={chartData} 
//             color={categoryColor} 
//             unit={categoryUnit} 
//             critValue={critValue} 
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default function Dashboard() {
//   const [activeCategory, setActiveCategory] = useState('TEMP');
//   const [sensorsMeta, setSensorsMeta] = useState([]);
//   const [zones, setZones] = useState([]);
//   const [zoneFilter, setZoneFilter] = useState(null);
//   const [timeHours, setTimeHours] = useState(1); // Default 1h
//   const [historyData, setHistoryData] = useState({});

//   useEffect(() => {
//     const loadMeta = async () => {
//       try {
//         const [sres, zres] = await Promise.all([
//           axios.get(`${origins}/api/sensors`),
//           axios.get(`${origins}/api/zones`),
//         ]);
//         setSensorsMeta(sres.data);
//         setZones(zres.data);
//       } catch (e) { console.error(e); }
//     };
//     loadMeta();
//   }, []);

//   useEffect(() => {
//     const loadHistory = async () => {
//       const filtered = sensorsMeta.filter(s => 
//         s.code_unique.startsWith(activeCategory) && (!zoneFilter || s.zone_id === zoneFilter)
//       );
//       const data = {};
//       await Promise.all(filtered.map(async s => {
//         try {
//           const res = await axios.get(`${origins}/api/history/${s.id}?hours=${timeHours}`);
//           data[s.code_unique] = res.data.map(p => ({ t: new Date(p.time), v: p.valeur }));
//         } catch (err) { console.error(err); }
//       }));
//       setHistoryData(data);
//     };
//     if (sensorsMeta.length) loadHistory();
//   }, [activeCategory, zoneFilter, timeHours, sensorsMeta]);

//   const activeCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
//   const filteredSensors = Object.entries(historyData).sort((a,b) => a[0].localeCompare(b[0]));

//   return (
//     <div className="p-8 max-w-7xl mx-auto">
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
//         <div>
//           <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Metrics</h1>
//           <p className="text-slate-500 font-medium">Real-time industrial monitoring</p>
//         </div>

//         {/* TIME FILTER DESIGN */}
//         <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
//           {TIME_OPTIONS.map(opt => (
//             <button
//               key={opt.label}
//               onClick={() => setTimeHours(opt.value)}
//               className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
//                 timeHours === opt.value 
//                 ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
//                 : 'text-slate-400 hover:text-slate-600'
//               }`}
//             >
//               {opt.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       <div className="flex flex-wrap items-center gap-4 mb-10">
//         <div className="flex gap-3 overflow-x-auto no-scrollbar">
//           {CATEGORIES.map(category => (
//             <CategoryButton key={category.id} category={category} isActive={activeCategory === category.id} onSelect={setActiveCategory} />
//           ))}
//         </div>
        
//         <select 
//           className="bg-white border-2 border-slate-100 p-2.5 px-4 rounded-2xl font-bold text-slate-600 outline-none focus:border-blue-500 transition-all cursor-pointer" 
//           value={zoneFilter || ''} 
//           onChange={e => setZoneFilter(e.target.value ? parseInt(e.target.value) : null)}
//         >
//           <option value="">All Zones</option>
//           {zones.map(z => <option key={z.id} value={z.id}>{z.nom_zone}</option>)}
//         </select>
//       </div>

//       <div className="space-y-4">
//         {filteredSensors.map(([key, data]) => (
//           <SensorCard 
//             key={key} 
//             sensorKey={key} 
//             sensorData={data} 
//             categoryColor={activeCategoryObj.color} 
//             categoryUnit={activeCategoryObj.unit}
//             critValue={activeCategoryObj.crit}
//           />
//         ))}
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import IndustrialChart from '../components/IndustrialChart';
import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Tooltip, Filler } from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Thermometer, Gauge, Droplets, Wind, Clock } from 'lucide-react';
import { origins } from './Managment';

const scrollStyles = `
  .chart-scroll::-webkit-scrollbar { display: none; }
  .chart-scroll { -ms-overflow-style: none; scrollbar-width: none; }
`;

// 1. MODIFICATION ICI : Ajout de la propriété "type" pour correspondre à ta base de données
const CATEGORIES = [
  { id: 'TEMP', label: 'Temperature', icon: Thermometer, color: '#2D5BFF', unit: '°C', crit: 30, type: 'Température' },
  { id: 'PRES', label: 'Pressure', icon: Gauge, color: '#A855F7', unit: 'Bar', crit: 4, type: 'Pression' },
  { id: 'HUMI', label: 'Humidity', icon: Droplets, color: '#0EA5E9', unit: '%', crit: 80, type: 'Humidité' },
  { id: 'CO2', label: 'CO2 Level', icon: Wind, color: '#22C55E', unit: 'ppm', crit: 900, type: 'Qualité Air' },
];

const TIME_OPTIONS = [
  { label: '5 min', value: 5/60 },
  { label: '30 min', value: 0.5 },
  { label: '1h', value: 1 },
  { label: '2h', value: 2 },
];

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

const SensorCard = ({ sensorKey, sensorData, categoryColor, categoryUnit, critValue }) => {
  const [loadingReport, setLoadingReport] = useState(false);
  if (!sensorData || sensorData.length === 0) return null;

  const latestValue = sensorData[sensorData.length - 1]?.v?.toFixed(1) || '0';
  const chartData = sensorData.map(p => ({
    x: p.t instanceof Date ? p.t : new Date(p.t),
    y: typeof p.v === 'number' ? p.v : parseFloat(p.v)
  }));

  const handleGenerateReport = async () => {
  setLoadingReport(true);
  try {
    const payload = {
      sensor_name: sensorKey,
      threshold: critValue,
      data: chartData.map(d => ({ 
        x: d.x.toISOString(), 
        y: d.y 
      }))
    };

    const resp = await fetch(`${origins}/generate-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) throw new Error('Erreur serveur');

    const blob = await resp.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Rapport_IA_${sensorKey}.pdf`;
    a.click();
    
    setTimeout(() => {
      const subject = encodeURIComponent(`Rapport Industriel : ${sensorKey}`);
      const body = encodeURIComponent(
        `Bonjour,\n\nVoici l'analyse IA pour le capteur ${sensorKey}.\n\n` +
        `Dernière valeur : ${latestValue}${categoryUnit}\n` +
        `Seuil critique : ${critValue}${categoryUnit}\n\n` +
        `Cordialement,\nSystème de Monitoring IoT`
      );
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    }, 1000);

  } catch (e) {
    console.error(e);
    alert("Échec de la génération du rapport dynamique.");
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
          {loadingReport ? 'Analyzing...' : 'AI Report & Email'}
        </button>
      </div>

      <div className="w-full chart-scroll overflow-x-auto overflow-y-hidden rounded-3xl border border-slate-100 bg-slate-50/30" style={{ height: '350px' }}>
        <div style={{ width: `${Math.max(sensorData.length * 10, 800)}px`, height: '100%' }}>
          <IndustrialChart 
            data={chartData} 
            color={categoryColor} 
            unit={categoryUnit} 
            critValue={critValue} 
          />
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [activeCategory, setActiveCategory] = useState('TEMP');
  const [sensorsMeta, setSensorsMeta] = useState([]);
  const [zones, setZones] = useState([]);
  const [zoneFilter, setZoneFilter] = useState(null);
  const [timeHours, setTimeHours] = useState(1);
  const [historyData, setHistoryData] = useState({});

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

  useEffect(() => {
    const loadHistory = async () => {
      const activeCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
      
      // 2. MODIFICATION ICI : On filtre sur le type_grandeur au lieu du nom qui commence par "TEMP", "PRES", etc.
      const filtered = sensorsMeta.filter(s => 
        (s.type_grandeur === activeCategoryObj.type || s.code_unique.startsWith(activeCategory)) && 
        (!zoneFilter || s.zone_id === zoneFilter)
      );
      
      const data = {};
      await Promise.all(filtered.map(async s => {
        try {
          const res = await axios.get(`${origins}/api/history/${s.id}?hours=${timeHours}`);
          data[s.code_unique] = res.data.map(p => ({ t: new Date(p.time), v: p.valeur }));
        } catch (err) { console.error(err); }
      }));
      setHistoryData(data);
    };
    if (sensorsMeta.length) loadHistory();
  }, [activeCategory, zoneFilter, timeHours, sensorsMeta]);

  const activeCategoryObj = CATEGORIES.find(c => c.id === activeCategory);
  const filteredSensors = Object.entries(historyData).sort((a,b) => a[0].localeCompare(b[0]));

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Metrics</h1>
          <p className="text-slate-500 font-medium">Real-time industrial monitoring</p>
        </div>

        <div className="flex items-center bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200">
          {TIME_OPTIONS.map(opt => (
            <button
              key={opt.label}
              onClick={() => setTimeHours(opt.value)}
              className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${
                timeHours === opt.value 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
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
      </div>

      <div className="space-y-4">
        {filteredSensors.map(([key, data]) => (
          <SensorCard 
            key={key} 
            sensorKey={key} 
            sensorData={data} 
            categoryColor={activeCategoryObj.color} 
            categoryUnit={activeCategoryObj.unit}
            critValue={activeCategoryObj.crit}
          />
        ))}
      </div>
    </div>
  );
}