// src/layouts/MainLayout.jsx
// Sidebar shows different items based on role:
//   automatician → Dashboard, Analytics, Alerts, Plant Map
//   admin        → Admin panel only (Users management)

import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Activity, Bell, Search, User, ShieldCheck } from "lucide-react";
import { useState, useEffect } from "react";
import { cevitalLogo } from "../pages/Managment";
import Logo from "../components/logo";
import { useAuth } from "../context/AuthContext";

const SidebarItem = ({ to = '/', label, active, icon: Icon }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg relative transition-all duration-300 ease-in-out
      ${active
        ? "bg-white/10 text-white border-r-4 border-purple-500"
        : "text-gray-300 hover:bg-white/5 hover:text-white"
      }`}
  >
    {Icon && <Icon size={18} className="shrink-0" />}
    <span className="text-base font-medium">{label}</span>
  </Link>
);

const MobileNavItem = ({ icon: Icon, label, to, active }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center gap-1 px-4 py-3 transition-all duration-200
      ${active ? 'text-blue-500' : 'text-slate-400'}`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-xs font-medium">{label}</span>
  </Link>
);

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  const isAdmin        = user?.role === 'admin';
  const isAutomatician = user?.role === 'automatician' || isAdmin; 

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="flex min-h-screen bg-dashboard-bg overflow-x-hidden">

      {/* ── SIDEBAR DESKTOP ─────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-44 bg-[#17203f] border-r border-slate-700 flex-col items-start py-10 lg:fixed lg:left-0 lg:top-0 h-screen z-20">
        <Logo />

        {/* User badge */}
        <div className="px-4 mt-3 mb-4 w-full">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.username}</p>
              <p className="text-[10px] text-purple-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="w-full px-3 mb-2">
          <div className="h-px bg-white/10" />
        </div>

        <nav className="flex flex-col gap-1 w-full px-2">
          {/* Automatician nav */}
          {isAutomatician && (
            <>
              <SidebarItem icon={LayoutGrid} label="Dashboard" to="/mainlayout"          active={location.pathname === "/mainlayout"} />
              <SidebarItem icon={Activity}   label="Analytics" to="/mainlayout/analytics" active={location.pathname === "/mainlayout/analytics"} />
              <SidebarItem icon={Bell}       label="Alerts"    to="/mainlayout/alerts"    active={location.pathname === "/mainlayout/alerts"} />
              <SidebarItem icon={Search}     label="Plant Map" to="/mainlayout/plantmap"  active={location.pathname === "/mainlayout/plantmap"} />
            </>
          )}

          {/* Admin-only nav */}
          {isAdmin && (
            <>
              <div className="w-full px-2 my-2">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 mb-1 px-2">Administration</p>
              </div>
              <SidebarItem icon={ShieldCheck} label="Utilisateurs" to="/mainlayout/admin" active={location.pathname === "/mainlayout/admin"} />
            </>
          )}
        </nav>

        <div className="mt-auto w-full px-2 pb-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300"
          >
            <span className="text-base font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto min-w-0 lg:ml-44 h-screen">

        {/* Desktop header */}
        <header className="hidden md:flex justify-between items-center h-[60px] w-full bg-white border-b border-slate-100 z-30 flex-shrink-0 px-4">
          <img src={cevitalLogo} alt="Cevital" className="w-[120px] ml-2 object-contain" />
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search..."
                className="bg-slate-50 rounded-full pl-9 pr-4 py-2 text-sm w-[260px] outline-none focus:ring-2 focus:ring-blue-400 border border-slate-100"
              />
            </div>
            <div
              title={`${user?.username} (${user?.role})`}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow"
            >
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        {/* Mobile header */}
        <header className="flex md:hidden justify-between items-center px-4 py-4 bg-white border-b border-slate-100 z-30 flex-shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Monitoring</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 hover:bg-slate-50 rounded-xl">
              <Search size={20} className="text-slate-600" />
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {searchOpen && (
            <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-100">
              <Search className="text-slate-400 shrink-0" size={16} />
              <input type="text" placeholder="Search..." autoFocus className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          )}
          <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8 min-w-0 pb-24 md:pb-0">
            <Outlet />
          </main>
        </div>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-100 z-40 shadow-lg">
        <div className="flex justify-around items-center h-16">
          {isAutomatician && (
            <>
              <MobileNavItem icon={LayoutGrid} label="Home"      to="/mainlayout"          active={location.pathname === "/mainlayout"} />
              <MobileNavItem icon={Activity}   label="Analytics" to="/mainlayout/analytics" active={location.pathname === "/mainlayout/analytics"} />
              <MobileNavItem icon={Bell}       label="Alerts"    to="/mainlayout/alerts"    active={location.pathname === "/mainlayout/alerts"} />
            </>
          )}
          {isAdmin && (
            <MobileNavItem icon={ShieldCheck} label="Admin" to="/mainlayout/admin" active={location.pathname === "/mainlayout/admin"} />
          )}
          <MobileNavItem icon={User} label="Logout" to="/" active={false} />
        </div>
      </nav>
    </div>
  );
}
