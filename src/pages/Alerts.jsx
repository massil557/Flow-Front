// // src/pages/Alerts.jsx  — version avec onglet "Configuration des règles"
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { origins } from './Managment';
// import Button from '../components/Button';
// import {
//   Bell, BellOff, Clock, Database, ShieldAlert, Inbox,
//   AlertCircle, ChevronRight, Trash2, CheckCircle, X,
//   Settings, Plus, Pencil, ToggleLeft, ToggleRight,
//   Mail, Send, AlertTriangle, Shield, Save, FlaskConical
// } from 'lucide-react';

// // ── Helpers ──────────────────────────────────────────────────────────────────

// function getSensorMeta(code = '') {
//   const c = code.toUpperCase();
//   if (c.includes('TEMP')) return { color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    label: 'Température' };
//   if (c.includes('PRES')) return { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', label: 'Pression'    };
//   if (c.includes('HUMI')) return { color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   label: 'Humidité'    };
//   if (c.includes('CO2'))  return { color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  label: 'CO2'         };
//   return                         { color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200',  label: 'Capteur'     };
// }

// const EMPTY_FORM = {
//   sensor_prefix:         '',
//   label:                 '',
//   warning_threshold:     '',
//   danger_threshold:      '',
//   reminder_interval_min: 30,
//   email_recipients:      '',
//   custom_message:        '',
//   is_enabled:            true,
// };

// // ── Modal de création / édition d'une règle ───────────────────────────────────

// function ConfigModal({ mode, initial, onClose, onSave }) {
//   const [form,   setForm]   = useState(initial || EMPTY_FORM);
//   const [saving, setSaving] = useState(false);
//   const [error,  setError]  = useState('');

//   const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

//   const handleSubmit = async () => {
//     if (!form.sensor_prefix.trim()) return setError("Le préfixe capteur est obligatoire.");
//     if (!form.label.trim())         return setError("Le nom est obligatoire.");
//     const w = parseFloat(form.warning_threshold);
//     const d = parseFloat(form.danger_threshold);
//     if (isNaN(w) || isNaN(d))       return setError("Les seuils doivent être des nombres.");
//     if (d < w)                      return setError("Le seuil danger doit être ≥ au seuil avertissement.");
//     if (!form.email_recipients.trim()) return setError("Au moins un destinataire email est requis.");

//     setSaving(true);
//     setError('');
//     try {
//       await onSave({ ...form, warning_threshold: w, danger_threshold: d });
//       onClose();
//     } catch (e) {
//       setError(e.response?.data?.detail || 'Une erreur est survenue.');
//     } finally {
//       setSaving(false);
//     }
//   };

//   const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#17203f] focus:ring-2 focus:ring-[#17203f]/10 transition-all";
//   const labelCls = "block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5";

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
//       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

//         {/* Header */}
//         <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-[#17203f]/10 flex items-center justify-center">
//               {mode === 'create' ? <Plus className="text-[#17203f]" size={20} /> : <Pencil className="text-[#17203f]" size={18} />}
//             </div>
//             <div>
//               <h2 className="text-base font-bold text-[#17203f]">
//                 {mode === 'create' ? 'Nouvelle règle d\'alerte' : 'Modifier la règle'}
//               </h2>
//               <p className="text-xs text-slate-400 mt-0.5">Configurez les seuils et destinataires</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all">
//             <X size={18} />
//           </button>
//         </div>

//         {/* Body */}
//         <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">

//           {/* Préfixe + Label */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className={labelCls}>Préfixe capteur *</label>
//               <input
//                 className={inputCls}
//                 placeholder="ex: TEMP, PRES, CO2"
//                 value={form.sensor_prefix}
//                 onChange={e => set('sensor_prefix', e.target.value.toUpperCase())}
//               />
//               <p className="text-xs text-slate-400 mt-1">Correspond aux codes contenant ce préfixe</p>
//             </div>
//             <div>
//               <label className={labelCls}>Nom affiché *</label>
//               <input
//                 className={inputCls}
//                 placeholder="ex: Température Zone A"
//                 value={form.label}
//                 onChange={e => set('label', e.target.value)}
//               />
//             </div>
//           </div>

//           {/* Seuils */}
//           <div className="bg-slate-50 rounded-2xl p-4 space-y-3">
//             <p className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-2">
//               <AlertTriangle size={13} /> Seuils d'alerte
//             </p>
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className={labelCls}>
//                   <span className="inline-flex items-center gap-1.5">
//                     <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
//                     Avertissement *
//                   </span>
//                 </label>
//                 <input
//                   type="number" step="0.1"
//                   className={inputCls}
//                   placeholder="ex: 25"
//                   value={form.warning_threshold}
//                   onChange={e => set('warning_threshold', e.target.value)}
//                 />
//               </div>
//               <div>
//                 <label className={labelCls}>
//                   <span className="inline-flex items-center gap-1.5">
//                     <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
//                     Danger critique *
//                   </span>
//                 </label>
//                 <input
//                   type="number" step="0.1"
//                   className={inputCls}
//                   placeholder="ex: 30"
//                   value={form.danger_threshold}
//                   onChange={e => set('danger_threshold', e.target.value)}
//                 />
//               </div>
//             </div>
//             {form.warning_threshold && form.danger_threshold &&
//              parseFloat(form.danger_threshold) >= parseFloat(form.warning_threshold) && (
//               <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
//                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Normal : &lt; {form.warning_threshold}</span>
//                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> Warning : ≥ {form.warning_threshold}</span>
//                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Danger : ≥ {form.danger_threshold}</span>
//               </div>
//             )}
//           </div>

//           {/* Email */}
//           <div>
//             <label className={labelCls}>
//               <span className="inline-flex items-center gap-1.5"><Mail size={12} /> Destinataires email * (séparés par virgule)</span>
//             </label>
//             <input
//               className={inputCls}
//               placeholder="chef@usine.com, operateur@usine.com"
//               value={form.email_recipients}
//               onChange={e => set('email_recipients', e.target.value)}
//             />
//           </div>

//           {/* Rappel + Message */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className={labelCls}>Rappel toutes les (min)</label>
//               <input
//                 type="number" min="1" max="1440"
//                 className={inputCls}
//                 value={form.reminder_interval_min}
//                 onChange={e => set('reminder_interval_min', parseInt(e.target.value) || 30)}
//               />
//               <p className="text-xs text-slate-400 mt-1">Anti-spam entre deux emails</p>
//             </div>
//             <div className="flex flex-col">
//               <label className={labelCls}>Activée</label>
//               <button
//                 type="button"
//                 onClick={() => set('is_enabled', !form.is_enabled)}
//                 className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all mt-1 ${
//                   form.is_enabled
//                     ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
//                     : 'bg-slate-100 border-slate-200 text-slate-500'
//                 }`}
//               >
//                 {form.is_enabled
//                   ? <><ToggleRight size={18} /> Activée</>
//                   : <><ToggleLeft size={18} /> Désactivée</>
//                 }
//               </button>
//             </div>
//           </div>

//           <div>
//             <label className={labelCls}>Message personnalisé (optionnel)</label>
//             <textarea
//               className={`${inputCls} resize-none`}
//               rows={2}
//               placeholder="Message inclus dans l'email d'alerte..."
//               value={form.custom_message}
//               onChange={e => set('custom_message', e.target.value)}
//             />
//           </div>

//           {error && (
//             <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
//               <AlertCircle size={15} /> {error}
//             </div>
//           )}
//         </div>

//         {/* Footer */}
//         <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-all"
//           >
//             Annuler
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={saving}
//             className="flex items-center gap-2 px-5 py-2 bg-[#17203f] text-white text-sm font-semibold rounded-xl hover:bg-[#17203f]/90 disabled:opacity-50 transition-all"
//           >
//             <Save size={15} />
//             {saving ? 'Enregistrement...' : mode === 'create' ? 'Créer la règle' : 'Sauvegarder'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Carte d'une règle ─────────────────────────────────────────────────────────

// function ConfigCard({ config, onEdit, onToggle, onDelete, onTestEmail, testingId }) {
//   const meta = getSensorMeta(config.sensor_prefix);
//   const recipients = config.email_recipients
//     ? config.email_recipients.split(',').map(r => r.trim()).filter(Boolean)
//     : [];

