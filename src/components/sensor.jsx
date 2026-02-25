/* recharts imports could be re-added later if the sparkline returns */
// import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, Activity, Wifi } from 'lucide-react';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { origins } from '../pages/Managment';

const Sensor = ({ sensor, onToggle }) => {
  // each sensor component requests its own last-two values from the API
  const [lastTwo, setLastTwo] = useState([]);
  const seuilDanger = 80; // Seuil de danger pour la grandeur mesurée (ex: température critique)
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = sensor.is_activated;

  useEffect(() => {
    if (!isActive) {
      setLastTwo([]);
      return;
    }
    let mounted = true;
    const fetchLastTwo = async () => {
      try {
        const res = await axios.get(`${origins}/api/last-two/${sensor.code_unique}`);
        if (mounted) {
          const data = res.data[sensor.code_unique] || [];
          setLastTwo(data);
        }
      } catch (err) {
        console.error('Erreur fetch last-two', err);
      }
    };

    fetchLastTwo();
    const interval = setInterval(fetchLastTwo, 1000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [sensor.code_unique, isActive]);

  // 1. Extraction des deux dernières valeurs renvoyées par le serveur
  // lastTwo est un tableau d'au plus deux nombres, ex. [21.3, 22.1]
  const currentValue = lastTwo.length > 0 ? lastTwo[lastTwo.length - 1] : 0;
  const previousValue = lastTwo.length > 1 ? lastTwo[lastTwo.length - 2] : currentValue;
  const isDanger = currentValue >= seuilDanger;
  const isTrendingUp = currentValue >= previousValue;

  // 2. Configuration des couleurs selon le statut
  const statusColors = isDanger 
    ? {
        border: 'border-red-500',
        bg: 'bg-red-50/30',
        text: 'text-red-600',
        icon: 'text-red-500',
        line: '#ef4444' // Red-500 pour le graphique
      }
    : {
        border: 'border-blue-500',
        bg: 'bg-white',
        text: 'text-slate-900',
        icon: 'text-emerald-500',
        line: '#3b82f6' // Blue-500 pour le graphique
      };

  return (
    <div className={`relative p-5 rounded-xl border-l-4 shadow-sm w-[200px] transition-all duration-300 hover:shadow-md 
        ${statusColors.border} ${statusColors.bg} ${isActive ? '' : 'opacity-50 grayscale'} `}>
      
      {/* HEADER : Titre et Statut */}
      <div className="flex justify-between items-start mb-2 relative">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Activity size={14} className="text-slate-400" />
            {sensor.type_grandeur}
          </h3>
          <p className="text-[10px] font-mono text-slate-500 mt-1">{sensor.code_unique}</p>
        </div>
        
        {/* Icône de statut clignotante en cas de danger */}
        <div className={`${isDanger ? 'animate-pulse' : ''}`}> 
          {isDanger ? (
            <AlertTriangle size={20} className={statusColors.icon} />
          ) : (
            <CheckCircle2 size={20} className={statusColors.icon} />
          )}
        </div>
        {/* menu trois points */}
        <div className="absolute top-0 right-0">
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
            </svg>
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded shadow-lg z-10">
              <button
                className="block w-full px-4 py-2 text-left text-sm hover:bg-gray-100"
                onClick={async () => {
                  try {
                    const res = await axios.patch(`${origins}/api/sensors/${sensor.id}/activate?activate=${!isActive}`);
                    // server responds {success: true, is_activated: ...}
                    const updated = { ...sensor, is_activated: res.data.is_activated };
                    if (onToggle) onToggle(updated);
                  } catch (err) {
                    console.error('toggle failed', err);
                  }
                  setMenuOpen(false);
                }}
              >
                {isActive ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* METADATA TECHNIQUES : IP & Zone */}
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center gap-1 text-[9px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono border border-slate-200">
          <Wifi size={10} />
          {sensor.adresse_ip}
        </span>
      </div>

      {/* MAIN VALUE : Valeur Temps Réel et Tendance */}
      <div className="flex items-baseline gap-2">
        <span className={`text-4xl font-bold font-mono tracking-tighter ${statusColors.text}`}>
          {currentValue.toFixed(1)}
        </span>
        <span className="text-sm text-slate-500 font-semibold">{sensor.unite}</span>
        
        {/* Flèche de tendance dynamique */}
        <span className={`ml-auto flex items-center text-xs font-bold ${isTrendingUp ? 'text-emerald-500' : 'text-blue-500'}`}>
          {isTrendingUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs((currentValue - previousValue)).toFixed(1)}
        </span>
      </div>

      {/* footer simplifié : on affiche la dernière valeur seulement */}
      <div className="mt-4 pt-3 border-t border-slate-100/50 flex justify-between items-center">
        <span className="text-[10px] text-slate-400 italic">
          Dernière valeur : {currentValue.toFixed(1)}
        </span>
        {isDanger && (
          <span className="text-[9px] font-bold text-red-500 uppercase animate-pulse">
            Seuil Critique
          </span>
        )}
      </div>

    </div>
  );
};

export default Sensor;