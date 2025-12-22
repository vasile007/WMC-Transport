import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/authContext.jsx";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate("/login");
    setIsOpen(false);
  }

  function handleAccountClick() {
    if (!user) return navigate("/login");
    if (user.role === "admin") navigate("/admin-dashboard");
    else if (user.role === "driver") navigate("/driver-dashboard");
    else navigate("/client-dashboard");
  }

  const linkBase = "text-sm font-semibold text-[#B9B3A8] hover:text-[#F5F3EE] transition-colors px-2 py-1 rounded-full hover:bg-white/5";

  return (
    <nav className="navbar sticky top-0 z-50 bg-[#0B0D10]/85 backdrop-blur-xl border-b border-white/10 shadow-[0_16px_36px_rgba(0,0,0,0.45)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="inline-block bg-gradient-to-r from-[#D4AF37] via-[#C49A2E] to-[#B98B2D] text-[#0B0D10] px-2 py-1 rounded-md text-sm font-extrabold leading-none shadow-soft">
              WMC
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#F5F3EE] group-hover:text-[#D4AF37] hidden md:inline">
              WMC TRANSPORT LTD
            </span>
            <span className="text-xl font-extrabold tracking-tight text-[#F5F3EE] group-hover:text-[#D4AF37] md:hidden">
              WMC TRANSPORT
            </span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/" className={linkBase}>Home</Link>
          <Link to="/services" className={linkBase}>Services</Link>
          <Link to="/about" className={linkBase}>About</Link>
          <Link to="/contact" className={linkBase}>Contact</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <Link
              to="/login"
              className="px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-[#F5F3EE] hover:border-[#D4AF37]/60 hover:text-[#D4AF37] shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
            >
              Login
            </Link>
          ) : (
            <>
              <button
                onClick={handleAccountClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/15 bg-white/5 text-sm font-semibold text-[#F5F3EE] hover:border-[#D4AF37]/60 hover:text-[#D4AF37] shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              >
                <User size={16} /> Your Account
              </button>
              <button
                onClick={handleLogout}
                className="btn text-sm px-4 py-2"
              >
                Logout
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:text-amber-700"
          aria-label="Toggle Menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0B0D10]/95 backdrop-blur px-6 py-4 space-y-3 shadow-[0_20px_40px_rgba(0,0,0,0.45)]">
          <Link to="/" onClick={() => setIsOpen(false)} className={linkBase}>Home</Link>
          <Link to="/services" onClick={() => setIsOpen(false)} className={linkBase}>Services</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className={linkBase}>About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className={linkBase}>Contact</Link>

          {!user ? (
            <div className="pt-2 flex gap-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex-1 px-4 py-2 rounded-lg border border-white/15 text-center text-sm font-semibold text-[#F5F3EE] bg-white/5 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              >
                Login
              </Link>
            </div>
          ) : (
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => { handleAccountClick(); setIsOpen(false); }}
                className="flex-1 px-4 py-2 rounded-lg border border-white/15 text-sm font-semibold text-[#F5F3EE] bg-white/5 hover:border-[#D4AF37]/60 hover:text-[#D4AF37] shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              >
                Your Account
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 btn text-sm py-2"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
