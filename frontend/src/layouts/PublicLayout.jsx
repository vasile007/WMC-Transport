import { Outlet } from "react-router-dom";
import PublicNavbar from "../components/PublicNavbar.jsx";

export default function PublicLayout() {
  return (
    <div className="relative min-h-screen bg-[#0B0D10] text-[#F5F3EE] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 -left-24 h-72 w-72 bg-[#D4AF37]/20 blur-3xl" />
        <div className="absolute top-10 right-0 h-64 w-64 bg-[#B98B2D]/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-72 w-72 bg-[#D4AF37]/10 blur-3xl" />
      </div>

      <PublicNavbar />
      <main className="min-h-screen relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="section-shell px-6 sm:px-10 py-10">
            <Outlet />
          </div>
        </div>
      </main>
      <footer className="border-t border-white/10 bg-white/5 backdrop-blur py-10 text-center text-sm text-[#B9B3A8] mt-10 shadow-[0_12px_28px_rgba(0,0,0,0.45)]">
        &copy; {new Date().getFullYear()} WMC TRANSPORT LTD ??" Fast | Reliable | Professional.
      </footer>
    </div>
  );
}
