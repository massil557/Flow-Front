// src/components/PlantMap/AddZoneDialog.jsx
import { useState } from 'react';

const AddZoneDialog = ({ drawRect, onConfirm, onCancel }) => {
  const [zoneName, setZoneName] = useState('');
  const [zoneType, setZoneType] = useState('Process');

  const handleConfirm = () => {
    if (!zoneName.trim()) {
      alert('Veuillez entrer un nom pour la zone');
      return;
    }
    onConfirm(zoneName, zoneType);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-30">
      <div className="bg-white dark:bg-[#1e293b] rounded-xl shadow-2xl w-96 p-6">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Nouvelle zone</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Nom de la zone</label>
            <input
              type="text"
              value={zoneName}
              onChange={e => setZoneName(e.target.value)}
              placeholder="Ex: Atelier Mécanique"
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-[#334155] dark:text-slate-200"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">Type de zone</label>
            <select
              value={zoneType}
              onChange={e => setZoneType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none dark:bg-[#334155] dark:text-slate-200"
            >
              <option value="Process">Process / Production</option>
              <option value="Stockage">Stockage</option>
              <option value="Logistique">Logistique / Convoyage</option>
              <option value="Énergie">Énergie / Utilités</option>
            </select>
          </div>
          
          <div className="bg-slate-50 dark:bg-[#334155] rounded-lg p-3 text-sm text-slate-600 dark:text-slate-300">
            <p className="font-medium">Dimensions:</p>
            <p>Largeur: {Math.round(drawRect.w)} px • Hauteur: {Math.round(drawRect.h)} px</p>
            <p>Position: X={Math.round(drawRect.x)}, Y={Math.round(drawRect.y)}</p>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 px-4 py-2 bg-[#17203f] text-white rounded-lg hover:bg-[#1e2a55]"
          >
            Créer
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddZoneDialog;