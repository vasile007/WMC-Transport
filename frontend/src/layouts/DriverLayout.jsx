import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../services/authContext.jsx';
import SideNavDriver from '../components/SideNavDriver.jsx';

export default function DriverLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0B0D10] via-[#11151B] to-[#141820] text-[#F5F3EE] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-28 -left-24 h-72 w-72 bg-[#D4AF37]/24 blur-3xl" />
        <div className="absolute top-12 right-0 h-64 w-64 bg-[#B98B2D]/22 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-72 w-72 bg-[#D4AF37]/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(255,255,255,0.08),transparent_40%)]" />
      </div>
      <div className="pointer-events-none absolute left-12 top-44 z-0 select-none" aria-hidden="true">
        <div className="relative text-[56px] md:text-[80px] font-extrabold tracking-[0.12em] animate-[wmcGlow_6s_ease-in-out_infinite]">
          <span className="absolute inset-0 text-[#E8C86A]/32 blur-[3px]">WMC</span>
          <span
            className="relative text-[#FFECC8] drop-shadow-[0_6px_14px_rgba(232,200,106,0.32)]"
            style={{
              textShadow:
                "0 0 10px rgba(232,200,106,0.22), 0 1px 0 rgba(92,74,22,0.75), 1px 0 rgba(92,74,22,0.75), 0 -1px rgba(92,74,22,0.75), -1px 0 rgba(92,74,22,0.75)",
            }}
          >
            WMC
          </span>
        </div>
      </div>
      <header className="h-16 bg-[#0B0D10]/85 backdrop-blur border-b border-white/10 shadow-[0_14px_32px_rgba(0,0,0,0.45)] flex items-center justify-between px-6 relative z-10">
        <div className="flex items-center gap-3">
          <Link to="/" className="font-extrabold text-[#D4AF37]">
            <span className="hidden md:inline">WMC TRANSPORT LTD</span>
            <span className="md:hidden">WMC TRANSPORT</span>
          </Link>
          <span className="text-sm text-[#B9B3A8]">Driver</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#E3DED5]">Hello, <b>{user?.name || 'Driver'}</b></span>
          <button onClick={logout} className="btn-secondary text-sm px-4 py-2">Logout</button>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-6 py-6 flex gap-6 relative z-10">
        <SideNavDriver />
        <main className="flex-1">
          <div className="surface p-6 md:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
