import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../services/authContext.jsx";
import { users as usersApi } from "../services/users.js";
import { User as UserIcon, Mail, Phone, MapPin, Shield } from "lucide-react";
import { Autocomplete, useJsApiLoader } from "@react-google-maps/api";

export default function ClientProfile() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address1, setAddress1] = useState(user?.addressLine1 || "");
  const [city, setCity] = useState(user?.city || "");
  const [postcode, setPostcode] = useState(user?.postcode || "");
  const addressRef = useRef(null);
  const cityRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const redirectRef = useRef(null);

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/\D/g, ""));
  };

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
    libraries: ["places"],
  });

  // Show a small map preview for the saved address
  function ensureMap() {
    if (!isLoaded) return null;
    const maps = window.google.maps;
    if (!mapRef.current) {
      mapRef.current = new maps.Map(document.getElementById('profile-map'), {
        center: { lat: 51.509865, lng: -0.118092 },
        zoom: 12,
      });
    }
    return window.google.maps;
  }

  function geocodeAddress() {
    const maps = ensureMap();
    if (!maps || !address1) return;
    const geocoder = new maps.Geocoder();
    geocoder.geocode({ address: address1 }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const loc = results[0].geometry.location;
        mapRef.current.setCenter(loc);
        if (!markerRef.current) markerRef.current = new maps.Marker({ map: mapRef.current });
        markerRef.current.setPosition(loc);
      }
    });
  }

  // Re-render map when address changes
  useEffect(() => {
    if (!isLoaded) return;
    geocodeAddress();
  }, [isLoaded, address1]);

  useEffect(() => {
    return () => {
      if (redirectRef.current) clearTimeout(redirectRef.current);
    };
  }, []);

  function useCurrentAddress() {
    if (!('geolocation' in navigator) || !isLoaded) return;
    const maps = window.google.maps;
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      const geocoder = new maps.Geocoder();
      geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const place = results[0];
          const formatted = place.formatted_address || `${latitude}, ${longitude}`;
          setAddress1(formatted);
          try {
            const comps = place.address_components || [];
            const cityComp = comps.find(c => c.types.includes('locality')) || comps.find(c => c.types.includes('postal_town'));
            const pcComp = comps.find(c => c.types.includes('postal_code'));
            if (cityComp) setCity(cityComp.long_name);
            if (pcComp) setPostcode(pcComp.long_name);
          } catch {}
        }
      });
    });
  }

  async function saveEmail(e) {
    e.preventDefault(); setStatus(""); setError(""); setRedirecting(false);
    try {
      const res = await usersApi.updateEmail(user?.token, { email });
      if (res?.user) updateUser(res.user);
      setStatus("Email updated");
      setRedirecting(true);
      redirectRef.current = setTimeout(() => navigate("/client-dashboard"), 2000);
    } catch (e) {
      setError(e.message||"Failed to update email");
    }
  }
  async function saveProfile(e) {
    e.preventDefault(); setStatus(""); setError(""); setRedirecting(false);
    try {
      const res = await usersApi.updateProfile(user?.token, { phone, addressLine1: address1, city, postcode });
      if (res?.user) updateUser(res.user);
      setStatus("Details saved");
      setRedirecting(true);
      redirectRef.current = setTimeout(() => navigate("/client-dashboard"), 2000);
    } catch (e) {
      setError(e.message||"Failed to save details");
    }
  }
  async function changePassword(e) {
    e.preventDefault(); setStatus(""); setError(""); setRedirecting(false);
    try {
      await usersApi.changePassword(user?.token, { currentPassword, newPassword });
      setStatus("Password changed");
      setCurrentPassword("");
      setNewPassword("");
      setRedirecting(true);
      redirectRef.current = setTimeout(() => navigate("/client-dashboard"), 2000);
    } catch (e) {
      setError(e.message||"Failed to change password");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-black text-gray-100">
      <section className="max-w-3xl mx-auto px-6 py-8">
        <nav className="text-sm text-gray-400 mb-2" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1">
            <li><Link className="hover:text-red-400" to="/client-dashboard">Dashboard</Link></li>
            <li className="text-gray-600">/</li>
            <li className="text-gray-200">My Profile</li>
          </ol>
        </nav>
        {/* Hero header with avatar and accent */}
        <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-900/70 p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-sm text-lg font-semibold">
              {(user?.name || 'U').slice(0,1).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-100">My Profile</h1>
              <p className="text-sm text-gray-400">Hello, <span className="font-medium text-gray-100">{user?.name || 'Client'}</span>. Keep your details up to date.</p>
            </div>
            <Link to="/client-dashboard" className="text-sm px-3 py-1.5 rounded-md border border-gray-700 text-gray-200 hover:border-red-500 hover:text-red-400">Back to Dashboard</Link>
          </div>
          <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-red-900/40" />
        </div>

        <div className="space-y-6">
          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Mail className="text-red-400" size={18} />
              <h3 className="text-lg font-semibold text-gray-100">Profile (Email)</h3>
            </div>
            <form onSubmit={saveEmail} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Full name</label>
                <input disabled value={user?.name || ''} className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-400" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Email address</label>
                <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-100" />
              </div>
              <button disabled={redirecting} className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">Save</button>
            </form>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="text-red-400" size={18} />
              <h3 className="text-lg font-semibold text-gray-100">Contact & Address</h3>
            </div>
            <form onSubmit={saveProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Phone</label>
                <input
                  value={phone}
                  onChange={handlePhoneChange}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Postcode</label>
                <input value={postcode} onChange={(e)=>setPostcode(e.target.value)} className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-100" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-300 mb-1">Address</label>
                {isLoaded ? (
                  <Autocomplete onLoad={(ref)=> (addressRef.current = ref)} onPlaceChanged={() => {
                    const place = addressRef.current?.getPlace();
                    const formatted = place?.formatted_address || "";
                    setAddress1(formatted);
                    try {
                      const comps = place?.address_components || [];
                      const cityComp = comps.find(c => c.types.includes('locality')) || comps.find(c => c.types.includes('postal_town'));
                      const pcComp = comps.find(c => c.types.includes('postal_code'));
                      if (cityComp) setCity(cityComp.long_name);
                      if (pcComp) setPostcode(pcComp.long_name);
                    } catch {}
                  }}>
                    <input value={address1} onChange={(e)=>setAddress1(e.target.value)} className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-100 placeholder-gray-500" placeholder="Start typing your address" />
                  </Autocomplete>
                ) : (
                  <input value={address1} onChange={(e)=>setAddress1(e.target.value)} className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-100" />
                )}
                <button type="button" onClick={useCurrentAddress} className="mt-1 text-xs text-red-400 hover:underline">Use current location</button>
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">City</label>
                {isLoaded ? (
                  <Autocomplete onLoad={(ref)=> (cityRef.current = ref)} options={{ types: ['(cities)'] }} onPlaceChanged={() => {
                    const place = cityRef.current?.getPlace();
                    const cname = place?.name || place?.formatted_address || '';
                    if (cname) setCity(cname);
                  }}>
                    <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-100 placeholder-gray-500" placeholder="City" />
                  </Autocomplete>
                ) : (
                  <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-100" />
                )}
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button disabled={redirecting} className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">Save details</button>
              </div>
            </form>
            <div className="mt-4">
              <label className="block text-sm text-gray-300 mb-1">Address Preview</label>
              <div id="profile-map" className="w-full h-48 rounded-md border border-gray-800" />
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="text-red-400" size={18} />
              <h3 className="text-lg font-semibold text-gray-100">Security</h3>
            </div>
            <form onSubmit={changePassword} className="space-y-3">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Current password</label>
                <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-100" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">New password</label>
                <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full bg-gray-900/60 border border-gray-700 rounded-md p-2 text-gray-100" />
              </div>
              <button disabled={redirecting} className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed">Update password</button>
            </form>
          </div>

          {(status || error) && (
            <p className={`text-sm ${error ? 'text-red-400' : 'text-emerald-300'}`}>{error || status}</p>
          )}
          {redirecting && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="inline-block h-4 w-4 border-2 border-gray-700 border-t-red-500 rounded-full animate-spin" />
              Redirecting to dashboard...
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
