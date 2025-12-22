import { useState } from "react";
import { useAuth } from "../services/authContext";

export default function FirstLoginReset() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await resetPassword(email, password);
      setMsg("✅ Password changed successfully. You can now log in.");
    } catch (e) {
      setMsg("❌ " + e.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0B0D10] text-[#F5F3EE]">
      <form onSubmit={handleSubmit} className="bg-white/5 p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4 text-center">Change Your Password</h1>
        <input
          className="border border-white/15 rounded-md px-3 py-2 w-full mb-3"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border border-white/15 rounded-md px-3 py-2 w-full mb-3"
          placeholder="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-gray-900 text-white py-2 rounded-md w-full hover:bg-black">
          Update Password
        </button>
        {msg && <p className="text-sm text-center mt-3">{msg}</p>}
      </form>
    </main>
  );
}



