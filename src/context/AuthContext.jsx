// src/context/AuthContext.jsx
// Global auth context. Wrap your app with <AuthProvider> in main.jsx.
// Access anywhere with:  const { user, login, logout, isAuthenticated } = useAuth();

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { loginRequest, getMeRequest } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  /**
   * user shape — everything EXCEPT password_hash:
   * { id: number, username: string, role: string }
   */
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(() => localStorage.getItem('flow_token'));
  const [loading, setLoading] = useState(true);   // verifying stored token on boot
  const [error, setError]     = useState(null);

  // ── Rehydrate user from stored token on app start ─────────────────────────
  useEffect(() => {
    async function rehydrate() {
      if (!token) { setLoading(false); return; }
      const me = await getMeRequest(token);
      if (me) {
        setUser(me);
      } else {
        // Token expired or invalid — clean up silently
        localStorage.removeItem('flow_token');
        setToken(null);
      }
      setLoading(false);
    }
    rehydrate();
  }, [token]); // runs once on mount only

  // ── login ─────────────────────────────────────────────────────────────────
  const login = useCallback(async (username, password) => {
  setError(null);
  setLoading(true); // ← bloque ProtectedRoute pendant le login

  try {
    const { access_token } = await loginRequest(username, password);
    localStorage.setItem('flow_token', access_token);
    setToken(access_token); // ← déclenche useEffect[token] → rehydrate() → setUser()
    return true;
  } catch (err) {
    setError(err.message || 'Erreur de connexion');
    setLoading(false); // ← seulement en cas d'erreur, sinon useEffect gère
    return false;
  }
}, []);

  // ── logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('flow_token');
    setToken(null);
    setUser(null);
  }, []);

  const value = {
    user,             // { id, username, role } | null
    token,            // raw JWT | null
    loading,          // true while verifying token on boot
    error,            // last login error message | null
    login,            // async (username, password) => boolean
    logout,           // () => void
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth() hook — use in ANY component to access auth state.
 *
 * Examples:
 *   const { user } = useAuth();       // user.id, user.username, user.role
 *   const { logout } = useAuth();     // call to log out
 *   const { isAuthenticated } = useAuth();
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
