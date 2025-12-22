import { Link } from "react-router-dom";
import { Bell, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { clearNotifications, listNotifications } from "../services/notifications.js";

export default function ClientNotifications() {
  const [nonce, setNonce] = useState(0);
  const notifications = useMemo(() => listNotifications(), [nonce]);
  useEffect(() => {
    const onUpdate = () => setNonce((v) => v + 1);
    window.addEventListener("client-notifications", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("client-notifications", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100">
      <section className="max-w-5xl mx-auto px-6 py-8">
        <nav className="text-sm text-gray-400 mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link className="hover:text-red-400" to="/client-dashboard">Dashboard</Link></li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-200">Notifications</li>
          </ol>
        </nav>
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
              <Bell size={20} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-100">Notifications</h1>
              <p className="text-sm text-gray-400">Recent updates on your deliveries</p>
            </div>
            <Link to="/client-dashboard" className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Back to Dashboard</Link>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-900/40" />
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-gray-400">Latest {notifications.length} updates</div>
            <button
              className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400 disabled:opacity-50"
              onClick={() => {
                clearNotifications();
                setNonce((v) => v + 1);
              }}
              disabled={notifications.length === 0}
            >
              <Trash2 size={14} className="inline-block mr-1" />
              Clear all
            </button>
          </div>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-400">No notifications.</p>
          ) : (
            <ul className="divide-y divide-gray-800">
              {notifications.map(n => (
                <li key={n.id} className="py-2 text-sm text-gray-200 flex items-center justify-between">
                  <span>{n.text}</span>
                  <span className="text-xs text-gray-500">{new Date(n.ts).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
