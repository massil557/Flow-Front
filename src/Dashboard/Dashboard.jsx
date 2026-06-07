// // // // // import React, { useState, useEffect } from 'react';
// // // // // import axios from 'axios';
// // // // // import { Line } from 'react-chartjs-2';
// // // // // import {
// // // // //   Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
// // // // // } from 'chart.js';

// // // // // ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// // // // // const Dashboard = () => {
// // // // //   const [sensorData, setSensorData] = useState({
// // // // //     temperature: 0, pression: 0, humidite: 0,
// // // // //     history: { labels: [], temp: [], press: [], hum: [] }
// // // // //   });

// // // // //   const fetchData = async () => {
// // // // //     try {
// // // // //       const res = await axios.get('http://127.0.0.1:8000/api/live-data');
// // // // //       if (res.data.error) return;

// // // // //       const { temperature, pression, humidite } = res.data;
// // // // //       const now = new Date().toLocaleTimeString();

// // // // //       setSensorData(prev => ({
// // // // //         temperature, pression, humidite,
// // // // //         history: {
// // // // //           labels: [...prev.history.labels, now].slice(-15),
// // // // //           temp: [...prev.history.temp, temperature].slice(-15),
// // // // //           press: [...prev.history.press, pression].slice(-15),
// // // // //           hum: [...prev.history.hum, humidite].slice(-15)
// // // // //         }
// // // // //       }));
// // // // //     } catch (err) { console.error("Erreur Backend:", err); }
// // // // //   };

// // // // //   useEffect(() => {
// // // // //     const interval = setInterval(fetchData, 2000);
// // // // //     return () => clearInterval(interval);
// // // // //   }, []);

// // // // //   const chartConfig = {
// // // // //     labels: sensorData.history.labels,
// // // // //     datasets: [
// // // // //       { label: 'Température (°C)', data: sensorData.history.temp, borderColor: '#3b82f6', tension: 0.4, fill: true, backgroundColor: 'rgba(59, 130, 246, 0.1)' },
// // // // //       { label: 'Pression (Bar)', data: sensorData.history.press, borderColor: '#10b981', tension: 0.4, fill: true, backgroundColor: 'rgba(16, 185, 129, 0.1)' },
// // // // //       { label: 'Humidité (%)', data: sensorData.history.hum, borderColor: '#f59e0b', tension: 0.4, fill: true, backgroundColor: 'rgba(245, 158, 11, 0.1)' }
// // // // //     ]
// // // // //   };

// // // // //   return (
// // // // //     <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '2rem', color: '#f8fafc', fontFamily: 'sans-serif' }}>
// // // // //       <h1 style={{ color: '#38bdf8', marginBottom: '2rem' }}>🏭 Factory Control Center</h1>
      
// // // // //       <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
// // // // //         <Card title="Température" value={sensorData.temperature} unit="°C" color="#3b82f6" />
// // // // //         <Card title="Pression" value={sensorData.pression} unit="Bar" color="#10b981" />
// // // // //         <Card title="Humidité" value={sensorData.humidite} unit="%" color="#f59e0b" />
// // // // //       </div>

// // // // //       <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '15px', height: '400px', border: '1px solid #334155' }}>
// // // // //         <Line data={chartConfig} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { grid: { color: '#334155' } } } }} />
// // // // //       </div>
// // // // //     </div>
// // // // //   );
// // // // // };

// // // // // const Card = ({ title, value, unit, color }) => (
// // // // //   <div style={{ background: '#1e293b', padding: '1.5rem', borderRadius: '15px', borderLeft: `6px solid ${color}`, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.2)' }}>
// // // // //     <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem' }}>{title}</p>
// // // // //     <h2 style={{ margin: '0.5rem 0', fontSize: '2.2rem' }}>{value} <span style={{ fontSize: '1rem', color: '#64748b' }}>{unit}</span></h2>
// // // // //   </div>
// // // // // );

// // // // // export default Dashboard;

// // // // import React, { useState, useEffect } from 'react';
// // // // import axios from 'axios';
// // // // import { Line } from 'react-chartjs-2';
// // // // import {
// // // //   Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
// // // // } from 'chart.js';

// // // // ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// // // // const Dashboard = () => {
// // // //   const [sensorData, setSensorData] = useState({
// // // //     temperature: 0, pression: 0, humidite: 0,
// // // //     history: { labels: [], temp: [], press: [], hum: [] }
// // // //   });

// // // //   // 1. Charger l'historique de la BDD au démarrage
// // // //   const loadHistory = async () => {
// // // //     try {
// // // //       const res = await axios.get('http://127.0.0.1:8000/api/history');
// // // //       setSensorData(prev => ({
// // // //         ...prev,
// // // //         history: {
// // // //           labels: res.data.map(d => d.time.split(' ')[1] || d.time), 
// // // //           temp: res.data.map(d => d.temp),
// // // //           press: res.data.map(d => d.press),
// // // //           hum: res.data.map(d => d.hum)
// // // //         }
// // // //       }));
// // // //     } catch (err) { console.error("Erreur historique:", err); }
// // // //   };

// // // //   // 2. Récupérer le point "Live" et l'ajouter au graphique
// // // //   const fetchLive = async () => {
// // // //     try {
// // // //       const res = await axios.get('http://127.0.0.1:8000/api/live-data');
// // // //       const { temperature, pression, humidite } = res.data;
// // // //       const now = new Date().toLocaleTimeString();

// // // //       setSensorData(prev => ({
// // // //         temperature, pression, humidite,
// // // //         history: {
// // // //           labels: [...prev.history.labels, now], // On ne slice plus à 15 pour garder l'historique
// // // //           temp: [...prev.history.temp, temperature],
// // // //           press: [...prev.history.press, pression],
// // // //           hum: [...prev.history.hum, humidite]
// // // //         }
// // // //       }));
// // // //     } catch (err) { console.error("Erreur Live:", err); }
// // // //   };

// // // //   useEffect(() => {
// // // //     loadHistory(); // Charger la BDD
// // // //     const interval = setInterval(fetchLive, 2000); // Puis live
// // // //     return () => clearInterval(interval);
// // // //   }, []);

// // // //   const chartConfig = {
// // // //     labels: sensorData.history.labels,
// // // //     datasets: [
// // // //       { label: 'Température (°C)', data: sensorData.history.temp, borderColor: '#3b82f6', tension: 0.3, fill: false },
// // // //       { label: 'Pression (Bar)', data: sensorData.history.press, borderColor: '#10b981', tension: 0.3, fill: false },
// // // //       { label: 'Humidité (%)', data: sensorData.history.hum, borderColor: '#f59e0b', tension: 0.3, fill: false }
// // // //     ]
// // // //   };

// // // //   return (
// // // //     <div style={{ backgroundColor: '#0f172a', minHeight: '100vh', padding: '20px', color: 'white', fontFamily: 'sans-serif' }}>
// // // //       <h2>🏭 Supervision Industrielle (Historique BDD)</h2>
      
// // // //       <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
// // // //         <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', flex: 1 }}>
// // // //           Temp: <b style={{ color: '#3b82f6' }}>{sensorData.temperature} °C</b>
// // // //         </div>
// // // //         <div style={{ background: '#1e293b', padding: '20px', borderRadius: '10px', flex: 1 }}>
// // // //           Pression: <b style={{ color: '#10b981' }}>{sensorData.pression} Bar</b>
// // // //         </div>
// // // //       </div>

// // // //       {/* CONTENEUR AVEC SCROLL HORIZONTAL */}
// // // //       <div style={{ 
// // // //         background: '#1e293b', 
// // // //         padding: '20px', 
// // // //         borderRadius: '15px', 
// // // //         height: '450px', 
// // // //         overflowX: 'auto' // Active le scroll
// // // //       }}>
// // // //         <div style={{ minWidth: '2000px', height: '100%' }}> 
// // // //           <Line 
// // // //             data={chartConfig} 
// // // //             options={{ 
// // // //               responsive: true, 
// // // //               maintainAspectRatio: false,
// // // //               scales: { x: { ticks: { color: '#94a3b8' } }, y: { ticks: { color: '#94a3b8' } } }
// // // //             }} 
// // // //           />
// // // //         </div>
// // // //       </div>
// // // //       <p style={{ color: '#64748b', marginTop: '10px' }}>← Faites défiler pour voir l'historique complet</p>
// // // //     </div>
// // // //   );
// // // // };

