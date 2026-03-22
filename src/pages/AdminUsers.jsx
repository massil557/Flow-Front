// src/pages/AdminUsers.jsx
// Only accessible by role === "admin"
// Features: list users, create user (sends email), edit user, delete user

import { useState, useEffect } from 'react';
import axios from 'axios';
import { origins } from './Managment';
import { useAuth } from '../context/AuthContext';
import { UserPlus, Pencil, Trash2, X, Check, Mail, ShieldCheck, User } from 'lucide-react';

const ROLES = ['admin', 'automatician', 'viewer'];

const ROLE_BADGE = {
  admin:        'bg-purple-100 text-purple-700 border-purple-200',
  automatician: 'bg-blue-100 text-blue-700 border-blue-200',
  viewer:       'bg-slate-100 text-slate-600 border-slate-200',
};

// ── Axios instance with JWT header ───────────────────────────────────────────
function useApi() {
  const { token } = useAuth();
  return axios.create({
    baseURL: origins,
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Modal for create / edit ───────────────────────────────────────────────────
function UserModal({ mode, user, onClose, onSave }) {
  const [form, setForm] = useState(
    mode === 'edit'
      ? { username: user.username, email: user.email || '', role: user.role }
      : { username: '', email: '', role: 'automatician' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      setError("Nom d'utilisateur et email sont obligatoires.");
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.response?.data?.detail || 'Une erreur est survenue.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in duration-200">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-600">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-50 rounded-2xl">
            {mode === 'create' ? <UserPlus className="text-blue-600" size={22} /> : <Pencil className="text-blue-600" size={22} />}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800">
              {mode === 'create' ? 'Créer un utilisateur' : 'Modifier l\'utilisateur'}
            </h2>
            {mode === 'create' && (
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                <Mail size={11} /> Un mot de passe temporaire sera envoyé par email
              </p>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nom d'utilisateur</label>
            <input
              type="text"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="ex: jean.dupont"
              className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="ex: jean.dupont@cevital.dz"
              className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Rôle</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full mt-1.5 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 outline-none focus:ring-2 focus:ring-blue-400 text-sm cursor-pointer"
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-8">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {saving ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <><Check size={16} /> {mode === 'create' ? 'Créer & Envoyer' : 'Enregistrer'}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const api = useApi();
  const { user: currentUser } = useAuth();

  const [users, setUsers]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [modal, setModal]       = useState(null);   // null | { mode: 'create'|'edit', user? }
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast]       = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  };

  // Load users
  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Create
  const handleCreate = async (form) => {
    await api.post('/admin/users', form);
    await fetchUsers();
    showToast(`✅ Utilisateur "${form.username}" créé. Credentials envoyés à ${form.email}`);
  };

  // Edit
  const handleEdit = async (form) => {
    await api.patch(`/admin/users/${modal.user.id}`, form);
    await fetchUsers();
    showToast(`✅ Utilisateur "${form.username}" mis à jour.`);
  };

  // Delete
  const handleDelete = async (id, username) => {
    if (!window.confirm(`Supprimer l'utilisateur "${username}" ?`)) return;
    setDeletingId(id);
    await api.delete(`/admin/users/${id}`);
    await fetchUsers();
    setDeletingId(null);
    showToast(`🗑️ Utilisateur "${username}" supprimé.`);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-3 bg-slate-900 text-white rounded-2xl shadow-2xl text-sm font-medium animate-in slide-in-from-top-4 duration-300">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
            <ShieldCheck className="text-purple-500" size={32} />
            Gestion des Utilisateurs
          </h1>
          <p className="text-slate-400 mt-1 text-sm">
            Connecté en tant qu'<span className="font-bold text-purple-600">{currentUser?.username}</span> (admin)
          </p>
        </div>
        <button
          onClick={() => setModal({ mode: 'create' })}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
        >
          <UserPlus size={18} /> Nouvel utilisateur
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-12 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase tracking-widest">
          <span className="col-span-1">#</span>
          <span className="col-span-3">Utilisateur</span>
          <span className="col-span-4">Email</span>
          <span className="col-span-2">Rôle</span>
          <span className="col-span-2 text-right">Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-20 text-slate-300">
            <User size={48} strokeWidth={1} className="mx-auto mb-3" />
            <p className="font-medium">Aucun utilisateur trouvé</p>
          </div>
        ) : (
          users.map((u, i) => (
            <div
              key={u.id}
              className={`grid grid-cols-12 items-center px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50/50 transition-colors ${u.id === currentUser?.id ? 'bg-blue-50/30' : ''}`}
            >
              <span className="col-span-1 text-slate-300 font-mono text-sm">{i + 1}</span>

              <div className="col-span-3 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">{u.username}</p>
                  {u.id === currentUser?.id && <p className="text-[10px] text-blue-500 font-medium">Vous</p>}
                </div>
              </div>

              <div className="col-span-4">
                <p className="text-slate-500 text-sm truncate">{u.email || <span className="text-slate-300 italic">—</span>}</p>
              </div>

              <div className="col-span-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${ROLE_BADGE[u.role] || ROLE_BADGE.viewer}`}>
                  {u.role}
                </span>
              </div>

              <div className="col-span-2 flex justify-end gap-2">
                <button
                  onClick={() => setModal({ mode: 'edit', user: u })}
                  className="p-2 rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  title="Modifier"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(u.id, u.username)}
                  disabled={deletingId === u.id || u.id === currentUser?.id}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={u.id === currentUser?.id ? 'Vous ne pouvez pas vous supprimer' : 'Supprimer'}
                >
                  {deletingId === u.id
                    ? <span className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin block" />
                    : <Trash2 size={16} />
                  }
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Role legend */}
      <div className="mt-6 flex gap-4 flex-wrap">
        <p className="text-xs text-slate-400 font-medium">Rôles :</p>
        {ROLES.map(r => (
          <span key={r} className={`px-3 py-1 rounded-full text-xs font-bold border capitalize ${ROLE_BADGE[r]}`}>
            {r}
          </span>
        ))}
        <p className="text-xs text-slate-400">— Les nouveaux utilisateurs reçoivent leur mot de passe par email.</p>
      </div>

      {/* Modal */}
      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSave={modal.mode === 'create' ? handleCreate : handleEdit}
        />
      )}
    </div>
  );
}