//   return (
//     <div className={`bg-white rounded-2xl border-2 p-5 transition-all ${
//       config.is_enabled ? 'border-slate-200' : 'border-slate-100 opacity-60'
//     }`}>
//       {/* Header de la carte */}
//       <div className="flex items-start justify-between gap-3 mb-4">
//         <div className="flex items-center gap-3">
//           <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${meta.bg} ${meta.border}`}>
//             <Shield size={18} className={meta.color} />
//           </div>
//           <div>
//             <p className="font-bold text-[#17203f] text-sm">{config.label}</p>
//             <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${meta.bg} ${meta.border} ${meta.color}`}>
//               {config.sensor_prefix}
//             </span>
//           </div>
//         </div>

//         {/* Badge état */}
//         <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${
//           config.is_enabled
//             ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
//             : 'bg-slate-100 border-slate-200 text-slate-500'
//         }`}>
//           {config.is_enabled ? 'Active' : 'Inactive'}
//         </span>
//       </div>

//       {/* Seuils */}
//       <div className="grid grid-cols-2 gap-2 mb-4">
//         <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-center">
//           <p className="text-xs font-semibold text-orange-600 mb-0.5">⚠ Avertissement</p>
//           <p className="text-lg font-bold text-orange-700">{config.warning_threshold}</p>
//         </div>
//         <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
//           <p className="text-xs font-semibold text-red-600 mb-0.5">🚨 Danger</p>
//           <p className="text-lg font-bold text-red-700">{config.danger_threshold}</p>
//         </div>
//       </div>

//       {/* Destinataires */}
//       <div className="mb-4">
//         <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5 flex items-center gap-1">
//           <Mail size={11} /> Destinataires ({recipients.length})
//         </p>
//         <div className="flex flex-wrap gap-1.5">
//           {recipients.length > 0
//             ? recipients.map((r, i) => (
//                 <span key={i} className="text-xs bg-blue-50 border border-blue-100 text-blue-700 px-2 py-0.5 rounded-lg font-medium">
//                   {r}
//                 </span>
//               ))
//             : <span className="text-xs text-slate-400 italic">Aucun destinataire</span>
//           }
//         </div>
//       </div>

//       {/* Rappel */}
//       <p className="text-xs text-slate-400 mb-4 flex items-center gap-1">
//         <Clock size={11} /> Rappel toutes les {config.reminder_interval_min} min
//       </p>

//       {/* Actions */}
//       <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
//         <button
//           onClick={() => onTestEmail(config.id)}
//           disabled={testingId === config.id || recipients.length === 0}
//           className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-600 bg-violet-50 border border-violet-200 rounded-lg hover:bg-violet-100 disabled:opacity-40 transition-all"
//           title={recipients.length === 0 ? "Aucun destinataire configuré" : "Envoyer un email de test"}
//         >
//           <FlaskConical size={13} />
//           {testingId === config.id ? 'Envoi...' : 'Test email'}
//         </button>

//         <div className="flex items-center gap-1.5 ml-auto">
//           <button
//             onClick={() => onToggle(config.id)}
//             className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
//               config.is_enabled
//                 ? 'text-slate-600 border-slate-200 hover:bg-slate-50'
//                 : 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
//             }`}
//           >
//             {config.is_enabled ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
//             {config.is_enabled ? 'Désactiver' : 'Activer'}
//           </button>
//           <button
//             onClick={() => onEdit(config)}
//             className="p-1.5 text-slate-400 hover:text-[#17203f] hover:bg-slate-100 rounded-lg transition-all"
//             title="Modifier"
//           >
//             <Pencil size={14} />
//           </button>
//           <button
//             onClick={() => onDelete(config.id)}
//             className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
//             title="Supprimer"
//           >
//             <Trash2 size={14} />
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Page principale ───────────────────────────────────────────────────────────

// export default function Alerts() {
//   // ── Onglet actif ──────────────────────────────────────────────────────────
//   const [tab, setTab] = useState('alerts'); // 'alerts' | 'config'

//   // ── État alertes ──────────────────────────────────────────────────────────
//   const [alerts,       setAlerts]       = useState([]);
//   const [selected,     setSelected]     = useState(null);
//   const [loadingAl,    setLoadingAl]    = useState(true);
//   const [filter,       setFilter]       = useState('all');
//   const [mobileDetail, setMobileDetail] = useState(false);

//   // ── État configs ──────────────────────────────────────────────────────────
//   const [configs,     setConfigs]     = useState([]);
//   const [loadingCfg,  setLoadingCfg]  = useState(true);
//   const [modal,       setModal]       = useState(null);  // null | { mode, data }
//   const [testingId,   setTestingId]   = useState(null);

//   // ── État mute email ───────────────────────────────────────────────────────
//   const [emailMuted,  setEmailMuted]  = useState(false);
//   const [mutingEmail, setMutingEmail] = useState(false);

//   useEffect(() => {
//     axios.get(`${origins}/api/email-mute`)
//       .then(res => setEmailMuted(res.data.muted))
//       .catch(console.error);
//   }, []);

//   const toggleEmailMute = async () => {
//     setMutingEmail(true);
//     try {
//       const res = await axios.post(`${origins}/api/email-mute/toggle`);
//       setEmailMuted(res.data.muted);
//       showToast(res.data.muted ? "🔕 Emails silencieux" : "🔔 Emails réactivés");
//     } catch (err) {
//       showToast("Erreur lors du changement", false);
//     } finally {
//       setMutingEmail(false);
//     }
//   };

//   // ── Toast partagé ─────────────────────────────────────────────────────────
//   const [toast, setToast] = useState({ msg: '', ok: true });
//   const showToast = (msg, ok = true) => {
//     setToast({ msg, ok });
//     setTimeout(() => setToast({ msg: '', ok: true }), 3500);
//   };

//   // ── Fetch alertes (polling 5s) ────────────────────────────────────────────
//   const fetchAlerts = async () => {
//     try {
//       const res = await axios.get(`${origins}/api/alerts`);
//       setAlerts(res.data);
//     } catch (err) { console.error(err); }
//     finally { setLoadingAl(false); }
//   };

//   useEffect(() => {
//     fetchAlerts();
//     const id = setInterval(fetchAlerts, 5000);
//     return () => clearInterval(id);
//   }, []);

//   // ── Fetch configs ─────────────────────────────────────────────────────────
//   const fetchConfigs = async () => {
//     try {
//       const res = await axios.get(`${origins}/api/alert-configs`);
//       setConfigs(res.data);
//     } catch (err) { console.error(err); }
//     finally { setLoadingCfg(false); }
//   };

//   useEffect(() => { fetchConfigs(); }, []);

//   // ── Actions alertes ────────────────────────────────────────────────────────
//   const resolveAlert = async (id) => {
//     try {
//       await axios.patch(`${origins}/api/alerts/${id}/resolve`);
//       setAlerts(prev => prev.map(a => a.id === id ? { ...a, is_resolved: true } : a));
//       if (selected?.id === id) setSelected(prev => ({ ...prev, is_resolved: true }));
//       showToast('Alerte marquée comme résolue');
//     } catch (err) { console.error(err); }
//   };

//   const ignoreAlert = async (id) => {
//     try {
//       await axios.patch(`${origins}/api/alerts/${id}/ignore`);
//       setAlerts(prev => prev.filter(a => a.id !== id));
//       if (selected?.id === id) { setSelected(null); setMobileDetail(false); }
//       showToast('Alerte ignorée');
//     } catch (err) { console.error(err); }
//   };

//   const deleteAlert = async (id) => {
//     try {
//       await axios.delete(`${origins}/api/alerts/${id}`);
//       setAlerts(prev => prev.filter(a => a.id !== id));
//       if (selected?.id === id) { setSelected(null); setMobileDetail(false); }
//       showToast('Alerte supprimée');
//     } catch (err) { console.error(err); }
//   };

//   // ── Actions configs ────────────────────────────────────────────────────────
//   const handleSaveConfig = async (formData) => {
//     if (modal.mode === 'create') {
//       const res = await axios.post(`${origins}/api/alert-configs`, formData);
//       setConfigs(prev => [...prev, res.data]);
//       showToast('Règle créée avec succès ✓');
//     } else {
//       const res = await axios.put(`${origins}/api/alert-configs/${modal.data.id}`, formData);
//       setConfigs(prev => prev.map(c => c.id === modal.data.id ? res.data : c));
//       showToast('Règle mise à jour ✓');
//     }
//   };

//   const handleToggle = async (id) => {
//     try {
//       const res = await axios.patch(`${origins}/api/alert-configs/${id}/toggle`);
//       setConfigs(prev => prev.map(c => c.id === id ? res.data : c));
//       showToast(res.data.is_enabled ? 'Règle activée' : 'Règle désactivée');
//     } catch (err) { showToast('Erreur lors du changement d\'état', false); }
//   };

