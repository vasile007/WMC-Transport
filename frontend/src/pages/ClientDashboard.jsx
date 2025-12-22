import { Link } from "react-router-dom";
import { ClipboardList, User, Bell, CreditCard, History, Shield, ChevronRight, MessageCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { orders as ordersApi } from "../services/orders.js";
import { useAuth } from "../services/authContext.jsx";
import { connectSocket } from "../services/socket.js";
import { addNotification } from "../services/notifications.js";
import { getUnreadCount, subscribeUnread } from "../services/chatUnread.js";

export default function ClientDashboard() {
  const { user } = useAuth();
  const [activeCount, setActiveCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [unpaidCount, setUnpaidCount] = useState(0);
  const [paidCount, setPaidCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState("");
  const toastTimerRef = useRef(null);
  const socketRef = useRef(null);
  const [chatUnread, setChatUnread] = useState(0);

  console.log(
    'MAP KEY =',
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  );
  async function refreshStats() {
    try {
      const rows = await ordersApi.list(user?.token);
      const active = (rows || []).filter(o => !['delivered','cancelled'].includes(o.status));
      setActiveCount(active.length);
      const pending = (rows || []).filter(o => o.status === 'pending');
      setPendingCount(pending.length);
      const delivered = (rows || []).filter(o => o.status === 'delivered');
      setDeliveredCount(delivered.length);
      const paid = (rows || []).filter(o => {
        const pay = (o.paymentStatus || '').toLowerCase();
        return pay === 'succeeded' || pay === 'paid';
      });
      setPaidCount(paid.length);
      const unpaid = (rows || []).filter(o => {
        const pay = (o.paymentStatus || '').toLowerCase();
        return pay !== 'succeeded' && pay !== 'paid';
      });
      setUnpaidCount(unpaid.length);
      const mostRecent = (rows || []).reduce((acc, r) => {
        const t = r.updatedAt ? Date.parse(r.updatedAt) : 0;
        return t > (acc?.t || 0) ? { t, r } : acc;
      }, null);
      setLastUpdated(mostRecent?.t ? new Date(mostRecent.t).toLocaleString() : null);
    } catch {}
  }

  useEffect(() => {
    refreshStats();
  }, [user?.token]);
  useEffect(() => {
    if (!user?.token) return;
    const s = connectSocket(user.token);
    socketRef.current = s;
    s.on("order:deleted", (payload) => {
      if (!payload?.orderId) return;
      const text = `Order #${payload.orderId} was deleted by admin.`;
      addNotification({ text, type: "order", orderId: payload.orderId });
      setToast(text);
      refreshStats();
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(""), 3000);
    });
    return () => {
      s.disconnect();
      socketRef.current = null;
    };
  }, [user?.token]);

  useEffect(() => {
    setChatUnread(getUnreadCount());
    const unsub = subscribeUnread(() => setChatUnread(getUnreadCount()));
    return () => unsub();
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100">
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="border-b border-gray-800 pb-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">Client Dashboard</h1>
              <p className="text-sm text-gray-300 mt-1">Hello, <span className="font-semibold text-gray-100">{user?.name || 'Client'}</span></p>
              <p className="text-sm text-gray-400">Manage your orders and profile</p>
            </div>
            <div className="flex items-center gap-2">
              <Link to="/client/orders/new" className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-semibold hover:bg-red-700">Create New Order</Link>
              <Link to="/client/orders" className="px-4 py-2 rounded-md border border-gray-700 text-sm font-semibold text-gray-200 hover:border-red-500 hover:text-red-400">View Orders</Link>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI title="Delivered" value={deliveredCount} subtitle={lastUpdated ? `Last update ${lastUpdated}` : 'No updates yet'} />
            <KPI title="Active" value={activeCount} subtitle={pendingCount ? `${pendingCount} pending` : 'Up to date'} />
            <KPI title="Paid" value={paidCount} subtitle={paidCount ? 'Completed payments' : 'No payments yet'} />
            <KPI title="Unpaid" value={unpaidCount} subtitle={unpaidCount ? 'Complete payments' : 'All paid'} />
          </div>
          {/* Empty state CTA */}
          {activeCount === 0 && (
            <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/70 p-5 shadow-sm flex items-center justify-between">
              <div className="text-sm text-gray-300">No active orders. Ready to book your next delivery?</div>
              <div className="flex items-center gap-2">
                <Link to="/pricing" className="px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">See Pricing</Link>
                <Link to="/client/orders/new" className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">Create Order</Link>
              </div>
            </div>
          )}
        </div>


        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-900 border border-yellow-400 text-yellow-200 px-4 py-2 rounded-lg shadow-lg">
            {toast}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Section list */}
          <div className="lg:col-span-2 space-y-3">
            <DashboardRow
              to="/client/orders"
              icon={<ClipboardList className="text-red-400" size={18} />}
              title="My Orders"
              desc={`Track and pay deliveries · pending ${pendingCount}, active ${activeCount}`}
            >
              <span className="inline-block px-2 py-0.5 rounded-full text-xs border bg-yellow-500/10 text-yellow-300 border-yellow-500/30">Pending: {pendingCount}</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs border bg-gray-800/80 text-gray-200 border-gray-700">Active: {activeCount}</span>
            </DashboardRow>
            <DashboardRow
              to="/client/orders/history"
              icon={<History className="text-red-400" size={18} />}
              title="Order History"
              desc={`Delivered ${deliveredCount} · cancelled orders removed from tracking`}
            />
            <DashboardRow
              to="/client/notifications"
              icon={<Bell className="text-red-400" size={18} />}
              title="Notifications"
              desc="Status updates, cancellations, and payment receipts"
            />
            <DashboardRow
              to="/client/support"
              icon={<MessageCircle className="text-red-400" size={18} />}
              title="Support Chat"
              desc="Open a live chat with support"
            >
              {chatUnread > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border bg-red-500/20 text-red-300 border-red-500/40">
                  New
                </span>
              )}
            </DashboardRow>
            <DashboardRow
              to="/client/billing"
              icon={<CreditCard className="text-red-400" size={18} />}
              title="Billing"
              desc={`Paid ${paidCount} · Unpaid ${unpaidCount} · download receipts`}
            />
            <DashboardRow
              to="/client/security"
              icon={<Shield className="text-red-400" size={18} />}
              title="Security"
              desc="Devices and two-factor authentication"
            />

            {/* Recent Orders section removed to restore previous layout */}
          </div>

          {/* Right: Profile summary */}
          <aside className="lg:col-span-1">
            <div className="relative overflow-hidden rounded-xl border border-red-900/40 bg-gradient-to-r from-gray-900 via-gray-900 to-gray-950 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-semibold">
                  {(user?.name || 'U').slice(0,1).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-100">{user?.name || 'Client'}</div>
                  <div className="text-xs text-gray-400">{user?.email || 'Not set'}</div>
                </div>
              </div>
              <div className="text-sm text-gray-300 space-y-0.5">
                <div><span className="text-gray-400">Phone:</span> {user?.phone || 'Not set'}</div>
                <div><span className="text-gray-400">Address:</span> {user?.addressLine1 || 'Not set'}</div>
                <div><span className="text-gray-400">City:</span> {user?.city || 'Not set'}</div>
                <div><span className="text-gray-400">Postcode:</span> {user?.postcode || 'Not set'}</div>
              </div>
              <div className="mt-3">
                <Link to="/client/profile" className="inline-block text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Manage Profile</Link>
              </div>
              <div className="pointer-events-none absolute -right-8 -top-8 h-20 w-20 rounded-full bg-red-900/40" />
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

function DashboardRow({ to, icon, title, desc, children }) {
  return (
    <Link to={to} className="group flex items-center justify-between rounded-xl border border-gray-800 bg-gray-900/60 p-4 shadow-sm hover:border-red-500/60 hover:shadow transition-colors">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-full bg-gray-800 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <div className="font-semibold text-gray-100">{title}</div>
          <div className="text-sm text-gray-400">{desc}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 text-gray-500 group-hover:text-red-400">
        {children}
        <ChevronRight size={18} />
      </div>
    </Link>
  );
}

function KPI({ title, value, subtitle }) {
  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 shadow-sm">
      <div className="text-xs uppercase text-gray-400">{title}</div>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      <div className="text-xs text-gray-500">{subtitle}</div>
    </div>
  );
}

//
