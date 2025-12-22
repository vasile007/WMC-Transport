import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../services/authContext.jsx";
import { Truck } from "lucide-react";

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const [showForgot, setShowForgot] = useState(() => new URLSearchParams(window.location.search).get('forgot') === '1');
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setStatus("");
  try {
    const res =
      tab === "login"
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password, "client");

    // Redirect based on role or redirect param
    if (res?.mustReset) return navigate('/first-login-reset');
    const redirectParam = new URLSearchParams(window.location.search).get('redirect');
    if (redirectParam) return navigate(redirectParam);
    if (res?.role === "admin" || res?.role === "operator") navigate("/admin-dashboard");
    else if (res?.role === "driver") navigate("/driver-dashboard");
    else navigate("/client-dashboard");
  } catch (err) {
    setError(err.message || "Something went wrong");
  }
};

const handleForgot = async (e) => {
  e.preventDefault();
  setError("");
  setStatus("");
  // Backend supports resetting when providing both email and a new password (first-login reset).
  // A full email-based reset flow is not implemented here.
  setStatus("Password reset by email is not available in this demo. Please use First Login Reset or contact support.");
};


  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center text-[#F5F3EE] px-4">
      <div className="bg-white/5 border border-white/10 rounded-2xl shadow-sm p-10 w-full max-w-md">
        
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-yellow-400 p-3 rounded-full shadow-md mb-3">
            <Truck className="text-[#F5F3EE] w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold text-yellow-400 tracking-tight">
            WMC TRANSPORT LTD
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Fast • Reliable • Professional
          </p>
        </div>

        {/* Tabs / Forgot */}
        <div className="flex mb-8 border-b border-white/10">
          {!showForgot && ["login", "register"].map((type) => (
            <button
              key={type}
              onClick={() => setTab(type)}
              className={`flex-1 py-2 text-center font-semibold transition-colors duration-300 ${
                tab === type
                  ? "text-[#D4AF37] border-b-2 border-red-700"
                  : "text-[#B9B3A8] hover:text-[#D4AF37]"
              }`}
            >
              {type === "login" ? "Login" : "Register"}
            </button>
          ))}
          {showForgot && (
            <div className="flex-1 py-2 text-center font-semibold text-[#D4AF37] border-b-2 border-red-700">Forgot Password</div>
          )}
        </div>

        {/* Forms */}
        <div className="min-h-[360px]">
        {!showForgot ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {tab === "register" && (
            <div>
              <label className="block text-sm mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full p-3 bg-white/5 border border-white/15 rounded-lg focus:border-[#D4AF37] outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 bg-white/5 border border-white/15 rounded-lg focus:border-[#D4AF37] outline-none"
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full p-3 bg-white/5 border border-white/15 rounded-lg focus:border-[#D4AF37] outline-none"
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm text-center animate-pulse">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-[#D4AF37] text-white font-semibold rounded-full shadow-md hover:bg-[#B98B2D] transition-colors"
          >
            {tab === "login" ? "Sign In" : "Create Account"}
          </button>
          <div className="text-center text-sm mt-4">
            <button type="button" onClick={() => setShowForgot(true)} className="text-yellow-300 hover:text-yellow-200">Forgot your password?</button>
          </div>
        </form>
        ) : (
        <form onSubmit={handleForgot} className="space-y-5">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full p-3 bg-white/5 border border-white/15 rounded-lg focus:border-[#D4AF37] outline-none"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {status && <p className="text-emerald-400 text-sm text-center">{status}</p>}

          <button type="submit" className="w-full py-3 bg-[#D4AF37] text-white font-semibold rounded-full shadow-md hover:bg-[#B98B2D] transition-all">Send reset link</button>
          <div className="text-center text-sm">
            <button type="button" onClick={() => { setShowForgot(false); setError(""); setStatus(""); }} className="text-yellow-300 hover:text-yellow-200">Back to sign in</button>
          </div>
        </form>
        )}
        </div>
      </div>
    </div>
  );
}




