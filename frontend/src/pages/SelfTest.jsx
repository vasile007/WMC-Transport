import { useState } from "react";
import { useAuth } from "../services/authContext.jsx";
import { users as usersApi } from "../services/users.js";

export default function SelfTest() {
  const { register, login, logout, resetPassword } = useAuth();
  const [logs, setLogs] = useState([]);
  const [running, setRunning] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const log = (msg) => setLogs((l) => [...l, msg]);

  async function runClientFlow() {
    setRunning("client");
    setLogs([]);
    const ts = Date.now();
    const e = `test+${ts}@example.com`;
    const p = "Passw0rd!";
    setEmail(e);
    setPassword(p);

    try {
      log("1) Registering new client user...");
      const r1 = await register("Test User", e, p);
      if (!r1?.token) throw new Error("Register did not return token");
      log("[ok] Registered and token issued");

      log("2) Logging out...");
      logout();
      if (localStorage.getItem("user")) throw new Error("Logout did not clear storage");
      log("[ok] Logged out and storage cleared");

      log("3) Login with wrong password should fail...");
      let badFailed = false;
      try {
        await login(e, "wrong-" + p);
      } catch {
        badFailed = true;
      }
      if (!badFailed) throw new Error("Login with wrong password unexpectedly succeeded");
      log("[ok] Wrong-password login rejected");

      log("4) Login with correct password...");
      const r2 = await login(e, p);
      if (!r2?.token) throw new Error("Login did not return token");
      if (r2?.role !== "client") throw new Error(`Expected role client, got ${r2?.role}`);
      log("[ok] Logged in with role=client and token present");

      log("All checks passed.");
    } catch (err) {
      log("[error] Failure: " + (err?.message || String(err)));
    } finally {
      setRunning("");
    }
  }

  async function runAdminDriverFlow() {
    setRunning("admin");
    try {
      setLogs([]);
      const t = Date.now();
      const drEmail = `dr+${t}@example.com`;
      const newPw = "NewPassw0rd!";

      const admin = await login(adminEmail, adminPassword);
      if (admin?.role !== "admin") throw new Error("Not an admin account");

      const dr = await usersApi.create(admin.token, { name: "Driver Test", email: drEmail, role: "driver" });
      const drTemp = dr?.tempPassword;
      logout();

      if (!drTemp) throw new Error("No temp password returned for driver (dev only)");
      await login(drEmail, drTemp);
      await resetPassword(drEmail, newPw);
      logout();
      await login(drEmail, newPw);
      logout();
      setLogs((l) => [...l, "[ok] Admin create driver + reset/login passed"]);
    } catch (e) {
      setLogs((l) => [...l, "[error] Admin flow failed: " + (e.message || String(e))]);
    } finally {
      setRunning("");
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white border border-gray-200 rounded-xl shadow-sm mt-8">
      <h1 className="text-xl font-bold mb-2">WMC TRANSPORT LTD Auth Self-Test</h1>
      <p className="text-sm text-gray-600 mb-4">Runs register / logout / login and validates responses.</p>

      <div className="text-sm text-gray-700 mb-3">
        Test user will be created as: <code className="px-1 rounded bg-gray-100">{email || "(generated)"}</code>
      </div>

      <button
        disabled={!!running}
        onClick={runClientFlow}
        className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold disabled:opacity-50"
      >
        {running === "client" ? "Running..." : "Run Client Tests"}
      </button>

      <div className="mt-8 border-t border-gray-200 pt-6">
        <h2 className="text-lg font-semibold mb-2">Admin Create Driver</h2>
        <p className="text-sm text-gray-600 mb-3">Provide an admin account to create a test driver and verify login + reset flow.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <input
            className="border border-gray-300 rounded-md px-3 py-2"
            placeholder="Admin email"
            value={adminEmail}
            onChange={(e) => setAdminEmail(e.target.value)}
          />
          <input
            className="border border-gray-300 rounded-md px-3 py-2"
            placeholder="Admin password"
            type="password"
            value={adminPassword}
            onChange={(e) => setAdminPassword(e.target.value)}
          />
        </div>
        <button
          disabled={!!running}
          onClick={runAdminDriverFlow}
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold disabled:opacity-50"
        >
          {running === "admin" ? "Running..." : "Run Admin Create Tests"}
        </button>
      </div>

      <div className="mt-4 space-y-1 text-sm">
        {logs.map((l, i) => (
          <div
            key={i}
            className={
              l.startsWith("[error]")
                ? "text-red-600"
                : l.startsWith("[ok]")
                  ? "text-green-700"
                  : "text-gray-800"
            }
          >
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}
