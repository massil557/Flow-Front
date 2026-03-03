// src/components/ProtectedRoute.jsx
// Wraps any route that needs authentication.
// Unauthenticated users are redirected to "/" (login page).

import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // While verifying the stored JWT, show a spinner instead of flashing /login
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#17203f]">
        <div className="w-10 h-10 border-4 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/" replace />;
}
