import { Link } from "react-router-dom";
import { CreditCard } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../services/authContext.jsx";
import { orders as ordersApi } from "../services/orders.js";

export default function ClientBilling() {
  const { token } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) return;
      setLoading(true);
      try {
        const list = await ordersApi.list(token);
        const paid = (list || []).filter((o) => {
          const p = (o.paymentStatus || "").toLowerCase();
          return p === "paid" || p === "succeeded";
        });
        setRows(paid);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100">
      <section className="max-w-5xl mx-auto px-6 py-8">
        <nav className="text-sm text-gray-400 mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link className="hover:text-red-400" to="/client-dashboard">Dashboard</Link></li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-200">Billing</li>
          </ol>
        </nav>
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
              <CreditCard size={20} />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-100">Billing</h1>
              <p className="text-sm text-gray-400">Payment history and invoices</p>
            </div>
            <Link to="/client-dashboard" className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Back to Dashboard</Link>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-900/40" />
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 shadow-sm">
          {loading && <p className="text-sm text-gray-400">Loading payments...</p>}
          {!loading && rows.length === 0 && (
            <p className="text-sm text-gray-400">No completed payments yet.</p>
          )}
          {!loading && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-400">
                    <th className="py-2">Order</th>
                    <th className="py-2">Reference</th>
                    <th className="py-2">Amount</th>
                    <th className="py-2">Status</th>
                    <th className="py-2">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((o) => (
                    <tr key={o.id} className="border-t border-gray-800">
                      <td className="py-2">#{o.id}</td>
                      <td className="py-2 text-xs text-gray-400">{o.referenceNumber || "-"}</td>
                      <td className="py-2">{o.price ? `£${Number(o.price).toFixed(2)}` : "-"}</td>
                      <td className="py-2 capitalize">{o.paymentStatus || "-"}</td>
                      <td className="py-2">{o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
