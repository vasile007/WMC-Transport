import { useEffect, useRef, useState } from "react";
import { RefreshCcw, MessageCircle, Send } from "lucide-react";
import { useAuth } from "../services/authContext.jsx";
import { orders as ordersApi } from "../services/orders.js";
import { users as usersApi } from "../services/users.js";
import { io } from "socket.io-client";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(null);
  const [toast, setToast] = useState("");
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [reply, setReply] = useState("");
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const selectedRef = useRef(null);
  const [notify, setNotify] = useState(false);
  const notifyRef = useRef(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "driver" });
  const [newUserError, setNewUserError] = useState("");
  const [newUserOk, setNewUserOk] = useState("");
  const [ops, setOps] = useState([]);
  const [opsLoading, setOpsLoading] = useState(false);
  const [resetPw, setResetPw] = useState("");
  const [tab, setTab] = useState("orders");
  const [orderQuery, setOrderQuery] = useState("");
  const [historyQuery, setHistoryQuery] = useState("");
  const [supportUnread, setSupportUnread] = useState(false);
  const [usersFilter, setUsersFilter] = useState("driver");
  const tabRef = useRef(tab);

  // Load Orders + Drivers
  async function loadData() {
    setLoading(true);
    try {
      const [ordersData, driversData] = await Promise.all([
        ordersApi.list(user?.token),
        usersApi.listDrivers(user?.token),
      ]);
      setOrders(ordersData || []);
      setDrivers(driversData || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    if (!user?.token) return;
    setOpsLoading(true);
    try {
      const list = await usersApi.list(user.token, usersFilter);
      setOps(list);
    } catch {
      // ignored
    }
    setOpsLoading(false);
  }

  useEffect(() => {
    if (user?.token) loadData();
  }, [user]);

  // Load Users List
  useEffect(() => {
    loadUsers();
  }, [user, usersFilter]);

  useEffect(() => {
    notifyRef.current = notify;
  }, [notify]);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    tabRef.current = tab;
    if (tab === "support") setSupportUnread(false);
  }, [tab]);

  // Setup Socket
  useEffect(() => {
    if (!user?.token) return;
    const s = io("https://wmc-transport.vercel.app", {
  transports: ["polling"],
  upgrade: false,
  withCredentials: true
});


    socketRef.current = s;

    s.emit("help:list", (items) => setConversations(items || []));
    s.on("help:conversation", (summary) => {
      setConversations((prev) => {
        const rest = prev.filter((c) => c.id !== summary.id);
        return [summary, ...rest];
      });
      if (
        summary?.lastMessageFrom !== "admin" &&
        tabRef.current !== "support"
      ) {
        setSupportUnread(true);
      }
    });
    s.on("help:message", (m) => {
      const isSelected = m.conversationId === selectedRef.current;
      if (isSelected) setHistory((h) => [...h, m]);
      if (m?.from && m.from !== "admin" && tabRef.current !== "support") {
        setSupportUnread(true);
      }
      if (isSelected) return;
      try {
        if (notifyRef.current) audioRef.current?.play();
      } catch {}
      try {
        if (
          notifyRef.current &&
          "Notification" in window &&
          Notification.permission === "granted"
        ) {
          new Notification("New customer message", {
            body: (m.text || "").slice(0, 80),
          });
        }
      } catch {}
    });
    s.on("help:deleted", ({ id }) => {
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (selectedRef.current === id) {
        setSelected(null);
        setHistory([]);
      }
    });
    s.on("order:delivered", (payload) => {
      if (!payload?.orderId) return;
      setToast(`Order #${payload.orderId} delivered`);
      setTimeout(() => setToast(""), 2000);
      loadData();
    });

    return () => s.disconnect();
  }, [user?.token]);

  useEffect(() => {
    if (conversations.length && !selected) {
      openConversation(conversations[0].id);
    }
  }, [conversations]);

  function openConversation(id) {
    setSelected(id);
    setHistory([]);
    socketRef.current?.emit("help:subscribe", id);
    socketRef.current?.emit("help:history", id, (h) => setHistory(h || []));
  }

  function sendReply(e) {
    e.preventDefault();
    if (!selected || !reply) return;
    socketRef.current?.emit("help:message", { conversationId: selected, text: reply });
    setReply("");
  }

  function deleteConversation(id) {
    if (!id) return;
    if (!window.confirm(`Delete conversation #${id}? This cannot be undone.`)) return;
    socketRef.current?.emit("help:delete", id, (res) => {
      if (!res?.ok) alert("Failed to delete conversation");
    });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedRef.current === id) {
      setSelected(null);
      setHistory([]);
    }
  }

  async function assignDriver(orderId, driverId) {
    if (!driverId) return;
    setAssigning(orderId);
    try {
      await ordersApi.update(user.token, orderId, { driverId });
      setToast("Driver assigned successfully!");
      await loadData();
      setTimeout(() => setToast(""), 2500);
    } catch (e) {
      alert(e.message);
    } finally {
      setAssigning(null);
    }
  }

  async function refreshAll() {
    await loadData();
    if (tab === "users") await loadUsers();
    if (tab === "support") {
      socketRef.current?.emit("help:list", (items) => setConversations(items || []));
    }
  }

  // Orders Table
  function filterRows(rows, query) {
    const needle = query.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((o) => {
      const idMatch = String(o.id || "").includes(needle);
      const refMatch = String(o.referenceNumber || "").toLowerCase().includes(needle);
      return idMatch || refMatch;
    });
  }

  function confirmDeleteOrder(order) {
    if (!order) return false;
    const pay = String(order.paymentStatus || "").toLowerCase();
    const isPaid = pay === "paid" || pay === "succeeded";
    const msg = isPaid
      ? `Order #${order.id} is paid. Are you sure you want to delete it? This cannot be undone and refunds must be handled manually.`
      : `Delete order #${order.id}?`;
    return window.confirm(msg);
  }

  function OrdersTable({ rows }) {
    const filtered = filterRows(rows, orderQuery);

    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="py-2">ID</th>
              <th className="py-2">Ref</th>
              <th className="py-2">Pickup</th>
              <th className="py-2">Dropoff</th>
              <th className="py-2">Status</th>
              <th className="py-2">Payment</th>
              <th className="py-2">Driver</th>
              <th className="py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-6 text-center text-gray-500">
                  No matching orders.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-t border-gray-200">
                  <td className="py-2">#{o.id}</td>
                  <td className="py-2 text-xs text-gray-600">
                    {o.referenceNumber || "-"}
                  </td>
                  <td className="py-2">{o.pickupAddress}</td>
                  <td className="py-2">{o.dropoffAddress}</td>
                  <td className="py-2 capitalize">{o.status}</td>
                  <td className="py-2">
                    <PaymentBadge status={o.paymentStatus} />
                  </td>
                  <td className="py-2">
                    {o.status === "pending" ? (
                      <select
                        className="border border-gray-700 bg-gray-900/70 text-gray-100 rounded px-2 py-1"
                        onChange={(e) => assignDriver(o.id, e.target.value)}
                        disabled={assigning === o.id}
                      >
                        <option value="">Select driver...</option>
                        {drivers.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    ) : o.driverId ? (
                      <span>#{o.driverId}</span>
                    ) : (
                      "-"
                    )}
                  </td>
                  <td className="py-2 flex gap-2">
                  {["assigned", "in_transit"].includes(o.status) && (
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Cancel order #${o.id}?`)) return;
                        await ordersApi.update(user.token, o.id, { status: "cancelled" });
                        setToast("Order cancelled");
                        setTimeout(() => setToast(""), 1500);
                        await loadData();
                      }}
                      className="px-3 py-1.5 rounded-md border border-red-300 text-red-700 hover:bg-red-50"
                    >
                      Cancel
                    </button>
                  )}
                    <button
                      onClick={async () => {
                        if (!confirmDeleteOrder(o)) return;
                        try {
                          await ordersApi.remove(user.token, o.id);
                          setToast("Order deleted");
                          setTimeout(() => setToast(""), 1500);
                          await loadData();
                        } catch (e) {
                          alert(e.message || "Failed to delete");
                        }
                      }}
                      className="px-3 py-1.5 rounded-md border border-red-900/60 text-red-300 hover:bg-red-900/40 hover:text-red-200"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  );
}

