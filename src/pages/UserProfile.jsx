// src/pages/UserProfile.jsx
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { origins } from './Managment';
import Button from '../components/Button';
import { User, Shield, KeyRound, LogOut, Check, Eye, EyeOff, Clock } from 'lucide-react';

export default function UserProfile() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [tab,         setTab]         = useState('info');
  const [showOld,     setShowOld]     = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [oldPwd,      setOldPwd]      = useState('');
  const [newPwd,      setNewPwd]      = useState('');
  const [confirmPwd,  setConfirmPwd]  = useState('');
  const [saving,      setSaving]      = useState(false);
  const [toast,       setToast]       = useState({ msg: '', ok: true });

  const showToast = (msg, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast({ msg: '', ok: true }), 3500);
  };

  const handleChangePassword = async () => {
    if (!oldPwd || !newPwd || !confirmPwd) return showToast('Tous les champs sont requis.', false);
    if (newPwd !== confirmPwd)             return showToast('Les mots de passe ne correspondent pas.', false);
    if (newPwd.length < 6)                return showToast('Minimum 6 caractères requis.', false);
    setSaving(true);
    try {
      await axios.patch(
        `${origins}/auth/change-password`,
        { old_password: oldPwd, new_password: newPwd },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast('Mot de passe mis à jour avec succès.');
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (e) {
      showToast(e.response?.data?.detail || 'Erreur lors du changement.', false);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/'); };

  const PERMISSIONS = {
    admin:        ['Gestion des utilisateurs', 'Tableau de bord', 'Analytiques', 'Alertes', 'Carte usine'],
    automatician: ['Tableau de bord', 'Analytiques', 'Alertes', 'Carte usine'],
    viewer:       ['Tableau de bord', 'Lecture seule'],
  };

  const permissions = PERMISSIONS[user?.role] || [];

  const pwdStrength = (pwd) => {
    if (!pwd) return 0;
    if (pwd.length < 4) return 1;
    if (pwd.length < 7) return 2;
    if (pwd.length < 10) return 3;
    return 4;
  };

  const strengthLabel = ['', 'Trop court', 'Moyen', 'Bien', 'Excellent'];
  const strengthColor = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-emerald-500'];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

      {/* Toast */}
      {toast.msg && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-xl shadow-2xl text-sm font-semibold text-white max-w-sm
          ${toast.ok ? 'bg-[#17203f]' : 'bg-red-600'}`}>
          {toast.msg}
        </div>
      )}

      {/* Profile hero */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        {/* Banner */}
        <div className="h-24 sm:h-32 bg-[#17203f] relative">
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
          />
        </div>

        <div className="px-6 sm:px-8 pb-6 sm:pb-8 relative">
          {/* Avatar */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#17203f] flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-white shadow-lg -mt-8 sm:-mt-10 mb-4">
            {user?.username?.[0]?.toUpperCase()}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#17203f]">{user?.username}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="px-3 py-1 rounded-lg bg-[#17203f] text-white text-xs font-semibold capitalize">
                  {user?.role}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <Clock size={11} /> ID #{user?.id}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              icon={<LogOut size={14} />}
            >
              Déconnexion
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1.5 mb-5 bg-white rounded-xl p-1.5 border border-slate-200 shadow-sm">
        {[
          { id: 'info',     label: 'Informations', icon: User      },
          { id: 'password', label: 'Sécurité',     icon: KeyRound  },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all
              ${tab === t.id
                ? 'bg-[#17203f] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-700'}`}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {tab === 'info' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100">
            <h2 className="font-bold text-[#17203f] text-lg">Informations du compte</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Données enregistrées dans le système</p>
          </div>

          {[
            { label: "Nom d'utilisateur", value: user?.username,  icon: User   },
            { label: 'Rôle',              value: user?.role,       icon: Shield },
            { label: 'Identifiant',       value: `#${user?.id}`,   icon: Shield },
          ].map((item, i) => (
            <div key={i} className={`flex items-center gap-4 px-6 sm:px-8 py-5 ${i < 2 ? 'border-b border-slate-50' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                <item.icon size={16} className="text-slate-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-bold text-[#17203f] capitalize mt-0.5">{item.value}</p>
              </div>
            </div>
          ))}

          {/* Permissions */}
          <div className="px-6 sm:px-8 py-5 border-t border-slate-50 bg-slate-50/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {permissions.map(p => (
                <span key={p} className="px-3 py-1 rounded-lg bg-[#17203f]/8 text-[#17203f] border border-[#17203f]/15 text-xs font-semibold">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Password */}
      {tab === 'password' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100">
            <h2 className="font-bold text-[#17203f] text-lg">Changer le mot de passe</h2>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">Minimum 6 caractères</p>
          </div>

          <div className="px-6 sm:px-8 py-6 space-y-5">
            <PwdField label="Mot de passe actuel"  value={oldPwd}     onChange={setOldPwd}     show={showOld}     toggle={() => setShowOld(v => !v)} />
            <PwdField label="Nouveau mot de passe" value={newPwd}     onChange={setNewPwd}     show={showNew}     toggle={() => setShowNew(v => !v)} />
            <PwdField label="Confirmer le nouveau" value={confirmPwd} onChange={setConfirmPwd} show={showConfirm} toggle={() => setShowConfirm(v => !v)} />

            {newPwd && (
              <div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${
                      pwdStrength(newPwd) >= i ? strengthColor[pwdStrength(newPwd)] : 'bg-slate-100'
                    }`} />
                  ))}
                </div>
                <p className="text-xs text-slate-400 mt-1 font-medium">{strengthLabel[pwdStrength(newPwd)]}</p>
              </div>
            )}
          </div>

          <div className="px-6 sm:px-8 pb-8">
            <Button
              onClick={handleChangePassword}
              loading={saving}
              icon={<Check size={15} />}
              fullWidth
              size="lg"
            >
              Mettre à jour le mot de passe
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function PwdField({ label, value, onChange, show, toggle }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{label}</label>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-11 rounded-xl border-2 border-slate-200 bg-slate-50 outline-none focus:border-[#17203f] text-sm font-medium transition-colors"
        />
        <button
          type="button"
          onClick={toggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}
