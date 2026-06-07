// src/pages/AdminUsers.jsx
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { origins } from './Managment';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { UserPlus, Pencil, Trash2, X, Check, Mail, ShieldCheck, User } from 'lucide-react';

const ROLES = ['admin', 'automatician', 'viewer'];

const ROLE_BADGE = {
  admin:        'bg-purple-100 text-purple-700 border-purple-200',
  automatician: 'bg-blue-100 text-blue-700 border-blue-200',
  viewer:       'bg-slate-100 text-slate-600 border-slate-200',
};

function useApi() {
  const { token } = useAuth();
  return axios.create({
    baseURL: origins,
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function UserModal({ mode, user, onClose, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState(
    mode === 'edit'
      ? { username: user.username, email: user.email || '', role: user.role }
      : { username: '', email: '', role: 'automatician' }
  );
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');

  const handleSubmit = async () => {
    if (!form.username.trim() || !form.email.trim()) {
      setError(t('admin_users.error_validation'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await onSave(form);
      onClose();
    } catch (e) {
      setError(e.response?.data?.detail || t('admin_users.error_generic'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        {/* Modal header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#17203f]/10 flex items-center justify-center">
              {mode === 'create'
                ? <UserPlus className="text-[#17203f]" size={20} />
                : <Pencil className="text-[#17203f]" size={20} />
              }
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#17203f] dark:text-white">
                {mode === 'create' ? t('admin_users.create_user') : t('admin_users.edit_user')}
              </h2>
              {mode === 'create' && (
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                  <Mail size={11} /> {t('admin_users.credentials_sent')}
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="px-8 py-6 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-red-600 dark:text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {[
            { label: t('admin_users.username'), key: 'username', type: 'text',  placeholder: t('admin_users.username_placeholder') },
            { label: t('admin_users.email'), key: 'email',    type: 'email', placeholder: t('admin_users.email_placeholder') },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {field.label}
              </label>
              <input
                type={field.type}
                value={form[field.key]}
                onChange={e => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#334155] outline-none focus:border-[#17203f] text-sm font-medium transition-colors dark:text-slate-200"
              />
            </div>
          ))}

          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">{t('admin_users.role')}</label>
            <select
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#334155] outline-none focus:border-[#17203f] text-sm font-medium cursor-pointer transition-colors dark:text-slate-200"
            >
              {ROLES.map(r => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 px-8 pb-8">
          <Button variant="ghost" onClick={onClose} fullWidth>{t('admin_users.cancel')}</Button>
          <Button
            onClick={handleSubmit}
            loading={saving}
            icon={<Check size={15} />}
            fullWidth
          >
            {mode === 'create' ? t('admin_users.create_send') : t('admin_users.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const api = useApi();
  const { user: currentUser } = useAuth();
  const { t } = useTranslation();

  const [users,      setUsers]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [modal,      setModal]      = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast,      setToast]      = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
       console.log('API response:', res);   // check the browser console

      setUsers(res.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleCreate = async (form) => {
    await api.post('/admin/users', form);
    await fetchUsers();
    showToast(t('admin_users.toast_created', { username: form.username, email: form.email }));
  };

  const handleEdit = async (form) => {
    await api.patch(`/admin/users/${modal.user.id}`, form);
    await fetchUsers();
    showToast(t('admin_users.toast_updated', { username: form.username }));
  };

  const handleDelete = async (id, username) => {
    if (!window.confirm(t('admin_users.confirm_delete', { username }))) return;
    setDeletingId(id);
    await api.delete(`/admin/users/${id}`);
    await fetchUsers();
    setDeletingId(null);
    showToast(t('admin_users.toast_deleted', { username }));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 px-6 py-3 bg-[#17203f] dark:bg-[#1e293b] text-white rounded-xl shadow-2xl text-sm font-semibold max-w-sm">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#17203f] dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
              <ShieldCheck className="text-purple-600 dark:text-purple-400" size={20} />
            </div>
            {t('admin_users.title')}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm font-medium">
            {t('admin_users.connected_as')} <span className="font-bold text-[#17203f] dark:text-white">{currentUser?.username}</span>
          </p>
        </div>
        <Button
          onClick={() => setModal({ mode: 'create' })}
          icon={<UserPlus size={16} />}
        >
          {t('admin_users.new_user')}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">

        {/* Table header — hidden on mobile */}
        <div className="hidden sm:grid grid-cols-12 px-6 py-4 bg-slate-50 dark:bg-[#334155] border-b border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-widest">
          <span className="col-span-1">{t('admin_users.table_hash')}</span>
          <span className="col-span-3">{t('admin_users.table_user')}</span>
          <span className="col-span-4">{t('admin_users.table_email')}</span>
          <span className="col-span-2">{t('admin_users.table_role')}</span>
          <span className="col-span-2 text-right">{t('admin_users.table_actions')}</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#17203f] dark:border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-300 dark:text-slate-600">
            <User size={52} strokeWidth={1} className="mb-4" />
            <p className="font-semibold text-slate-400 dark:text-slate-500">{t('admin_users.no_users')}</p>
          </div>
        ) : (
          users.map((u, i) => (
            <div
              key={u.id}
              className={`flex flex-col sm:grid sm:grid-cols-12 sm:items-center px-6 py-5 border-b border-slate-50 dark:border-slate-700 last:border-0 transition-colors hover:bg-slate-50/50 dark:hover:bg-[#334155]/50
                ${u.id === currentUser?.id ? 'bg-[#17203f]/3 dark:bg-[#17203f]/20' : ''}`}
            >
              <span className="hidden sm:block col-span-1 text-slate-300 dark:text-slate-600 font-mono text-sm">{i + 1}</span>

              <div className="col-span-3 flex items-center gap-3 mb-3 sm:mb-0">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#17203f] to-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#17203f] dark:text-white text-sm">{u.username}</p>
                  {u.id === currentUser?.id && (
                    <p className="text-xs text-blue-500 font-semibold">{t('admin_users.you')}</p>
                  )}
                </div>
              </div>

              <div className="col-span-4 mb-3 sm:mb-0">
                <p className="text-slate-500 dark:text-slate-400 text-sm truncate">
                  {u.email || <span className="text-slate-300 dark:text-slate-600 italic">{t('admin_users.not_provided')}</span>}
                </p>
              </div>

              <div className="col-span-2 mb-3 sm:mb-0">
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold border capitalize ${ROLE_BADGE[u.role] || ROLE_BADGE.viewer}`}>
                  {u.role}
                </span>
              </div>

              <div className="col-span-2 flex justify-start sm:justify-end gap-2">
                <button
                  onClick={() => setModal({ mode: 'edit', user: u })}
                  className="p-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-[#17203f] dark:hover:text-white hover:bg-[#17203f]/8 dark:hover:bg-slate-700 transition-colors"
                  title={t('admin_users.edit_tooltip')}
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => handleDelete(u.id, u.username)}
                  disabled={deletingId === u.id || u.id === currentUser?.id}
                  className="p-2.5 rounded-xl text-slate-400 dark:text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={u.id === currentUser?.id ? t('admin_users.delete_self_error') : t('admin_users.delete_tooltip')}
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
      <div className="mt-5 flex flex-wrap gap-3 items-center">
        <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold">{t('admin_users.roles_legend')}</p>
        {ROLES.map(r => (
          <span key={r} className={`px-3 py-1 rounded-lg text-xs font-bold border capitalize ${ROLE_BADGE[r]}`}>
            {r}
          </span>
        ))}
        <p className="text-xs text-slate-400 dark:text-slate-500 w-full sm:w-auto sm:ml-auto">
          {t('admin_users.footer_note')}
        </p>
      </div>

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