// // // // export default Dashboard;
// // // import React, { useState, useEffect } from 'react';
// // // import axios from 'axios';
// // // import { Line } from 'react-chartjs-2';
// // // import {
// // //   Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
// // // } from 'chart.js';

// // // ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// // // const Dashboard = () => {
// // //   const [sensorData, setSensorData] = useState({
// // //     temperature: 0, pression: 0, humidite: 0, status: 'loading',
// // //     history: { labels: [], temp: [], press: [], hum: [] }
// // //   });

// // //   const loadHistory = async () => {
// // //     try {
// // //       const res = await axios.get('http://127.0.0.1:8000/api/history');
// // //       setSensorData(prev => ({
// // //         ...prev,
// // //         history: {
// // //           labels: res.data.map(d => d.time.split(' ')[1] || d.time), 
// // //           temp: res.data.map(d => d.temp),
// // //           press: res.data.map(d => d.press),
// // //           hum: res.data.map(d => d.hum)
// // //         }
// // //       }));
// // //     } catch (err) { console.error("Erreur historique:", err); }
// // //   };

// // //   const fetchLive = async () => {
// // //     try {
// // //       const res = await axios.get('http://127.0.0.1:8000/api/live-data');
// // //       const { temperature, pression, humidite, status } = res.data;
// // //       const now = new Date().toLocaleTimeString();

// // //       setSensorData(prev => ({
// // //         temperature, pression, humidite, status,
// // //         history: {
// // //           labels: [...prev.history.labels, now],
// // //           temp: [...prev.history.temp, temperature],
// // //           press: [...prev.history.press, pression],
// // //           hum: [...prev.history.hum, humidite]
// // //         }
// // //       }));
// // //     } catch (err) { console.error("Erreur Live:", err); }
// // //   };

// // //   useEffect(() => {
// // //     loadHistory();
// // //     const interval = setInterval(fetchLive, 2000);
// // //     return () => clearInterval(interval);
// // //   }, []);

// // //   const chartConfig = {
// // //     labels: sensorData.history.labels,
// // //     datasets: [
// // //       { label: 'Température (°C)', data: sensorData.history.temp, borderColor: '#3b82f6', tension: 0.3, fill: false },
// // //       { label: 'Pression (Bar)', data: sensorData.history.press, borderColor: '#10b981', tension: 0.3, fill: false },
// // //       { label: 'Humidité (%)', data: sensorData.history.hum, borderColor: '#f59e0b', tension: 0.3, fill: false }
// // //     ]
// // //   };

// // //   const chartOptions = {
// // //     responsive: true,
// // //     maintainAspectRatio: false,
// // //     scales: {
// // //       x: { ticks: { color: '#94a3b8' }, grid: { display: false } },
// // //       y: { ticks: { color: '#94a3b8' }, grid: { color: '#334155' } }
// // //     },
// // //     plugins: { legend: { labels: { color: '#f8fafc' } } }
// // //   };

// // //   return (
// // //     <div className="min-h-screen bg-slate-950 text-white p-5">
// // //       <style>{`
// // //         .chart-scroll::-webkit-scrollbar {
// // //           display: none;
// // //         }
// // //         .chart-scroll {
// // //           -ms-overflow-style: none;
// // //           scrollbar-width: none;
// // //         }
// // //       `}</style>
      
// // //       <div className="flex justify-between items-center mb-8">
// // //         <h1 className="text-cyan-400 text-3xl font-bold m-0">Factory Monitor v2.0</h1>
// // //         <div className={`px-4 py-1 rounded-full text-sm font-semibold ${
// // //           sensorData.status === 'connected' ? 'bg-emerald-900 text-emerald-100' : 'bg-red-900 text-red-100'
// // //         }`}>
// // //           {sensorData.status === 'connected' ? 'Live' : 'Offline'}
// // //         </div>
// // //       </div>
      
