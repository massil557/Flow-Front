import { AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight, Activity, Wifi } from 'lucide-react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { origins } from '../pages/Managment';

const Sensor = ({ sensor, onToggle }) => {
  const [lastTwo, setLastTwo] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lastAlertTime, setLastAlertTime] = useState(0); // Système de cooldown

  // 1. CONFIGURATION DYNAMIQUE DES SEUILS
  const getDynamicThreshold = (code) => {
    if (code.startsWith('TEMP')) return 30;  // Température: 30°C
    if (code.startsWith('PRES')) return 4;   // Pression: 4 Bar
    if (code.startsWith('HUMI')) return 80;  // Humidité: 80%
    if (code.startsWith('CO2'))  return 900; // CO2: 900 ppm
    return 50; // Seuil par défaut
  };

  const seuilDanger = getDynamicThreshold(sensor.code_unique);
  const isActive = sensor.is_activated;

  // 2. RÉCUPÉRATION DES DONNÉES TEMPS RÉEL
  useEffect(() => {
    if (!isActive) {
      setLastTwo([]);
      return;
    }
    const fetchLastTwo = async () => {
      try {
        const res = await axios.get(`${origins}/api/last-two/${sensor.code_unique}`);
        const data = res.data[sensor.code_unique] || [];
        setLastTwo(data);
      } catch (err) {
        console.error('Erreur fetch sensor data:', err);
      }
    };

    fetchLastTwo();
    const interval = setInterval(fetchLastTwo, 1000);
    return () => clearInterval(interval);
  }, [sensor.code_unique, isActive]);

  // Calculs des états
  const currentValue = lastTwo.length > 0 ? lastTwo[lastTwo.length - 1] : 0;
  const previousValue = lastTwo.length > 1 ? lastTwo[lastTwo.length - 2] : currentValue;
  const isDanger = currentValue >= seuilDanger;
  const isTrendingUp = currentValue >= previousValue;

  // 3. LOGIQUE D'ENVOI D'ALERTE AU BACKEND
  useEffect(() => {
    const now = Date.now();
    // On n'envoie l'alerte que si : Actif + En danger + Pas d'alerte depuis 10 secondes
    if (isActive && isDanger && (now - lastAlertTime > 10000)) {
     // Dans ton composant Sensor.jsx, remplace la fonction triggerAlert :
const triggerAlert = async () => {
  // Vérification de sécurité : n'envoie rien si la valeur n'est pas un nombre valide
  if (isNaN(currentValue) || currentValue === null) {
    console.warn("⚠️ Envoi annulé : valeur non numérique.");
    return;
  }

  try {
    const payload = {
      capteur_code: String(sensor.code_unique),
      valeur: Number(currentValue.toFixed(1)), // Force le type Number
      seuil_depasse: Number(seuilDanger),      // Force le type Number
      message: `⚠️ Alerte : ${sensor.type_grandeur} à ${currentValue.toFixed(1)}${sensor.unite}`
    };

    const response = await axios.post(`${origins}/api/alerts/trigger`, payload);
    setLastAlertTime(Date.now());
    console.log("✅ Alerte enregistrée :", response.data);
  } catch (err) {
    // Si l'erreur est 500, le problème est dans le terminal Python !
    console.error("❌ Erreur 500 détaillée :", err.response?.data);
  }
};
      triggerAlert();
    }
  }, [currentValue, isActive, isDanger, sensor, lastAlertTime, seuilDanger]);

  // Gestion des couleurs
  const statusColors = isDanger 
    ? { border: 'border-red-500', bg: 'bg-red-50/30', text: 'text-red-600', icon: 'text-red-500' }
    : { border: 'border-blue-500', bg: 'bg-white', text: 'text-slate-900', icon: 'text-emerald-500' };

  return (
    <div className={`relative p-5 rounded-xl border-l-4 shadow-sm w-[220px] transition-all duration-300 hover:shadow-md 
        ${statusColors.border} ${statusColors.bg} ${isActive ? '' : 'opacity-50 grayscale'} `}>
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1 text-left">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-2">
            <Activity size={14} className="text-slate-400" />
            {sensor.type_grandeur}
          </h3>
          <p className="text-[10px] font-mono text-slate-400 mt-1">{sensor.code_unique}</p>
        </div>
        
        <div className="flex items-center gap-1">
          <div className={`${isDanger && isActive ? 'animate-pulse' : ''}`}> 
            {isDanger ? (
              <AlertTriangle size={18} className={statusColors.icon} />
            ) : (
              <CheckCircle2 size={18} className={statusColors.icon} />
            )}
          </div>

          {/* MENU ACTIONS */}
          <div className="relative">
            <button 
              onClick={() => setMenuOpen(!menuOpen)} 
              className="p-1 hover:bg-slate-200/50 rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)}></div>
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-lg shadow-xl z-20 overflow-hidden">
                  <button
                    className="block w-full px-4 py-2 text-left text-xs font-semibold hover:bg-slate-50 transition-colors"
                    onClick={async () => {
                      try {
                        await axios.patch(`${origins}/api/sensors/${sensor.id}/activate?activate=${!isActive}`);
                        onToggle({ ...sensor, is_activated: !isActive });
                      } catch (err) { console.error(err); }
                      setMenuOpen(false);
                    }}
                  >
                    {isActive ? 'Désactiver' : 'Activer'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* IP INFO */}
      <div className="flex items-center gap-2 mb-4">
        <span className="flex items-center gap-1 text-[9px] bg-slate-100 px-2 py-0.5 rounded text-slate-500 font-mono border border-slate-200">
          <Wifi size={10} />
          {sensor.adresse_ip}
        </span>
      </div>

      {/* MAIN VALUE */}
      <div className="flex items-baseline gap-1">
        <span className={`text-4xl font-bold font-mono tracking-tighter ${statusColors.text}`}>
          {currentValue.toFixed(1)}
        </span>
        <span className="text-xs text-slate-500 font-semibold">{sensor.unite}</span>
        
        {/* TREND */}
        <span className={`ml-auto flex items-center text-xs font-bold ${isTrendingUp ? 'text-emerald-500' : 'text-blue-500'}`}>
          {isTrendingUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {Math.abs(currentValue - previousValue).toFixed(1)}
        </span>
      </div>

      {/* FOOTER STATS */}
      <div className="mt-4 pt-3 border-t border-slate-100/50 flex justify-between items-center">
        <span className="text-[10px] text-slate-400 font-medium">LIVE</span>
        {isDanger && isActive && (
          <span className="text-[9px] font-black text-red-500 uppercase animate-bounce">
            SEUIL {seuilDanger} {sensor.unite}
          </span>
        )}
      </div>

    </div>
  );
};

export default Sensor;