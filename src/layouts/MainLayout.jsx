import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutGrid, Activity, Bell, Settings, LogOut, Menu, X, Search, Home, User  } from "lucide-react";
import { useState, useEffect } from "react";
import { cevitalLogo} from "../pages/Managment";
import Logo from "../components/logo";

const SidebarItem = ({ to='/', label, active }) => (
  <Link
    to={to}
    className={`
      flex items-center   px-4 py-3 w-full
      rounded-lg relative
      transition-all duration-300 ease-in-out

      ${active
        ? "bg-white/10 text-white border-r-4 border-purple-500"
        : "text-gray-300 hover:bg-white/5 hover:text-white"
      }
    `}
  >
    <span className="text-xl  text-center font-medium">{label}</span>
  </Link>
);


const MobileNavItem = ({ icon: Icon, label, to, active }) => (
  <Link
    to={to}
    className={`flex flex-col items-center justify-center gap-1 px-4 py-3 touch-feedback transition-all duration-200 ${
      active
        ? 'text-brand-blue'
        : 'text-text-sub'
    }`}
  >
    <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    <span className="text-xs font-medium">{label}</span>
  </Link>
);

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-dashboard-bg overflow-x-hidden">
      {/* SIDEBAR DESKTOP */}
      <aside className="hidden lg:flex w-40 bg-[#17203f] border-r border-slate-100 flex-col items-start  py-10 sticky lg:fixed lg:left-0 lg:top-0 h-screen z-20">
         <Logo/>
        <nav className="flex flex-col gap-3 w-full mt-6">
          <SidebarItem label="Dashboard" to="/mainlayout" active={location.pathname === "/mainlayout"} />
          <SidebarItem label="Analytics" to="/mainlayout/analytics" active={location.pathname === "/mainlayout/analytics"} />
          <SidebarItem label="Alerts" to="/mainlayout/alerts" active={location.pathname === "/mainlayout/alerts"} />
          <SidebarItem label="Plant Map" to="/mainlayout/plantmap" active={location.pathname === "/mainlayout/plantmap"} />
        </nav>
        <div className="mt-auto w-full pb-6">
          <SidebarItem label="Logout" to="/"/>
        </div>
      </aside>

      <div className="flex-1 flex flex-col w-full max-w-[1600px] mx-auto min-w-0 lg:ml-40 h-screen">
        {/* DESKTOP HEADER */}
        <header className="hidden md:flex justify-between items-center h-[60px] w-full bg-white border-b border-slate-100 z-30 flex-shrink-0">
          <div>
            {/* <p className="text-text-sub text-3xl font-bold uppercase tracking-widest">Dashboard</p> */}
            <img src={cevitalLogo} alt="Cevital Logo" className="w-[120px] ml-[15px] object-contain" />
          </div>
          <div className="bg-white p-2 rounded-panel shadow-soft-ui flex items-center gap-4 border border-slate-50">
            <div className="relative border-0 p-0">
              <Search className="absolute left-2 top-[16px] -translate-y-1/2 text-text-sub" size={18} />
              <input 
                type="text" 
                placeholder="Search transactions, sensors..." 
                className="bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-full border-0 outline-none focus:ring-2 focus:ring-brand-blue/20 placeholder:text-[12px] text-[12px] rounded-full pl-10 pr-4 py-2 text-sm w-48 lg:w-[300px] lg:h-[33px] transition-all"
/>
            </div>
            <div className="w-10 h-10 rounded-card bg-brand-blue overflow-hidden cursor-pointer shadow-soft-ui hover:shadow-fintech transition-shadow">
              <User   className="w-full h-full" />
            </div>
          </div>
        </header>

        {/* MOBILE HEADER */}
        <header className="flex md:hidden justify-between items-center px-4 py-4 bg-white border-b border-slate-100 z-30 flex-shrink-0">
          <div className="flex-1">
            <h1 className="text-text-main text-xl font-bold">Monitoring</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 hover:bg-slate-50 rounded-card transition-colors touch-feedback"
            >
              <Search size={20} className="text-text-main" />
            </button>
            <div className="w-8 h-8 rounded-card bg-brand-blue overflow-hidden cursor-pointer">
              <img src="https://ui-avatars.com/api/?name=A&background=2D5BFF&color=fff&size=32" alt="User" className="w-full h-full" />
            </div>
          </div>
        </header>

        {/* MOBILE SEARCH BAR (Expandable) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
        {searchOpen && (
          <div className="md:hidden flex items-center gap-2 px-4 py-3 bg-white border-b border-slate-50 animate-slide-up flex-shrink-0">
            <Search className="text-text-sub flex-shrink-0" size={18} />
            <input
              type="text"
              placeholder="Search..."
              autoFocus
              className="flex-1 bg-transparent text-sm focus:outline-none text-text-main placeholder:text-text-sub"
            />
          </div>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 md:py-8 min-w-0 pb-24 md:pb-0">
          <Outlet />
        </main>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-white border-t border-slate-100 z-40" style={{ boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)' }}>
        <div className="flex justify-around items-center h-16">
          <MobileNavItem 
            icon={LayoutGrid} 
            label="Dashboard" 
            to="/" 
            active={location.pathname === "/"} 
          />
          <MobileNavItem 
            icon={Activity} 
            label="Analytics" 
            to="/analytics" 
            active={location.pathname === "/analytics"} 
          />
          <MobileNavItem 
            icon={Bell} 
            label="Alerts" 
            to="/alerts" 
            active={location.pathname === "/alerts"} 
          />
          <MobileNavItem 
            icon={Settings} 
            label="Settings" 
            to="/settings" 
            active={location.pathname === "/settings"} 
          />
        </div>
      </nav>
    </div>
  );
}