// // //       <div className="flex gap-5 mb-8 justify-center">
// // //         <Card label="Temperature" value={sensorData.temperature} unit="°C" color="border-blue-500" />
// // //         <Card label="Pressure" value={sensorData.pression} unit="Bar" color="border-emerald-500" />
// // //         <Card label="Humidity" value={sensorData.humidite} unit="%" color="border-amber-500" />
// // //       </div>

// // //       <div className="mb-4">
// // //         <div className="flex gap-6 pl-6">
// // //           <div className="flex items-center gap-2">
// // //             <div className="w-4 h-1 bg-blue-500"></div>
// // //             <span className="text-sm text-slate-400">Temperature (°C)</span>
// // //           </div>
// // //           <div className="flex items-center gap-2">
// // //             <div className="w-4 h-1 bg-emerald-500"></div>
// // //             <span className="text-sm text-slate-400">Pressure (Bar)</span>
// // //           </div>
// // //           <div className="flex items-center gap-2">
// // //             <div className="w-4 h-1 bg-amber-500"></div>
// // //             <span className="text-sm text-slate-400">Humidity (%)</span>
// // //           </div>
// // //         </div>
// // //       </div>

// // //       <div className="chart-scroll bg-slate-800 p-6 rounded-2xl border border-slate-700 h-96 overflow-x-auto">
// // //         <div style={{ width: '5000px', height: '100%' }}> 
// // //           <Line data={chartConfig} options={chartOptions} />
// // //         </div>
// // //       </div>
      
// // //       <p className="text-slate-600 text-center mt-3 text-sm">Scroll left to see all recordings</p>
// // //     </div>
// // //   );
// // // };

// // // const Card = ({ label, value, unit, color }) => (
// // //   <div className={`bg-slate-800 p-5 rounded-xl flex-1 border-t-4 ${color} shadow-lg`}>
// // //     <p className="text-slate-400 m-0 mb-2 text-xs uppercase font-semibold">{label}</p>
// // //     <div className="text-2xl font-bold">
// // //       {value} <span className="text-slate-500 text-sm">{unit}</span>
// // //     </div>
// // //   </div>
// // // );

// // // export default Dashboard;

// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { Line } from 'react-chartjs-2';
// // import {
// //   Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler
// // } from 'chart.js';

// // ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// // const Dashboard = () => {
// //   const [sensorData, setSensorData] = useState({
// //     temperature: 0, pression: 0, humidite: 0, status: 'loading',
// //     history: { labels: [], temp: [], press: [], hum: [] }
// //   });

// //   // 1. Charger l'historique initial (on prend les 20 derniers de la BDD pour commencer)
// //   const loadHistory = async () => {
// //     try {
// //       const res = await axios.get('http://127.0.0.1:8000/api/history');
// //       // On ne prend que les 20 derniers résultats de l'historique pour le rendu initial
// //       const lastEntries = res.data.slice(-20);
      
// //       setSensorData(prev => ({
// //         ...prev,
// //         history: {
// //           labels: lastEntries.map(d => d.time.split(' ')[1] || d.time), 
// //           temp: lastEntries.map(d => d.temp),
// //           press: lastEntries.map(d => d.press),
// //           hum: lastEntries.map(d => d.hum)
// //         }
// //       }));
// //     } catch (err) { console.error("Erreur historique:", err); }
// //   };

// //   // 2. Mise à jour en temps réel (Fenêtre glissante de 20 points)
// //   const fetchLive = async () => {
// //     try {
// //       const res = await axios.get('http://127.0.0.1:8000/api/live-data');
// //       const { temperature, pression, humidite, status } = res.data;
// //       const now = new Date().toLocaleTimeString();

// //       setSensorData(prev => ({
// //         temperature, pression, humidite, status,
// //         history: {
// //           // .slice(-20) permet de faire défiler le graphique vers la gauche
// //           labels: [...prev.history.labels, now].slice(-20),
// //           temp: [...prev.history.temp, temperature].slice(-20),
// //           press: [...prev.history.press, pression].slice(-20),
// //           hum: [...prev.history.hum, humidite].slice(-20)
// //         }
// //       }));
// //     } catch (err) { console.error("Erreur Live:", err); }
// //   };

