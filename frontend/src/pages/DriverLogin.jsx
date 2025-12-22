import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../services/authContext.jsx";

export default function DriverLogin() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "driver") navigate("/driver-dashboard");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await login(email, password);
      if (res.role === "driver") navigate("/driver-dashboard");
      else setError("Access denied — only drivers can log in here.");
    } catch (err) {
      setError(err.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center text-[#F5F3EE] fade-in">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl max-w-md w-full">
        <h1 className="text-3xl font-bold text-[#D4AF37] text-center mb-6">
          Driver Portal
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Sign in to access your delivery dashboard.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="driver@example.com"
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-[#D4AF37] text-[#F5F3EE] font-semibold rounded-full shadow-md hover:bg-[#B98B2D] hover:scale-105 transition-all duration-300"
          >
            Sign In
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Not registered?{" "}
          <Link
            to="/driver-register"
            className="text-[#D4AF37] hover:underline"
          >
            Join as a Driver
          </Link>
        </p>

        <p className="mt-6 text-xs text-[#B9B3A8] text-center">
          © {new Date().getFullYear()} WMC TRANSPORT LTD — Driver Portal
        </p>
      </div>
    </div>
  );
}



