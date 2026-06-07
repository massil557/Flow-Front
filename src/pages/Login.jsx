// src/pages/Login.jsx
// Same UI as before — wired to the real backend via AuthContext.

import { useState } from 'react';
import { man, cevitalLogo } from './Managment';
import LoginLogo from '../components/login-logo';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, error: authError } = useAuth();

  const [focus, setFocus]       = useState(null);
  const [userData, setUserData] = useState({ username: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalError('');
    setUserData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    if (!userData.username.trim() || !userData.password.trim()) {
      setLocalError(t('login.error_required'));
      return;
    }
    setSubmitting(true);
    const success = await login(userData.username, userData.password);
    setSubmitting(false);
    if (success) navigate('/mainlayout');
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleLogin(); };
  const displayError = localError || authError;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f172a] flex items-center justify-center p-6">
      <div className="w-full max-w-6xl h-[500px] bg-[#1e2a55] rounded-3xl shadow-2xl flex overflow-hidden">
        <div className="hidden md:flex w-1/2 items-center justify-center relative bg-white dark:bg-[#1e293b]">
          <div className="absolute top-6 left-6 w-40">
            <img src={cevitalLogo} alt="Cevital Logo" className="w-40 object-contain" />
          </div>
          <img src={man} alt="Man illustration" className="w-[300px] object-contain" />
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center px-10 text-white relative">
          <div className="absolute top-6 left-6 w-40"><LoginLogo /></div>

          <h1 className="text-3xl font-semibold mb-8">{t('login.title')}</h1>

          {displayError && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-red-500/20 border border-red-400 text-red-300 text-sm">
              {displayError}
            </div>
          )}

          <div className="mb-4">
            <label className="text-sm text-gray-300">{t('login.username')}</label>
            <input type="text" name="username" placeholder={t('login.username_placeholder')}
              onFocus={() => setFocus('username')} onBlur={() => setFocus(null)} onKeyDown={handleKeyDown}
              className={`w-full mt-2 px-4 py-3 rounded-xl bg-[#0f1833] outline-none transition-all ${focus === 'username' ? 'ring-2 ring-blue-400' : 'border border-transparent'}`}
              value={userData.username} onChange={handleInputChange} />
          </div>

          <div className="mb-2">
            <label className="text-sm text-gray-300">{t('login.password')}</label>
            <input type="password" name="password" placeholder={t('login.password_placeholder')}
              onFocus={() => setFocus('password')} onBlur={() => setFocus(null)} onKeyDown={handleKeyDown}
              className={`w-full mt-2 px-4 py-3 rounded-xl bg-[#0f1833] outline-none transition-all ${focus === 'password' ? 'ring-2 ring-blue-400' : 'border border-transparent'}`}
              value={userData.password} onChange={handleInputChange} />
          </div>

          <div className="text-right mb-6">
            <a href="#" className="text-sm text-blue-400 hover:underline">{t('login.forgot_password')}</a>
          </div>

          <button onClick={handleLogin} disabled={submitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 hover:opacity-90 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? (
              <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('login.submitting')}</>
            ) : t('login.submit')}
          </button>

          <p className="text-xs text-gray-500 mt-10 text-center">{t('login.terms')}</p>
        </div>
      </div>
    </div>
  );
}