//   const handleDeleteConfig = async (id) => {
//     if (!window.confirm('Supprimer cette règle d\'alerte ?')) return;
//     try {
//       await axios.delete(`${origins}/api/alert-configs/${id}`);
//       setConfigs(prev => prev.filter(c => c.id !== id));
//       showToast('Règle supprimée');
//     } catch (err) { showToast('Erreur lors de la suppression', false); }
//   };

//   const handleTestEmail = async (id) => {
//     setTestingId(id);
//     try {
//       const res = await axios.post(`${origins}/api/alert-configs/${id}/test-email`);
//       showToast(`Email de test envoyé à ${res.data.sent_to.join(', ')} ✓`);
//     } catch (err) {
//       showToast(err.response?.data?.detail || 'Erreur lors de l\'envoi', false);
//     } finally {
//       setTestingId(null);
//     }
//   };

//   // ── Compteurs ──────────────────────────────────────────────────────────────
//   const activeCount   = alerts.filter(a => !a.is_resolved).length;
//   const resolvedCount = alerts.filter(a =>  a.is_resolved).length;
//   const activeConfigs = configs.filter(c => c.is_enabled).length;
//   const filtered = alerts.filter(a => {
//     if (filter === 'active')   return !a.is_resolved;
//     if (filter === 'resolved') return  a.is_resolved;
//     return true;
//   });

//   return (
//     <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">

//       {/* Toast */}
//       {toast.msg && (
//         <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all ${
//           toast.ok ? 'bg-[#17203f] text-white' : 'bg-red-600 text-white'
//         }`}>
//           {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
//           {toast.msg}
//         </div>
//       )}

//       {/* Modal */}
//       {modal && (
//         <ConfigModal
//           mode={modal.mode}
//           initial={modal.mode === 'edit' ? modal.data : null}
//           onClose={() => setModal(null)}
//           onSave={handleSaveConfig}
//         />
//       )}

//       {/* Page header */}
//       <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
//         <div>
//           <h1 className="text-3xl font-bold text-[#17203f] flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
//               <Bell className="text-red-600" size={20} />
//             </div>
//             Alertes
//           </h1>
//           <p className="text-slate-500 mt-1 text-sm font-medium">
//             {activeCount} alerte{activeCount !== 1 ? 's' : ''} active{activeCount !== 1 ? 's' : ''}
//             {resolvedCount > 0 && ` · ${resolvedCount} résolue${resolvedCount !== 1 ? 's' : ''}`}
//             {` · ${activeConfigs} règle${activeConfigs !== 1 ? 's' : ''} active${activeConfigs !== 1 ? 's' : ''}`}
//           </p>
//         </div>

//         {/* Bouton créer règle (visible sur l'onglet config) */}
//         {tab === 'config' && (
//           <button
//             onClick={() => setModal({ mode: 'create' })}
//             className="flex items-center gap-2 px-5 py-2.5 bg-[#17203f] text-white text-sm font-semibold rounded-xl hover:bg-[#17203f]/90 transition-all shadow-sm"
//           >
//             <Plus size={16} /> Nouvelle règle
//           </button>
//         )}
//       </div>

//       {/* Onglets principaux */}
//       <div className="flex gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm mb-6 w-full sm:w-auto sm:inline-flex">
//         <button
//           onClick={() => setTab('alerts')}
//           className={`flex-1 sm:flex-none flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
//             tab === 'alerts' ? 'bg-[#17203f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
//           }`}
//         >
//           <Bell size={14} />
//           Alertes
//           {activeCount > 0 && (
//             <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
//               {activeCount}
//             </span>
//           )}
//         </button>
//         <button
//           onClick={() => setTab('config')}
//           className={`flex-1 sm:flex-none flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
//             tab === 'config' ? 'bg-[#17203f] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'
//           }`}
//         >
//           <Settings size={14} />
//           Configuration
//           <span className="bg-slate-200 text-slate-600 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
//             {configs.length}
//           </span>
//         </button>
//       </div>

//       {/* ══════════════════════════ ONGLET ALERTES ══════════════════════════ */}
//       {tab === 'alerts' && (
//         <>
//           {/* Sous-filtres */}
//           <div className="flex gap-1 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm mb-6 w-full sm:w-auto sm:inline-flex">
//             {[
//               { id: 'all',      label: `Toutes (${alerts.length})`   },
//               { id: 'active',   label: `Actives (${activeCount})`    },
//               { id: 'resolved', label: `Résolues (${resolvedCount})` },
//             ].map(f => (
//               <button
//                 key={f.id}
//                 onClick={() => setFilter(f.id)}
//                 className={`flex-1 sm:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
//                   filter === f.id ? 'bg-slate-100 text-[#17203f]' : 'text-slate-500 hover:text-slate-800'
//                 }`}
//               >
//                 {f.label}
//               </button>
//             ))}
//           </div>

//           {/* Layout liste + détail */}
//           <div className="flex gap-6 h-[calc(100vh-320px)] min-h-[400px]">

