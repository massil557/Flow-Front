// src/layouts/MainLayout.jsx
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Activity, Bell, Search, User, ShieldCheck, LogOut, Map } from "lucide-react";
import { useState } from "react";
import { cevitalLogo } from "../pages/Managment";
import Logo from "../components/logo";
import { useAuth } from "../context/AuthContext";

const SidebarItem = ({ to, label, active, icon: Icon }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-all duration-200
      ${active
        ? "bg-white/12 text-white border-r-4 border-white/60"
        : "text-slate-300 hover:bg-white/8 hover:text-white"
      }`}
  >
    {Icon && <Icon size={17} className="shrink-0" />}
    <span className="text-sm font-medium">{label}</span>
  </Link>
);

const MobileNavItem = ({ icon: Icon, label, to, active }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-all duration-200
      ${active ? 'text-[#17203f]' : 'text-slate-400'}`}
  >
    <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
    <span className="text-[10px] font-semibold">{label}</span>
  </Link>
);

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchOpen, setSearchOpen] = useState(false);

  const isAdmin        = user?.role === 'admin';
  const isAutomatician = user?.role === 'automatician' || isAdmin;

  const handleLogout = () => { logout(); navigate('/'); };
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navItems = isAutomatician ? [
    { icon: LayoutGrid, label: 'Dashboard', to: '/mainlayout/dashboard' },
    { icon: Activity,   label: 'Analytiques', to: '/mainlayout/analytics' },
    { icon: Bell,       label: 'Alertes',    to: '/mainlayout/alerts'    },
    { icon: Map,        label: 'Carte usine', to: '/mainlayout/plantmap' },
  ] : [];

  return (
    <div className="flex min-h-screen bg-[#F8F9FB] overflow-x-hidden">

      {/* ── SIDEBAR ─────────────────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-52 bg-[#17203f] flex-col fixed left-0 top-0 h-screen z-20 shadow-xl">

        {/* Logo */}
        <div className="px-5 pt-8 pb-4">
          <Logo />
        </div>

        {/* User badge */}
        <div className="mx-3 mb-4">
          <Link
            to="/mainlayout/profile"
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/8 transition-all group"
          >
            <div className="w-8 h-8 rounded-xl bg-white/15 flex items-center justify-center text-white text-sm font-bold shrink-0 group-hover:bg-white/25 transition-colors">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.username}</p>
              <p className="text-[10px] text-white/50 capitalize font-medium">{user?.role}</p>
            </div>
          </Link>
        </div>

        <div className="mx-5 mb-3 h-px bg-white/10" />

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
          {navItems.map(item => (
            <SidebarItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={isActive(item.to)}
            />
          ))}

          {isAdmin && (
            <>
              <div className="px-4 pt-5 pb-1">
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Administration</p>
              </div>
              <SidebarItem icon={ShieldCheck} label="Utilisateurs" to="/mainlayout/admin" active={isActive("/mainlayout/admin")} />
            </>
          )}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-white/50 hover:bg-white/8 hover:text-white transition-all duration-200"
          >
            <LogOut size={16} className="shrink-0" />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col lg:ml-52 min-h-screen">

        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between h-16 bg-white border-b border-slate-100 px-6 sticky top-0 z-10 shadow-sm">
          <img src={cevitalLogo} alt="Cevital" className="h-8 object-contain" />
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="bg-slate-50 rounded-xl pl-9 pr-4 py-2 text-sm w-64 outline-none focus:ring-2 focus:ring-[#17203f]/20 border border-slate-200 transition-all font-medium"
              />
            </div>
            <Link
              to="/mainlayout/profile"
              title={`${user?.username} (${user?.role})`}
              className="w-9 h-9 rounded-xl bg-[#17203f] flex items-center justify-center text-white text-sm font-bold cursor-pointer hover:bg-[#1e2a55] transition-colors shadow-sm"
            >
              {user?.username?.[0]?.toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-slate-100 sticky top-0 z-10 shadow-sm">
          <img src={cevitalLogo} alt="Cevital" className="h-7 object-contain" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2.5 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Search size={18} className="text-slate-600" />
            </button>
            <Link
              to="/mainlayout/profile"
              className="w-8 h-8 rounded-xl bg-[#17203f] flex items-center justify-center text-white text-xs font-bold"
            >
              {user?.username?.[0]?.toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-100">
            <Search className="text-slate-400 shrink-0" size={15} />
            <input
              type="text"
              placeholder="Rechercher..."
              autoFocus
              className="flex-1 bg-transparent text-sm outline-none font-medium"
            />
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 pb-20 lg:pb-0">
          <Outlet />
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────────── */}
      <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-slate-200 z-40 shadow-lg">
        <div className="flex items-stretch h-16 px-2">
          {navItems.map(item => (
            <MobileNavItem
              key={item.to}
              icon={item.icon}
              label={item.label}
              to={item.to}
              active={isActive(item.to)}
            />
          ))}
          {isAdmin && (
            <MobileNavItem
              icon={ShieldCheck}
              label="Admin"
              to="/mainlayout/admin"
              active={isActive("/mainlayout/admin")}
            />
          )}
          <MobileNavItem
            icon={User}
            label="Profil"
            to="/mainlayout/profile"
            active={isActive("/mainlayout/profile")}
          />
        </div>
      </nav>
    </div>
  );
}
