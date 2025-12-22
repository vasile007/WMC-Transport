import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { orders as ordersApi } from "../services/orders.js";
import { useAuth } from "../services/authContext.jsx";
import { connectSocket } from "../services/socket.js";
import { addNotification } from "../services/notifications.js";

export default function ClientOrders() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);
  const socketRef = useRef(null);

  async function load() {
    setLoading(true);
    try {
      const data = await ordersApi.list(token);
      const active = (data || []).filter((o) => !["delivered", "cancelled"].includes(o.status));
      setOrders(active);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [token]);

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
        {/* Breadcrumbs */}
        <nav className="text-sm text-gray-400 mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link className="hover:text-red-400" to="/client-dashboard">Dashboard</Link></li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-200">My Orders</li>
          </ol>
        </nav>

        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
              <ClipboardList size={20} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-100">My Orders</h1>
              <p className="text-sm text-gray-400">View, track and pay your deliveries</p>
            </div>
            <div className="flex gap-2">
              <Link to="/client/orders/new" className="text-sm px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">New Order</Link>
              <Link to="/client-dashboard" className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Back to Dashboard</Link>
            </div>
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
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-8 shadow-sm text-center">
            <div className="mx-auto mb-3 w-10 h-10 rounded-full bg-red-500/20 text-red-300 flex items-center justify-center">🧾</div>
            <h2 className="text-lg font-semibold text-gray-100 mb-1">No orders yet</h2>
            <p className="text-sm text-gray-400 mb-4">When you book a delivery it will appear here. You can track the driver and complete payment.</p>
            <div className="flex items-center justify-center gap-2">
              <Link to="/client-dashboard" className="px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Back to Dashboard</Link>
              <Link to="/pricing" className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">See Pricing</Link>
              <Link to="/client/orders/new" className="px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Create Order</Link>
            </div>
          </div>
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
                  <th className="py-2">Payment</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id} className="border-t border-gray-800">
                    <td className="py-2">{o.id}</td>
                    <td className="py-2 text-xs text-gray-400">{o.referenceNumber || "-"}</td>
                    <td className="py-2">{o.pickupAddress}</td>
                    <td className="py-2">{o.dropoffAddress}</td>
                    <td className="py-2">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-2">
                      <PaymentBadge status={o.paymentStatus} />
                    </td>
                    <td className="py-2 flex gap-2">
                      <Link to={`/track/${o.id}`} className="px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Track</Link>
                      {o.status === 'cancelled' && (
                        <span className="px-3 py-1.5 rounded-md border border-gray-800 text-gray-400 bg-gray-900/60 text-xs">
                          Cancelled (refund in 3 days if paid)
                        </span>
                      )}
                    </td>
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

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    assigned: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30',
    picked_up: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30',
    in_transit: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
    delivered: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    cancelled: 'bg-red-500/10 text-red-300 border-red-500/30',
  };
  const cls = map[status] || 'bg-gray-800 text-gray-200 border-gray-700';
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs border capitalize ${cls}`}>{status || '-'}</span>;
}

function PaymentBadge({ status }) {
  const norm = (status || '').toLowerCase();
  const map = {
    succeeded: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    paid: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
    failed: 'bg-red-500/10 text-red-300 border-red-500/30',
  };
  const label = norm || 'pending';
  const cls = map[norm] || map.pending;
  return <span className={`inline-block px-2 py-0.5 rounded-full text-xs border capitalize ${cls}`}>{label}</span>;
}