//             {/* Liste */}
//             <div className={`flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden
//               ${mobileDetail ? 'hidden lg:flex' : 'flex'} w-full lg:w-2/5 xl:w-1/3`}>
//               <div className="overflow-y-auto flex-1 p-3 space-y-2">
//                 {loadingAl && (
//                   <div className="flex justify-center items-center py-16">
//                     <div className="w-7 h-7 border-2 border-[#17203f] border-t-transparent rounded-full animate-spin" />
//                   </div>
//                 )}
//                 {!loadingAl && filtered.length === 0 && (
//                   <div className="flex flex-col items-center justify-center h-full py-16 text-slate-300">
//                     <Inbox size={52} strokeWidth={1} className="mb-4" />
//                     <p className="text-sm font-semibold text-slate-400">
//                       {filter === 'resolved' ? 'Aucune alerte résolue' : 'Système nominal — aucune alerte'}
//                     </p>
//                   </div>
//                 )}
//                 {filtered.map(a => {
//                   const meta = getSensorMeta(a.code);
//                   const isSelected = selected?.id === a.id;
//                   return (
//                     <div
//                       key={a.id}
//                       onClick={() => { setSelected(a); setMobileDetail(true); }}
//                       className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200
//                         ${isSelected ? 'bg-[#17203f]/5 border-[#17203f] shadow-sm' : 'bg-slate-50/50 border-transparent hover:border-slate-200 hover:bg-white'}
//                         ${a.is_resolved ? 'opacity-55' : ''}`}
//                     >
//                       <div className="flex items-start justify-between gap-2 mb-1.5">
//                         <div className="flex items-center gap-2 flex-wrap">
//                           <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${meta.bg} ${meta.border} ${meta.color}`}>
//                             {meta.label}
//                           </span>
//                           <span className={`font-bold text-sm ${isSelected ? 'text-[#17203f]' : 'text-slate-800'}`}>{a.code}</span>
//                         </div>
//                         <span className="text-xs text-slate-400 font-medium shrink-0">{a.time}</span>
//                       </div>
//                       <p className="text-xs text-slate-500 pr-4 leading-relaxed">{a.msg}</p>
//                       {a.is_resolved && (
//                         <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
//                           <CheckCircle size={11} /> Résolue
//                         </div>
//                       )}
//                       <ChevronRight size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity ${isSelected ? 'opacity-100 text-[#17203f]' : 'opacity-0'}`} />
//                     </div>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Détail */}
//             <div className={`flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden
//               ${mobileDetail ? 'flex' : 'hidden lg:flex'} flex-col`}>
//               {selected ? (
//                 <div className="flex flex-col h-full">
//                   <div className="lg:hidden p-4 border-b border-slate-100">
//                     <button onClick={() => setMobileDetail(false)} className="flex items-center gap-2 text-sm font-semibold text-[#17203f]">
//                       <ChevronRight size={16} className="rotate-180" /> Retour aux alertes
//                     </button>
//                   </div>
//                   <div className="p-6 sm:p-8 border-b border-slate-100">
//                     <div className="flex items-start justify-between gap-4">
//                       <div className="flex items-center gap-4">
//                         <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 ${getSensorMeta(selected.code).bg} ${getSensorMeta(selected.code).border}`}>
//                           <ShieldAlert size={28} className={getSensorMeta(selected.code).color} />
//                         </div>
//                         <div>
//                           <h2 className="text-2xl font-bold text-[#17203f]">Dépassement de seuil</h2>
//                           <p className="text-slate-500 flex items-center gap-1.5 mt-1 text-sm font-medium"><Clock size={14} /> {selected.time}</p>
//                           {selected.is_resolved && (
//                             <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold">
//                               <CheckCircle size={12} /> Résolue
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                       <button onClick={() => deleteAlert(selected.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all shrink-0">
//                         <Trash2 size={18} />
//                       </button>
//                     </div>
//                   </div>
//                   <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
//                         <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Valeur relevée</p>
//                         <p className={`text-4xl font-bold tabular-nums ${getSensorMeta(selected.code).color}`}>{selected.value}</p>
//                       </div>
//                       <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
//                         <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Code capteur</p>
//                         <p className="text-4xl font-bold text-[#17203f] tabular-nums">{selected.code}</p>
//                       </div>
//                     </div>
//                     {selected.seuil && (
//                       <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
//                         <p className="text-xs text-slate-400 uppercase font-semibold tracking-wider mb-2">Seuil dépassé</p>
//                         <p className="text-2xl font-bold text-slate-700">{selected.seuil}</p>
//                       </div>
//                     )}
//                     <div>
//                       <h3 className="text-sm font-bold text-[#17203f] flex items-center gap-2 mb-3"><AlertCircle size={18} className="text-blue-500" /> Rapport automatique</h3>
//                       <div className="bg-[#17203f]/5 border-l-4 border-[#17203f] p-5 rounded-r-2xl">
//                         <p className="text-slate-700 leading-relaxed text-sm font-medium italic">{selected.msg}</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div className="p-6 sm:p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row justify-end gap-3">
//                     <Button variant="ghost" onClick={() => ignoreAlert(selected.id)} disabled={selected.is_resolved} icon={<X size={15} />}>Ignorer</Button>
//                     <Button variant={selected.is_resolved ? 'ghost' : 'success'} onClick={() => resolveAlert(selected.id)} disabled={selected.is_resolved} icon={<CheckCircle size={15} />}>
//                       {selected.is_resolved ? 'Déjà résolue' : 'Marquer comme résolue'}
//                     </Button>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="flex flex-col items-center justify-center h-full text-slate-200 p-8">
//                   <Database size={80} strokeWidth={0.8} className="mb-6" />
//                   <p className="text-lg font-bold text-slate-400">Sélectionnez une alerte</p>
//                   <p className="text-sm text-slate-300 mt-2 text-center">Cliquez sur une alerte dans la liste pour afficher les détails</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </>
//       )}

//       {/* ═══════════════════════ ONGLET CONFIGURATION ═══════════════════════ */}
//       {tab === 'config' && (
//         <div>
//           {/* ── Bouton Mute Email ───────────────────────────────────────────── */}
//           <div className={`flex items-center justify-between p-4 rounded-2xl border-2 mb-6 transition-all ${
//             emailMuted
//               ? "bg-amber-50 border-amber-300"
//               : "bg-emerald-50 border-emerald-200"
//           }`}>
//             <div className="flex items-center gap-3">
//               <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
//                 emailMuted ? "bg-amber-100" : "bg-emerald-100"
//               }`}>
//                 {emailMuted
//                   ? <BellOff size={20} className="text-amber-600" />
//                   : <Bell size={20} className="text-emerald-600" />}
//               </div>
//               <div>
//                 <p className={`font-bold text-sm ${
//                   emailMuted ? "text-amber-800" : "text-emerald-800"
//                 }`}>
//                   {emailMuted ? "Emails d'alerte silencieux" : "Emails d'alerte actifs"}
//                 </p>
//                 <p className="text-xs text-slate-500 mt-0.5">
//                   {emailMuted
//                     ? "Les alertes sont enregistrées en BDD mais aucun email n'est envoyé"
//                     : "Les emails sont envoyés aux destinataires configurés"}
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={toggleEmailMute}
//               disabled={mutingEmail}
//               className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold border-2 transition-all disabled:opacity-50 ${
//                 emailMuted
//                   ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
//                   : "bg-amber-500 text-white border-amber-500 hover:bg-amber-600"
//               }`}
//             >
//               {mutingEmail
//                 ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                 : emailMuted ? <Bell size={16} /> : <BellOff size={16} />}
//               {emailMuted ? "Réactiver les emails" : "Mettre en silence"}
//             </button>
//           </div>
//           {/* Statistiques rapides */}
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
//             {[
//               { label: 'Règles totales',    value: configs.length,                  color: 'text-[#17203f]',  bg: 'bg-slate-50'   },
//               { label: 'Règles actives',    value: activeConfigs,                   color: 'text-emerald-600', bg: 'bg-emerald-50' },
//               { label: 'Règles inactives',  value: configs.length - activeConfigs,  color: 'text-slate-500',  bg: 'bg-slate-50'   },
//               { label: 'Alertes actives',   value: activeCount,                     color: 'text-red-600',    bg: 'bg-red-50'     },
//             ].map((s, i) => (
//               <div key={i} className={`${s.bg} rounded-2xl border border-slate-200 p-4`}>
//                 <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">{s.label}</p>
//                 <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
//               </div>
//             ))}
//           </div>

//           {/* Grille de cartes */}
//           {loadingCfg ? (
//             <div className="flex justify-center items-center py-24">
//               <div className="w-8 h-8 border-2 border-[#17203f] border-t-transparent rounded-full animate-spin" />
//             </div>
//           ) : configs.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-24 text-slate-300 bg-white rounded-2xl border border-slate-200">
//               <Settings size={60} strokeWidth={0.8} className="mb-4" />
//               <p className="text-lg font-bold text-slate-400">Aucune règle configurée</p>
//               <p className="text-sm text-slate-300 mt-2 mb-6">Créez votre première règle pour surveiller vos capteurs</p>
//               <button
//                 onClick={() => setModal({ mode: 'create' })}
//                 className="flex items-center gap-2 px-5 py-2.5 bg-[#17203f] text-white text-sm font-semibold rounded-xl hover:bg-[#17203f]/90 transition-all"
//               >
//                 <Plus size={16} /> Créer une règle
//               </button>
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
//               {configs.map(cfg => (
//                 <ConfigCard
//                   key={cfg.id}
//                   config={cfg}
//                   onEdit={(c) => setModal({ mode: 'edit', data: c })}
//                   onToggle={handleToggle}
//                   onDelete={handleDeleteConfig}
//                   onTestEmail={handleTestEmail}
//                   testingId={testingId}
//                 />
//               ))}
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// src/pages/Alerts.jsx  — version avec onglet "Configuration des règles"
import { useState, useEffect } from 'react';
import axios from 'axios';
import { origins } from './Managment';
import Button from '../components/Button';
import EmailSilenceToggle from '../components/EmailSilenceToggle';
import {
  Bell, BellOff, Clock, Database, ShieldAlert, Inbox,
  AlertCircle, ChevronLeft, ChevronRight, Trash2, CheckCircle, X,
  Settings, Plus, Pencil, ToggleLeft, ToggleRight,
  Mail, Send, AlertTriangle, Shield, Save, FlaskConical
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { usePaginatedAlerts } from '../hooks/usePaginatedAlerts';

// ── Helpers ──────────────────────────────────────────────────────────────────

function getSensorMeta(code = '') {
  const c = code.toUpperCase();
  if (c.includes('TEMP')) return { color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200',    labelKey: 'alerts.sensor_temp' };
  if (c.includes('PRES')) return { color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', labelKey: 'alerts.sensor_pres' };
  if (c.includes('HUMI')) return { color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200',   labelKey: 'alerts.sensor_humi' };
  if (c.includes('CO2'))  return { color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200',  labelKey: 'alerts.sensor_co2'  };
  return                         { color: 'text-slate-600',  bg: 'bg-slate-50',  border: 'border-slate-200',  labelKey: 'alerts.sensor_default' };
}

const EMPTY_FORM = {
  sensor_prefix:         '',
  label:                 '',
  warning_threshold:     '',
  danger_threshold:      '',
  reminder_interval_min: 30,
  email_recipients:      '',
  custom_message:        '',
  is_enabled:            true,
};

// ── Modal de création / édition d'une règle ───────────────────────────────────

function ConfigModal({ mode, initial, onClose, onSave }) {
  const { t } = useTranslation();
  const [form,   setForm]   = useState(initial || EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');
  const [sensors, setSensors] = useState([]);
  const [loadingSensors, setLoadingSensors] = useState(true);

  useEffect(() => {
    axios.get(`${origins}/api/sensors`)
      .then(res => setSensors(res.data))
      .catch(() => setError("Erreur lors du chargement des capteurs"))
      .finally(() => setLoadingSensors(false));
  }, []);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSensorSelect = (e) => {
    const id = parseInt(e.target.value);
    if (!id) {
      set('sensor_id', null);
      set('sensor_prefix', '');
      return;
    }
    const sensor = sensors.find(s => s.id === id);
    if (sensor) {
      set('sensor_id', sensor.id);
      set('sensor_prefix', sensor.code_unique);
    }
  };

  const handleSubmit = async () => {
    if (!form.sensor_prefix.trim()) return setError(t('alerts.error_prefix_required'));
    if (!form.label.trim())         return setError(t('alerts.error_name_required'));
    const w = parseFloat(form.warning_threshold);
    const d = parseFloat(form.danger_threshold);
    if (isNaN(w) || isNaN(d))       return setError(t('alerts.error_thresholds_numbers'));
    if (d < w)                      return setError(t('alerts.error_danger_threshold'));
    if (!form.email_recipients.trim()) return setError(t('alerts.error_email_required'));

    setSaving(true);
    setError('');
    try {
      await onSave({ ...form, warning_threshold: w, danger_threshold: d });
      onClose();
    } catch (e) {
      setError(e.response?.data?.detail || t('alerts.error_generic'));
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:border-[#17203f] focus:ring-2 focus:ring-[#17203f]/10 transition-all dark:bg-[#334155]";
  const labelCls = "block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17203f]/10 flex items-center justify-center">
              {mode === 'create' ? <Plus className="text-[#17203f]" size={20} /> : <Pencil className="text-[#17203f]" size={18} />}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#17203f] dark:text-white">
                {mode === 'create' ? t('alerts.create_rule') : t('alerts.edit_rule')}
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{t('alerts.configure_thresholds')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">

          {/* Capteur (dropdown) + Label */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('alerts.sensor_select_label')}</label>
              <select
                className={inputCls}
                value={form.sensor_id || ''}
                onChange={handleSensorSelect}
                disabled={loadingSensors}
              >
                {loadingSensors ? (
                  <option value="">{t('common.loading')}</option>
                ) : sensors.length === 0 ? (
                  <option value="" disabled>{t('alerts.no_sensors')}</option>
                ) : (
                  <>
                    <option value="">{t('alerts.sensor_select_placeholder')}</option>
                    {sensors.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.code_unique} — {s.type_grandeur} ({s.unite})
                      </option>
                    ))}
                  </>
                )}
              </select>
              {form.sensor_prefix && (
                <p className="text-xs text-slate-400 mt-1">{t('alerts.sensor_prefix_helper')}: <strong>{form.sensor_prefix}</strong></p>
              )}
            </div>
            <div>
              <label className={labelCls}>{t('alerts.display_name')}</label>
              <input
                className={inputCls}
                placeholder={t('alerts.display_name_placeholder')}
                value={form.label}
                onChange={e => set('label', e.target.value)}
              />
            </div>
          </div>

          {/* Seuils */}
          <div className="bg-slate-50 dark:bg-[#0f172a] rounded-2xl p-4 space-y-3">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle size={13} /> {t('alerts.alert_thresholds')}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-orange-400 inline-block" />
                    {t('alerts.warning')}
                  </span>
                </label>
                  <input
                    type="number" step="0.1"
                    className={inputCls}
                    placeholder={t('alerts.warning_placeholder')}
                    value={form.warning_threshold}
                  onChange={e => set('warning_threshold', e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" />
                    {t('alerts.danger')}
                  </span>
                </label>
                  <input
                    type="number" step="0.1"
                    className={inputCls}
                    placeholder={t('alerts.danger_placeholder')}
                    value={form.danger_threshold}
                  onChange={e => set('danger_threshold', e.target.value)}
                />
              </div>
            </div>
            {form.warning_threshold && form.danger_threshold &&
             parseFloat(form.danger_threshold) >= parseFloat(form.warning_threshold) && (
              <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {t('alerts.normal')} {form.warning_threshold}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400" /> Warning : ≥ {form.warning_threshold}</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Danger : ≥ {form.danger_threshold}</span>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className={labelCls}>
              <span className="inline-flex items-center gap-1.5"><Mail size={12} /> {t('alerts.email_recipients')}</span>
            </label>
            <input
              className={inputCls}
              placeholder={t('alerts.email_recipients_placeholder')}
              value={form.email_recipients}
              onChange={e => set('email_recipients', e.target.value)}
            />
          </div>

          {/* Rappel + Message */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>{t('alerts.reminder')}</label>
              <input
                type="number" min="1" max="1440"
                className={inputCls}
                value={form.reminder_interval_min}
                onChange={e => set('reminder_interval_min', parseInt(e.target.value) || 30)}
              />
              <p className="text-xs text-slate-400 mt-1">{t('alerts.reminder_helper')}</p>
            </div>
            <div className="flex flex-col">
              <label className={labelCls}>{t('alerts.enabled')}</label>
              <button
                type="button"
                onClick={() => set('is_enabled', !form.is_enabled)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all mt-1 ${
                  form.is_enabled
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'
                }`}
              >
                {form.is_enabled
                  ? <><ToggleRight size={18} /> {t('alerts.enabled')}</>
                  : <><ToggleLeft size={18} /> {t('alerts.disabled')}</>
                }
              </button>
            </div>
          </div>

          <div>
            <label className={labelCls}>{t('alerts.custom_message')}</label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={2}
              placeholder={t('alerts.custom_message_placeholder')}
              value={form.custom_message}
              onChange={e => set('custom_message', e.target.value)}
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-700 dark:text-red-400 text-sm rounded-xl px-4 py-3">
              <AlertCircle size={15} /> {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0f172a]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 bg-[#17203f] text-white text-sm font-semibold rounded-xl hover:bg-[#17203f]/90 disabled:opacity-50 transition-all"
          >
            <Save size={15} />
            {saving ? t('alerts.saving') : mode === 'create' ? t('alerts.create_rule_btn') : t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Carte d'une règle ─────────────────────────────────────────────────────────

function ConfigCard({ config, onEdit, onToggle, onDelete, onTestEmail, testingId, isAdmin }) {
  const { t } = useTranslation();
  const meta = getSensorMeta(config.sensor_prefix);
  const recipients = config.email_recipients
    ? config.email_recipients.split(',').map(r => r.trim()).filter(Boolean)
    : [];

  return (
    <div className={`bg-white dark:bg-[#1e293b] rounded-2xl border-2 p-5 transition-all ${
      config.is_enabled ? 'border-slate-200 dark:border-slate-700' : 'border-slate-100 dark:border-slate-800 opacity-60'
    }`}>
      {/* Header de la carte */}
      <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${meta.bg} ${meta.border}`}>
            <Shield size={18} className={meta.color} />
          </div>
          <div>
            <p className="font-bold text-[#17203f] dark:text-white text-sm">{config.label}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${meta.bg} ${meta.border} ${meta.color}`}>
              {config.sensor_prefix}
            </span>
          </div>
        </div>

        {/* Badge état */}
        <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${
          config.is_enabled
            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400'
        }`}>
          {config.is_enabled ? t('alerts.active_badge') : t('alerts.inactive_badge')}
        </span>
      </div>

      {/* Seuils */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/30 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 mb-0.5 flex items-center justify-center gap-1">
            <AlertTriangle size={11} className="text-orange-500" /> {t('alerts.warning_label')}
          </p>
          <p className="text-lg font-bold text-orange-700 dark:text-orange-300">{config.warning_threshold}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/30 rounded-xl p-3 text-center">
          <p className="text-xs font-semibold text-red-600 dark:text-red-400 mb-0.5 flex items-center justify-center gap-1">
            <AlertTriangle size={11} className="text-red-500" /> {t('alerts.danger_label')}
          </p>
          <p className="text-lg font-bold text-red-700 dark:text-red-300">{config.danger_threshold}</p>
        </div>
      </div>

      {/* Destinataires */}
      <div className="mb-4">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5 flex items-center gap-1">
          <Mail size={11} /> {t('alerts.recipients', { count: recipients.length })}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {recipients.length > 0
            ? recipients.map((r, i) => (
                <span key={i} className="text-xs bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-lg font-medium">
                  {r}
                </span>
              ))
            : <span className="text-xs text-slate-400 dark:text-slate-500 italic">{t('alerts.no_recipients_text')}</span>
          }
        </div>
      </div>

      {/* Rappel */}
      <p className="text-xs text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-1">
        <Clock size={11} /> {t('alerts.reminder_every', { min: config.reminder_interval_min })}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700">
        <button
          onClick={() => onTestEmail(config.id)}
          disabled={testingId === config.id || recipients.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/30 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-500/20 disabled:opacity-40 transition-all"
          title={recipients.length === 0 ? t('alerts.no_recipients_title') : t('alerts.test_email_title')}
        >
          <FlaskConical size={13} />
          {testingId === config.id ? t('alerts.sending_test') : t('alerts.test_email')}
        </button>

        <div className="flex items-center gap-1.5 ml-auto">
          {isAdmin && (
            <>
              <button
                onClick={() => onToggle(config.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                  config.is_enabled
                    ? 'text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/30 hover:bg-emerald-100 dark:hover:bg-emerald-500/20'
                }`}
              >
                {config.is_enabled ? <ToggleLeft size={13} /> : <ToggleRight size={13} />}
                {config.is_enabled ? t('alerts.disable') : t('alerts.enable')}
              </button>
              <button
                onClick={() => onEdit(config)}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-[#17203f] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                title={t('alerts.edit_tooltip')}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(config.id)}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all"
                title={t('alerts.delete_tooltip')}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page principale ───────────────────────────────────────────────────────────

export default function Alerts() {
  const { t } = useTranslation();
  const { user, token } = useAuth();
  // ── Onglet actif ──────────────────────────────────────────────────────────
  const [tab, setTab] = useState('alerts'); // 'alerts' | 'config'

  // ── Sous-onglet Config ─────────────────────────────────────────────────────
  const [configSubTab, setConfigSubTab] = useState('basic'); // 'basic' | 'advanced'

  // ── État alertes (usePaginatedAlerts) ─────────────────────────────────────
  const {
    alerts,
    total,
    currentPage,
    loading: loadingAl,
    loadingPage,
    hasOlder,
    hasNewer,
    goOlder,
    goNewer,
    resolveAlert: resolveAlertHook,
    ignoreAlert: ignoreAlertHook,
    deleteAlert: deleteAlertHook,
    displayCount,
  } = usePaginatedAlerts();

  const [selected,     setSelected]     = useState(null);
  const [filter,       setFilter]       = useState('all');
  const [mobileDetail, setMobileDetail] = useState(false);

  // ── État configs ──────────────────────────────────────────────────────────
  const [configs,     setConfigs]     = useState([]);
  const [loadingCfg,  setLoadingCfg]  = useState(true);
  const [modal,       setModal]       = useState(null);  // null | { mode, data }
  const [testingId,   setTestingId]   = useState(null);

  // ── État AlertRules ───────────────────────────────────────────────────────
  const [rules,         setRules]         = useState([]);
  const [loadingRules,  setLoadingRules]  = useState(true);
  const [ruleModal,     setRuleModal]     = useState(null);
  const [sensorsMap,    setSensorsMap]    = useState({});

  // ── État mute email ───────────────────────────────────────────────────────
  const [emailMuted,  setEmailMuted]  = useState(false);
  const [mutingEmail, setMutingEmail] = useState(false);

  useEffect(() => {
    axios.get(`${origins}/api/email-mute`)
      .then(res => setEmailMuted(res.data.muted))
      .catch(console.error);
  }, []);

  const authHeaders = () => ({ headers: { Authorization: `Bearer ${token}` } });

  const toggleEmailMute = async (desiredSilenced) => {
    setMutingEmail(true);
    try {
      const res = await axios.post(`${origins}/api/admin/email-silence`, { silenced: desiredSilenced }, authHeaders());
      setEmailMuted(res.data.silenced);
      showToast(res.data.silenced ? t('alerts.email_muted_toast') : t('alerts.email_unmuted_toast'));
    } catch (err) {
      showToast(t('alerts.toggle_error_toast'), false);
    } finally {
      setMutingEmail(false);
    }
  };

  // ── Toast partagé ─────────────────────────────────────────────────────────
  const [toast, setToast] = useState({ msg: '', ok: true });
  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3500);
  };

  // ── Fetch configs ─────────────────────────────────────────────────────────
  const fetchConfigs = async () => {
    try {
      const res = await axios.get(`${origins}/api/alert-configs`);
      setConfigs(res.data);
    } catch (err) { console.error(err); }
    finally { setLoadingCfg(false); }
  };

  useEffect(() => { fetchConfigs(); }, []);

  // ── Fetch AlertRules + sensors map ────────────────────────────────────────
  const fetchRules = async () => {
    try {
      const [rulesRes, sensorsRes] = await Promise.all([
        axios.get(`${origins}/api/rules`),
        axios.get(`${origins}/api/sensors`),
      ]);
      setRules(rulesRes.data);
      const map = {};
      sensorsRes.data.forEach(s => { map[s.id] = s; });
      setSensorsMap(map);
    } catch (err) { console.error(err); }
    finally { setLoadingRules(false); }
  };

  useEffect(() => { fetchRules(); }, []);

  // ── Actions alertes (wrappers with selected + toast) ──────────────────────
  const handleResolve = async (id) => {
    try {
      await resolveAlertHook(id);
      if (selected?.id === id) setSelected(prev => ({ ...prev, is_resolved: true }));
      showToast(t('alerts.toast_resolved'));
    } catch (err) { console.error(err); }
  };

  const handleIgnore = async (id) => {
    try {
      await ignoreAlertHook(id);
      if (selected?.id === id) { setSelected(null); setMobileDetail(false); }
      showToast(t('alerts.toast_ignored'));
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (id) => {
    try {
      await deleteAlertHook(id);
      if (selected?.id === id) { setSelected(null); setMobileDetail(false); }
      showToast(t('alerts.toast_deleted'));
    } catch (err) { console.error(err); }
  };

  // ── Actions configs ────────────────────────────────────────────────────────
  const handleSaveConfig = async (formData) => {
    if (modal.mode === 'create') {
      const res = await axios.post(`${origins}/api/alert-configs`, formData, authHeaders());
      setConfigs(prev => [...prev, res.data]);
      showToast(t('alerts.toast_rule_created'));
    } else {
      const res = await axios.put(`${origins}/api/alert-configs/${modal.data.id}`, formData);
      setConfigs(prev => prev.map(c => c.id === modal.data.id ? res.data : c));
      showToast(t('alerts.toast_rule_updated'));
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await axios.patch(`${origins}/api/alert-configs/${id}/toggle`);
      setConfigs(prev => prev.map(c => c.id === id ? res.data : c));
      showToast(res.data.is_enabled ? t('alerts.toast_rule_enabled') : t('alerts.toast_rule_disabled'));
    } catch (err) { showToast(t('alerts.toast_toggle_error'), false); }
  };

  const handleDeleteConfig = async (id) => {
    if (!window.confirm(t('alerts.confirm_delete_rule'))) return;
    try {
      await axios.delete(`${origins}/api/alert-configs/${id}`, authHeaders());
      setConfigs(prev => prev.filter(c => c.id !== id));
      showToast(t('alerts.toast_rule_deleted'));
    } catch (err) { showToast(t('alerts.toast_delete_error'), false); }
  };

  const handleTestEmail = async (id) => {
    setTestingId(id);
    try {
      const res = await axios.post(`${origins}/api/alert-configs/${id}/test-email`);
      showToast(t('alerts.toast_test_sent', { emails: res.data.sent_to.join(', ') }));
    } catch (err) {
      showToast(err.response?.data?.detail || t('alerts.toast_test_error'), false);
    } finally {
      setTestingId(null);
    }
  };

  // ── Actions AlertRules ───────────────────────────────────────────────────────
  const handleSaveRule = async (formData) => {
    if (ruleModal.mode === 'create') {
      const res = await axios.post(`${origins}/api/rules`, formData, authHeaders());
      setRules(prev => [...prev, res.data]);
      showToast("Règle avancée créée");
    } else {
      const res = await axios.put(`${origins}/api/rules/${ruleModal.data.id}`, formData, authHeaders());
      setRules(prev => prev.map(r => r.id === ruleModal.data.id ? res.data : r));
      showToast("Règle avancée mise à jour");
    }
  };

  const handleToggleRule = async (id) => {
    try {
      const rule = rules.find(r => r.id === id);
      const res = await axios.put(`${origins}/api/rules/${id}`, { active: !rule.active }, authHeaders());
      setRules(prev => prev.map(r => r.id === id ? res.data : r));
      showToast(res.data.active ? "Règle activée" : "Règle désactivée");
    } catch (err) { showToast("Erreur lors du changement d'état", false); }
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm("Supprimer cette règle avancée ?")) return;
    try {
      await axios.delete(`${origins}/api/rules/${id}`, authHeaders());
      setRules(prev => prev.filter(r => r.id !== id));
      showToast("Règle avancée supprimée");
    } catch (err) { showToast("Erreur lors de la suppression", false); }
  };

  // ── Compteurs ──────────────────────────────────────────────────────────────
  const activeCount   = alerts.filter(a => !a.is_resolved).length;
  const resolvedCount = alerts.filter(a =>  a.is_resolved).length;
  const activeConfigs = configs.filter(c => c.is_enabled).length;
  const filtered = alerts.filter(a => {
    if (filter === 'active')   return !a.is_resolved;
    if (filter === 'resolved') return  a.is_resolved;
    return true;
  });

  return (
    // CHANGED: removed max-w-7xl mx-auto, added w-full
    <div className="p-4 sm:p-6 lg:p-8 w-full">

      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all ${
          toast.ok ? 'bg-[#17203f] dark:bg-[#1e293b] text-white' : 'bg-red-600 text-white'
        }`}>
          {toast.ok ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          {toast.msg}
        </div>
      )}

      {/* Modal AlertConfig */}
      {modal && (
        <ConfigModal
          mode={modal.mode}
          initial={modal.mode === 'edit' ? modal.data : null}
          onClose={() => setModal(null)}
          onSave={handleSaveConfig}
        />
      )}

      {/* Modal AlertRule */}
      {ruleModal && (
        <AlertRuleModal
          mode={ruleModal.mode}
          initial={ruleModal.mode === 'edit' ? ruleModal.data : null}
          onClose={() => setRuleModal(null)}
          onSave={handleSaveRule}
        />
      )}

      {/* Page header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#17203f] dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
              <Bell className="text-red-600 dark:text-red-400" size={20} />
            </div>
            {t('alerts.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            {t('alerts.active', { count: activeCount })} · {t('alerts.resolved', { count: resolvedCount })} · <span className="font-semibold">Total: {displayCount}</span> · {t('alerts.active_rules', { count: activeConfigs })}
          </p>
        </div>

        {/* Bouton créer règle (visible sur l'onglet config, admin only) */}
        {tab === 'config' && user?.is_admin && (
          <button
            onClick={() => setModal({ mode: 'create' })}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#17203f] text-white text-sm font-semibold rounded-xl hover:bg-[#17203f]/90 transition-all shadow-sm"
          >
            <Plus size={16} /> {t('alerts.new_rule')}
          </button>
        )}
      </div>

      {/* Onglets principaux */}
      <div className="flex gap-1 bg-white dark:bg-[#1e293b] p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 w-full sm:w-auto sm:inline-flex">
        <button
          onClick={() => setTab('alerts')}
          className={`flex-1 sm:flex-none flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            tab === 'alerts' ? 'bg-[#17203f] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Bell size={14} />
          {t('alerts.tab_alerts')}
          {activeCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {activeCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab('config')}
          className={`flex-1 sm:flex-none flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
            tab === 'config' ? 'bg-[#17203f] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Settings size={14} />
          {t('alerts.tab_config')}
          <span className="bg-slate-200 dark:bg-slate-600 text-slate-600 dark:text-slate-300 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {configs.length}
          </span>
        </button>
      </div>

      {/* ══════════════════════════ ONGLET ALERTES ══════════════════════════ */}
      {tab === 'alerts' && (
        <>
          {/* Sous-filtres */}
          <div className="flex gap-1 bg-white dark:bg-[#1e293b] p-1.5 rounded-xl border ml-5 border-slate-200 dark:border-slate-700 shadow-sm mb-6 w-full sm:w-auto sm:inline-flex">
            {[
              { id: 'all',      label: t('alerts.all', { count: alerts.length })      },
              { id: 'active',   label: t('alerts.active', { count: activeCount })       },
              { id: 'resolved', label: t('alerts.resolved', { count: resolvedCount })   },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`flex-1 sm:flex-none px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                  filter === f.id ? 'bg-slate-100 dark:bg-slate-700 text-[#17203f] dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Page range indicator */}
          {!loadingAl && total > 0 && (
            <div className="mb-3 ml-5 text-xs text-slate-400 dark:text-slate-500 font-medium">
              {(() => {
                const start = (currentPage - 1) * 99 + 1;
                const end = Math.min(currentPage * 99, total);
                return `${start}–${end} ${t('alerts.of') || 'of'} ${total}`;
              })()}
            </div>
          )}

          {/* Layout liste + détail */}
          <div className="flex gap-6 h-[calc(100vh-320px)] min-h-[400px]">

            {/* Liste - CHANGED: made wider (lg:w-1/2 xl:w-2/5 instead of lg:w-2/5 xl:w-1/3) */}
            <div className={`flex flex-col bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden
              ${mobileDetail ? 'hidden lg:flex' : 'flex'} w-full lg:w-1/2 xl:w-2/5`}>
              <div className="overflow-y-auto flex-1 p-3 space-y-2">
                {loadingAl && (
                  <div className="flex justify-center items-center py-16">
                    <div className="w-7 h-7 border-2 border-[#17203f] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                {!loadingAl && filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-slate-300 dark:text-slate-600">
                    <Inbox size={52} strokeWidth={1} className="mb-4" />
                    <p className="text-sm font-semibold text-slate-400 dark:text-slate-500">
                      {filter === 'resolved' ? t('alerts.no_alerts_resolved') : t('alerts.no_alerts_nominal')}
                    </p>
                  </div>
                )}

                {filtered.map(a => {
                  const meta = getSensorMeta(a.code);
                  const isSelected = selected?.id === a.id;
                  return (
                    <div
                      key={a.id}
                      onClick={() => { setSelected(a); setMobileDetail(true); }}
                      className={`relative cursor-pointer p-4 rounded-xl border-2 transition-all duration-200
                        ${isSelected ? 'bg-[#17203f]/5 dark:bg-[#17203f]/20 border-[#17203f] shadow-sm' : 'bg-slate-50/50 dark:bg-slate-800/30 border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-[#1e293b]'}
                        ${a.is_resolved ? 'opacity-55' : ''}`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2.5 py-0.5 rounded-lg text-xs font-semibold border ${meta.bg} ${meta.border} ${meta.color}`}>
                            {t(meta.labelKey)}
                          </span>
                          {a.severity && (
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${a.severity === 'danger' ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                              {a.severity === 'danger' ? t('alerts.danger_label') : t('alerts.warning_label')}
                            </span>
                          )}
                          <span className={`font-bold text-sm ${isSelected ? 'text-[#17203f] dark:text-white' : 'text-slate-800 dark:text-slate-200'}`}>{a.code}</span>
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium shrink-0">{a.time}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 pr-4 leading-relaxed">{a.msg}</p>
                      {a.is_resolved && (
                        <div className="mt-2 flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle size={11} /> {t('alerts.resolved_badge')}
                        </div>
                      )}
                      <ChevronRight size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 transition-opacity ${isSelected ? 'opacity-100 text-[#17203f]' : 'opacity-0'}`} />
                    </div>
                  );
                })}
              </div>

              {/* Pagination bar — side by side buttons + page indicator */}
              {!loadingAl && total > 0 && (
                <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0f172a] px-4 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={goOlder}
                      disabled={loadingPage || !hasOlder}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <span>Next</span>
                      {loadingPage ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </button>

                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 select-none">
                      {(() => {
                        const start = (currentPage - 1) * 99 + 1;
                        const end = Math.min(currentPage * 99, total);
                        return `${start}–${end} / ${total}`;
                      })()}
                    </span>

                    <button
                      onClick={goNewer}
                      disabled={loadingPage || !hasNewer}
                      className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      {loadingPage ? (
                        <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <ChevronLeft size={16} />
                      )}
                      <span>Prev</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Détail */}
            <div className={`flex-1 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden
              ${mobileDetail ? 'flex' : 'hidden lg:flex'} flex-col`}>
              {selected ? (
                <div className="flex flex-col h-full">
                  <div className="lg:hidden p-4 border-b border-slate-100 dark:border-slate-700">
                    <button onClick={() => setMobileDetail(false)} className="flex items-center gap-2 text-sm font-semibold text-[#17203f] dark:text-white">
                      <ChevronRight size={16} className="rotate-180" /> {t('alerts.back_to_alerts_mobile')}
                    </button>
                  </div>
                  <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 shrink-0 ${getSensorMeta(selected.code).bg} ${getSensorMeta(selected.code).border}`}>
                          <ShieldAlert size={28} className={getSensorMeta(selected.code).color} />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-[#17203f] dark:text-white">{t('alerts.threshold_exceeded')}</h2>
                          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1 text-sm font-medium"><Clock size={14} /> {selected.time}</p>
                          {selected.severity && (
                            <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold border ${
                              selected.severity === 'danger'
                                ? 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/30'
                                : 'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-500/30'
                            }`}>
                              {selected.severity === 'danger' ? t('alerts.danger_label') : t('alerts.warning_label')}
                            </div>
                          )}
                          {selected.is_resolved && (
                            <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-xs font-semibold">
                              <CheckCircle size={12} /> {t('alerts.resolved_badge')}
                            </div>
                          )}
                        </div>
                      </div>
                      <button onClick={() => handleDelete(selected.id)} className="p-2.5 text-slate-300 dark:text-slate-600 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all shrink-0">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-2">{t('alerts.valeur_relevee')}</p>
                        <p className={`text-4xl font-bold tabular-nums ${getSensorMeta(selected.code).color}`}>{selected.value}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-2">{t('alerts.code_capteur')}</p>
                        <p className="text-4xl font-bold text-[#17203f] dark:text-white tabular-nums">{selected.code}</p>
                      </div>
                    </div>
                    {selected.seuil && (
                      <div className="bg-slate-50 dark:bg-[#0f172a] p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-400 dark:text-slate-500 uppercase font-semibold tracking-wider mb-2">{t('alerts.seuil_depasse')}</p>
                        <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">{selected.seuil}</p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-bold text-[#17203f] dark:text-white flex items-center gap-2 mb-3"><AlertCircle size={18} className="text-blue-500" /> {t('alerts.rapport_automatique')}</h3>
                      <div className="bg-[#17203f]/5 dark:bg-[#17203f]/20 border-l-4 border-[#17203f] p-5 rounded-r-2xl">
                        <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm font-medium italic">{selected.msg}</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 sm:p-8 border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-[#0f172a] flex flex-col sm:flex-row justify-end gap-3">
                    <Button variant="ghost" onClick={() => handleIgnore(selected.id)} disabled={selected.is_resolved} icon={<X size={15} />}>{t('alerts.ignore')}</Button>
                    <Button variant={selected.is_resolved ? 'ghost' : 'success'} onClick={() => handleResolve(selected.id)} disabled={selected.is_resolved} icon={<CheckCircle size={15} />}>
                      {selected.is_resolved ? t('alerts.already_resolved') : t('alerts.mark_resolved')}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-200 dark:text-slate-600 p-8">
                  <Database size={80} strokeWidth={0.8} className="mb-6" />
                  <p className="text-lg font-bold text-slate-400 dark:text-slate-500">{t('alerts.select_alert')}</p>
                  <p className="text-sm text-slate-300 dark:text-slate-500 mt-2 text-center">{t('alerts.select_alert_hint')}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ═══════════════════════ ONGLET CONFIGURATION ═══════════════════════ */}
      {tab === 'config' && (
        <div>
          {/* ── Sous-onglets ──────────────────────────────────────────────────── */}
          <div className="flex gap-1 bg-white dark:bg-[#1e293b] p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6 w-full sm:w-auto sm:inline-flex">
            <button
              onClick={() => setConfigSubTab('basic')}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                configSubTab === 'basic' ? 'bg-[#17203f] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Settings size={14} />
              {t('alerts.basic_rules_tab')}
            </button>
            <button
              onClick={() => setConfigSubTab('advanced')}
              className={`flex-1 sm:flex-none flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
                configSubTab === 'advanced' ? 'bg-[#17203f] text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Shield size={14} />
              {t('alerts.advanced_rules_tab')}
            </button>
          </div>

          {/* ══════════════ SOUS-ONGLET : RÈGLES SIMPLES (AlertConfig) ══════════ */}
          {configSubTab === 'basic' && (
            <>
              {/* ── Email Silence Toggle (admin only) ───────────────────────────── */}
              {user?.is_admin && (
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 mb-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                        emailMuted ? "bg-amber-100 dark:bg-amber-500/20" : "bg-emerald-100 dark:bg-emerald-500/20"
                      }`}>
                        {emailMuted
                          ? <BellOff size={18} className="text-amber-600 dark:text-amber-400" />
                          : <Bell size={18} className="text-emerald-600 dark:text-emerald-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${
                          emailMuted ? "text-amber-700 dark:text-amber-400" : "text-emerald-700 dark:text-emerald-400"
                        }`}>
                          {emailMuted ? t('alerts.emails_muted') : t('alerts.emails_active')}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {emailMuted
                            ? t('alerts.muted_description')
                            : t('alerts.active_description')}
                        </p>
                      </div>
                    </div>
                    <EmailSilenceToggle
                      silenced={emailMuted}
                      loading={mutingEmail}
                      onToggle={() => toggleEmailMute(!emailMuted)}
                      label={t('alerts.silence_toggle_label')}
                    />
                  </div>
                  {emailMuted && (
                    <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-2 rounded-lg border border-amber-200 dark:border-amber-500/20">
                      <BellOff size={14} className="shrink-0" />
                      <span>{t('alerts.silence_warning')}</span>
                    </div>
                  )}
                </div>
              )}
              {/* Statistiques rapides */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: t('alerts.total_rules'),   value: configs.length,                  color: 'text-[#17203f]',  bg: 'bg-slate-50'   },
                  { label: t('alerts.active_rules'),  value: activeConfigs,                   color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: t('alerts.inactive_rules'), value: configs.length - activeConfigs,  color: 'text-slate-500',  bg: 'bg-slate-50'   },
                  { label: t('alerts.active_alerts'),  value: activeCount,                     color: 'text-red-600',    bg: 'bg-red-50'     },
                ].map((s, i) => (
                  <div key={i} className={`${s.bg} dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 p-4`}>
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{s.label}</p>
                    <p className={`text-3xl font-bold ${s.color} dark:opacity-90`}>{s.value}</p>
                  </div>
                ))}
              </div>
              {loadingCfg ? (
                <div className="flex justify-center items-center py-24">
                  <div className="w-8 h-8 border-2 border-[#17203f] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : configs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-600 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Settings size={60} strokeWidth={0.8} className="mb-4" />
                  <p className="text-lg font-bold text-slate-400 dark:text-slate-500">{t('alerts.no_rules')}</p>
                  <p className="text-sm text-slate-300 dark:text-slate-500 mt-2 mb-6">{t('alerts.no_rules_hint')}</p>
                  {user?.is_admin && (
                    <button onClick={() => setModal({ mode: 'create' })} className="flex items-center gap-2 px-5 py-2.5 bg-[#17203f] text-white text-sm font-semibold rounded-xl hover:bg-[#17203f]/90 transition-all">
                      <Plus size={16} /> {t('alerts.create_rule')}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {configs.map(cfg => (
                    <ConfigCard
                      key={cfg.id}
                      config={cfg}
                      onEdit={(c) => setModal({ mode: 'edit', data: c })}
                      onToggle={handleToggle}
                      onDelete={handleDeleteConfig}
                      onTestEmail={handleTestEmail}
                      testingId={testingId}
                      isAdmin={user?.is_admin}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* ══════════════ SOUS-ONGLET : RÈGLES AVANCÉES (AlertRule) ════════════ */}
          {configSubTab === 'advanced' && (
            <div>
              {/* Bouton créer */}
              {user?.is_admin && (
                <div className="flex justify-end mb-4">
                  <button onClick={() => setRuleModal({ mode: 'create' })} className="flex items-center gap-2 px-5 py-2.5 bg-[#17203f] text-white text-sm font-semibold rounded-xl hover:bg-[#17203f]/90 transition-all shadow-sm">
                    <Plus size={16} /> {t('alerts.advanced_rule_create')}
                  </button>
                </div>
              )}
              {loadingRules ? (
                <div className="flex justify-center items-center py-24">
                  <div className="w-8 h-8 border-2 border-[#17203f] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-slate-300 dark:text-slate-600 bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700">
                  <Shield size={60} strokeWidth={0.8} className="mb-4" />
                  <p className="text-lg font-bold text-slate-400 dark:text-slate-500">{t('alerts.no_rules_advanced')}</p>
                  <p className="text-sm text-slate-300 dark:text-slate-500 mt-2">{t('alerts.no_rules_advanced_hint')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {rules.map(rule => (
                    <AlertRuleCard
                      key={rule.id}
                      rule={rule}
                      sensorsMap={sensorsMap}
                      onDelete={handleDeleteRule}
                      onToggle={handleToggleRule}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}