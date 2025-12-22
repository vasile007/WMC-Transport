import { useState } from "react";
import { useAuth } from "../services/authContext.jsx";
import { users as usersApi } from "../services/users.js";

export default function AccountSettings({ compact = false }) {
  const { user, updateUser } = useAuth();
  const [email, setEmail] = useState(user?.email || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [phone, setPhone] = useState(user?.phone || "");
  const [address1, setAddress1] = useState(user?.addressLine1 || "");
  const [city, setCity] = useState(user?.city || "");
  const [postcode, setPostcode] = useState(user?.postcode || "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handlePhoneChange = (e) => {
    setPhone(e.target.value.replace(/\D/g, ""));
  };

  async function onEmailSubmit(e) {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      const res = await usersApi.updateEmail(user?.token, { email });
      if (res?.user) updateUser(res.user);
      setStatus("Email updated successfully");
    } catch (e) {
      setError(e.message || "Failed to update email");
    }
  }

  async function onProfileSubmit(e) {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      const res = await usersApi.updateProfile(user?.token, {
        phone,
        addressLine1: address1,
        city,
        postcode,
      });
      if (res?.user) updateUser(res.user);
      setStatus("Details updated successfully");
    } catch (e) {
      setError(e.message || "Failed to update details");
    }
  }

  async function onPasswordSubmit(e) {
    e.preventDefault();
    setStatus("");
    setError("");
    try {
      await usersApi.changePassword(user?.token, { currentPassword, newPassword });
      setStatus("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (e) {
      setError(e.message || "Failed to change password");
    }
  }

  return (
    <div className={compact ? "space-y-4" : "space-y-6"}>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        {!compact && (
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-bold">
              {(user?.name || 'U').slice(0,1).toUpperCase()}
            </div>
            <div>
              <div className="text-base font-semibold text-gray-900">{user?.name || 'Your Profile'}</div>
              <div className="text-xs text-gray-500">{user?.email}</div>
            </div>
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Contact details</h3>
        <p className="text-sm text-gray-500 mb-4">Keep your details up to date</p>
        <form onSubmit={onProfileSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Phone</label>
            <input
              value={phone}
              onChange={handlePhoneChange}
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Postcode</label>
            <input value={postcode} onChange={(e)=>setPostcode(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm text-gray-700 mb-1">Address line 1</label>
            <input value={address1} onChange={(e)=>setAddress1(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">City</label>
            <input value={city} onChange={(e)=>setCity(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900" />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="px-4 py-2 rounded-md bg-yellow-400 text-red-800 font-semibold hover:bg-yellow-300">Save details</button>
          </div>
        </form>
      </div>
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Account</h3>
        <p className="text-sm text-gray-500 mb-4">Update your email address</p>
        <form onSubmit={onEmailSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Full name</label>
            <input disabled value={user?.name || ""} className="w-full bg-gray-100 border border-gray-300 rounded-md p-2 text-gray-700" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Email address</label>
            <input value={email} onChange={(e)=>setEmail(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900" />
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-md bg-yellow-400 text-red-800 font-semibold hover:bg-yellow-300">Save changes</button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Security</h3>
        <p className="text-sm text-gray-500 mb-4">Change your account password</p>
        <form onSubmit={onPasswordSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Current password</label>
            <input type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900" />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">New password</label>
            <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} className="w-full bg-white border border-gray-300 rounded-md p-3 text-gray-900" />
          </div>
          <div className="flex justify-end">
            <button className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700">Update password</button>
          </div>
        </form>
        {(status || error) && (
          <p className={`mt-3 text-sm ${error ? 'text-red-600' : 'text-emerald-700'}`}>{error || status}</p>
        )}
      </div>
    </div>
  );
}
