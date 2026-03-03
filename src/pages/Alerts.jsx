import { useState, useEffect } from 'react';
import axios from 'axios';
import { origins } from './Managment'; // Assure-toi que ce chemin est correct
import { 
  Bell, 
  Clock, 
  Database, 
  ShieldAlert, 
  Inbox, 
  AlertCircle, 
  ChevronRight,
  Trash2
} from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Récupération des alertes
  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${origins}/api/alerts`);
      setAlerts(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Erreur lors de la récupération des alertes:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 5000); // Refresh toutes les 5 secondes
    return () => clearInterval(interval);
  }, []);

  // 2. Fonction pour supprimer une alerte (Optionnel)
  const deleteAlert = async (id) => {
    try {
      await axios.delete(`${origins}/api/alerts/${id}`);
      setAlerts(alerts.filter(a => a.id !== id));
      if (selectedAlert?.id === id) setSelectedAlert(null);
    } catch (err) {
      console.error("Erreur de suppression", err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] bg-white overflow-hidden m-4 rounded-3xl border border-slate-200 shadow-xl">
      
      {/* --- PANNEAU DE GAUCHE : LISTE --- */}
      <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-6 bg-white border-b border-slate-100">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Bell className="text-red-600" size={20} />
              </div>
              Alertes
            </h1>
            <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
              {alerts.length}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-2 custom-scrollbar">
          {alerts.map((a) => (
            <div 
              key={a.id} 
              onClick={() => setSelectedAlert(a)}
              className={`group relative cursor-pointer p-4 rounded-2xl transition-all duration-300 border-2 text-left
                ${selectedAlert?.id === a.id 
                  ? 'bg-white border-blue-500 shadow-md translate-x-1' 
                  : 'bg-white/50 border-transparent hover:border-slate-200 hover:bg-white'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-bold text-sm ${selectedAlert?.id === a.id ? 'text-blue-600' : 'text-slate-700'}`}>
                  {a.code}
                </span>
                <span className="text-[10px] text-slate-400 font-medium">{a.time}</span>
              </div>
              <p className="text-xs text-slate-500 truncate pr-4">{a.msg}</p>
              <ChevronRight size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity ${selectedAlert?.id === a.id ? 'opacity-100 text-blue-500' : 'opacity-0'}`} />
            </div>
          ))}

          {alerts.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-64 text-slate-400 animate-pulse">
              <Inbox size={48} strokeWidth={1} />
              <p className="text-sm mt-4 font-medium">Système nominal. Aucune alerte.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- PANNEAU DE DROITE : DÉTAILS --- */}
      <div className="flex-1 bg-white relative">
        {selectedAlert ? (
          <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Détails */}
            <div className="p-10 border-b border-slate-50 text-left">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-5">
                  <div className="p-5 bg-red-50 rounded-3xl text-red-600 border border-red-100 shadow-inner">
                    <ShieldAlert size={40} />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">
                      Dépassement de Seuil
                    </h2>
                    <p className="text-slate-400 flex items-center gap-2 mt-1 font-medium italic">
                      <Clock size={16} /> Enregistré le {selectedAlert.time}
                    </p>
                  </div>
                </div>
                <button 
                   onClick={() => deleteAlert(selectedAlert.id)}
                   className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            {/* Corps Détails */}
            <div className="p-10 space-y-8 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-8 text-left">
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:border-red-200 transition-colors">
                  <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em] mb-3">Valeur Relevée</p>
                  <p className="text-5xl font-mono font-bold text-red-600 tracking-tighter">
                    {selectedAlert.value}
                  </p>
                </div>
                <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group hover:border-blue-200 transition-colors">
                  <p className="text-[11px] text-slate-400 uppercase font-black tracking-[0.2em] mb-3">Code Capteur</p>
                  <p className="text-5xl font-mono font-bold text-slate-800 tracking-tighter">
                    {selectedAlert.code}
                  </p>
                </div>
              </div>

              <div className="space-y-4 text-left">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                  <AlertCircle size={22} className="text-blue-500" />
                  Rapport Automatique
                </h3>
                <div className="bg-blue-50/30 border border-blue-100 p-8 rounded-[2rem] relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                  <p className="text-slate-700 leading-relaxed text-lg italic font-medium">
                    "{selectedAlert.msg}"
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/30 flex justify-end gap-4">
              <button className="px-8 py-3 bg-white border border-slate-200 text-slate-600 rounded-2xl font-bold hover:bg-slate-100 transition-all shadow-sm">
                Ignorer
              </button>
              <button className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-xl transition-all">
                Marquer comme résolue
              </button>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-200">
            <div className="relative mb-6">
              <Database size={100} strokeWidth={0.5} />
              <div className="absolute inset-0 flex items-center justify-center animate-pulse">
                <AlertCircle size={40} className="text-slate-100" />
              </div>
            </div>
            <p className="text-xl font-bold text-slate-400">En attente de sélection</p>
            <p className="text-sm text-slate-300 mt-2">Cliquez sur une alerte pour voir l'analyse technique</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alerts;