// //   useEffect(() => {
// //     loadHistory();
// //     const interval = setInterval(fetchLive, 2000); // Mise à jour toutes les 2 secondes
// //     return () => clearInterval(interval);
// //   }, []);

// //   const chartConfig = {
// //     labels: sensorData.history.labels,
// //     datasets: [
// //       { 
// //         label: 'Température (°C)', 
// //         data: sensorData.history.temp, 
// //         borderColor: '#3b82f6', 
// //         backgroundColor: 'rgba(59, 130, 246, 0.1)',
// //         tension: 0.4, 
// //         fill: true 
// //       },
// //       { 
// //         label: 'Pression (Bar)', 
// //         data: sensorData.history.press, 
// //         borderColor: '#10b981', 
// //         backgroundColor: 'rgba(16, 185, 129, 0.1)',
// //         tension: 0.4, 
// //         fill: true 
// //       },
// //       { 
// //         label: 'Humidité (%)', 
// //         data: sensorData.history.hum, 
// //         borderColor: '#f59e0b', 
// //         backgroundColor: 'rgba(245, 158, 11, 0.1)',
// //         tension: 0.4, 
// //         fill: true 
// //       }
// //     ]
// //   };

// //   const chartOptions = {
// //     responsive: true,
// //     maintainAspectRatio: false,
// //     animation: { duration: 800 }, // Animation douce pour le mouvement des points
// //     scales: {
// //       x: { 
// //         ticks: { color: '#94a3b8', maxRotation: 0 }, 
// //         grid: { display: false } 
// //       },
// //       y: { 
// //         ticks: { color: '#94a3b8' }, 
// //         grid: { color: '#334155' } 
// //       }
// //     },
// //     plugins: { 
// //       legend: { 
// //         position: 'top',
// //         labels: { color: '#f8fafc', usePointStyle: true, padding: 20 } 
// //       } 
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-slate-950 text-white p-6 font-sans">
// //       {/* HEADER */}
// //       <div className="flex justify-between items-center mb-10">
// //         <div>
// //           <h1 className="text-cyan-400 text-3xl font-extrabold tracking-tight">FACTORY MONITOR <span className="text-slate-500 font-light">v2.0</span></h1>
// //           <p className="text-slate-400 text-sm">Système de supervision OPC UA en temps réel</p>
// //         </div>
// //         <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest ${
// //           sensorData.status === 'connected' ? 'bg-emerald-900/30 text-emerald-400 border border-emerald-500/50' : 'bg-red-900/30 text-red-400 border border-red-500/50'
// //         }`}>
// //           <div className={`w-2 h-2 rounded-full ${sensorData.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></div>
// //           {sensorData.status === 'connected' ? 'Système En Ligne' : 'Hors Ligne'}
// //         </div>
// //       </div>
      
// //       {/* CARTES DES INDICATEURS */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
// //         <Card label="Température" value={sensorData.temperature} unit="°C" color="border-blue-500" icon="🌡️" />
// //         <Card label="Pression" value={sensorData.pression} unit="Bar" color="border-emerald-500" icon="⏲️" />
// //         <Card label="Humidité" value={sensorData.humidite} unit="%" color="border-amber-500" icon="💧" />
// //       </div>

// //       {/* GRAPHIQUE */}
// //       <div className="bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-2xl">
// //         <div className="flex justify-between items-center mb-6">
// //           <h3 className="text-slate-300 font-semibold">Analyse des flux (20 derniers relevés)</h3>
// //           <span className="text-xs text-slate-500 italic font-mono text-emerald-400">Enregistrement BDD actif...</span>
// //         </div>
// //         <div className="h-[400px] w-full">
// //           <Line data={chartConfig} options={chartOptions} />
// //         </div>
// //       </div>
      
