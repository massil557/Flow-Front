// src/App.jsx
// ProtectedRoute guards /mainlayout and all its children.
// Unauthenticated users are sent back to "/" (login).

import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import { Dashboard, Analytics, Alerts, LoginPage, PlantMap, Zone } from "./pages/Managment";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public route — login page */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected routes — require valid JWT */}
        <Route
          path="mainlayout"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="alerts" element={<Alerts />} />
          <Route path="plantmap" element={<PlantMap />} />
          <Route path="zone" element={<Zone />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
