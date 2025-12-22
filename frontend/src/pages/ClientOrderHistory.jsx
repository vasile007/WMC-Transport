import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { History } from "lucide-react";
import { orders as ordersApi } from "../services/orders.js";
import { useAuth } from "../services/authContext.jsx";
import { connectSocket } from "../services/socket.js";
import { addNotification } from "../services/notifications.js";

export default function ClientOrderHistory() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);
  const socketRef = useRef(null);
  async function load() {
    setLoading(true);
    try {
      const rows = await ordersApi.list(token);
      const past = (rows || []).filter(o => ['delivered','cancelled'].includes(o.status));
      setOrders(past);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);
  useEffect(() => {
    if (!token) return;
    const s = connectSocket(token);
    socketRef.current = s;
    s.on("order:deleted", (payload) => {
      if (!payload?.orderId) return;
      const text = `Order #${payload.orderId} was deleted by admin.`;
      addNotification({ text, type: "order", orderId: payload.orderId });
      setToast(text);
      load();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(""), 3000);
    });
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100">
      <section className="max-w-7xl mx-auto px-6 py-8">
        <nav className="text-sm text-gray-400 mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link className="hover:text-red-400" to="/client-dashboard">Dashboard</Link></li>
            <li className="text-gray-600">/</li>
            <li><Link className="hover:text-red-400" to="/client/orders">My Orders</Link></li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-200">Order History</li>
          </ol>
        </nav>
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
              <History size={20} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-100">Order History</h1>
              <p className="text-sm text-gray-400">All your past deliveries</p>
            </div>
            <Link to="/client/orders" className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Back to My Orders</Link>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-900/40" />
        </div>

        {loading && <p className="text-gray-400">Loading…</p>}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-900 border border-yellow-400 text-yellow-200 px-4 py-2 rounded-lg shadow-lg">
            {toast}
          </div>
        )}
        {!loading && orders.length === 0 && (
          <p className="text-gray-400">No past orders.</p>
        )}
        {!loading && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400">
                  <th className="py-2">#</th>
                  <th className="py-2">Reference</th>
                  <th className="py-2">Pickup</th>
                  <th className="py-2">Dropoff</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Updated</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-gray-800">
                    <td className="py-2">{o.id}</td>
                    <td className="py-2 text-xs text-gray-400">{o.referenceNumber || "-"}</td>
                    <td className="py-2">{o.pickupAddress}</td>
                    <td className="py-2">{o.dropoffAddress}</td>
                    <td className="py-2 capitalize">{o.status}</td>
                    <td className="py-2">{o.updatedAt ? new Date(o.updatedAt).toLocaleString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
