import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function DriverRegister() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    vehicleType: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "");
      setForm({ ...form, phone: digitsOnly });
      return;
    }
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    ...form,
    role: "driver",
  }),
});


      if (!res.ok) throw new Error("Registration failed");
      setSuccess("Account created successfully! You can now log in.");
      setTimeout(() => navigate("/driver-login"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D10] flex items-center justify-center text-[#F5F3EE] fade-in">
      <div className="bg-white/5 border border-white/10 rounded-2xl p-8 shadow-xl max-w-lg w-full">
        <h1 className="text-3xl font-bold text-[#D4AF37] text-center mb-6">
          Join WMC TRANSPORT LTD Drivers
        </h1>
        <p className="text-center text-gray-400 mb-6 text-sm">
          Become a trusted WMC TRANSPORT LTD driver and start earning today.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          />
          <input
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email Address"
            type="email"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          />
          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            type="password"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          />
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="Phone Number"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          />
          <input
            name="vehicleType"
            value={form.vehicleType}
            onChange={handleChange}
            placeholder="Vehicle Type (Van, Truck, Bike...)"
            className="w-full p-3 rounded-lg bg-white/5 border border-white/10 focus:border-[#D4AF37] outline-none"
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-400 text-sm">{success}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-[#D4AF37] text-[#F5F3EE] font-semibold rounded-full shadow-md hover:bg-[#B98B2D] hover:scale-105 transition-all duration-300"
          >
            Register
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-400">
          Already a driver?{" "}
          <Link to="/driver-login" className="text-[#D4AF37] hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}



