// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Dashboard, Analytics, Alerts, LoginPage, PlantMap, Zone, AdminUsers } from "./pages/Managment";
import UserProfile from "./pages/UserProfile";

// ── Admin-only guard ──────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "admin") return <Navigate to="/mainlayout" replace />;
  return children;
}

// ── Default index: admin → admin panel, others → dashboard ───────────────────
function DefaultRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user?.role === "admin") return <Navigate to="/mainlayout/admin" replace />;
  return <Dashboard />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />

        <Route
          path="mainlayout"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DefaultRedirect />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="analytics"  element={<Analytics />} />
          <Route path="alerts"     element={<Alerts />} />
          <Route path="plantmap"   element={<PlantMap />} />
          <Route path="zone"       element={<Zone />} />
          <Route path="profile"    element={<UserProfile />} />

          {/* Admin only */}
          <Route
            path="admin"
            element={
              <AdminRoute>
                <AdminUsers />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