// //       <footer className="mt-8 text-center">
// //         <p className="text-slate-600 text-xs">Propulsé par FastAPI & React • Stockage SQLite local</p>
// //       </footer>
// //     </div>
// //   );
// // };

// // // Composant Card réutilisable avec Tailwind
// // const Card = ({ label, value, unit, color, icon }) => (
// //   <div className={`bg-slate-900 p-6 rounded-2xl border-t-4 ${color} shadow-xl transition-transform hover:scale-105 duration-300`}>
// //     <div className="flex justify-between items-start mb-4">
// //       <p className="text-slate-400 text-xs uppercase font-bold tracking-wider">{label}</p>
// //       <span className="text-xl">{icon}</span>
// //     </div>
// //     <div className="flex items-baseline gap-2">
// //       <span className="text-4xl font-black text-slate-100">{value}</span>
// //       <span className="text-slate-500 font-medium">{unit}</span>
// //     </div>
// //   </div>
// // );

// // export default Dashboard;
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Line } from 'react-chartjs-2';
// import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

// ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

// const Dashboard = () => {
//   const [sensorData, setSensorData] = useState({
//     temperature: 0, pression: 0, humidite: 0, status: 'loading',
//     history: { labels: [], temp: [], press: [], hum: [] }
//   });

//   const [alarm, setAlarm] = useState(null); // Stocke l'alerte active

//   const fetchLive = async () => {
//     try {
//       const res = await axios.get('http://127.0.0.1:8000/api/live-data');
//       if (res.data.status === 'connected') {
//         const { temperature, pression, humidite, status } = res.data;
//         const now = new Date().toLocaleTimeString();

//         // GESTION DES ALERTES (Seuils : Temp > 30°C ou Pression > 3 Bar)
//         if (!alarm) {
//           if (temperature > 30) {
//             setAlarm({ type: 'TEMPÉRATURE CRITIQUE', value: temperature, unit: '°C', time: now });
//           } else if (pression > 3) {
//             setAlarm({ type: 'PRESSION CRITIQUE', value: pression, unit: 'Bar', time: now });
//           }
//         }

//         setSensorData(prev => ({
//           temperature, pression, humidite, status,
//           history: {
//             labels: [...prev.history.labels, now].slice(-20),
//             temp: [...prev.history.temp, temperature].slice(-20),
//             press: [...prev.history.press, pression].slice(-20),
//             hum: [...prev.history.hum, humidite].slice(-20)
//           }
//         }));
//       }
//     } catch (err) { console.error(err); }
//   };

//   useEffect(() => {
//     const interval = setInterval(fetchLive, 2000);
//     return () => clearInterval(interval);
//   }, [alarm]);

//   return (
//     <div className="min-h-screen bg-slate-950 text-white p-6 relative">
      
//       {/* MODAL D'ALERTE BLOQUANT */}
//       {alarm && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
//           <div className="bg-slate-900 border-2 border-red-500 p-8 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)] text-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
//             <div className="text-red-500 text-6xl mb-4">⚠️</div>
//             <h2 className="text-red-500 text-2xl font-black mb-1 uppercase italic">{alarm.type}</h2>
//             <p className="text-slate-400 text-sm mb-6">Incident enregistré à {alarm.time}</p>
//             <div className="bg-red-500/10 border border-red-500/30 rounded-2xl py-6 mb-8">
//               <span className="text-6xl font-black text-white">{alarm.value}</span>
//               <span className="text-xl text-red-500 ml-2">{alarm.unit}</span>
//             </div>
//             <button 
//               onClick={() => setAlarm(null)}
//               className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95"
//             >
//               SEEN / ACQUITTER
//             </button>
//           </div>
//         </div>
//       )}

//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-10">
//         <h1 className="text-cyan-400 text-2xl font-black italic tracking-tighter">SCADA_ALPHA v2.0</h1>
//         <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${
//           sensorData.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50' : 'bg-red-500/10 text-red-500 border-red-500/50'
//         }`}>
//           {sensorData.status === 'connected' ? '● System Live' : '○ Connection Lost'}
//         </div>
//       </div>

