import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";
import { Dashboard, Analytics, Alerts,LoginPage,PlantMap,Zone } from "./pages/Managment";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="mainlayout" element={<MainLayout />}>
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