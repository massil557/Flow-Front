// src/components/PlantMap/ZoneDetailPanel.jsx
import { Activity, Trash2, X } from 'lucide-react';
import { getZoneIcon } from './ZoneUtils';

const ZoneDetailPanel = ({ zone, zoneStats, onClose, onDelete, onViewDetails }) => {
  const stats = zoneStats[zone?.id];

  if (!zone) return null;

  return (
    <div className="fixed right-4 top-20 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-20">
      <div className="p-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getZoneIcon(zone.code_zone)}
            <div>
              <h3 className="text-base font-bold text-slate-800">{zone.nom_zone}</h3>
              <p className="text-[10px] font-mono text-slate-400">{zone.code_zone}</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button
              onClick={onViewDetails}
              className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-all"
              title="Voir les capteurs"
            >
              <Activity size={16} />
            </button>
            <button
              onClick={() => onDelete(zone.id)}
              className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-400 font-medium">Capteurs</p>
            <p className="text-xl font-bold text-[#17203f]">{stats?.sensor_count || 0}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-slate-400 font-medium">Alertes actives</p>
            <p className={`text-xl font-bold ${stats?.active_alerts > 0 ? 'text-amber-500' : 'text-green-500'}`}>
              {stats?.active_alerts || 0}
            </p>
          </div>
        </div>
        
        {stats?.sensors && stats.sensors.length > 0 && (
          <div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Capteurs</p>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
              {stats.sensors.map(s => (
                <span key={s.code} className="px-2 py-1 bg-slate-100 rounded text-[10px] font-mono text-slate-600">
                  {s.code}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <button
          onClick={onViewDetails}
          className="w-full text-center text-xs font-semibold text-[#17203f] hover:text-white hover:bg-[#17203f] px-3 py-2 rounded-lg transition-all"
        >
          Gérer les capteurs →
        </button>
      </div>
    </div>
  );
};

export default ZoneDetailPanel;