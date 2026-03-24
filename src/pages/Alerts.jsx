// src/pages/Alerts.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { origins } from './Managment';
import Button from '../components/Button';
import {
  Bell, Clock, Database, ShieldAlert, Inbox,
  AlertCircle, ChevronRight, Trash2, CheckCircle, X
} from 'lucide-react';

function getSensorMeta(code = '') {
  const c = code.toUpperCase();
  if (c.includes('TEMP')) return { color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'Température' };
  if (c.includes('PRES')) return { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Pression'    };
  if (c.includes('HUMI')) return { color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'Humidité'    };
  if (c.includes('CO2'))  return { color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  label: 'CO2'         };
  return                         { color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200',  label: 'Capteur'     };
}

export default function Alerts() {
  const [alerts,        setAlerts]        = useState([]);
  const [selected,      setSelected]      = useState(null);
  const [loading,       setLoading]       = useState(true);
  const [filter,        setFilter]        = useState('all');
  const [toast,         setToast]         = useState('');
  const [mobileDetail,  setMobileDetail]  = useState(false);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchAlerts = async () => {
    try {
      const res = await axios.get(`${origins}/api/alerts`);
      setAlerts(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchAlerts();
    const id = setInterval(fetchAlerts, 5000);
    return () => clearInterval(id);
  }, []);

  const resolveAlert = async (id) => {
    try {
      await axios.patch(`${origins}/api/alerts/${id}/resolve`);
      setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
      if (selected?.id === id) setSelected(prev => ({ ...prev, is_resolved: true }));
      showToast('Alerte marquée comme résolue');
    } catch (err) { console.error(err); }
  };

  const ignoreAlert = async (id) => {
    try {
      await axios.patch(`${origins}/api/alerts/${id}/ignore`);
      setAlerts(prev => prev.filter(a => a.id !== id));
      if (selected?.id === id) { setSelected(null); setMobileDetail(false); }
      showToast('Alerte ignorée');
    } catch (err) { console.error(err); }
  };

  const deleteAlert = async (id) => {
    try {
      await axios.delete(`${origins}/api/alerts/${id}`);
      setAlerts(prev => prev.filter(a => a.id !== id));
      if (selected?.id === id) { setSelected(null); setMobileDetail(false); }
      showToast('Alerte supprimée');
    } catch (err) { console.error(err); }
  };

  const selectAlert = (a) => { setSelected(a); setMobileDetail(true); };

  const filtered = alerts.filter(a => {
    if (filter === 'active')   return !a.is_resolved;
    if (filter === 'resolved') return  a.is_resolved;
    return true;
  });

  const activeCount   = alerts.filter(a => !a.is_resolved).length;
  const resolvedCount = alerts.filter(a =>  a.is_resolved).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-3 bg-[#17203f] text-white rounded-xl shadow-2xl text-sm font-semibold">
          {toast}
        </div>
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#17203f] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Bell className="text-red-600" size={20} />
            </div>
            Alertes
          </h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">
            {activeCount} alerte{activeCount !== 1 ? 's' : ''} active{activeCount !== 1 ? 's' : ''}
            {resolvedCount > 0 && ` · ${resolvedCount} résolue${resolvedCount !== 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm mb-6 w-full sm:w-auto sm:inline-flex">
        {[
          { id: 'all',      label: `Toutes (${alerts.length})`      },
          { id: 'active',   label: `Actives (${activeCount})`       },
          { id: 'resolved', label: `Résolues (${resolvedCount})`    },
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 sm:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              filter === f.id
                ? 'bg-[#17203f] text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Main layout */}
      <div className="flex gap-6 h-[calc(100vh-280px)] min-h-[400px]">

        {/* ── LEFT: Alert list ──────────────────────────────────────────────── */}
        <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden
          ${mobileDetail ? 'hidden lg:flex' : 'flex'} w-full lg:w-2/5 xl:w-1/3`}>
          <div className="overflow-y-auto flex-1 p-3 space-y-2">
            {loading && (
              <div className="flex justify-center items-center py-16">
                <div className="w-7 h-7 border-2 border-[#17203f] border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-16 text-slate-300">
                <Inbox size={52} strokeWidth={1} className="mb-4" />
                <p className="text-sm font-semibold text-slate-400">
                  {filter === 'resolved' ? 'Aucune alerte résolue' : 'Système nominal — aucune alerte'}
                </p>
              </div>
            )}

            {filtered.map(a => {
              const meta = getSensorMeta(a.code);
              const isSelected = selected?.id === a.id;
              return (
                <div
                  key={a.id}
                  onClick={() => selectAlert(a)}
                  className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200
                    ${isSelected
                      ? 'bg-[#17203f]/5 border-[#17203f] shadow-sm'
                      : 'bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white'}
                    ${a.is_resolved ? 'opacity-55' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${meta.bg} ${meta.border} ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className={`font-bold text-sm ${isSelected ? 'text-[#17203f]' : 'text-slate-800'}`}>
                        {a.code}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-medium shrink-0">{a.time}</span>
                  </div>
                  <p className="text-xs text-slate-500 pr-4 leading-relaxed">{a.msg}</p>
                  {a.is_resolved && (
                    <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <CheckCircle size={11} /> Résolue
                    </div>
                  )}
                  <ChevronRight
                    size={14}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity ${isSelected ? 'opacity-100 text-[#17203f]' : 'opacity-0'}`}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── RIGHT: Detail panel ───────────────────────────────────────────── */}
        <div className={`flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden
          ${mobileDetail ? 'flex' : 'hidden lg:flex'} flex-col`}>

          {selected ? (
            <div className="flex flex-col h-full">
              {/* Mobile back button */}
              <div className="lg:hidden p-4 border-b border-slate-100">
                <button
                  onClick={() => setMobileDetail(false)}
                  className="flex items-center gap-2 text-sm font-semibold text-[#17203f]"
                >
                  <ChevronRight size={16} className="rotate-180" /> Retour aux alertes
                </button>
              </div>

              {/* Detail header */}
              <div className="p-6 sm:p-8 border-b border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 ${getSensorMeta(selected.code).bg} ${getSensorMeta(selected.code).border}`}>
                      <ShieldAlert size={28} className={getSensorMeta(selected.code).color} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-[#17203f]">Dépassement de seuil</h2>
                      <p className="text-slate-500 flex items-center gap-1.5 mt-1 text-sm font-medium">
                        <Clock size={14} /> {selected.time}
                      </p>
                      {selected.is_resolved && (
                        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
                          <CheckCircle size={12} /> Résolue
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAlert(selected.id)}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0"
                    title="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>

              {/* Detail body */}
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Valeur relevée</p>
                    <p className={`text-4xl font-bold tabular-nums ${getSensorMeta(selected.code).color}`}>
                      {selected.value}
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Code capteur</p>
                    <p className="text-4xl font-bold text-[#17203f] tabular-nums">{selected.code}</p>
                  </div>
                </div>

                {selected.seuil && (
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Seuil dépassé</p>
                    <p className="text-2xl font-bold text-slate-700">{selected.seuil}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-bold text-[#17203f] flex items-center gap-2 mb-3">
                    <AlertCircle size={18} className="text-blue-500" />
                    Rapport automatique
                  </h3>
                  <div className="bg-[#17203f]/5 border-l-4 border-[#17203f] p-5 rounded-r-2xl rounded-l-none">
                    <p className="text-slate-700 leading-relaxed text-sm font-medium italic">
                      {selected.msg}
                    </p>
                  </div>
                </div>
              </div>

              {/* Detail footer */}
              <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-3">
                <Button
                  variant="ghost"
                  onClick={() => ignoreAlert(selected.id)}
                  disabled={selected.is_resolved}
                  icon={<X size={15} />}
                >
                  Ignorer
                </Button>
                <Button
                  variant={selected.is_resolved ? 'ghost' : 'success'}
                  onClick={() => resolveAlert(selected.id)}
                  disabled={selected.is_resolved}
                  icon={<CheckCircle size={15} />}
                >
                  {selected.is_resolved ? 'Déjà résolue' : 'Marquer comme résolue'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-200 p-8">
              <Database size={80} strokeWidth={0.8} className="mb-6" />
              <p className="text-lg font-bold text-slate-400">Sélectionnez une alerte</p>
              <p className="text-sm text-slate-300 mt-2 text-center">
                Cliquez sur une alerte dans la liste pour afficher les détails
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
