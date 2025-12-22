import { Link } from "react-router-dom";
import { Shield } from "lucide-react";
import { useMemo } from "react";

export default function ClientSecurity() {
  const devices = useMemo(() => [
    { id: 1, name: 'Chrome on Windows', lastSeen: Date.now() - 1000*60*20 },
    { id: 2, name: 'Safari on iPhone', lastSeen: Date.now() - 1000*60*60*48 },
  ], []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100">
      <section className="max-w-5xl mx-auto px-6 py-8">
        <nav className="text-sm text-gray-400 mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link className="hover:text-red-400" to="/client-dashboard">Dashboard</Link></li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-200">Security</li>
          </ol>
        </nav>
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
              <Shield size={20} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-100">Security</h1>
              <p className="text-sm text-gray-400">Devices & two-factor authentication</p>
            </div>
            <Link to="/client-dashboard" className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Back to Dashboard</Link>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-900/40" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-100 mb-3">Active devices</h3>
            <ul className="space-y-2">
              {devices.map(d => (
                <li key={d.id} className="text-sm text-gray-200 flex items-center justify-between">
                  <span>{d.name}</span>
                  <span className="text-xs text-gray-500">Last seen {new Date(d.lastSeen).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-100 mb-3">Two-factor authentication</h3>
            <p className="text-sm text-gray-400 mb-3">Add an extra layer of security to your account by enabling 2FA.</p>
            <button className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700">Enable 2FA</button>
          </div>
        </div>
      </section>
    </main>
  );
}