function HistoryTable({ rows }) {
  const filtered = filterRows(rows, historyQuery);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500">
            <th className="py-2">ID</th>
            <th className="py-2">Ref</th>
            <th className="py-2">Pickup</th>
            <th className="py-2">Dropoff</th>
            <th className="py-2">Status</th>
            <th className="py-2">Updated</th>
            <th className="py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={7} className="py-6 text-center text-gray-500">
                No matching history.
              </td>
            </tr>
          ) : (
            filtered.map((o) => (
              <tr key={o.id} className="border-t border-gray-200">
                <td className="py-2">#{o.id}</td>
                <td className="py-2 text-xs text-gray-600">{o.referenceNumber || "-"}</td>
                <td className="py-2">{o.pickupAddress}</td>
                <td className="py-2">{o.dropoffAddress}</td>
                <td className="py-2 capitalize">{o.status}</td>
                <td className="py-2">{o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "-"}</td>
                <td className="py-2">
                  <button
                    onClick={async () => {
                      if (!confirmDeleteOrder(o)) return;
                      try {
                        await ordersApi.remove(user.token, o.id);
                        setToast("Order deleted");
                        setTimeout(() => setToast(""), 1500);
                        await loadData();
                      } catch (e) {
                        alert(e.message || "Failed to delete");
                      }
                    }}
                    className="px-3 py-1.5 rounded-md border border-red-900/60 text-red-300 hover:bg-red-900/40 hover:text-red-200"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

function PaymentBadge({ status }) {
  const norm = (status || "").toLowerCase();
  const map = {
    succeeded: "bg-green-100 text-green-800 border-green-200",
    paid: "bg-green-100 text-green-800 border-green-200",
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    failed: "bg-red-100 text-red-800 border-red-200",
  };
  const cls = map[norm] || map.pending;
  const label = norm || "pending";
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs border capitalize ${cls}`}>
      {label}
    </span>
  );
}

  const activeOrders = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status)
  );
  const historyOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  );

  return (
    <main className="bg-transparent min-h-screen">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500">Manage orders, users and support</p>
          </div>
          <div className="flex gap-2">
            <button onClick={refreshAll} disabled={loading} className="btn-refresh">
              <span className="refresh-icon">
                <RefreshCcw className={loading ? "animate-spin" : ""} size={16} />
              </span>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {["orders", "history", "users", "support"].map((k) => {
            const isActive = tab === k;
            const isSupport = k === "support";
              const idleClass =
              supportUnread && isSupport && !isActive
                ? "border-red-600 text-red-700 bg-red-50"
                : "border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400";
            return (
              <button
                key={k}
                onClick={() => {
                  setTab(k);
                  if (k === "support") setSupportUnread(false);
                }}
                className={`px-4 py-2 rounded-md text-sm font-semibold border ${
                  isActive ? "border-red-600 text-red-700 bg-red-50" : idleClass
                }`}
              >
                <span className="inline-flex items-center gap-2">
                  {k.charAt(0).toUpperCase() + k.slice(1)}
                  {supportUnread && isSupport && !isActive && (
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-pulse ring-2 ring-red-200" />
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Orders */}
        {tab === "orders" && (
          <>
            <div className="mb-3 flex items-center gap-2">
              <input
                value={orderQuery}
                onChange={(e) => setOrderQuery(e.target.value)}
                placeholder="Search by ID or reference"
                className="border border-gray-700 bg-gray-900/70 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 text-sm w-full max-w-sm"
              />
              {orderQuery && (
                <button
                  onClick={() => setOrderQuery("")}
                  className="px-3 py-2 rounded-md bg-red-600 text-sm text-white hover:bg-red-700"
                >
                  Clear
                </button>
              )}
            </div>
            {activeOrders.length === 0 && !loading ? (
              <p className="text-gray-500 text-center">No active orders found.</p>
            ) : (
              <OrdersTable rows={activeOrders} />
            )}
          </>
        )}

        {/* History */}
        {tab === "history" && (
          <>
            <div className="mb-3 flex items-center gap-2">
              <input
                value={historyQuery}
                onChange={(e) => setHistoryQuery(e.target.value)}
                placeholder="Search by ID or reference"
                className="border border-gray-700 bg-gray-900/70 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2 text-sm w-full max-w-sm"
              />
              {historyQuery && (
                <button
                  onClick={() => setHistoryQuery("")}
                  className="px-3 py-2 rounded-md bg-red-600 text-sm text-white hover:bg-red-700"
                >
                  Clear
                </button>
              )}
            </div>
            {historyOrders.length === 0 && !loading ? (
              <p className="text-gray-500 text-center">No history yet.</p>
            ) : (
              <HistoryTable rows={historyOrders} />
            )}
          </>
        )}

        {/* Toast */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-gray-900 border border-yellow-400 text-yellow-200 px-4 py-2 rounded-lg shadow-lg">
            {toast}
          </div>
        )}

        <audio ref={audioRef} src="data:audio/mp3;base64,//uQZ..." preload="auto" className="hidden" />
      </section>

      {/* Users tab */}
      {tab === "users" && (
        <section className="max-w-7xl mx-auto px-6 pb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-3">Create User (Driver or Operator)</h2>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              <input
                className="border border-gray-700 bg-gray-900/70 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2"
                placeholder="Name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              <input
                className="border border-gray-700 bg-gray-900/70 text-gray-100 placeholder-gray-500 rounded-md px-3 py-2"
                placeholder="Email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              <select
                className="border border-gray-700 bg-gray-900/70 text-gray-100 rounded-md px-3 py-2"
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="driver">Driver</option>
                <option value="operator">Operator</option>
              </select>
              <div className="text-sm text-gray-500 md:col-span-1 md:self-center">
                Temporary password will be emailed.
              </div>
              <button
                onClick={async () => {
                  setNewUserError("");
                  setNewUserOk("");
                  try {
                    const res = await usersApi.create(user.token, newUser);
                    const msg = res?.tempPassword
                      ? `${newUser.role} created (temp password: ${res.tempPassword})`
                      : `${newUser.role} created`;
                    setNewUserOk(msg);
                    setNewUser({ name: "", email: "", role: "driver" });
                  } catch (e) {
                    setNewUserError(e.message || "Failed");
                  }
                }}
                className="rounded-md bg-red-600 text-white font-semibold px-4 py-2 hover:bg-red-700"
              >
                Create
              </button>
            </div>
            {newUserError && <div className="text-red-600 text-sm mt-2">{newUserError}</div>}
            {newUserOk && <div className="text-emerald-700 text-sm mt-2">{newUserOk}</div>}
          </div>

          {/* Users Table */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 mt-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold">Users</h2>
              <select
                className="border border-gray-700 bg-gray-900/70 text-gray-100 rounded px-2 py-1"
                value={usersFilter}
                onChange={(e) => setUsersFilter(e.target.value)}
              >
                <option value="driver">Drivers</option>
                <option value="operator">Operators</option>
              </select>
            </div>
            {opsLoading ? (
              <p className="text-sm text-gray-500">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2">ID</th>
                      <th className="py-2">Name</th>
                      <th className="py-2">Email</th>
                      <th className="py-2">Role</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ops.map((o) => (
                      <tr key={o.id} className="border-t border-gray-200">
                        <td className="py-2">{o.id}</td>
                        <td className="py-2">{o.name}</td>
                        <td className="py-2">{o.email}</td>
                        <td className="py-2">{o.role}</td>
                        <td className="py-2 flex gap-2">
                          <input
                            placeholder="New password"
                            value={resetPw}
                            onChange={(e) => setResetPw(e.target.value)}
                            className="border border-gray-700 bg-gray-900/70 text-gray-100 placeholder-gray-500 rounded-md px-2 py-1"
                          />
                          <button
                            onClick={async () => {
                              if (!resetPw) return;
                              if (!window.confirm(`Reset password for user #${o.id}?`)) return;
                              try {
                                await usersApi.resetPassword(user.token, o.id, resetPw);
                                setResetPw("");
                                setToast("Password updated");
                                setTimeout(() => setToast(""), 1500);
                              } catch (e) {
                                alert(e.message);
                              }
                            }}
                            className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700"
                          >
                            Reset
                          </button>
                          <button
                            onClick={async () => {
                              if (!window.confirm(`Delete user #${o.id}?`)) return;
                              try {
                                await usersApi.remove(user.token, o.id);
                                setOps(ops.filter((x) => x.id !== o.id));
                                setToast("User deleted");
                                setTimeout(() => setToast(""), 1500);
                              } catch (e) {
                                alert(e.message);
                              }
                            }}
                            className="px-3 py-1.5 rounded-md border border-red-900/60 text-red-300 hover:bg-red-900/40 hover:text-red-200"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Support tab */}
      {tab === "support" && (
        <section className="max-w-7xl mx-auto px-6 pb-12 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Support Inbox</h2>
              <p className="text-sm text-gray-600">
                Live socket inbox that connects you with clients and drivers coming from the contact
                page chat entry.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  socketRef.current?.emit("help:list", (items) => setConversations(items || []))
                }
                className="btn-refresh"
              >
                <span className="refresh-icon">
                  <RefreshCcw size={16} />
                </span>
                Refresh
              </button>
              <button
                onClick={() => {
                  if (
                    !notify &&
                    "Notification" in window &&
                    Notification.permission !== "granted"
                  ) {
                    Notification.requestPermission().finally(() => setNotify((v) => !v));
                  } else setNotify((v) => !v);
                }}
                className={`btn-outline ${notify ? "border-primary text-primary" : ""}`}
              >
                {notify ? "Mute" : "Notify"}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-[280px,1fr] gap-4">
            <aside className="bg-white/5 border border-white/10 rounded-xl p-3 max-h-[420px] overflow-y-auto">
              <h3 className="font-semibold text-gray-900 mb-3">Conversations</h3>
              {conversations.length === 0 && (
                <p className="text-sm text-gray-500">
                  Waiting for new chats. Customers and drivers will appear here instantly.
                </p>
              )}
              <ul className="space-y-2">
                {conversations.map((c) => (
                  <li key={c.id} className="flex gap-2">
                    <button
                      onClick={() => openConversation(c.id)}
                      className={`flex-1 text-left px-3 py-2 rounded-lg border transition ${
                        selected === c.id
                          ? "border-gray-900 bg-gray-100 text-gray-900"
                          : "border-gray-200 text-gray-900 hover:border-gray-400"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold truncate">{c.userName || "User"}</div>
                        <span className="text-[11px] text-gray-500">#{c.id}</span>
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <MessageCircle size={12} />
                        {c.userRole || c.role || "client/driver"}
                      </div>
                      {c.lastMessageSnippet && (
                        <div className="text-xs text-gray-600 mt-1 truncate">{c.lastMessageSnippet}</div>
                      )}
                    </button>
                    <button
                      onClick={() => deleteConversation(c.id)}
                      className="px-2 py-2 rounded-lg border border-gray-200 text-xs text-gray-600 hover:border-gray-500 hover:text-gray-900"
                      title="Delete conversation"
                    >
                      Delete
                    </button>
                  </li>
                ))}
              </ul>
            </aside>

            <div className="bg-white/5 border border-white/10 rounded-xl flex flex-col min-h-[420px]">
              <div className="p-3 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">
                    {selected ? `Conversation #${selected}` : "Select a conversation"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Replies are delivered live to the user via sockets.
                  </div>
                </div>
                <div className="text-[11px] text-gray-600">
                  Sound alerts {notify ? "on" : "off"}
                </div>
              </div>
              <div className="flex-1 h-[260px] overflow-y-auto p-3 space-y-2 bg-gradient-to-b from-white/5 to-white/0 rounded-b-xl">
                {!selected && (
                  <p className="text-sm text-gray-500">
                    Choose a conversation from the left to view history and reply.
                  </p>
                )}
                {selected &&
                  history.map((m, idx) => {
                    const staffSide = m.from && m.from !== "client";
                    return (
                      <div
                        key={idx}
                        className={`max-w-[85%] text-sm px-3 py-2 rounded-2xl shadow-sm ${
                          staffSide
                            ? "bg-white border border-gray-200 text-gray-900"
                            : "bg-gray-100 border border-gray-200 text-gray-900 ml-auto"
                        }`}
                      >
                        {m.text}
                      </div>
                    );
                  })}
              </div>
              <form
                onSubmit={sendReply}
                className="p-3 flex items-center gap-2 border-t border-gray-200"
              >
                <input
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                  placeholder={selected ? "Type reply..." : "Select a conversation to start typing"}
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  disabled={!selected}
                />
                <button
                  className="p-2 rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50"
                  disabled={!selected || !reply}
                >
                  <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