//       {/* CARTES AVEC EFFET GLOW */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
//         <Card label="Température" value={sensorData.temperature} unit="°C" isDanger={sensorData.temperature > 30} color="blue" />
//         <Card label="Pression" value={sensorData.pression} unit="Bar" isDanger={sensorData.pression > 3} color="emerald" />
//         <Card label="Humidité" value={sensorData.humidite} unit="%" isDanger={false} color="amber" />
//       </div>

//       {/* GRAPHIQUE TEMPS RÉEL */}
//       <div className="bg-slate-900 p-6 rounded-3xl border border-slate-800 h-[400px] shadow-2xl">
//         <Line 
//           data={{
//             labels: sensorData.history.labels,
//             datasets: [
//               { label: 'T°', data: sensorData.history.temp, borderColor: '#3b82f6', tension: 0.4, pointRadius: 0 },
//               { label: 'P', data: sensorData.history.press, borderColor: '#10b981', tension: 0.4, pointRadius: 0 },
//               { label: 'H', data: sensorData.history.hum, borderColor: '#f59e0b', tension: 0.4, pointRadius: 0 }
//             ]
//           }} 
//           options={{
//             responsive: true, maintainAspectRatio: false,
//             scales: { x: { grid: { display: false } }, y: { grid: { color: '#1e293b' } } },
//             plugins: { legend: { display: false } }
//           }} 
//         />
//       </div>
//     </div>
//   );
// };

