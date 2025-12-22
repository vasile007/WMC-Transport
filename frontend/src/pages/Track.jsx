import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { connectSocket } from '../services/socket.js';
import { orders as ordersApi } from '../services/orders.js';
import { useAuth } from '../services/authContext.jsx';

function loadGoogleMaps(apiKey) {
  return new Promise((resolve, reject) => {
    if (window.google && window.google.maps) return resolve(window.google.maps);
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.onload = () => resolve(window.google.maps);
    script.onerror = reject;
    document.body.appendChild(script);
  });
}

export default function Track() {
  const { orderId } = useParams();
  const { token } = useAuth();
  const [last, setLast] = useState(null);
  const [order, setOrder] = useState(null);
  const [eta, setEta] = useState(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const pickupMarkerRef = useRef(null);
  const dropoffMarkerRef = useRef(null);
  const dirRendererRef = useRef(null);
  const dirServiceRef = useRef(null);
  const socketRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => {
    async function loadOrder() {
      try {
        const all = await ordersApi.list(token);
        const found = (all || []).find(o => String(o.id) === String(orderId));
        setOrder(found || null);
        if (found?.status === 'cancelled' && socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      } catch {}
    }

    loadOrder();
    pollRef.current = setInterval(loadOrder, 10000);

    socketRef.current = connectSocket();
    socketRef.current.emit('tracking:subscribe', { orderId: Number(orderId) });
    socketRef.current.on('location', (payload) => {
      if (String(payload.orderId) === String(orderId)) setLast(payload);
    });

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      socketRef.current?.disconnect();
    };
  }, [orderId, token]);

  useEffect(() => {
    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_KEY;
    if (!key || order?.status === 'cancelled') return;
    loadGoogleMaps(key)
      .then((maps) => {
        if (!mapRef.current) {
          mapRef.current = new maps.Map(document.getElementById('map'), {
            center: { lat: 0, lng: 0 },
            zoom: 12,
          });
        }
        if (!dirServiceRef.current) dirServiceRef.current = new maps.DirectionsService();
        if (!dirRendererRef.current) {
          dirRendererRef.current = new maps.DirectionsRenderer({
            suppressMarkers: true,
            polylineOptions: { strokeColor: '#dc2626', strokeWeight: 4 },
          });
          dirRendererRef.current.setMap(mapRef.current);
        }

        const bounds = new maps.LatLngBounds();
        const geocoder = new maps.Geocoder();
        const fitBounds = () => mapRef.current.fitBounds(bounds);

        if (order?.pickupAddress) {
          geocoder.geocode({ address: order.pickupAddress }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const pos = results[0].geometry.location;
              if (!pickupMarkerRef.current) pickupMarkerRef.current = new maps.Marker({ map: mapRef.current, label: 'P' });
              pickupMarkerRef.current.setPosition(pos);
              bounds.extend(pos);
              fitBounds();
            }
          });
        }
        if (order?.dropoffAddress) {
          geocoder.geocode({ address: order.dropoffAddress }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const pos = results[0].geometry.location;
              if (!dropoffMarkerRef.current) dropoffMarkerRef.current = new maps.Marker({ map: mapRef.current, label: 'D' });
              dropoffMarkerRef.current.setPosition(pos);
              bounds.extend(pos);
              fitBounds();
            }
          });
        }

        if (order?.pickupAddress && order?.dropoffAddress) {
          try {
            dirServiceRef.current.route(
              { origin: order.pickupAddress, destination: order.dropoffAddress, travelMode: maps.TravelMode.DRIVING },
              (result, status) => {
                if (status === 'OK' && result) dirRendererRef.current.setDirections(result);
              }
            );
          } catch {}
        }

        if (last) {
          const pos = { lat: last.lat, lng: last.lng };
          if (!markerRef.current)
            markerRef.current = new maps.Marker({ position: pos, map: mapRef.current, label: 'DR' });
          markerRef.current.setPosition(pos);
          bounds.extend(pos);
          fitBounds();
        }

        if (last && order?.dropoffAddress) {
          geocoder.geocode({ address: order.dropoffAddress }, (results, status) => {
            if (status === 'OK' && results[0]) {
              const dest = results[0].geometry.location;
              const dlat = (dest.lat() - last.lat) * Math.PI/180;
              const dlng = (dest.lng() - last.lng) * Math.PI/180;
              const a = Math.sin(dlat/2)**2 + Math.cos(last.lat*Math.PI/180) * Math.cos(dest.lat()*Math.PI/180) * Math.sin(dlng/2)**2;
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
              const km = 6371 * c;
              const avgKmh = 40;
              const minutes = Math.round((km/avgKmh)*60);
              setEta({ km: Number(km.toFixed(1)), minutes });
            }
          });
        }
      })
      .catch(() => {});
  }, [last, order]);

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F3EE]">
      <div className="sticky top-0 z-10 bg-white/10 backdrop-blur border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 h-12 flex items-center justify-between">
          <Link to="/client-dashboard" className="text-[#D4AF37] hover:text-[#B98B2D] font-medium">Back to Dashboard</Link>
          <div className="text-sm text-[#B9B3A8]">
            {order?.referenceNumber ? `Ref ${order.referenceNumber}` : `Order #${orderId}`}
          </div>
        </div>
      </div>
      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">
        <h1 className="text-2xl font-bold text-[#F5F3EE]">Tracking Order #{orderId}</h1>
        {order?.referenceNumber && (
          <div className="text-sm text-[#B9B3A8]">Reference: {order.referenceNumber}</div>
        )}
        {order?.status === 'cancelled' && (
          <div className="bg-red-50 border border-red-200 text-[#B98B2D] px-4 py-3 rounded-md">
            This delivery was cancelled. If payment was completed, the refund will be processed within 3 business days.
          </div>
        )}
        {order?.status !== 'cancelled' && (
          <>
            {last ? (
              <div className="text-sm text-[#E3DED5]">
                Driver #{last.driverId} @ lat:{last.lat.toFixed(5)} | lng:{last.lng.toFixed(5)}
                {eta && (
                  <span className="ml-3 text-[#F5F3EE] font-medium">~{eta.km} km left - {eta.minutes} min ETA</span>
                )}
              </div>
            ) : (
              <div className="text-sm text-[#B9B3A8]">Driver location not shared yet. Showing route between pickup and dropoff.</div>
            )}
            <div id="map" className="w-full h-[420px] bg-white/5 border border-white/10 rounded-xl" />
          </>
        )}
        {order?.status === 'cancelled' && (
          <p className="text-sm text-[#B9B3A8]">Tracking is disabled for cancelled orders.</p>
        )}
      </div>
    </div>
  );
}



