import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  FileText, 
  Settings, 
  LogOut,
  Wallet
} from 'lucide-react';
import { useAuthStore } from '../lib/store';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/siswa', label: 'Data Siswa', icon: Users },
  { path: '/transaksi/setoran', label: 'Setoran', icon: ArrowUpCircle },
  { path: '/transaksi/penarikan', label: 'Penarikan', icon: ArrowDownCircle },
  { path: '/laporan', label: 'Laporan', icon: FileText },
  { path: '/pengaturan', label: 'Pengaturan', icon: Settings },
];

export default function Layout({ children }: { children: ReactNode }) {
  const { logout, user } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-neutral-50 font-sans text-neutral-900 overflow-hidden">
      {/* Sidebar - Hidden on mobile */}
      <aside className="hidden lg:flex w-64 bg-emerald-800 text-white flex-col shadow-xl">
        <div className="p-6 flex items-center gap-3 border-b border-emerald-700/50">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-none">TabunganSiswa</h1>
            <span className="text-[10px] text-emerald-300 uppercase tracking-widest font-semibold">Pro Version</span>
          </div>
        </div>

        <nav className="flex-1 mt-6 px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-white text-emerald-800 shadow-lg font-semibold" 
                  : "text-emerald-100 hover:bg-emerald-700/50"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-emerald-700/50">
          <div className="bg-emerald-900/50 rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-xs">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.username}</p>
                <p className="text-[10px] text-emerald-400 uppercase tracking-wider">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-300 hover:text-white hover:bg-emerald-700/50 rounded-lg transition-colors border border-emerald-700"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar Sistem
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 bg-emerald-800 text-white flex items-center justify-between px-4 z-20 shadow-md">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h1 className="font-bold text-sm">TabunganSiswa</h1>
          </div>
          <div className="flex items-center gap-3">
             <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-[10px]">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} className="p-1.5 hover:bg-emerald-700 rounded-lg">
                <LogOut className="w-4 h-4 text-emerald-200" />
              </button>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="hidden lg:flex h-16 bg-white border-b border-neutral-200 items-center justify-between px-8 z-10">
          <h2 className="text-lg font-semibold text-neutral-800">
            Selamat Datang, <span className="text-emerald-600">{user?.username}</span>
          </h2>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-xs text-neutral-400">Status Sistem</p>
                <div className="flex items-center gap-1.5 justify-end">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Online</span>
                </div>
             </div>
          </div>
        </header>

        {/* Content Area */}
        <section className="flex-1 overflow-y-auto p-4 lg:p-8 pb-20 lg:pb-8 custom-scrollbar">
          {children}
        </section>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-neutral-200 flex items-center justify-around px-2 z-20 pb-safe">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 px-2 py-1 transition-all duration-200",
                isActive 
                  ? "text-emerald-600 font-bold" 
                  : "text-neutral-400"
              )}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn("w-5 h-5", isActive ? "scale-110" : "")} />
                  <span className="text-[9px] uppercase tracking-tighter whitespace-nowrap">{item.label.split(' ')[0]}</span>
                </>
              )}
            </NavLink>
          ))}
          <NavLink
            to="/pengaturan"
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 px-2 py-1 transition-all duration-200",
              isActive ? "text-emerald-600 font-bold" : "text-neutral-400"
            )}
          >
            {({ isActive }) => (
              <>
                <Settings className={cn("w-5 h-5", isActive ? "scale-110" : "")} />
                <span className="text-[9px] uppercase tracking-tighter">Opsi</span>
              </>
            )}
          </NavLink>
        </nav>
      </main>
    </div>
  );
}
