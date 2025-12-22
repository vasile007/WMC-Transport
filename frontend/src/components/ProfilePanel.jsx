import { useState } from "react";
import { useAuth } from "../services/authContext.jsx";
import { users as usersApi } from "../services/users.js";

export default function ProfilePanel({ orders = [] }) {
  const { user, updateUser } = useAuth();
  const [section, setSection] = useState("overview");
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address1, setAddress1] = useState(user?.addressLine1 || "");
  const [address2, setAddress2] = useState(user?.addressLine2 || "");
  const [city, setCity] = useState(user?.city || "");
  const [postcode, setPostcode] = useState(user?.postcode || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/\D/g, ""));
  };

  const NavItem = ({ id, label }) => (
    <button
      onClick={() => { setSection(id); setStatus(""); setError(""); }}
      className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${section===id ? 'bg-red-50 text-red-700 border border-red-200' : 'text-gray-700 hover:text-red-700 hover:bg-gray-50 border border-transparent'}`}
    >{label}</button>
  );

  async function saveEmail(e) {
    e.preventDefault(); setStatus(""); setError("");
    try { const res = await usersApi.updateEmail(user?.token, { email }); if (res?.user) updateUser(res.user); setStatus("Email updated"); } catch (e) { setError(e.message||"Failed to update email"); }
  }

  async function savePassword(e) {
    e.preventDefault(); setStatus(""); setError("");
    try { await usersApi.changePassword(user?.token, { currentPassword, newPassword }); setStatus("Password changed"); setCurrentPassword(""); setNewPassword(""); } catch (e) { setError(e.message||"Failed to change password"); }
  }

  async function saveContact(e) {
    e.preventDefault(); setStatus(""); setError("");
    try {
      const res = await usersApi.updateProfile(user?.token, { phone, addressLine1: address1, addressLine2: address2, city, postcode });
      if (res?.user) updateUser(res.user);
      setStatus("Details saved");
    } catch (e) { setError(e.message||"Failed to save details"); }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-4">
        <aside className="md:col-span-1 p-3 border-b md:border-b-0 md:border-r border-gray-200 bg-gray-50">
          <div className="text-xs uppercase text-gray-500 px-1 mb-2">Settings</div>
          <div className="space-y-1">
            <NavItem id="overview" label="Overview" />
            <NavItem id="profile" label="Profile (Email)" />
            <NavItem id="contact" label="Contact & Address" />
            <NavItem id="security" label="Security" />
            <NavItem id="orders" label="Orders & Payments" />
          </div>
        </aside>
        <section className="md:col-span-3 p-6">
          {section === 'overview' && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">Account Overview</h3>
              <div className="text-sm text-gray-700">
                <p><b>Name:</b> {user?.name || '-'}</p>
                <p><b>Email:</b> {user?.email || '-'}</p>
                <p><b>Phone:</b> {user?.phone || '-'}</p>
                <p><b>Address:</b> {[user?.addressLine1, user?.addressLine2, user?.city, user?.postcode].filter(Boolean).join(', ') || '-'}</p>
              </div>
            </div>
          )}

          {section === 'profile' && (
            <form onSubmit={saveEmail} className="space-y-3 max-w-lg">
              <h3 className="text-lg font-semibold text-gray-900">Profile (Email)</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Full name</label>
                <input disabled value={user?.name || ''} className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-700" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Email address</label>
                <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900" />
              </div>
              <button className="px-4 py-2 rounded-md bg-yellow-400 text-red-800 font-semibold hover:bg-yellow-300">Save</button>
            </form>
          )}

          {section === 'contact' && (
            <form onSubmit={saveContact} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
              <h3 className="md:col-span-2 text-lg font-semibold text-gray-900">Contact & Address</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Phone</label>
                <input
                  value={phone}
                  onChange={handlePhoneChange}
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Postcode</label>
                <input value={postcode} onChange={(e)=>setPostcode(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Address line 1</label>
                <input value={address1} onChange={(e)=>setAddress1(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm text-gray-700 mb-1">Address line 2</label>
                <input value={address2} onChange={(e)=>setAddress2(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">City</label>
                <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900" />
              </div>
              <div className="md:col-span-2 flex justify-end">
                <button className="px-4 py-2 rounded-md bg-yellow-400 text-red-800 font-semibold hover:bg-yellow-300">Save details</button>
              </div>
            </form>
          )}

          {section === 'security' && (
            <form onSubmit={savePassword} className="space-y-3 max-w-lg">
              <h3 className="text-lg font-semibold text-gray-900">Security</h3>
              <div>
                <label className="block text-sm text-gray-700 mb-1">Current password</label>
                <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900" />
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">New password</label>
                <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-2 text-gray-900" />
              </div>
              <button className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700">Update password</button>
            </form>
          )}

          {section === 'orders' && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900">Orders & Payments</h3>
              {orders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-500">
                        <th className="py-2">#</th>
                        <th className="py-2">Pickup</th>
                        <th className="py-2">Dropoff</th>
                        <th className="py-2">Status</th>
                        <th className="py-2">Payment</th>
                        <th className="py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id} className="border-t border-gray-200">
                          <td className="py-2">{o.id}</td>
                          <td className="py-2">{o.pickupAddress}</td>
                          <td className="py-2">{o.dropoffAddress}</td>
                          <td className="py-2 capitalize">{o.status}</td>
                          <td className="py-2">{o.paymentStatus || '-'}</td>
                          <td className="py-2 flex gap-2">
                            <a href={`/track/${o.id}`} className="px-3 py-1.5 rounded-md border border-gray-300 text-sm text-gray-800 hover:border-red-600 hover:text-red-700">Track</a>
                            {o.paymentStatus !== 'succeeded' && (
                              <a href={`/pay/${o.id}`} className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm hover:bg-red-700">Pay</a>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {(status || error) && (
            <p className={`mt-4 text-sm ${error ? 'text-red-600' : 'text-emerald-700'}`}>{error || status}</p>
          )}
        </section>
      </div>
    </div>
  );
}