// const Card = ({ label, value, unit, isDanger, color }) => {
//   const themes = { blue: 'border-blue-500', emerald: 'border-emerald-500', amber: 'border-amber-500' };
//   return (
//     <div className={`bg-slate-900 p-6 rounded-2xl border-t-4 transition-all duration-300 ${
//       isDanger ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' : `${themes[color]} shadow-lg`
//     }`}>
//       <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-2">{label}</p>
//       <div className={`text-4xl font-black ${isDanger ? 'text-red-500' : 'text-slate-100'}`}>
//         {value} <span className="text-sm font-medium text-slate-600">{unit}</span>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const Dashboard = () => {
  const [sensorData, setSensorData] = useState({
    temperature: 0, pression: 0, humidite: 0, status: 'loading',
    history: { labels: [], temp: [], press: [], hum: [] }
  });

  const [alarm, setAlarm] = useState(null);
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);

  const initializeAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const generateAlarmSound = () => {
    try {
      initializeAudioContext();
      const audioContext = audioContextRef.current;
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0, audioContext.currentTime + 0.2);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.2);
    } catch (err) {
      console.log("Erreur audio:", err);
    }
  };

  const playAlarmRepeatedly = () => {
    const interval = setInterval(() => {
      generateAlarmSound();
    }, 300);
    audioRef.current = interval;
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      clearInterval(audioRef.current);
      audioRef.current = null;
    }
  };

  const handleAcknowledge = () => {
    setAlarm(null);
    stopAlarm();
  };

  const fetchLive = async () => {
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/live-data');
      if (res.data.status === 'connected') {
        const { temperature, pression, humidite, status } = res.data;
        const now = new Date().toLocaleTimeString();

        if (!alarm) {
          if (temperature > 30) {
            setAlarm({ type: 'TEMPÉRATURE CRITIQUE', value: temperature, unit: '°C', time: now });
            setTimeout(() => playAlarmRepeatedly(), 100);
          } else if (pression > 3) {
            setAlarm({ type: 'PRESSION CRITIQUE', value: pression, unit: 'Bar', time: now });
            setTimeout(() => playAlarmRepeatedly(), 100);
          }
        }

        // keep full history; rendering will limit visible points and add scroll
        setSensorData(prev => ({
          temperature, pression, humidite, status,
          history: {
            labels: [...prev.history.labels, now],
            temp: [...prev.history.temp, temperature],
            press: [...prev.history.press, pression],
            hum: [...prev.history.hum, humidite]
          }
        }));
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const interval = setInterval(fetchLive, 2000);
    return () => clearInterval(interval);
  }, [alarm]);

  // helper settings shared across individual graphs
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 800 },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: '#000000',
          callback: function(val, idx) {
            // show label only if minute is divisible by 5 (or hour marker)
            const label = this.getLabelForValue(val);
            const parts = label.split(':');
            if (parts.length >= 2) {
              const mins = parseInt(parts[1], 10);
              if (!isNaN(mins) && mins % 5 === 0) return label;
            }
            return '';
          }
        }
      },
      y: { grid: { color: '#1e293b' }, ticks: { color: '#000000' } }
    },
    plugins: { legend: { display: false } }
  };

  // component responsable d'un graphique individuel avec scroll et barre cachée
  const Graph = ({ title, labels, data, color }) => {
    const MAX_VISIBLE = 20;
    const containerWidth = labels.length > MAX_VISIBLE ? `${labels.length * 50}px` : '100%';

    const graphData = {
      labels,
      datasets: [
        {
          label: title,
          data,
          borderColor: color,
          backgroundColor: color,
          pointRadius: 4,
          pointHoverRadius: 6,
          tension: 0.4
        }
      ]
    };

    return (
      <div className="chart-scroll overflow-x-auto bg-slate-900 p-4 rounded-xl mb-6 h-[250px] w-full">
        <div style={{ width: containerWidth, height: '100%' }}>
          <Line data={graphData} options={baseOptions} />
        </div>
      </div>
    );
  };

  // CSS rules to hide native scrollbar on containers with class 'chart-scroll'
  const scrollStyles = `
    .chart-scroll::-webkit-scrollbar { display: none; }
    .chart-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  `;

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6 relative">
      <style>{scrollStyles}</style>
      {alarm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border-2 border-red-500 p-8 rounded-3xl shadow-[0_0_50px_rgba(239,68,68,0.4)] text-center max-w-sm w-full animate-in fade-in zoom-in duration-300">
            <h2 className="text-red-500 text-2xl font-black mb-1 uppercase italic">{alarm.type}</h2>
            <p className="text-slate-400 text-sm mb-6 font-mono">Incident à {alarm.time}</p>
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl py-6 mb-8 text-white text-5xl font-black">
              {alarm.value}<span className="text-xl ml-1 text-red-500">{alarm.unit}</span>
            </div>
            <button onClick={handleAcknowledge} className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-xl">SEEN / ACQUITTER</button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-cyan-400 text-2xl font-black italic tracking-tighter uppercase"></h1>
        <div className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase border ${sensorData.status === 'connected' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/50' : 'bg-red-500/10 text-red-500 border-red-500/50'}`}>
          {sensorData.status === 'connected' ? <><span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5" /> System Live</> : <><span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-1.5" /> Offline</>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <Card label="Température" value={sensorData.temperature} unit="°C" isDanger={sensorData.temperature > 30} color="blue" />
        <Card label="Pression" value={sensorData.pression} unit="Bar" isDanger={sensorData.pression > 3} color="emerald" />
        <Card label="Humidité" value={sensorData.humidite} unit="%" isDanger={false} color="amber" />
      </div>

      {/* graphs section - one per line */}
      <Graph title="Température (°C)" labels={sensorData.history.labels} data={sensorData.history.temp} color="#3b82f6" />
      <Graph title="Pression (Bar)" labels={sensorData.history.labels} data={sensorData.history.press} color="#10b981" />
      <Graph title="Humidité (%)" labels={sensorData.history.labels} data={sensorData.history.hum} color="#f59e0b" />
    </div>
  );
};

const Card = ({ label, value, unit, isDanger, color }) => {
  const themes = { blue: 'border-blue-500', emerald: 'border-emerald-500', amber: 'border-amber-500' };
  return (
    <div className={`bg-slate-900 p-6 rounded-2xl border-t-4 transition-all duration-300 ${isDanger ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse' : `${themes[color]} shadow-lg`}`}>
      <p className="text-slate-500 text-[10px] font-bold uppercase mb-2 tracking-widest">{label}</p>
      <div className={`text-4xl font-black ${isDanger ? 'text-red-500' : 'text-slate-100'}`}>
        {value} <span className="text-sm font-medium text-slate-600">{unit}</span>
      </div>
    </div>
  );
};

export default Dashboard;