import { useEffect, useRef, useState } from "react";
import { RefreshCcw, Phone, MessageSquare, MessageCircle, Navigation, Clock } from "lucide-react";
import { useAuth } from "../services/authContext.jsx";
import { orders as ordersApi } from "../services/orders.js";
import AccountSettings from "../components/AccountSettings.jsx";
import { connectSocket } from "../services/socket.js";

export default function DriverDashboard() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);
  const [toast, setToast] = useState("");
  const [sharing, setSharing] = useState(false);
  const [lastPos, setLastPos] = useState(null);
  const [etaPickup, setEtaPickup] = useState(null);
  const [etaDropoff, setEtaDropoff] = useState(null);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const watchIdRef = useRef(null);
  const socketRef = useRef(null);
  const mapRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const meMarkerRef = useRef(null);
  const dirRendererRef = useRef(null);
  const dirServiceRef = useRef(null);
  const autoShareRef = useRef("");

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const t = token || user?.token;
      if (!t) throw new Error("No token");
      const all = await ordersApi.list(t);
      setOrders(all.filter((o) => o.driverId === user?.id));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status, msg) {
    setUpdating(id);
    try {
      await ordersApi.update(token, id, { status });
      await loadOrders();
      if (["picked_up", "in_transit"].includes(status) && !sharing) {
        startSharing(id);
      }
      setToast(msg);
      setTimeout(() => setToast(""), 2000);
    } catch (e) {
      setError(e.message);
    } finally {
      setUpdating(null);
    }
  }

  useEffect(() => {
    if (user && (token || user?.token)) loadOrders();
  }, [user, token]);

  useEffect(() => {
    socketRef.current = connectSocket();
    const timer = setInterval(() => { if (user && (token || user?.token)) loadOrders(); }, 10000);
    return () => {
      clearInterval(timer);
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      socketRef.current?.disconnect();
    };
  }, [user, token]);

  useEffect(() => {
    const active = orders.find((o) => ["picked_up", "in_transit"].includes(o.status));
    if (!active || sharing) return;
    const key = `${active.id}:${active.status}`;
    if (autoShareRef.current === key) return;
    autoShareRef.current = key;
    startSharing(active.id);
  }, [orders, sharing]);

  function loadGoogleMaps(apiKey) {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.maps) return resolve(window.google.maps);
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = () => resolve(window.google.maps);
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  function startSharing(orderId) {
    if (watchIdRef.current) return;
    if (!navigator.geolocation) {
      setToast("Geolocation not supported");
      setTimeout(() => setToast(""), 1500);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLastPos({ lat: latitude, lng: longitude });
        socketRef.current?.emit("location:update", { orderId, driverId: user?.id, lat: latitude, lng: longitude });
      },
      () => {}
    );
    const id = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setLastPos({ lat: latitude, lng: longitude });
        socketRef.current?.emit("location:update", { orderId, driverId: user?.id, lat: latitude, lng: longitude });
      },
      () => {
        setToast("Location access denied");
        setTimeout(() => setToast(""), 1500);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    watchIdRef.current = id;
    setSharing(true);
  }

  function toggleSharing() {
    if (sharing) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setSharing(false);
      return;
    }
    const active = orders.find((o) => ["assigned", "picked_up", "in_transit", "pending"].includes(o.status));
    if (!active) {
      setToast("No active order to share location");
      setTimeout(() => setToast(""), 1500);
      return;
    }
    startSharing(active.id);
  }

  useEffect(() => {
    const active = orders.find((o) => ["pending", "assigned", "picked_up", "in_transit"].includes(o.status));
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!active || !key) return;
    loadGoogleMaps(key)
      .then((maps) => {
        if (!mapRef.current) {
          mapRef.current = new maps.Map(document.getElementById("driver-wide-map"), { center: { lat: 51.5, lng: -0.12 }, zoom: 10 });
        }
        if (!dirServiceRef.current) dirServiceRef.current = new maps.DirectionsService();
        if (!dirRendererRef.current) {
          dirRendererRef.current = new maps.DirectionsRenderer({ suppressMarkers: true });
          dirRendererRef.current.setMap(mapRef.current);
        }
        const geocoder = new maps.Geocoder();
        const bounds = new maps.LatLngBounds();
        if (active.pickupAddress) {
          geocoder.geocode({ address: active.pickupAddress }, (results, status) => {
            if (status === "OK" && results[0]) {
              const pos = results[0].geometry.location;
              if (!pickupMarkerRef.current) pickupMarkerRef.current = new maps.Marker({ map: mapRef.current, label: "P" });
              pickupMarkerRef.current.setPosition(pos);
              bounds.extend(pos);
              mapRef.current.fitBounds(bounds);
            }
          });
        }
        if (active.dropoffAddress) {
          geocoder.geocode({ address: active.dropoffAddress }, (results, status) => {
            if (status === "OK" && results[0]) {
              const pos = results[0].geometry.location;
              if (!dropoffMarkerRef.current) dropoffMarkerRef.current = new maps.Marker({ map: mapRef.current, label: "D" });
              dropoffMarkerRef.current.setPosition(pos);
              bounds.extend(pos);
              mapRef.current.fitBounds(bounds);
            }
          });
        }
        if (lastPos) {
          const me = new maps.LatLng(lastPos.lat, lastPos.lng);
          if (!meMarkerRef.current) meMarkerRef.current = new maps.Marker({ map: mapRef.current, label: "Me" });
          meMarkerRef.current.setPosition(me);
          bounds.extend(me);
          mapRef.current.fitBounds(bounds);

          try {
            const matrix = new maps.DistanceMatrixService();
            if (active.pickupAddress) {
              matrix.getDistanceMatrix(
                { origins: [me], destinations: [active.pickupAddress], travelMode: maps.TravelMode.DRIVING },
                (res, status) => {
                  if (status === "OK") {
                    const el = res.rows?.[0]?.elements?.[0];
                    setEtaPickup(el && el.duration ? el.duration.text : null);
                  }
                }
              );
            }
            if (active.dropoffAddress) {
              matrix.getDistanceMatrix(
                { origins: [me], destinations: [active.dropoffAddress], travelMode: maps.TravelMode.DRIVING },
                (res, status) => {
                  if (status === "OK") {
                    const el = res.rows?.[0]?.elements?.[0];
                    setEtaDropoff(el && el.duration ? el.duration.text : null);
                  }
                }
              );
            }
          } catch {}
        }

        if (active.pickupAddress && active.dropoffAddress) {
          try {
            dirServiceRef.current.route(
              { origin: active.pickupAddress, destination: active.dropoffAddress, travelMode: maps.TravelMode.DRIVING },
              (result, status) => {
                if (status === "OK" && result) dirRendererRef.current.setDirections(result);
              }
            );
          } catch {}
        }
      })
      .catch(() => {});
  }, [orders, lastPos]);

  function navLinks(address) {
    const enc = encodeURIComponent(address || "");
    return {
      google: `https://www.google.com/maps/dir/?api=1&destination=${enc}`,
      apple: `https://maps.apple.com/?daddr=${enc}`,
    };
  }

  const getBadge = (status) => {
    const base = "px-3 py-1 rounded-full text-xs font-semibold capitalize";
    const map = {
      pending: "bg-yellow-500/20 text-yellow-500",
      assigned: "bg-cyan-500/20 text-cyan-500",
      picked_up: "bg-orange-500/20 text-orange-500",
      in_transit: "bg-blue-500/20 text-blue-500",
      delivered: "bg-green-500/20 text-green-500",
    };
    return `${base} ${map[status] || "bg-gray-700 text-gray-300"}`;
  };

  const activeOrders = orders.filter((o) =>
    ["pending", "assigned", "picked_up", "in_transit"].includes(o.status)
  );
  const historyOrders = orders.filter((o) =>
    ["delivered", "cancelled"].includes(o.status)
  );
  const activeOrder = activeOrders[0];
  const counts = {
    pending: activeOrders.filter((o) => o.status === "pending").length,
    assigned: activeOrders.filter((o) => o.status === "assigned").length,
    inTransit: activeOrders.filter((o) => o.status === "in_transit").length,
    delivered: historyOrders.filter((o) => o.status === "delivered").length,
  };

  const nextStep = (o) => {
    if (!o) return null;
    if (o.status === "pending") return { status: "assigned", label: "Accept job", tone: "bg-green-600 text-white" };
    if (o.status === "assigned") return { status: "picked_up", label: "Mark picked up", tone: "bg-yellow-400 text-gray-900" };
    if (o.status === "picked_up") return { status: "in_transit", label: "Start transit", tone: "bg-blue-600 text-white" };
    if (o.status === "in_transit") return { status: "delivered", label: "Mark delivered", tone: "bg-green-700 text-white" };
    return null;
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-gray-200 pb-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
            <p className="text-sm text-gray-600">Your assigned deliveries</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button onClick={toggleSharing} className={`px-4 py-2 rounded-md text-sm font-semibold ${sharing ? "bg-green-600 text-white" : "bg-gray-900 text-white"} hover:opacity-90`}>
              {sharing ? "Sharing location" : "Share location"}
            </button>
            <button onClick={loadOrders} disabled={loading} className="btn-refresh">
              <span className="refresh-icon">
                <RefreshCcw className={loading ? "animate-spin" : ""} size={16} />
              </span>
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard label="Pending" value={counts.pending} tone="text-yellow-700 bg-yellow-50 border-yellow-100" />
          <StatCard label="Assigned" value={counts.assigned} tone="text-cyan-700 bg-cyan-50 border-cyan-100" />
          <StatCard label="In transit" value={counts.inTransit} tone="text-blue-700 bg-blue-50 border-blue-100" />
          <StatCard label="Delivered" value={counts.delivered} tone="text-green-700 bg-green-50 border-green-100" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">{error}</div>}

            {!activeOrder && <p className="text-center text-gray-500 mt-6">No active deliveries yet.</p>}

            {activeOrder && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="text-xs uppercase text-gray-500">Active delivery</div>
                    <div className="text-lg font-semibold text-gray-900">#{activeOrder.id}</div>
                    <div className="text-xs text-gray-500">
                      Ref: {activeOrder.referenceNumber || "-"}
                    </div>
                    <div className="mt-1 inline-block">
                      <span className={getBadge(activeOrder.status)}>{activeOrder.status}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <div>
                      Payment: <span className="font-semibold text-gray-900">{String(activeOrder.paymentStatus || "-")}</span>
                    </div>
                    <div>Updated: {activeOrder.updatedAt ? new Date(activeOrder.updatedAt).toLocaleString() : "—"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <div className="text-sm text-gray-800">
                      <b>Pickup:</b> {activeOrder.pickupAddress}
                      {activeOrder.pickupAddress && (
                        <span className="ml-2 inline-flex items-center gap-2 text-xs">
                          <a className="text-red-700 hover:underline" href={navLinks(activeOrder.pickupAddress).google} target="_blank" rel="noreferrer" title="Navigate in Google Maps">
                            <Navigation size={14} /> Google
                          </a>
                          <a className="text-gray-700 hover:underline" href={navLinks(activeOrder.pickupAddress).apple} target="_blank" rel="noreferrer" title="Navigate in Apple Maps">
                            Apple
                          </a>
                          {etaPickup && <span className="text-gray-500">ETA {etaPickup}</span>}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-800">
                      <b>Dropoff:</b> {activeOrder.dropoffAddress}
                      {activeOrder.dropoffAddress && (
                        <span className="ml-2 inline-flex items-center gap-2 text-xs">
                          <a className="text-red-700 hover:underline" href={navLinks(activeOrder.dropoffAddress).google} target="_blank" rel="noreferrer" title="Navigate in Google Maps">
                            <Navigation size={14} /> Google
                          </a>
                          <a className="text-gray-700 hover:underline" href={navLinks(activeOrder.dropoffAddress).apple} target="_blank" rel="noreferrer" title="Navigate in Apple Maps">
                            Apple
                          </a>
                          {etaDropoff && <span className="text-gray-500">ETA {etaDropoff}</span>}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    {activeOrder.client && (
                      <div className="text-sm text-gray-800 flex items-center gap-2 flex-wrap">
                        <b>Client:</b>
                        <span>{activeOrder.client.name || "Client"}</span>
                        {activeOrder.client.phone && (
                          <>
                            <a className="inline-flex items-center gap-1 text-red-700 hover:underline" href={`tel:${activeOrder.client.phone}`} title="Call client">
                              <Phone size={14} /> {activeOrder.client.phone}
                            </a>
                            <a className="inline-flex items-center gap-1 text-gray-800 hover:underline" href={`sms:${activeOrder.client.phone}`} title="Send SMS">
                              <MessageSquare size={14} /> SMS
                            </a>
                            <a className="inline-flex items-center gap-1 text-gray-800 hover:underline" href={`https://wa.me/${activeOrder.client.phone.replace(/\\D/g, "")}`} target="_blank" rel="noreferrer" title="WhatsApp">
                              <MessageCircle size={14} /> WhatsApp
                            </a>
                          </>
                        )}
                      </div>
                    )}
                    {activeOrder.description && <div className="text-sm text-gray-800"><b>Notes:</b> {activeOrder.description}</div>}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4 text-sm text-gray-700">
                  <div>
                    {activeOrder.status === "pending" && "Next: Accept the delivery so the client sees it in progress."}
                    {activeOrder.status === "assigned" && "Next: Head to pickup and mark as picked up."}
                    {activeOrder.status === "picked_up" && "Next: Head to dropoff and start transit."}
                    {activeOrder.status === "in_transit" && "Next: Deliver and mark as delivered."}
                    {activeOrder.status === "delivered" && "Completed."}
                  </div>
                  {etaDropoff && (
                    <div className="inline-flex items-center gap-1 text-gray-500">
                      <Clock size={14} /> ETA {etaDropoff}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 flex-wrap">
                  {(() => {
                    const step = nextStep(activeOrder);
                    if (!step) return null;
                    return (
                      <button
                        disabled={updating === activeOrder.id}
                        onClick={() => updateStatus(activeOrder.id, step.status, step.label)}
                        className={`px-4 py-2 rounded-md font-semibold text-sm ${step.tone}`}
                      >
                        {updating === activeOrder.id ? "Updating…" : step.label}
                      </button>
                    );
                  })()}
                  {activeOrder.status === "pending" && (
                    <button
                      onClick={async () => {
                        try {
                          await ordersApi.update(token, activeOrder.id, { status: "cancelled" });
                          setToast("Delivery declined");
                          setTimeout(() => setToast(""), 1500);
                          await loadOrders();
                        } catch (e) {
                          setToast(e.message || "Unable to decline");
                          setTimeout(() => setToast(""), 1500);
                        }
                      }}
                      className="px-4 py-2 rounded-md border border-gray-300 text-gray-800 font-semibold text-sm hover:border-red-600 hover:text-red-700"
                    >
                      Decline
                    </button>
                  )}
                </div>
              </div>
            )}

            {activeOrders.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">My queue</div>
                  <span className="text-xs text-gray-500">Tap to update status</span>
                </div>
                <ul className="divide-y divide-gray-200">
                  {activeOrders.map((o) => {
                    const step = nextStep(o);
                    return (
                      <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            #{o.id} <span className={getBadge(o.status)}>{o.status}</span>
                          </div>
                          <div className="text-xs text-gray-600">Ref: {o.referenceNumber || "-"}</div>
                          <div className="text-xs text-gray-600 truncate max-w-[48ch]">{o.pickupAddress} → {o.dropoffAddress}</div>
                        </div>
                        {step && (
                          <button
                            disabled={updating === o.id}
                            onClick={() => updateStatus(o.id, step.status, step.label)}
                            className={`px-3 py-1.5 rounded-md text-xs font-semibold ${step.tone}`}
                          >
                            {updating === o.id ? "..." : step.label}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {historyOrders.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-gray-900">History</div>
                  <span className="text-xs text-gray-500">Delivered and cancelled orders</span>
                </div>
                <ul className="divide-y divide-gray-200">
                  {historyOrders.map((o) => (
                    <li key={o.id} className="py-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                          #{o.id} <span className={getBadge(o.status)}>{o.status}</span>
                        </div>
                        <div className="text-xs text-gray-600">Ref: {o.referenceNumber || "-"}</div>
                        <div className="text-xs text-gray-600 truncate max-w-[48ch]">
                          {o.pickupAddress} → {o.dropoffAddress}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {o.updatedAt ? new Date(o.updatedAt).toLocaleString() : "-"}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4 lg:sticky lg:top-20 self-start">
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="h-56 bg-gray-100" id="driver-wide-map">
                {!activeOrder && <div className="h-full flex items-center justify-center text-sm text-gray-500">No active route yet</div>}
              </div>
              <div className="p-4 text-sm text-gray-700 flex items-center justify-between">
                <div>Route preview</div>
                {activeOrder?.dropoffAddress && (
                  <a className="text-red-700 hover:underline text-xs" href={navLinks(activeOrder.dropoffAddress).google} target="_blank" rel="noreferrer">
                    Open in Maps
                  </a>
                )}
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
                    {(user?.name || "D").slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-base font-semibold text-gray-900">{user?.name || "Driver"}</div>
                    <div className="text-xs text-gray-500">Driver profile</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileEdit((v) => !v)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:border-red-600 hover:text-red-700"
                >
                  {showProfileEdit ? "Close edit" : "Edit details"}
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Email</span>
                  <span className="text-gray-900 truncate">{user?.email || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Phone</span>
                  <span className="text-gray-900">{user?.phone || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Address</span>
                  <span className="text-gray-900 truncate">{user?.addressLine1 || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">City</span>
                  <span className="text-gray-900">{user?.city || "Not set"}</span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-gray-500">Postcode</span>
                  <span className="text-gray-900">{user?.postcode || "Not set"}</span>
                </div>
              </div>
            </div>
            {showProfileEdit && (
              <div className="space-y-3">
                <div className="px-1">
                  <div className="text-sm font-semibold text-gray-900">Edit profile</div>
                  <div className="text-xs text-gray-500">Update contact, email, and password</div>
                </div>
                <AccountSettings compact />
              </div>
            )}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm text-center">
              <div className="text-xs uppercase text-gray-500 mb-2">Support</div>
              <a
                href="tel:+447555123456"
                className="inline-flex items-center justify-center gap-2 text-2xl font-bold text-gray-900 hover:text-red-700"
                title="Call support"
              >
                <Phone size={20} /> +44 7555 123 456
              </a>
              <div className="text-xs text-gray-500 mt-1">7 days a week</div>
            </div>
          </div>
        </div>

        {sharing && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50 text-green-800 px-4 py-2 flex items-center justify-between">
            <div className="text-sm">Sharing location with dispatch and customer.</div>
            <button onClick={toggleSharing} className="text-sm px-3 py-1 rounded-md border border-green-300 hover:bg-green-100">
              Stop
            </button>
          </div>
        )}

        {toast && <div className="fixed bottom-6 right-6 bg-gray-900 border border-yellow-400 text-yellow-200 px-4 py-2 rounded-lg shadow-lg">{toast}</div>}
      </section>
    </main>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div className={`rounded-xl border px-4 py-3 shadow-sm ${tone}`}>
      <div className="text-xs uppercase">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
