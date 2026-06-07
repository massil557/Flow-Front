// src/components/PlantMap/ZoneToolbar.jsx
import { Move, Square, ZoomIn, ZoomOut, Maximize, RefreshCw, Pencil, MousePointer } from 'lucide-react';

const ZoneToolbar = ({ mode, setMode, onZoomIn, onZoomOut, onResetView, onRefresh }) => {
  return (
    <div className="bg-white dark:bg-[#1e293b] border-b border-slate-200 dark:border-slate-700 px-4 py-2 flex items-center justify-between flex-wrap gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode('view')}
          className={`p-2 rounded-lg transition-all ${mode === 'view' ? 'bg-[#17203f] text-white' : 'bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
          title="Mode sélection"
        >
          <Move size={18} />
        </button>
        <button
          onClick={() => { setMode('add'); }}
          className={`p-2 rounded-lg transition-all ${mode === 'add' ? 'bg-[#17203f] text-white' : 'bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'}`}
          title="Ajouter une zone"
        >
          <Square size={18} />
        </button>
        
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1" />
        
        <button
          onClick={onZoomIn}
          className="p-2 rounded-lg bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          title="Zoom avant"
        >
          <ZoomIn size={18} />
        </button>
        <button
          onClick={onZoomOut}
          className="p-2 rounded-lg bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          title="Zoom arrière"
        >
          <ZoomOut size={18} />
        </button>
        <button
          onClick={onResetView}
          className="p-2 rounded-lg bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          title="Réinitialiser la vue"
        >
          <Maximize size={18} />
        </button>
        <button
          onClick={onRefresh}
          className="p-2 rounded-lg bg-slate-100 dark:bg-[#334155] text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          title="Rafraîchir"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      
      <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
        {mode === 'add' ? <><Pencil size={14} /> Cliquez et glissez pour créer une zone</> : <><MousePointer size={14} /> Cliquez sur une zone pour la sélectionner</>}
      </div>
    </div>
  );
};

export default ZoneToolbar;