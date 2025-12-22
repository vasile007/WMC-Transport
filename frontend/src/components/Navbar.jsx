import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/authContext.jsx";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

export default function Navbar() {
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

  const linkBase = "text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors";

  return (
    <nav className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-slate-200 shadow-[0_14px_32px_rgba(15,23,42,0.12)]">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <span className="inline-block bg-gradient-to-r from-black via-slate-800 to-amber-500 text-white px-2 py-1 rounded-sm text-sm font-extrabold leading-none">QM</span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 hidden md:inline">WMC TRANSPORT LTD</span>
            <span className="text-xl font-extrabold tracking-tight text-slate-900 group-hover:text-blue-600 md:hidden">WMC TRANSPORT</span>
          </Link>
        </div>

        {/* Main nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className={linkBase}>Home</Link>
          <Link to="/services" className={linkBase}>Services</Link>
          <Link to="/about" className={linkBase}>About</Link>
          <Link to="/contact" className={linkBase}>Contact</Link>
          <Link to="/driver-login" className="text-sm font-semibold text-slate-900 hover:text-blue-600">For Drivers</Link>
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-3">
          {!user ? (
            <>
              <Link to="/login" className="px-4 py-2 rounded-md border border-slate-200 text-sm font-semibold text-slate-900 hover:border-blue-300 hover:text-blue-700 bg-white">Login</Link>
            </>
          ) : (
            <>
              <button
                onClick={handleAccountClick}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 text-sm font-semibold text-slate-900 hover:border-blue-300 hover:text-blue-700 bg-white"
                aria-label="Open your account"
              >
                <User size={16} /> Your Account
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md bg-black text-white text-sm font-semibold hover:bg-slate-800 shadow-lg"
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:text-slate-900"
          aria-label="Toggle Menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile panel */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur px-6 py-4 space-y-3">
          <Link to="/" onClick={() => setIsOpen(false)} className={linkBase}>Home</Link>
          <Link to="/services" onClick={() => setIsOpen(false)} className={linkBase}>Services</Link>
          <Link to="/about" onClick={() => setIsOpen(false)} className={linkBase}>About</Link>
          <Link to="/contact" onClick={() => setIsOpen(false)} className={linkBase}>Contact</Link>
          <Link to="/driver-login" onClick={() => setIsOpen(false)} className="text-sm font-semibold text-slate-900 hover:text-blue-600">For Drivers</Link>

          {!user ? (
            <div className="pt-2 flex gap-2">
              <Link to="/login" onClick={() => setIsOpen(false)} className="flex-1 px-4 py-2 rounded-md border border-slate-200 text-center text-sm font-semibold text-slate-900 hover:border-blue-300 hover:text-blue-700 bg-white">Login</Link>
            </div>
          ) : (
            <div className="pt-2 flex gap-2">
              <button onClick={() => { handleAccountClick(); setIsOpen(false); }} className="flex-1 px-4 py-2 rounded-md border border-slate-200 text-sm font-semibold text-slate-900 hover:border-blue-300 hover:text-blue-700 bg-white">Your Account</button>
              <button onClick={handleLogout} className="flex-1 px-4 py-2 rounded-md bg-black text-white text-sm font-semibold hover:bg-slate-800 shadow-lg">Logout</button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
