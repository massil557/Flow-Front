import { useState, useEffect } from 'react';
import axios from 'axios';
import { origins } from './Managment';
import { Bell } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchAlerts = async () => {
      try {
        const res = await axios.get(`${origins}/api/alerts`);
        if (mounted) setAlerts(res.data);
      } catch (err) {
        console.error('Erreur récupération alertes', err);
      }
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // we want newest alerts first
  const displayList = alerts.slice().reverse();

  return (
    <div className="p-6 flex h-full">
      {/* liste à gauche */}
      <div className="w-1/3 border-r pr-4 overflow-y-auto">
        <h1 className="text-2xl font-bold mb-4">Alertes</h1>
        <ul>
          {displayList.map((a, i) => (
            <li
              key={i}
              className={`cursor-pointer py-2 px-2 rounded-md mb-1 hover:bg-gray-100 transition-colors 
                ${a === selectedAlert ? 'bg-gray-200' : ''}`}
              onClick={() => setSelectedAlert(a)}
            >
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-red-500" />
                <span className="font-semibold text-sm text-slate-800">{a.code}</span>
              </div>
              <div className="text-xs text-slate-500">
                {a.time} – {a.value}
              </div>
            </li>
          ))}
          {displayList.length === 0 && (
            <p className="text-sm text-slate-500">Aucune alerte</p>
          )}
        </ul>
      </div>

      {/* détails à droite */}
      <div className="flex-1 pl-6 overflow-y-auto">
        {selectedAlert ? (
          <div>
            <h2 className="text-xl font-bold mb-2">Détails de l'alerte</h2>
            <p className="mb-1">
              <span className="font-semibold">Capteur :</span> {selectedAlert.code}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Valeur :</span> {selectedAlert.value}
            </p>
            <p className="mb-1">
              <span className="font-semibold">Heure :</span> {selectedAlert.time}
            </p>
            <p className="mt-2 text-sm text-slate-700">{selectedAlert.msg}</p>
          </div>
        ) : (
          <p className="text-slate-500">Sélectionnez une alerte pour voir les détails</p>
        )}
      </div>
    </div>
  );
};

export default Alerts;