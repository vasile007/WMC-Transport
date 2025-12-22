import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
import { useAuth } from "../services/authContext.jsx";
import { orders as ordersApi } from "../services/orders.js";

const MAP_LIBRARIES = ["places"];
const SIZE_PRICING = {
  letter: { multiplier: 0.6, label: "Letter (light)" },
  small: { multiplier: 0.9, label: "Small parcel" },
  medium: { multiplier: 1.1, label: "Medium box" },
  large: { multiplier: 1.4, label: "Large box" },
};

export default function ClientOrderNew() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const pickupAuto = useRef(null);
  const dropoffAuto = useRef(null);

  const [pickupAddress, setPickupAddress] = useState("");
  const [dropoffAddress, setDropoffAddress] = useState("");
  const [pickupCoord, setPickupCoord] = useState(null);
  const [dropoffCoord, setDropoffCoord] = useState(null);

  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");
  const [packageSize, setPackageSize] = useState("small");
  const [scheduledAt, setScheduledAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function haversineMeters(a, b) {
    const toRad = (deg) => deg * (Math.PI / 180);
    const R = 6371000;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const lat1 = toRad(a.lat);
    const lat2 = toRad(b.lat);
    const h =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  }

  function recalcPrice(a, b, sizeKey = packageSize) {
    const meters = haversineMeters(a, b);
    const miles = meters / 1609.34;
    const baseFee = 4.5;
    const perMile = 1.5;
    const factor = SIZE_PRICING[sizeKey]?.multiplier || 1;
    const calculated = Math.max((baseFee + miles * perMile) * factor, baseFee * factor);
    setPrice(calculated.toFixed(2));
    return meters;
  }

  const onPickupChanged = () => {
    const place = pickupAuto.current.getPlace();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setPickupAddress(place.formatted_address);
    setPickupCoord({ lat, lng });

    if (dropoffCoord) recalcPrice({ lat, lng }, dropoffCoord);
  };

  const onDropoffChanged = () => {
    const place = dropoffAuto.current.getPlace();
    if (!place?.geometry) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setDropoffAddress(place.formatted_address);
    setDropoffCoord({ lat, lng });

    if (pickupCoord) recalcPrice(pickupCoord, { lat, lng });
  };

  useEffect(() => {
    if (pickupCoord && dropoffCoord) {
      recalcPrice(pickupCoord, dropoffCoord, packageSize);
    }
  }, [packageSize]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!pickupAddress.trim() || !dropoffAddress.trim()) {
      setError("Pickup and dropoff addresses are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        pickupAddress,
        dropoffAddress,
        pickupLat: pickupCoord?.lat ?? null,
        pickupLng: pickupCoord?.lng ?? null,
        dropoffLat: dropoffCoord?.lat ?? null,
        dropoffLng: dropoffCoord?.lng ?? null,
        price: price ? Number(price) : null,
        packageSize,
        description: [
          notes && `Notes: ${notes}`,
          packageSize && `Package: ${packageSize}`,
          scheduledAt && `Scheduled: ${new Date(scheduledAt).toLocaleString()}`
        ].filter(Boolean).join(" | "),
      };

      const created = await ordersApi.create(user?.token, payload);
      navigate(`/pay/${created.id}?new=1`);
    } catch (e) {
      setError(e.message || "Failed to create order");
    } finally {
      setSaving(false);
    }
  }

  return (
    <LoadScript
      googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
      libraries={MAP_LIBRARIES}
    >
      <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100">
        <section className="max-w-xl mx-auto px-6 py-8">
          <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 p-5 mb-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm">
                <ClipboardList size={20} />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-semibold text-gray-100">Create Order</h1>
                <p className="text-sm text-gray-400">Enter pickup and dropoff details</p>
              </div>
              <Link to="/client/orders" className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">
                Back
              </Link>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 shadow-sm">
            <form onSubmit={onSubmit} className="space-y-4">

              <div>
                <label className="block text-sm mb-1 text-gray-300">Pickup address</label>
                <Autocomplete onLoad={(a) => pickupAuto.current = a} onPlaceChanged={onPickupChanged}>
                  <input
                    className="w-full border border-gray-700 bg-gray-900/60 text-gray-100 placeholder-gray-500 p-3 rounded-md"
                    placeholder="Pickup address"
                    value={pickupAddress}
                    onChange={(e) => {
                      setPickupAddress(e.target.value);
                      setPickupCoord(null);
                    }}
                  />
                </Autocomplete>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">Dropoff address</label>
                <Autocomplete onLoad={(a) => dropoffAuto.current = a} onPlaceChanged={onDropoffChanged}>
                  <input
                    className="w-full border border-gray-700 bg-gray-900/60 text-gray-100 placeholder-gray-500 p-3 rounded-md"
                    placeholder="Dropoff address"
                    value={dropoffAddress}
                    onChange={(e) => {
                      setDropoffAddress(e.target.value);
                      setDropoffCoord(null);
                    }}
                  />
                </Autocomplete>
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">Price</label>
                <input readOnly className="w-full border border-gray-700 bg-gray-900/60 text-gray-100 placeholder-gray-500 p-3 rounded-md" value={price} placeholder="Auto" />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">Notes</label>
                <input className="w-full border border-gray-700 bg-gray-900/60 text-gray-100 placeholder-gray-500 p-3 rounded-md" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>

              <div>
                <label className="block text-sm mb-1 text-gray-300">Package size</label>
                <select className="w-full border border-gray-700 bg-gray-900/60 text-gray-100 p-3 rounded-md" value={packageSize} onChange={e => setPackageSize(e.target.value)}>
                  {Object.entries(SIZE_PRICING).map(([key, info]) => (
                    <option key={key} value={key}>{info.label}</option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-gray-400">Price adjusts by package size (larger items cost more).</p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex justify-end gap-2">
                <Link to="/client/orders" className="border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400 px-4 py-2 rounded-md">Cancel</Link>
                <button disabled={saving} className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700">
                  {saving ? "Creating…" : "Create Order"}
                </button>
              </div>

            </form>
          </div>
        </section>
      </main>
    </LoadScript>
  );
}
